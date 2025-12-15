import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    getConversation,
    getMessages,
    sendMessage,
    listParticipants,
    addParticipant,
} from "../api";
import { useParams } from "react-router-dom";

export default function ConversationDetailPage() {
    const { id } = useParams();
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [content, setContent] = useState("");
    const [newUserId, setNewUserId] = useState("");
    const [showAddParticipant, setShowAddParticipant] = useState(false);

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
        if (!newUserId.trim()) return;

        try {
            await addParticipant(id, Number(newUserId));
            setNewUserId("");
            setShowAddParticipant(false);
            await loadAll();
        } catch {
            alert("Failed to add participant");
        }
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
                            Chatting with: {participants.map((p) => p.username).join(", ")}
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
                        <form onSubmit={onAddUser} className="d-flex gap-2">
                            <input
                                className="form-control"
                                style={{ maxWidth: 200 }}
                                placeholder="User ID"
                                value={newUserId}
                                onChange={(e) => setNewUserId(e.target.value)}
                            />
                            <button className="btn btn-primary">Add</button>
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
