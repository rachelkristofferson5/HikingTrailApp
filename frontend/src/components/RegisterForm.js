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
            // show backend error if available
            const detail = err?.response?.data || {};
            let hint = 'Registration failed. Username or email may be taken.';
            if (detail.username) hint = `Username: ${detail.username}`;
            if (detail.email) hint = `Email: ${detail.email}`;
            setMsg(hint);
        }
    };

    return (
        <div className="col-md-8 offset-md-2">
            <div className="card p-4">
                <h4 className="mb-3">Create an account</h4>
                {msg && <div className="alert alert-info">{msg}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                        <label className="form-label">Username</label>
                        <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div className="mb-2">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                        <button className="btn btn-success">Register</button>
                        <small className="small-muted">Already have an account? Log in.</small>
                    </div>
                </form>
            </div>
        </div>
    );
}
