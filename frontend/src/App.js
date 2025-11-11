import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import TrailsPage from './components/TrailsPage';
import Map from './components/map/Map';
import ChatForum from './components/chat/ChatForum';

function RequireAuth({ children }) {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" replace />;
}

function App() {
    return (
        <div>
            <Navbar />
            <div className="container mt-4">
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegisterForm />} />
                    <Route path="/dashboard" element={
                        <RequireAuth><Dashboard /></RequireAuth>
                    } />
                    <Route path="/trails" element={
                        <RequireAuth><TrailsPage /></RequireAuth>
                    } />
                    <Route path="/map" element={
                        <RequireAuth><Map /></RequireAuth>
                    } />
                    <Route path="/chat" element={
                        <RequireAuth><ChatForum /></RequireAuth>
                    } />
                </Routes>
            </div>
        </div>
    );
}

export default App;
