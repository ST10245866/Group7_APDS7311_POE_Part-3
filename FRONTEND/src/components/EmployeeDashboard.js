import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPayments, setSelectedPayments] = useState([]);
  const navigate = useNavigate();

  // useEffect hook to fetch pending payments on component mount
  useEffect(() => {
    fetchPendingPayments();
  }, []);

  // Function to fetch the list of pending payments from the backend
  const fetchPendingPayments = async () => {
    try {
      const token = localStorage.getItem('employeeToken');
      if (!token) {
        navigate('/employee/login');
        return;
      }
      const response = await fetch('https://localhost:3001/employee/payments/pending', {
        headers: {
          'Authorization': `Bearer ${token}`  // Send the token as part of the request header for authentication
        },
      });
      if (response.status === 401) {
        localStorage.removeItem('employeeToken');
        localStorage.removeItem('employeeRole');
        navigate('/employee/login');
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      const data = await response.json();
      setPayments(data);  // Update the state with the fetched payments
    } catch (err) {
      setError('Failed to load pending payments');  // Set error state if the fetch fails
      console.error('Error:', err);
    }
  };

  // Function to handle payment verification, for marking payments as 'verified'
  const handleVerifyPayment = async (paymentId) => {
    try {
      setError('');  // Clear previous error messages
      setSuccess('');  // Clear previous success messages
      const token = localStorage.getItem('employeeToken');
      if (!token) {
        navigate('/employee/login');
        return;
      }
      const response = await fetch(`https://localhost:3001/employee/payments/${paymentId}/verify`, {
        method: 'PUT',  // PUT request for updating the payment status
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // Send the token in the Authorization header
        },
        body: JSON.stringify({ swiftVerified: true })
      });
      if (response.status === 401) {
        localStorage.removeItem('employeeToken');
        localStorage.removeItem('employeeRole');
        navigate('/employee/login');
        return;
      }
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message);  // Set success message if the payment was successfully verified
        setPayments(prevPayments =>
          prevPayments.map(payment =>
            payment._id === paymentId
              ? { ...payment, status: 'verified' }  // Update the payment status to 'verified'
              : payment
          )
        );
        setSelectedPayments(prev => prev.filter(id => id !== paymentId));
      } else {
        setError(data.message || 'Failed to verify payment');  // Set error message if verification fails
      }
    } catch (err) {
      setError('Error verifying payment');  // Set error state if there’s an error during verification
      console.error('Error:', err);
    }
  };

  // Function to handle submitting verified payments to SWIFT
  const handleSubmitToSwift = async () => {
    try {
      setError('');  // Clear previous error messages
      setSuccess('');  // Clear previous success messages
      const token = localStorage.getItem('employeeToken');
      if (!token) {
        navigate('/employee/login');
        return;
      }
      const response = await fetch('https://localhost:3001/employee/payments/submit-to-swift', {
        method: 'POST',  // POST request to submit payments to SWIFT
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // Send the token in the Authorization header
        },
        body: JSON.stringify({ paymentIds: selectedPayments })  // Send the selected payments to be submitted
      });
      if (response.status === 401) {
        localStorage.removeItem('employeeToken');
        localStorage.removeItem('employeeRole');
        navigate('/employee/login');
        return;
      }
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message);  // Set success message if submission is successful
        setSelectedPayments([]);  // Clear the selected payments list
        setPayments(prevPayments =>
          prevPayments.filter(payment => !selectedPayments.includes(payment._id))  // Filter out the submitted payments from the list
        );
      } else {
        setError(data.message || 'Failed to submit payments to SWIFT');  // Set error message if submission fails
      }
    } catch (err) {
      setError('Error submitting to SWIFT');  // Set error state if there’s an error during submission
      console.error('Error:', err);
    }
  };

  // Function to handle employee logout
  const handleLogout = () => {
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employeeRole');
    navigate('/employee/login');
  };

  // Function to return the appropriate status for each payment
  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <span className="badge bg-success">Verified</span>;
      case 'pending':
        return <span className="badge bg-warning">Pending</span>;
      default:
        return <span className="badge bg-secondary">New</span>;
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4 w-100" style={{ maxWidth: '1200px' }}>
        <h2 className="text-center mb-4">Payment Verification Dashboard</h2>
        {/* Buttons for submitting payments to SWIFT and logging out */}
        <div className="mb-3">
          <button
            className="btn btn-primary me-2"
            onClick={handleSubmitToSwift}
            disabled={selectedPayments.length === 0}  // Disable button if no payments are selected
          >
            Submit Selected to SWIFT
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
        {/* Display error or success messages */}
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        {/* Display the table of pending payments */}
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Select</th>
                <th>Payment ID</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>SWIFT Code</th>
                <th>Payee Name</th>
                <th>Account Number</th>
                <th>Bank Name</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td>
                    {/* Checkbox for selecting payments */}
                    <input
                      type="checkbox"
                      checked={selectedPayments.includes(payment._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPayments([...selectedPayments, payment._id]);
                        } else {
                          setSelectedPayments(selectedPayments.filter(id => id !== payment._id));
                        }
                      }}
                      disabled={payment.status === 'submitted'}  // Disable checkbox if payment is already submitted
                    />
                  </td>
                  <td>{payment._id}</td>
                  <td>{payment.amount}</td>
                  <td>{payment.currency}</td>
                  <td>{payment.swiftCode}</td>
                  <td>{payment.payeeInfo.name}</td>
                  <td>{payment.payeeInfo.accountNumber}</td>
                  <td>{payment.payeeInfo.bankName}</td>
                  <td>{getPaymentStatusBadge(payment.status)}</td>
                  <td>
                    {/* Button to verify the payment if not already verified */}
                    {payment.status !== 'verified' && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleVerifyPayment(payment._id)}
                      >
                        Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
