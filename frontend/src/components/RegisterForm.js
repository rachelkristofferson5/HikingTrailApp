import React, { useState } from 'react';
import { register } from '../api';
import { useNavigate } from 'react-router-dom';

export default function RegisterForm() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        try {
            await register(username, email, password);
            setMsg('Registration successful — redirecting to login...');
            setTimeout(() => navigate('/login'), 1100);
        } catch (err) {
            const data = err?.response?.data || {};
            let hint = 'Registration failed. Please check your details.';

            // Backend validation messages
            if (data.username) hint = `Username: ${data.username}`;
            else if (data.email) hint = `Email: ${data.email}`;
            else if (data.password) hint = `Password: ${data.password}`;
            else if (data.detail) hint = data.detail; // DRF default
            else if (typeof data === 'string') hint = data; // fallback string

            setMsg(hint);
        }
    };

    return (
        <div className="col-md-8 offset-md-2">
            <div className="card p-4 shadow-sm">
                <h4 className="mb-3">Create an Account</h4>

                {msg && <div className="alert alert-info">{msg}</div>}

                <form onSubmit={handleSubmit}>

                    <div className="mb-2">
                        <label className="form-label">Username</label>
                        <input
                            className="form-control"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                        <button className="btn btn-success" type="submit">
                            Register
                        </button>
                        <small className="text-muted">Already have an account? Log in.</small>
                    </div>
                </form>
            </div>
        </div>
    );
}