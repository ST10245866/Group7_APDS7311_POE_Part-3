import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function EmployeeLogin() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');  // Clear any previous error message before making a new login attempt

    // Perform the API request to login
    const response = await fetch('https://localhost:3001/employee/login', {
      method: 'POST',  // Use POST method for login
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, password }),
    });

    const data = await response.json();

    // If the login is successful, store the token and role session
    if (response.ok) {
      localStorage.setItem('employeeToken', data.token);
      localStorage.setItem('employeeRole', data.role);
      navigate('/employee/dashboard');
    } else {
      setError(data.message);  // If login failed, set the error message from the response
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4 w-100" style={{ maxWidth: '500px' }}>
        <h2 className="text-center mb-4">Employee Login</h2>
        <form onSubmit={handleSubmit}>
          {/* Employee ID input field */}
          <div className="form-group mb-3">
            <label>Employee ID</label>
            <input
              type="text"
              className="form-control"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}  // Update employeeId when input changes
              required  // Makes this field required
            />
          </div>

          {/* Password input field */}
          <div className="form-group mb-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}  // Update password when input changes
              required  // Makes this field required
            />
          </div>

          {/* Submit button */}
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>

        {/* Display error message if there is an error */}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </div>
    </div>
  );
}

export default EmployeeLogin;