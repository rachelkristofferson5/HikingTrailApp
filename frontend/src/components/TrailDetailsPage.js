import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    getTrailDetails,
    listReviews,
    createReview,
    listConditions,
    reportCondition,
    listTrailPhotos,
    uploadTrailPhoto,
    listTags,
    listFeatures,
    createFeature
} from '../api';

export default function TrailDetailsPage() {
    const { id } = useParams(); // route: /trails/:id
    const [trail, setTrail] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [conditions, setConditions] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [tags, setTags] = useState([]);
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        async function loadAll() {
            setLoading(true);
            try {
                const t = await getTrailDetails(id);
                setTrail(t);
                // store recently viewed trails
                const RECENT_KEY = 'recentTrails';
                const existing = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
                // remove duplicates
                const updated = [id, ...existing.filter(tid => String(tid) !== String(id))];
                // keep only last 3
                localStorage.setItem(RECENT_KEY, JSON.stringify(updated.slice(0, 3)));
                const r = await listReviews(id);
                setReviews(r.results || r || []);
                const c = await listConditions(id);
                setConditions(c.results || c || []);
                const p = await listTrailPhotos(id);
                setPhotos(p.results || p || []);
                const tg = await listTags();
                setTags(tg.results || tg || []);
                const f = await listFeatures(id);
                setFeatures(f.results || f || []);
            } catch (err) {
                console.error(err);
                setMsg('Failed to load trail details');
            } finally { setLoading(false); }
        }
        loadAll();
    }, [id]);

    async function handleCreateReview(e) {
        e.preventDefault();
        const form = e.target;
        const body = {
            trail: id,
            rating: Number(form.rating.value),
            title: form.title.value,
            review_text: form.review_text.value,
            visited_date: form.visited_date.value
        };
        try {
            await createReview(body);
            setMsg('Review posted');
            const r = await listReviews(id);
            setReviews(r.results || r || []);
            form.reset();
        } catch (err) {
            console.error(err);
            setMsg('Failed to post review');
        }
    }

    async function handlePhotoUpload(e) {
        e.preventDefault();
        const file = e.target.photo.files[0];
        if (!file) return;
        try {
            await uploadTrailPhoto({ file, trail_id: id, caption: e.target.caption.value });
            const p = await listTrailPhotos(id);
            setPhotos(p.results || p || []);
            setMsg('Photo uploaded');
        } catch (err) {
            console.error(err);
            setMsg('Upload failed');
        }
    }

    async function handleReportCondition(e) {
        e.preventDefault();
        const body = {
            trail: id,
            condition_type: e.target.condition_type.value,
            description: e.target.description.value,
            severity: e.target.severity.value,
            reported_date: e.target.reported_date.value
        };
        try {
            await reportCondition(body);
            const c = await listConditions(id);
            setConditions(c.results || c || []);
            setMsg('Condition reported');
            e.target.reset();
        } catch (err) {
            console.error(err);
            setMsg('Report failed');
        }
    }

    async function handleAddFeature(e) {
        e.preventDefault();
        const body = {
            trail: id,
            feature_type: e.target.feature_type.value,
            feature_name: e.target.feature_name.value,
            decimal_latitude: Number(e.target.decimal_latitude.value) || null,
            decimal_longitude: Number(e.target.decimal_longitude.value) || null,
            description: e.target.description.value
        };
        try {
            await createFeature(body);
            const f = await listFeatures(id);
            setFeatures(f.results || f || []);
            setMsg('Feature added');
            e.target.reset();
        } catch (err) {
            console.error(err);
            setMsg('Failed to add feature');
        }
    }

    if (loading) return <div className="container mt-4"><p>Loading...</p></div>;

    return (
        <div className="container mt-4">
            <div className="card p-3 mb-3 shadow-sm">
                <h3>{trail?.title || trail?.name || `Trail ${id}`}</h3>
                <p className="text-muted">{trail?.description}</p>
            </div>

            {msg && <div className="alert alert-info">{msg}</div>}

            <div className="row">
                <div className="col-md-7">
                    <div className="card p-3 mb-3">
                        <h5>Photos</h5>
                        <div className="d-flex flex-wrap gap-2">
                            {photos.length === 0 ? <p className="text-muted">No photos yet.</p> : photos.map(p => (
                                <img key={p.photo_id || p.id} src={p.photo_url || p.url} alt={p.caption || ''} style={{width:120, height:80, objectFit:'cover', borderRadius:6}} />
                            ))}
                        </div>
                        <form className="mt-3" onSubmit={handlePhotoUpload}>
                            <div className="mb-2">
                                <input type="file" name="photo" className="form-control" required />
                            </div>
                            <div className="mb-2">
                                <input name="caption" placeholder="Caption (optional)" className="form-control" />
                            </div>
                            <button className="btn btn-sm btn-outline-primary">Upload Photo</button>
                        </form>
                    </div>

                    <div className="card p-3 mb-3">
                        <h5>Reviews</h5>
                        {reviews.length === 0 ? <p className="text-muted">No reviews yet.</p> : reviews.map(r => (
                            <div key={r.post_id || r.review_id || r.id} className="mb-2">
                                <strong>{r.user?.username || r.user}</strong> <small className="text-muted"> - {r.rating}/5</small>
                                <p className="mb-0">{r.title}</p>
                                <small className="text-muted">{r.review_text}</small>
                                <hr />
                            </div>
                        ))}
                        <form onSubmit={handleCreateReview} className="mt-2">
                            <div className="row g-2">
                                <div className="col-auto"><input name="rating" defaultValue="5" className="form-control" /></div>
                                <div className="col"><input name="title" placeholder="Title" className="form-control" /></div>
                                <div className="col-12"><textarea name="review_text" placeholder="Write your review..." className="form-control" /></div>
                                <div className="col-auto"><input type="date" name="visited_date" className="form-control" /></div>
                                <div className="col-auto"><button className="btn btn-sm btn-success">Post Review</button></div>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="col-md-5">
                    <div className="card p-3 mb-3">
                        <h5>Trail Conditions</h5>
                        {conditions.length === 0 ? <p className="text-muted">No condition reports.</p> : conditions.map(c => (
                            <div key={c.id || c.condition_id} className="mb-2">
                                <strong>{c.condition_type}</strong> <small className="text-muted">{c.severity}</small>
                                <p className="mb-0">{c.description}</p>
                            </div>
                        ))}
                        <form onSubmit={handleReportCondition} className="mt-2">
                            <div className="mb-2">
                                <input name="condition_type" placeholder="Type e.g. muddy, blocked" className="form-control" />
                            </div>
                            <div className="mb-2">
                                <textarea name="description" placeholder="Description" className="form-control" />
                            </div>
                            <div className="mb-2">
                                <select name="severity" className="form-control">
                                    <option value="low">Low</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div className="mb-2">
                                <input type="date" name="reported_date" className="form-control" />
                            </div>
                            <button className="btn btn-sm btn-outline-danger">Report Condition</button>
                        </form>
                    </div>

                    <div className="card p-3 mb-3">
                        <h5>Features & Tags</h5>
                        <div className="mb-2">
                            <strong>Tags:</strong> {tags.map(t => <span key={t.tag_id || t.id} className="badge bg-light text-dark me-1">{t.tag_name || t.name}</span>)}
                        </div>
                        <div className="mb-2">
                            <strong>Features:</strong>
                            {features.map(f => <div key={f.feature_id || f.id} className="small">{f.feature_type}: {f.feature_name}</div>)}
                        </div>

                        <form onSubmit={handleAddFeature}>
                            <div className="mb-1"><input name="feature_type" className="form-control" placeholder="Type (viewpoint, water source)" /></div>
                            <div className="mb-1"><input name="feature_name" className="form-control" placeholder="Name" /></div>
                            <div className="mb-1"><input name="decimal_latitude" className="form-control" placeholder="Latitude (optional)" /></div>
                            <div className="mb-1"><input name="decimal_longitude" className="form-control" placeholder="Longitude (optional)" /></div>
                            <div className="mb-1"><textarea name="description" className="form-control" placeholder="Description"></textarea></div>
                            <button className="btn btn-sm btn-outline-primary">Add Feature</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
