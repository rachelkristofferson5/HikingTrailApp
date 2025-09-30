import React, { useState } from 'react';
import { register } from '../api';
import { useNavigate, Link } from 'react-router-dom';

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
            setMsg('Registration successful. Redirecting to login...');
            setTimeout(() => navigate('/login'), 1200);
        } catch (error) {
            setMsg('Registration failed. Maybe username or email taken.');
        }
    };

    return (
        <div className="col-md-6 offset-md-3">
            <h3>Register</h3>
            {msg && <div className="alert alert-info">{msg}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>Username</label>
                    <input value={username} onChange={e => setUsername(e.target.value)} className="form-control" required />
                </div>
                <div className="mb-3">
                    <label>Email</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="form-control" required />
                </div>
                <div className="mb-3">
                    <label>Password</label>
                    <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="form-control" required />
                </div>
                <button className="btn btn-success" type="submit">Register</button>
                <Link to="/login" className="btn btn-link">Already have an account?</Link>
            </form>
        </div>
    );
}
