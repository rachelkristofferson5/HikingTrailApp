import React, { useState, useEffect } from 'react';
import {
    getForumCategories,
    getForumThreads,
    getForumPosts,
    createForumPost
} from '../../api';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ChatForum() {
    const [categories, setCategories] = useState([]);
    const [threads, setThreads] = useState([]);
    const [posts, setPosts] = useState([]);
    const [selectedThread, setSelectedThread] = useState(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load forum categories first
    useEffect(() => {
        async function loadCategories() {
            try {
                const data = await getForumCategories();
                setCategories(data);
            } catch (err) {
                setError('Error loading forum categories');
                console.error(err);
            }
        }
        loadCategories();
    }, []);

    // Load threads in the first category by default
    const handleCategoryClick = async (categoryId) => {
        setThreads([]);
        setPosts([]);
        setSelectedThread(null);
        setError('');
        try {
            const data = await getForumThreads(categoryId);
            setThreads(data);
        } catch (err) {
            setError('Failed to load threads.');
            console.error(err);
        }
    };

    // Load posts for a selected thread
    const handleThreadClick = async (threadId) => {
        setLoading(true);
        setPosts([]);
        setSelectedThread(threadId);
        try {
            const data = await getForumPosts(threadId);
            setPosts(data);
        } catch (err) {
            setError('Failed to load posts.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Submit a new message (post)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedThread) return;

        try {
            await createForumPost(selectedThread, input);
            setInput('');
            const updatedPosts = await getForumPosts(selectedThread);
            setPosts(updatedPosts);
        } catch (err) {
            console.error(err);
            alert('Error posting message.');
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-body">
                    <h4 className="card-title text-center mb-3">💬 Trail Chat Forum</h4>

                    {error && <div className="alert alert-danger">{error}</div>}

                    {/* Categories */}
                    <div className="mb-3">
                        <h6 className="fw-bold">Categories</h6>
                        <div className="d-flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.category_id}
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => handleCategoryClick(cat.category_id)}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Threads */}
                    {threads.length > 0 && (
                        <div className="mb-3">
                            <h6 className="fw-bold">Threads</h6>
                            <div className="list-group">
                                {threads.map((thread) => (
                                    <button
                                        key={thread.thread_id}
                                        className={`list-group-item list-group-item-action ${
                                            selectedThread === thread.thread_id ? 'active' : ''
                                        }`}
                                        onClick={() => handleThreadClick(thread.thread_id)}
                                    >
                                        {thread.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Posts */}
                    <div
                        className="border rounded p-3 mb-3"
                        style={{ height: '300px', overflowY: 'auto', background: '#f9f9f9' }}
                    >
                        {loading ? (
                            <p className="text-center text-muted">Loading posts...</p>
                        ) : posts.length === 0 ? (
                            <p className="text-muted text-center">
                                {selectedThread
                                    ? 'No messages yet — start the conversation!'
                                    : 'Select a thread to view posts.'}
                            </p>
                        ) : (
                            posts.map((msg) => (
                                <div key={msg.post_id} className="mb-3">
                                    <strong>{msg.user?.username || msg.username}</strong>{' '}
                                    <small className="text-muted">
                                        {new Date(msg.created_at).toLocaleString()}
                                    </small>
                                    <p className="mb-0">{msg.contents}</p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Message input */}
                    {selectedThread && (
                        <form onSubmit={handleSubmit} className="d-flex gap-2">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Type a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button className="btn btn-success" type="submit">
                                Send
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
