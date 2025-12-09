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
            <h4>{conversation?.subject || "Conversation"}</h4>

            {/* Participants */}
            <div className="card p-3 mb-3">
                <h6>Participants</h6>
                <p>{participants.map((p) => p.username).join(", ")}</p>

                <form onSubmit={onAddUser} className="d-flex gap-2 mt-2">
                    <input
                        className="form-control"
                        style={{ width: 140 }}
                        placeholder="User ID"
                        value={newUserId}
                        onChange={(e) => setNewUserId(e.target.value)}
                    />
                    <button className="btn btn-outline-primary">Add</button>
                </form>
            </div>

            {/* Messages */}
            <div
                className="card p-3 mb-3"
                style={{ height: "400px", overflowY: "auto" }}
            >
                {messages.length === 0 && (
                    <p className="text-muted">No messages yet.</p>
                )}

                {messages.map((m) => (
                    <div key={m.id} className="mb-2">
                        <strong>{m.sender?.username}</strong>
                        <div>{m.content}</div>
                        <div className="text-muted small">{m.timestamp}</div>
                        <hr />
                    </div>
                ))}

                <div ref={bottomRef}></div>
            </div>

            {/* Send message */}
            <form onSubmit={onSend} className="d-flex gap-2">
                <input
                    className="form-control"
                    placeholder="Type a message..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <button className="btn btn-primary">Send</button>
            </form>
        </div>
    );
}
