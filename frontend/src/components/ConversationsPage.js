import React, { useEffect, useState } from "react";
import {
    getConversations,
    createConversation,
} from "../api";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";

export default function ConversationsPage() {
    const [convos, setConvos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subject, setSubject] = useState("");
    const [username, setUsername] = useState("");

    const location = useLocation();

    async function load() {
        try {
            const data = await getConversations();
            setConvos(data || []);
        } finally {
            setLoading(false);
        }
    }

    // Convert username → user ID
    async function getUserIdFromUsername(name) {
        try {
            const res = await axios.get(
                `https://hikingtrailapp-production.up.railway.app/users/search/?username=${name}`
            );
            return res.data?.id;
        } catch {
            return null;
        }
    }

    async function onCreate(e) {
        e.preventDefault();
        if (!username.trim()) return alert("Enter a username");

        const userId = await getUserIdFromUsername(username);
        if (!userId) return alert("User not found");

        try {
            await createConversation([userId], subject);
            setSubject("");
            setUsername("");
            await load();
        } catch {
            alert("Failed to create conversation");
        }
    }

    // Auto-start conversation when ?user=username exists
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const startUser = params.get("user");
        if (startUser) {
            setUsername(startUser);
            onCreate({ preventDefault: () => {} });
        }
    }, [location.search]);

    useEffect(() => { load(); }, []);

    return (
        <div className="container mt-4">
            <h3>💬 Direct Messages</h3>
            <p className="text-muted">Chat privately with other hikers.</p>

            {/* New conversation form */}
            <div className="card p-3 mb-4">
                <h5>Start New Conversation</h5>
                <form onSubmit={onCreate} className="d-flex gap-2 flex-wrap">
                    <input
                        className="form-control"
                        style={{ maxWidth: 200 }}
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        className="form-control"
                        placeholder="Subject (optional)"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                    <button className="btn btn-primary">Start</button>
                </form>
            </div>

            {/* Conversation list */}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="list-group">
                    {convos.length === 0 && <p>No conversations yet.</p>}

                    {convos.map((c) => (
                        <Link
                            key={c.id}
                            className="list-group-item list-group-item-action"
                            to={`/messages/${c.id}`}
                        >
                            <strong>{c.subject || "No Subject"}</strong>
                            <div className="text-muted small">
                                {c.participants?.map((p) => p.username).join(", ")}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

