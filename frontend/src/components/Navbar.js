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
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
            <div className="container">
                <Link className="navbar-brand fw-bold text-light" to="/">TrailHub</Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                    {token ? (
                        <ul className="navbar-nav align-items-center gap-2">
                            <li className="nav-item">
                                <Link className="btn btn-outline-light btn-sm" to="/dashboard">Dashboard</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="btn btn-outline-light btn-sm" to="/trails">Trails</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="btn btn-outline-light btn-sm" to="/map">Map</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="btn btn-outline-light btn-sm" to="/chat">Chat</Link>
                            </li>
                            <li className="nav-item">
                                <button className="btn btn-danger btn-sm" onClick={handleLogout}>Logout</button>
                            </li>
                        </ul>
                    ) : (
                        <ul className="navbar-nav align-items-center gap-2">
                            <li className="nav-item">
                                <Link className="btn btn-outline-light btn-sm" to="/login">Login</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="btn btn-primary btn-sm" to="/register">Register</Link>
                            </li>
                        </ul>
                    )}
                </div>
            </div>
        </nav>
    );
}
