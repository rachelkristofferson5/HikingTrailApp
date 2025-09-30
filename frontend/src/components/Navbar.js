import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../api';

export default function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container">
                <Link className="navbar-brand" to="/">TrailHub</Link>
                <div>
                    {token ? (
                        <>
                            <Link className="btn btn-outline-primary me-2" to="/dashboard">Dashboard</Link>
                            <button className="btn btn-outline-secondary" onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link className="btn btn-outline-primary me-2" to="/login">Login</Link>
                            <Link className="btn btn-outline-success" to="/register">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
