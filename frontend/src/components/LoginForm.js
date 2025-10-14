import React, { useState } from 'react';
import { login } from '../api';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        try {
            const data = await login(username, password);
            // backend might return different shapes; try several keys
            const token = data.token || data.auth_token || data.access;
            if (!token) throw new Error('No token returned');
            localStorage.setItem('token', token);
            navigate('/dashboard');
        } catch (err) {
            const detail = err?.response?.data;
            setMsg(detail?.detail || 'Login failed. Check credentials.');
        }
    };

    return (
        <div className="col-md-6 offset-md-3">
            <div className="card p-4">
                <h4 className="mb-3">Sign in</h4>
                {msg && <div className="alert alert-danger">{msg}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                        <label className="form-label">Username</label>
                        <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                        <button className="btn btn-primary">Login</button>
                        <small className="small-muted">Don't have an account? Register.</small>
                    </div>
                </form>
            </div>
        </div>
    );
}
