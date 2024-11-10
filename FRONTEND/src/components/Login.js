import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Make a POST request to the backend for login authentication
    const response = await fetch('https://localhost:3001/customer/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, accountNumber, password }), // Send login data
    });

    const data = await response.json();

    if (response.ok) {
      // If login is successful, store the token and navigate to the payment page
      console.log(data.message);
      localStorage.setItem('token', data.token); // Store token
      navigate('/payment'); // Redirect to the payment page
    } else {
      // If login fails, display the error message
      setError(data.message);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4 w-100" style={{ maxWidth: '500px' }}>
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="form-group mb-3">
            <label>Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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

          {/* Login Button */}
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>

        {/* Display error message if login fails */}
        {error && <div className="alert alert-danger mt-3">{error}</div>}

        {/* Link to signup page for users who don't have an account */}
        <p className="mt-3 text-center">
          Don't have an account? <a href="/signup">Signup</a>
        </p>
      </div>
    </div>
  );
}

export default Login;