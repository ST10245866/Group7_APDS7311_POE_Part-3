import express from "express";
import db from "../db/conn.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import checkAuth from "../check-auth.mjs";
import { encryptData, decryptData } from "../encryption.mjs";

const router = express.Router();

// Input Validation
// Using regular expressions to ensure that all user input meets specific criteria and formats
// This is crucial for maintaining data integrity and preventing malicious inputs

// Validates employee ID
const validateEmployeeId = (employeeId) => {
    const regex = /^EMP[0-9]{6}$/;  // Validates that ID starts with 'EMP' followed by exactly 6 digits
    return regex.test(employeeId);
};

// Validates Password
const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
};

// Input Sanitization
// This removes potentially malicious content from all user input
// A crucial security measure to prevent various types of injection attacks
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    return input
        .replace(/<[^>]*>?/gm, '')  // Removes HTML tags
        .replace(/[&<>"']/g, (match) => {  // Replaces special characters
            const entities = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };
            return entities[match];
        })
        .replace(/[\$\{\}]/g, '')  // Removes potentially dangerous characters
        .trim()  // Removes whitespace
        .substring(0, 1000);  // Limits all user input lengths
};

// This checks the validity of the JWT token sent with the request.
// If the token is valid, it decodes and attaches user data to the request object.
const checkEmployeeAuth = (req, res, next) => {
    try {
        // Extract the token from the Authorization header
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            throw new Error("Authentication failed");
        }

        // Verify and decode the token using the secret key
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded user data to the request for further processing
        req.userData = {
            employeeId: decodedToken.employeeId,
            role: decodedToken.role
        };

        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        // If the token is invalid or expired, send an error response
        res.status(401).json({ message: "Authentication failed" });
    }
};

// Employee Login Route
// This route authenticates employees by verifying their credentials.
// If authentication is successful, it generates a JWT token and sends it back to the client.
router.post("/login", async (req, res, next) => {
    try {
        const { employeeId, password } = req.body;

        // Ensure all fields are provided
        if (!employeeId || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate employee ID format
        if (!validateEmployeeId(employeeId)) {
            return res.status(400).json({
                message: "Invalid employee ID. Format should be EMPxxxxxx"
            });
        }

        // Validate password format
        if (!validatePassword(password)) {
            return res.status(400).json({
                message: "Invalid password. Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
            });
        }

        // Sanitize the employee ID to prevent potential injection attacks
        const sanitizedEmployeeId = sanitizeInput(employeeId);
        const collection = db.collection("employees");

        // Look up the employee in the database by their sanitized employee ID
        const employee = await collection.findOne({ employeeId: sanitizedEmployeeId });

        if (!employee) {
            return res.status(401).json({
                message: "Authentication failed: Invalid credentials"
            });
        }

        // Compare the provided password with the hashed password stored in the database
        const passwordMatch = await bcrypt.compare(password, employee.password);

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Authentication failed: Invalid credentials"
            });
        }

        // Generate JWT token with employee ID and role, expires in 8 hours
        const token = jwt.sign(
            {
                employeeId: sanitizedEmployeeId,
                role: employee.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        // Set the token as a secure HTTP-only cookie for client-side storage
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,  // Ensures the cookie is sent over HTTPS only
            sameSite: 'strict',  // Prevents cross-site request forgery (CSRF) attacks
            maxAge: 28800000  // Set the cookie expiration to 8 hours
        });

        res.status(200).json({
            message: "Authentication successful",
            token,
            role: employee.role
        });

    } catch (error) {
        console.error(`Employee login error: ${error.message}`);
        next(error);
    }
});

// Get pending payments
// This fetches payments that are in 'pending', 'verified' but not yet 'submitted'.
// It also decrypts sensitive information before sending the data.
router.get("/payments/pending", checkEmployeeAuth, async (req, res, next) => {
    try {
        const collection = db.collection("payments");

        // Find payments that are not yet submitted, and are either 'pending' or 'verified'
        const payments = await collection
            .find({
                status: {
                    $in: [null, "pending", "verified"],
                    $ne: "submitted"
                }
            })
            .toArray();

        // Decrypt sensitive payment data
        const decryptedPayments = payments.map(payment => ({
            ...payment,
            payeeInfo: {
                ...payment.payeeInfo,
                accountNumber: decryptData(payment.payeeInfo.accountNumber),
                iban: payment.payeeInfo.iban ? decryptData(payment.payeeInfo.iban) : null
            }
        }));

        // Return the decrypted payments
        res.status(200).json(decryptedPayments);
    } catch (error) {
        console.error(`Error fetching pending payments: ${error.message}`);
        next(error);
    }
});

// Verify payment route
// This allows employees to verify payments and update their status to 'verified'.
router.put("/payments/:id/verify", checkEmployeeAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { swiftVerified } = req.body;

        if (typeof swiftVerified !== "boolean") {
            return res.status(400).json({ message: "SWIFT verification status must be provided" });
        }

        const collection = db.collection("payments");

        // Update the payment status to 'verified' and record verification details
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status: "verified",
                    swiftVerified,
                    verifiedAt: new Date(),
                    verifiedBy: req.userData.employeeId
                }
            }
        );

        // Check if the payment was found and updated
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Payment not found" });
        }

        res.status(200).json({ message: "Payment verified successfully" });
    } catch (error) {
        console.error(`Error verifying payment: ${error.message}`);
        next(error);
    }
});

// Submit payments to SWIFT
// This route updates verified payments to 'submitted' and sends them to SWIFT.
router.post("/payments/submit-to-swift", checkEmployeeAuth, async (req, res, next) => {
    try {
        const { paymentIds } = req.body;

        // Ensure that payment IDs are provided.
        if (!Array.isArray(paymentIds) || paymentIds.length === 0) {
            return res.status(400).json({ message: "Payment IDs must be provided" });
        }

        const objectIds = paymentIds.map(id => new ObjectId(id));
        const collection = db.collection("payments");

        // Update the payments that are verified to be 'submitted'.
        const result = await collection.updateMany(
            {
                _id: { $in: objectIds },
                status: "verified"
            },
            {
                $set: {
                    status: "submitted",
                    submittedToSwiftAt: new Date(),
                    submittedBy: req.userData.employeeId
                }
            }
        );

        res.status(200).json({
            message: `${result.modifiedCount} payments submitted to SWIFT successfully`
        });
    } catch (error) {
        console.error(`Error submitting to SWIFT: ${error.message}`);
        next(error);
    }
});

export default router;