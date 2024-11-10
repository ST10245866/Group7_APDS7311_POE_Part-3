import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Payment() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [swiftProvider, setSwiftProvider] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [payeeAccountNumber, setPayeeAccountNumber] = useState('');
  const [payeeBankName, setPayeeBankName] = useState('');
  const [payeeAddress, setPayeeAddress] = useState('');
  const [payeeCity, setPayeeCity] = useState('');
  const [payeePostalCode, setPayeePostalCode] = useState('');
  const [payeeCountry, setPayeeCountry] = useState('');
  const [iban, setIban] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    // Get the token from, to authorize the request
    const token = localStorage.getItem('token');

    // Making the POST request to submit the payment data to the server
    const response = await fetch('https://localhost:3001/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount,
        currency,
        swiftProvider,
        swiftCode,
        payeeName,
        payeeAccountNumber,
        payeeBankName,
        payeeAddress,
        payeeCity,
        payeePostalCode,
        payeeCountry,
        iban
      }),
    });

    const data = await response.json();

    // Check if the response was successful
    if (response.ok) {
      setSuccess(data.message);

      // Clear form inputs after successful submission
      setAmount('');
      setCurrency('');
      setSwiftProvider('');
      setSwiftCode('');
      setPayeeName('');
      setPayeeAccountNumber('');
      setPayeeBankName('');
      setPayeeAddress('');
      setPayeeCity('');
      setPayeePostalCode('');
      setPayeeCountry('');
      setIban('');
    } else {
      setError(data.message); // Set error message from the response
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4 w-100" style={{ maxWidth: '800px' }}>
        <h2 className="text-center mb-4">Make a Payment</h2>

        <form onSubmit={handleSubmit}>
          {/* Amount input */}
          <div className="form-group mb-3">
            <label>Amount</label>
            <input
              type="text"
              className="form-control"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Currency input */}
          <div className="form-group mb-3">
            <label>Currency</label>
            <input
              type="text"
              className="form-control"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              required
            />
          </div>

          {/* SWIFT Provider input */}
          <div className="form-group mb-3">
            <label>SWIFT Provider</label>
            <input
              type="text"
              className="form-control"
              value={swiftProvider}
              onChange={(e) => setSwiftProvider(e.target.value)}
              required
            />
          </div>

          {/* SWIFT Code input */}
          <div className="form-group mb-3">
            <label>SWIFT Code</label>
            <input
              type="text"
              className="form-control"
              value={swiftCode}
              onChange={(e) => setSwiftCode(e.target.value)}
              required
            />
          </div>

          {/* Payee Name input */}
          <div className="form-group mb-3">
            <label>Payee Name</label>
            <input
              type="text"
              className="form-control"
              value={payeeName}
              onChange={(e) => setPayeeName(e.target.value)}
              required
            />
          </div>

          {/* Payee Account Number input */}
          <div className="form-group mb-3">
            <label>Payee Account Number</label>
            <input
              type="text"
              className="form-control"
              value={payeeAccountNumber}
              onChange={(e) => setPayeeAccountNumber(e.target.value)}
              required
            />
          </div>

          {/* Payee Bank Name input */}
          <div className="form-group mb-3">
            <label>Payee Bank Name</label>
            <input
              type="text"
              className="form-control"
              value={payeeBankName}
              onChange={(e) => setPayeeBankName(e.target.value)}
              required
            />
          </div>

          {/* Payee Address input */}
          <div className="form-group mb-3">
            <label>Payee Address</label>
            <input
              type="text"
              className="form-control"
              value={payeeAddress}
              onChange={(e) => setPayeeAddress(e.target.value)}
              required
            />
          </div>

          {/* Payee City input */}
          <div className="form-group mb-3">
            <label>Payee City</label>
            <input
              type="text"
              className="form-control"
              value={payeeCity}
              onChange={(e) => setPayeeCity(e.target.value)}
              required
            />
          </div>

          {/* Payee Postal Code input */}
          <div className="form-group mb-3">
            <label>Payee Postal Code</label>
            <input
              type="text"
              className="form-control"
              value={payeePostalCode}
              onChange={(e) => setPayeePostalCode(e.target.value)}
              required
            />
          </div>

          {/* Payee Country input */}
          <div className="form-group mb-3">
            <label>Payee Country</label>
            <input
              type="text"
              className="form-control"
              value={payeeCountry}
              onChange={(e) => setPayeeCountry(e.target.value)}
              required
            />
          </div>

          {/* IBAN input (optional) */}
          <div className="form-group mb-3">
            <label>IBAN (optional)</label>
            <input
              type="text"
              className="form-control"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
            />
          </div>

          {/* Submit button */}
          <button type="submit" className="btn btn-primary w-100">Pay Now</button>
        </form>

        {/* Error message */}
        {error && <div className="alert alert-danger mt-3">{error}</div>}

        {/* Success message */}
        {success && <div className="alert alert-success mt-3">{success}</div>}

        {/* Logout button */}
        <button onClick={() => navigate('/login')} className="btn btn-secondary mt-3 w-100">Logout</button>
      </div>
    </div>
  );
}

export default Payment;