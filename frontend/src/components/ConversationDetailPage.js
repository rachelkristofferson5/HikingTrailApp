import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    getConversation,
    getMessages,
    sendMessage,
    listParticipants,
    addParticipant,
} from "../api";
import { useParams } from "react-router-dom";
import axios from "axios";


export default function ConversationDetailPage() {
    const { id } = useParams();
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [content, setContent] = useState("");
    const [showAddParticipant, setShowAddParticipant] = useState(false);
    const [username, setUsername] = useState("");
    const [userSuggestions, setUserSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);


    const bottomRef = useRef(null);

    const loadAll = useCallback(async () => {
        try {
            const c = await getConversation(id);
            setConversation(c);

            const msgs = await getMessages(id);
            setMessages(msgs || []);

            const parts = await listParticipants(id);
            setParticipants(parts || []);
        } catch (err) {
            console.error("Failed to load conversation", err);
        }
    }, [id]);

    async function onSend(e) {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            await sendMessage(id, content);
            setContent("");
            await loadAll();
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        } catch {
            alert("Send failed");
        }
    }

    async function onAddUser(e) {
        e.preventDefault();
        if (!selectedUser) {
            alert("Please select a user from the list");
            return;
        }

        try {
            await addParticipant(id, selectedUser.id);
            setUsername("");
            setSelectedUser(null);
            setShowAddParticipant(false);
            await loadAll();
        } catch {
            alert("Failed to add participant");
        }
    }

    async function handleUsernameChange(e) {
    const value = e.target.value;
    setUsername(value);

        if (value.trim().length >= 2) {
            setSearchingUsers(true);
            try {
                const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";
                const token = localStorage.getItem("token");

                const res = await axios.get(
                    `${API_URL}/users/list/?q=${encodeURIComponent(value)}&limit=5`,
                    { headers: token ? { Authorization: `Token ${token}` } : {} }
                );

                if (res.data?.users?.length) {
                    setUserSuggestions(res.data.users);
                    setShowSuggestions(true);
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
    }

    function selectUser(user) {
        setUsername(user.username);
        setSelectedUser(user);
        setUserSuggestions([]);
        setShowSuggestions(false);
    }

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="mb-0">{conversation?.subject || "Conversation"}</h5>
                        <small className="text-muted">
                            Chatting with: {participants.map((p) => p.user?.username).filter(Boolean).join(", ")}
                        </small>
                    </div>
                    <button 
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setShowAddParticipant(!showAddParticipant)}
                    >
                        {showAddParticipant ? "Cancel" : "+ Add Person"}
                    </button>
                </div>

                {/* Add Participant Form (collapsed by default) */}
                {showAddParticipant && (
                    <div className="card-body border-bottom bg-light">
                        <h6>Add Another Person to this Conversation</h6>
                        <form onSubmit={onAddUser} className="d-flex gap-2 position-relative">
                            <input
                                className="form-control"
                                style={{ maxWidth: 250 }}
                                placeholder="Type a username"
                                value={username}
                                onChange={handleUsernameChange}
                                onFocus={() => userSuggestions.length && setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            />
                            <button className="btn btn-primary">Add</button>

                            {searchingUsers && (
                                <small className="text-muted ms-2">Searching…</small>
                            )}

                            {showSuggestions && userSuggestions.length > 0 && (
                                <div
                                    className="position-absolute bg-white border rounded shadow-sm mt-1"
                                    style={{ top: "100%", left: 0, zIndex: 1000, width: "250px" }}
                                >
                                    {userSuggestions.map(user => (
                                        <div
                                            key={user.id}
                                            className="p-2"
                                            style={{ cursor: "pointer" }}
                                            onMouseDown={() => selectUser(user)}
                                        >
                                            <strong>{user.username}</strong>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </form>
                    </div>
                )}

                {/* Messages */}
                <div
                    className="card-body"
                    style={{ height: "400px", overflowY: "auto", backgroundColor: "#f9f9f9" }}
                >
                    {messages.length === 0 && (
                        <div className="text-center text-muted mt-5">
                            <p className="mb-1">No messages yet.</p>
                            <p>Start the conversation by typing a message below!</p>
                        </div>
                    )}

                    {messages.map((m) => (
                        <div key={m.message_id} className="mb-3">
                            <div className="d-flex align-items-baseline gap-2">
                                <strong className="text-primary">{m.sender_username}</strong>
                                <small className="text-muted">
                                    {new Date(m.sent_at).toLocaleString()}
                                </small>
                            </div>
                            <div className="ms-3 p-2 bg-white rounded border">{m.message_text}</div>
                        </div>
                    ))}

                    <div ref={bottomRef}></div>
                </div>

                {/* Send message - More prominent */}
                <div className="card-footer bg-white">
                    <form onSubmit={onSend}>
                        <div className="input-group">
                            <input
                                className="form-control"
                                placeholder="Type your message here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                autoFocus
                            />
                            <button className="btn btn-primary px-4" type="submit">
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
