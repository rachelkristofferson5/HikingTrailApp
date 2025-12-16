import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    getProfile,
    listMyHikes,
    getTrailDetails
} from '../api';

export default function Dashboard() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const [recentTrails, setRecentTrails] = useState([]);
    const [hikes, setHikes] = useState([]);

    useEffect(() => {
        async function loadAll() {
            try {
                const p = await getProfile();
                setProfile(p);

                // load recent trails
                const ids = JSON.parse(localStorage.getItem('recentTrails')) || [];
                if (ids.length > 0) {
                    const trails = await Promise.all(
                        ids.map(id => getTrailDetails(id))
                    );
                    setRecentTrails(trails.filter(Boolean));
                }

                // load hikes
                const myHikes = await listMyHikes();
                setHikes(myHikes || []);
            } catch {
                setProfile(null);
            } finally {
                setLoading(false);
            }
        }

        loadAll();
    }, []);

    return (
        <div className="col-md-10 offset-md-1">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Dashboard</h3>
                <small className="small-muted">Manage account & explore trails</small>
            </div>

            <div className="row">

                {/* LEFT COLUMN */}
                <div className="col-md-4">

                    {/* PROFILE */}
                    <div className="card p-3 mb-3">
                        <h5>Profile</h5>
                        {loading ? (
                            <p>Loading...</p>
                        ) : profile ? (
                            <>
                                <p><strong>{profile.username}</strong></p>
                                {profile.email && <p>Email: {profile.email}</p>}
                                {profile.bio && <p>{profile.bio}</p>}

                                {profile.profile_photo_url && (
                                    <img
                                        src={profile.profile_photo_url}
                                        alt="profile"
                                        style={{
                                            width: 100,
                                            height: 100,
                                            objectFit: 'cover',
                                            borderRadius: 10
                                        }}
                                    />
                                )}

                                <Link to="/profile" className="btn btn-sm btn-primary mt-2">
                                    Edit Profile
                                </Link>
                            </>
                        ) : (
                            <p>Not available</p>
                        )}
                    </div>

                    {/* QUICK LINKS */}
                    <div className="card p-3">
                        <h5>Quick Links</h5>
                        <ul className="list-unstyled">
                            <li><Link to="/trails">Find Trails</Link></li>
                            <li><Link to="/map">Track a Hike</Link></li>
                            <li><Link to="/chat">Forum</Link></li>
                            <li><Link to="/messages">Messages</Link></li>
                        </ul>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="col-md-8">

                    {/* RECENT TRAILS */}
                    <div className="card p-3 mb-3">
                        <h5>Recent Trails</h5>

                        {recentTrails.length === 0 ? (
                            <p className="small-muted">
                                Trails you view will appear here.
                            </p>
                        ) : (
                            <ul className="list-group list-group-flush">
                                {recentTrails.map(trail => (
                                    <li key={trail.id} className="list-group-item">
                                        <Link to={`/trails/${trail.id}`}>
                                            {trail.title || trail.name}
                                        </Link>
                                        {trail.location && (
                                            <div className="small text-muted">
                                                {trail.location}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* ACTIVITY */}
                    <div className="card p-3">
                        <h5>Activity</h5>

                        {hikes.length === 0 ? (
                            <p className="small-muted">No recent activity yet.</p>
                        ) : (
                            <ul className="list-group list-group-flush">
                                {hikes.slice(0, 5).map(hike => (
                                    <li key={hike.hike_id || hike.id} className="list-group-item">
                                        <strong>Hike completed</strong>
                                        <div className="small text-muted">
                                            Distance: {hike.distance_miles ?? '—'} miles ·
                                            Duration: {hike.duration_min ?? '—'} min
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
