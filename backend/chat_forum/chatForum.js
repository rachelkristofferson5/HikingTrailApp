import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAuthHeader } from '../api';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

export default function ChatForum() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [parentId, setParentId] = useState(null); // for replying

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/chats/`, { headers: getAuthHeader() });
            setMessages(res.data);
        } catch (err) {
            console.error('Failed to fetch chats', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        try {
            await axios.post(`${API_URL}/api/chats/add/`, { message: input, parent_id: parentId }, { headers: getAuthHeader() });
            setInput('');
            setParentId(null); // reset reply
            fetchMessages();
        } catch (err) {
            console.error('Failed to add chat', err);
        }
    };

    const handleReply = (id) => {
        setParentId(id);
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-body">
                    <h4 className="card-title text-center mb-4">Chat Forum</h4>

                    <div className="border rounded p-3 mb-3" style={{ height: '350px', overflowY: 'auto', background: '#f9f9f9' }}>
                        {messages.length === 0 ? (
                            <p className="text-muted text-center">start the conversation!</p>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className="mb-3 ms-3" style={{ borderLeft: '2px solid #ccc', paddingLeft: '8px' }}>
                                    <strong>{msg.user}</strong>
                                    <small className="text-muted ms-2">{new Date(msg.created_at).toLocaleTimeString()}</small>
                                    <p>{msg.message}</p>

                                    <button className="btn btn-sm btn-link" onClick={() => handleReply(msg.id)}>Reply</button>

                                    {msg.replies && msg.replies.map((r) => (
                                        <div key={r.id} className="mb-2 ms-4" style={{ borderLeft: '1px solid #ddd', paddingLeft: '6px' }}>
                                            <strong>{r.user}</strong>
                                            <small className="text-muted ms-1">{new Date(r.created_at).toLocaleTimeString()}</small>
                                            <p>{r.message}</p>
                                            <button className="btn btn-sm btn-link" onClick={() => handleReply(r.id)}>Reply</button>
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>

                    {parentId && <p>Replying to message #{parentId} <button className="btn btn-sm btn-link" onClick={() => setParentId(null)}>Cancel</button></p>}

                    <form onSubmit={handleSubmit} className="d-flex gap-2">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button className="btn btn-success" type="submit">{parentId ? "Reply" : "Send"}</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
