import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Make a POST request to the server with form data
    const response = await fetch('https://localhost:3001/customer/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, idNumber, accountNumber, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // If successful, navigate to the login page
      console.log(data.message);
      navigate('/login');
    } else {
      // If there's an error, set the error state to display an error message
      setError(data.message);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4 w-100" style={{ maxWidth: '500px' }}>
        <h2 className="text-center mb-4">Signup</h2>
        <form onSubmit={handleSubmit}>
          {/* Full Name Input */}
          <div className="form-group mb-3">
            <label>Full Name</label>
            <input
              type="text"
              className="form-control"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* ID Number Input */}
          <div className="form-group mb-3">
            <label>ID Number</label>
            <input
              type="text"
              className="form-control"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
            />
          </div>

          {/* Account Number Input */}
          <div className="form-group mb-3">
            <label>Account Number</label>
            <input
              type="text"
              className="form-control"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="form-group mb-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-100">Signup</button>
        </form>

        {/* Display error message if any */}
        {error && <div className="alert alert-danger mt-3">{error}</div>}

        {/* Login Redirect for users who already have an account */}
        <p className="mt-3 text-center">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}

export default Signup;