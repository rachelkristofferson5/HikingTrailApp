import React, { useState } from 'react';
import { login } from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr('');
        try {
            const data = await login(username, password);
            // backend should return { token: '...' }
            if (data.token) {
                localStorage.setItem('token', data.token);
                navigate('/dashboard');
            } else {
                setErr('Login failed: no token returned');
            }
        } catch (error) {
            setErr('Login failed. Check credentials.');
        }
    };

    return (
        <div className="col-md-6 offset-md-3">
            <h3>Login</h3>
            {err && <div className="alert alert-danger">{err}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>Username</label>
                    <input value={username} onChange={e => setUsername(e.target.value)} className="form-control" required />
                </div>
                <div className="mb-3">
                    <label>Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-control" required />
                </div>
                <button className="btn btn-primary" type="submit">Login</button>
                <Link to="/register" className="btn btn-link">Register</Link>
            </form>
        </div>
    );
}
