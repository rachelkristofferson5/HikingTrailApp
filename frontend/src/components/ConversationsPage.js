import React, { useEffect, useState, useCallback } from "react";
import { getConversations, createConversation, searchUserByUsername } from "../api";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ConversationsPage() {
    const [convos, setConvos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subject, setSubject] = useState("");
    const [username, setUsername] = useState("");
    
    // User search autocomplete
    const [userSuggestions, setUserSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchingUsers, setSearchingUsers] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    // Load all conversations
    const load = useCallback(async () => {
        try {
            const data = await getConversations();
            setConvos(data || []);
        } finally {
            setLoading(false);
        }
    }, []);

    // Username → User ID lookup
    async function getUserIdFromUsername(name) {
        try {
            const data = await searchUserByUsername(name);
            return data?.id || null;
        } catch {
            return null;
        }
    }

    // Search for users as they type - uses new /users/list/ endpoint
    const handleUsernameChange = async (e) => {
        const value = e.target.value;
        setUsername(value);
        
        if (value.trim().length >= 2) {
            setSearchingUsers(true);
            try {
                // Use the list endpoint with query parameter
                const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';
                const token = localStorage.getItem('token');
                
                const res = await axios.get(`${API_URL}/users/list/?q=${encodeURIComponent(value)}&limit=5`, {
                    headers: token ? { Authorization: `Token ${token}` } : {}
                });
                
                if (res.data && res.data.users) {
                    setUserSuggestions(res.data.users);
                    setShowSuggestions(res.data.users.length > 0);
                } else {
                    setUserSuggestions([]);
                    setShowSuggestions(false);
                }
            } catch {
                setUserSuggestions([]);
                setShowSuggestions(false);
            } finally {
                setSearchingUsers(false);
            }
        } else {
            setUserSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // Select a user from suggestions
    const selectUser = (selectedUsername) => {
        setUsername(selectedUsername);
        setShowSuggestions(false);
        setUserSuggestions([]);
    };

    // Create convo and navigate to it
    const createAndNavigate = useCallback(async (recipientUsername, subjectText = "") => {
        const userId = await getUserIdFromUsername(recipientUsername);
        if (!userId) {
            alert("User not found");
            return null;
        }

        try {
            const newConvo = await createConversation([userId], subjectText);
            await load();
            return newConvo;
        } catch (err) {
            if (err?.response?.data?.error) {
                alert(err.response.data.error);
            } else {
                alert("Failed to create conversation");
            }
            return null;
        }
    }, [load]);

    // Create convo from form
    const onCreate = useCallback(async (e) => {
        e.preventDefault();
        if (!username.trim()) {
            alert("Enter a username");
            return;
        }

        const newConvo = await createAndNavigate(username, subject);
        if (newConvo) {
            setSubject("");
            setUsername("");
            navigate(`/messages/${newConvo.id}`);
        }
    }, [username, subject, createAndNavigate, navigate]);

    // Pre-fill username from ?user=username parameter
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const startUser = params.get("user");

        if (startUser) {
            setUsername(startUser);
            setSubject(`Chat with ${startUser}`);
            navigate("/messages", { replace: true });
        }
    }, [location.search, navigate]);

    // Initial load
    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="container mt-4">
            <h3>Direct Messages</h3>
            <p className="text-muted">Chat privately with other hikers.</p>

            {/* New conversation form */}
            <div className="card p-3 mb-4">
                <h5>Start New Conversation</h5>
                <form onSubmit={onCreate}>
                    <div className="row g-2">
                        <div className="col-md-3 position-relative">
                            <label className="form-label small">Username</label>
                            <input
                                className="form-control"
                                placeholder="Enter username"
                                value={username}
                                onChange={handleUsernameChange}
                                onFocus={() => userSuggestions.length > 0 && setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            />
                            {searchingUsers && (
                                <small className="text-muted">Searching...</small>
                            )}
                            
                            {/* User suggestions dropdown */}
                            {showSuggestions && userSuggestions.length > 0 && (
                                <div 
                                    className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
                                    style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                                >
                                    {userSuggestions.map((user) => (
                                        <div
                                            key={user.id}
                                            className="p-2 cursor-pointer"
                                            style={{ cursor: 'pointer' }}
                                            onMouseDown={() => selectUser(user.username)}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                        >
                                            <strong>{user.username}</strong>
                                            {user.email && <small className="text-muted ms-2">({user.email})</small>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="col-md-6">
                            <label className="form-label small">Subject (optional)</label>
                            <input
                                className="form-control"
                                placeholder="What's this about?"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>
                        
                        <div className="col-md-3 d-flex align-items-end">
                            <button className="btn btn-primary w-100" type="submit">
                                Start Conversation
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Conversation list */}
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">Your Conversations</h5>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <p className="p-3 text-center text-muted">Loading...</p>
                    ) : (
                        <div className="list-group list-group-flush">
                            {convos.length === 0 && (
                                <p className="p-3 text-center text-muted">No conversations yet. Start one above!</p>
                            )}

                            {convos.map((c) => (
                                <Link
                                    key={c.id}
                                    className="list-group-item list-group-item-action"
                                    to={`/messages/${c.id}`}
                                >
                                    <div className="d-flex w-100 justify-content-between">
                                        <strong>{c.subject || "No Subject"}</strong>
                                        <small className="text-muted">
                                            {new Date(c.updated_at || c.created_at).toLocaleDateString()}
                                        </small>
                                    </div>
                                    <div className="text-muted small">
                                        {c.participants?.map((p) => p.username).join(", ")}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}