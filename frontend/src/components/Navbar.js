import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../api';
import Notifications from './Notifications';

export default function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [hidden, setHidden] = useState(false);
    const [lastScroll, setLastScroll] = useState(window.scrollY);

    // Close mobile menu manually
    const closeMenu = () => {
        const nav = document.getElementById('navbarNav');
        if (nav && nav.classList.contains('show')) {
            nav.classList.remove('show');
        }
    };

    const handleLogout = async () => {
        await logout();
        closeMenu();
        navigate('/login');
    };

    // Auto-hide navbar on scroll
    useEffect(() => {
        const handleScroll = () => {
            const current = window.scrollY;

            if (current > lastScroll && current > 80) {
                // scrolling down
                setHidden(true);
            } else {
                // scrolling up
                setHidden(false);
            }

            setLastScroll(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScroll]);

    return (
        <nav
            className={`navbar navbar-expand-lg navbar-dark bg-dark shadow-sm fixed-top transition-fast ${
                hidden ? 'navbar-hidden' : ''
            }`}
            style={{ transition: 'top 0.3s ease' }}
        >
            <div className="container">
                <Link className="navbar-brand fw-bold text-light" to="/" onClick={closeMenu}>
                    TrailHub
                </Link>

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
                                <Link className="btn btn-outline-light btn-sm" to="/dashboard" onClick={closeMenu}>
                                    Dashboard
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link className="btn btn-outline-light btn-sm" to="/profile" onClick={closeMenu}>
                                    Profile
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link className="btn btn-outline-light btn-sm" to="/trails" onClick={closeMenu}>
                                    Trails
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="btn btn-outline-light btn-sm" to="/map" onClick={closeMenu}>
                                    Map
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="btn btn-outline-light btn-sm" to="/chat" onClick={closeMenu}>
                                    Chat
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link className="btn btn-outline-light btn-sm" to="/messages" onClick={closeMenu}>
                                    Messages
                                </Link>
                            </li>

                            {/* Add Notifications Component */}
                            <li className="nav-item">
                                <Notifications />
                            </li>

                            <li className="nav-item">
                                <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                                    Logout
                                </button>
                            </li>
                        </ul>
                    ) : (
                        <ul className="navbar-nav align-items-center gap-2">
                            <li className="nav-item">
                                <Link className="btn btn-outline-light btn-sm" to="/login" onClick={closeMenu}>
                                    Login
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="btn btn-primary btn-sm" to="/register" onClick={closeMenu}>
                                    Register
                                </Link>
                            </li>
                        </ul>
                    )}
                </div>
            </div>
        </nav>
    );
}