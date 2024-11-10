const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const connectionString = process.env.ATLAS_URI;
const client = new MongoClient(connectionString);

// Register a new employee
const registerEmployee = async (employeeId, password, role) => {
  try {
    // Connect to the server
    await client.connect();
    const db = client.db('payments');
    const collection = db.collection('employees');

    // Check if an employee with the same employeeId already exists
    const existingEmployee = await collection.findOne({ employeeId });
    if (existingEmployee) {
      console.log('Employee already exists');
      return;
    }

    // Hash the provided password
    const hashedPassword = await bcrypt.hash(password, 12); // 12 is the salt rounds for bcrypt

    // Create the new employee document to insert into the database
    const newEmployee = {
      employeeId, // Unique ID for the employee
      password: hashedPassword, // Hashed password instead of plain text
      role,
    };

    // Insert the new employee into the database
    const result = await collection.insertOne(newEmployee);
    console.log(`Employee added with ID: ${result.insertedId}`);
  } catch (error) {
    console.error('Error adding employee:', error);
  } finally {
    await client.close();
  }
};

const employeeId = 'EMP123456';
const password = 'Password@123';
const role = 'admin';

registerEmployee(employeeId, password, role);