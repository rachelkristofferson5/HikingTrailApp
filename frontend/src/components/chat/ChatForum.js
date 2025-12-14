
import React, { useState, useEffect, useRef } from 'react';
import {
  getForumCategories,
  listForumThreads,
  createForumThread,
  getForumPosts,
  createForumPost,
  updateForumPost,
  deleteForumPost,
  uploadForumPhoto,
  getProfile
} from '../../api';
import 'bootstrap/dist/css/bootstrap.min.css';

const WS_RECONNECT_MS = 3000;

export default function ChatForum() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [threads, setThreads] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);

  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null); // { username, is_staff, ... }

  const [imageFile, setImageFile] = useState(null); // image attached to new post
  const [uploadingImageForPost, setUploadingImageForPost] = useState(null); // post_id while uploading

  // Create thread 
  const [showCreateThread, setShowCreateThread] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [creatingThread, setCreatingThread] = useState(false);

  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  useEffect(() => {
    loadProfile();
    loadCategories();
    // open WS
    connectWebsocket();
    return () => {
      cleanupWebsocket();
      clearTimeout(reconnectTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load profile to know current username / role
  const loadProfile = async () => {
    try {
      const p = await getProfile();
      setCurrentUser(p);
    } catch (err) {
      // If not logged in, currentUser stays null
      setCurrentUser(null);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getForumCategories();
      setCategories(data || []);
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  const handleCategoryClick = async (categoryId) => {
    setSelectedCategory(categoryId);
    setThreads([]);
    setPosts([]);
    setSelectedThread(null);
    setError('');
    setShowCreateThread(false);
    try {
      const data = await listForumThreads(categoryId);
      setThreads(data || []);
    } catch (err) {
      setError('Failed to load threads');
    }
  };

  const handleThreadClick = async (threadId) => {
    setSelectedThread(threadId);
    setLoading(true);
    try {
      const data = await getForumPosts(threadId);
      // backend returns thread detail with posts[] (your api does that)
      setPosts(data.posts || []);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- CREATE THREAD ---------------- */
  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !selectedCategory) return;
    
    setCreatingThread(true);
    try {
      // Calling API to create thread
      // API signature: createForumThread(title, categoryId, first_post_content)
      await createForumThread(newThreadTitle, selectedCategory, newThreadContent || "");
      
      // Reset form
      setNewThreadTitle("");
      setNewThreadContent("");
      setShowCreateThread(false);
      
      // Refresh threads list
      const data = await listForumThreads(selectedCategory);
      setThreads(data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to create thread");
    } finally {
      setCreatingThread(false);
    }
  };

  /* ---------------- CREATE / REPLY ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedThread) return;
    try {
      // createForumPost(threadId, contents, parent_post=null)
      const created = await createForumPost(selectedThread, input, replyTo || null);
      // if there's an image selected, upload it for the newly created post (assuming API returns created.post_id or id)
      if (imageFile && created?.id) {
        try {
          setUploadingImageForPost(created.id);
          await uploadForumPhoto({ file: imageFile, post_id: created.id });
        } finally {
          setUploadingImageForPost(null);
          setImageFile(null);
        }
      }
      setInput('');
      setReplyTo(null);
      // refresh posts
      const updated = await getForumPosts(selectedThread);
      setPosts(updated.posts || []);
    } catch (err) {
      console.error(err);
      alert('Failed to send message');
    }
  };

  /* ---------------- EDIT ---------------- */
  const startEdit = (post) => {
    setEditingPostId(post.post_id);
    setEditText(post.contents);
  };

  const saveEdit = async (postId) => {
    if (!editText.trim()) return;
    try {
      await updateForumPost(postId, { contents: editText });
      setEditingPostId(null);
      setEditText('');
      const updated = await getForumPosts(selectedThread);
      setPosts(updated.posts || []);
    } catch (err) {
      console.error(err);
      alert('Edit failed');
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteForumPost(postId);
      const updated = await getForumPosts(selectedThread);
      setPosts(updated.posts || []);
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  /* ---------------- Image Attach (for new posts) ---------------- */
  const onImageSelected = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setImageFile(f);
    }
  };

  /* ---------------- Helpers: role check ---------------- */
  const canModify = (post) => {
    // post.user?.username OR post.username fields can exist depending on backend
    const authorName = post.user?.username || post.username;
    if (!currentUser) return false;
    if (authorName === currentUser.username) return true;
    if (currentUser.is_staff || currentUser.is_superuser) return true;
    return false;
  };

  /* ---------------- Nested replies rendering ---------------- */
  const renderReplies = (replies = []) => {
    if (!replies || replies.length === 0) return null;
    return replies.map((r) => (
      <div key={r.post_id} style={{ marginLeft: 18 }} className="mt-2">
        <div className="mb-2 p-2 border rounded bg-light">
          <strong>{r.user?.username || r.username}</strong>{' '}
          <small className="text-muted ms-2">{new Date(r.created_at).toLocaleString()}</small>
          <p className="mb-1">{r.contents}</p>
          <div className="d-flex gap-2">
            <button className="btn btn-link btn-sm" onClick={() => setReplyTo(r.post_id)}>Reply</button>
            {canModify(r) && (
              <>
                <button className="btn btn-link btn-sm" onClick={() => startEdit(r)}>Edit</button>
                <button className="btn btn-link btn-sm text-danger" onClick={() => handleDelete(r.post_id)}>Delete</button>
              </>
            )}
          </div>
          {/* render nested replies (one more level) */}
          {r.replies && r.replies.length > 0 && renderReplies(r.replies)}
        </div>
      </div>
    ));
  };

  /* ---------------- WebSocket: real-time updates ---------------- */
  const connectWebsocket = () => {
    const apiBase = process.env.REACT_APP_API_URL || ''; // e.g. https://domain.com/api
    let wsUrl = process.env.REACT_APP_WS_URL;
    if (!wsUrl) {
      // try to derive: replace protocol and /api if present
      try {
        const u = new URL(apiBase);
        u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
        // append /ws/forums/ (backend must support this endpoint)
        wsUrl = `${u.origin}/ws/forums/`;
      } catch (e) {
        wsUrl = null;
      }
    }

    if (!wsUrl) return;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Forum WS connected', wsUrl);
      };

      wsRef.current.onmessage = (evt) => {
        // Expect server to send JSON like: { type: 'post_created', thread: X, post: {...} }
        try {
          const payload = JSON.parse(evt.data);
          if (!payload) return;
          // if change belongs to current thread, refresh posts
          if (payload.thread && selectedThread && Number(payload.thread) === Number(selectedThread)) {
            // quick path: if server provides full post, we can integrate, but safe approach: re-fetch
            getForumPosts(selectedThread).then((data) => setPosts(data.posts || []));
          } else {
            // if thread is not selected, ignore or optionally refresh threads list
          }
        } catch (e) {
          console.error('WS parse error', e);
        }
      };

      wsRef.current.onclose = (e) => {
        console.log('Forum WS closed, reconnecting in', WS_RECONNECT_MS);
        reconnectTimerRef.current = setTimeout(connectWebsocket, WS_RECONNECT_MS);
      };

      wsRef.current.onerror = (err) => {
        console.error('Forum WS error', err);
        wsRef.current?.close();
      };
    } catch (err) {
      console.error('Failed to open WS', err);
    }
  };

  const cleanupWebsocket = () => {
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      try { wsRef.current.close(); } catch {}
      wsRef.current = null;
    }
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="text-center mb-3">💬 Trail Chat Forum</h4>
          {error && <div className="alert alert-danger">{error}</div>}

          {/* categories */}
          <div className="mb-3">
            <h6>Categories</h6>
            <div className="d-flex flex-wrap gap-2">
              {categories.map(cat => (
                <button key={cat.category_id}
                        className={`btn btn-outline-primary btn-sm ${selectedCategory === cat.category_id ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(cat.category_id)}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* threads */}
          {selectedCategory && (
            <>
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Threads</h6>
                {currentUser && (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowCreateThread(!showCreateThread)}>
                    {showCreateThread ? "Cancel" : "+ Create Thread"}
                  </button>
                )}
              </div>

              {/* Create Thread Form */}
              {showCreateThread && (
                <div className="card mb-3">
                  <div className="card-body">
                    <h6>Create New Thread</h6>
                    <form onSubmit={handleCreateThread}>
                      <div className="mb-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Thread title"
                          value={newThreadTitle}
                          onChange={(e) => setNewThreadTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div className="mb-2">
                        <textarea
                          className="form-control"
                          placeholder="Initial message (optional)"
                          rows="3"
                          value={newThreadContent}
                          onChange={(e) => setNewThreadContent(e.target.value)}
                        />
                      </div>
                      <div className="d-flex gap-2">
                        <button 
                          type="submit" 
                          className="btn btn-success btn-sm"
                          disabled={creatingThread || !newThreadTitle.trim()}>
                          {creatingThread ? "Creating..." : "Create Thread"}
                        </button>
                        <button 
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setShowCreateThread(false);
                            setNewThreadTitle('');
                            setNewThreadContent('');
                          }}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {threads.length > 0 && (
                <div className="list-group mb-3">
                  {threads.map(t => (
                    <button key={t.thread_id}
                            className={`list-group-item list-group-item-action ${selectedThread === t.thread_id ? 'active' : ''}`}
                            onClick={() => handleThreadClick(t.thread_id)}>
                      {t.title}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* posts */}
          <div className="border rounded p-3 mb-3" style={{ height: 360, overflowY: 'auto', background: '#f9f9f9' }}>
            {loading ? (
              <p className="text-center text-muted">Loading posts...</p>
            ) : posts.length === 0 ? (
              <p className="text-center text-muted">{selectedThread ? 'No messages yet' : 'Select a thread'}</p>
            ) : (
              posts.map(post => (
                <div key={post.post_id} className="mb-3 p-2 border rounded">
                  <strong>{post.user?.username || post.username}</strong>{' '}
                  <small className="text-muted ms-2">{new Date(post.created_at).toLocaleString()}</small>

                  {editingPostId === post.post_id ? (
                    <>
                      <textarea className="form-control mt-2" value={editText} onChange={e => setEditText(e.target.value)} />
                      <div className="mt-2">
                        <button className="btn btn-success btn-sm me-2" onClick={() => saveEdit(post.post_id)}>Save</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingPostId(null)}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 mb-1">{post.contents}</p>
                      {/* image for post if present (assumes API returns image_url) */}
                      {post.image_url && (
                        <div className="mb-2">
                          <img src={post.image_url} alt="post" style={{ maxWidth: '200px', borderRadius: 6 }} />
                        </div>
                      )}
                      <div className="d-flex gap-2">
                        <button className="btn btn-link btn-sm" onClick={() => setReplyTo(post.post_id)}>Reply</button>
                        {canModify(post) && (
                          <>
                            <button className="btn btn-link btn-sm" onClick={() => startEdit(post)}>Edit</button>
                            <button className="btn btn-link btn-sm text-danger" onClick={() => handleDelete(post.post_id)}>Delete</button>
                          </>
                        )}
                      </div>

                      {/* nested replies */}
                      {post.replies && post.replies.length > 0 && (
                        <div className="mt-2">
                          {renderReplies(post.replies)}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {/* reply indicator */}
          {replyTo && (
            <div className="alert alert-info d-flex justify-content-between align-items-center">
              Replying to #{replyTo} <button className="btn btn-sm btn-link" onClick={() => setReplyTo(null)}>Cancel</button>
            </div>
          )}

          {/* image input */}
          <div className="mb-2">
            <input type="file" accept="image/*" onChange={onImageSelected} />
            {imageFile && <small className="text-muted ms-2">{imageFile.name}</small>}
          </div>

          {/* input */}
          {selectedThread && (
            <form onSubmit={handleSubmit} className="d-flex gap-2">
              <input type="text" className="form-control" placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} />
              <button className="btn btn-success" type="submit">{replyTo ? 'Reply' : 'Send'}</button>
            </form>
          )}

          {/* show upload status */}
          {uploadingImageForPost && <div className="mt-2 text-muted">Uploading image for post #{uploadingImageForPost}...</div>}
        </div>
      </div>
    </div>
  );
}