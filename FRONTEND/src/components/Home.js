import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <div className="card p-4 w-100" style={{ maxWidth: '500px' }}>
                <div className="card-body">
                    <h1 className="text-center mb-4">
                        Welcome
                    </h1>

                    <div className="d-grid gap-3">
                        {/* Button for Customer Login */}
                        <button
                            onClick={() => navigate('/login')} // Navigates to the customer login page
                            className="btn btn-primary btn-lg"
                        >
                            Customer Login
                        </button>

                        {/* Button for Employee Login */}
                        <button
                            onClick={() => navigate('/employee/login')} // Navigates to the employee login page
                            className="btn btn-secondary btn-lg"
                        >
                            Employee Login
                        </button>

                        {/* Text and button for new customer signup */}
                        <div className="text-center mt-3">
                            <span className="text-muted">New customer? </span>
                            <button
                                onClick={() => navigate('/signup')} // Navigates to the signup page
                                className="btn btn-link p-0 align-baseline"
                            >
                                Sign up here
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;