import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ChatForum() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMessage = {
            text: input,
            user: 'You',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, newMessage]);
        setInput('');
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-body">
                    <h4 className="card-title text-center mb-4">💬 Trail Chat Forum</h4>

                    <div className="border rounded p-3 mb-3" style={{ height: '350px', overflowY: 'auto', background: '#f9f9f9' }}>
                        {messages.length === 0 ? (
                            <p className="text-muted text-center">No messages yet — start the conversation!</p>
                        ) : (
                            messages.map((msg, i) => (
                                <div key={i} className="mb-3">
                                    <strong>{msg.user}</strong>
                                    <small className="text-muted ms-2">{msg.time}</small>
                                    <p className="mb-0">{msg.text}</p>
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="d-flex gap-2">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button className="btn btn-success" type="submit">Send</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
