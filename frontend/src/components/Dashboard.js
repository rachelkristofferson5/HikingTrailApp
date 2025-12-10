import React, { useEffect, useState } from 'react';
import { getProfile } from '../api';
import { Link } from "react-router-dom";

export default function Dashboard() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const p = await getProfile();
                setProfile(p);
            } catch {
                setProfile(null);
            } finally {
                setLoading(false);
            }
        }
        load();
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

                    {/* PROFILE CARD */}
                    <div className="card p-3 mb-3">
                        <h5>Profile</h5>
                        {loading ? (
                            <p>Loading...</p>
                        ) : profile ? (
                            <div>
                                <p><strong>{profile.username}</strong></p>

                                {profile.email && <p className="small-muted">Email: {profile.email}</p>}
                                {profile.first_name && <p>First Name: {profile.first_name}</p>}
                                {profile.last_name && <p>Last Name: {profile.last_name}</p>}
                                {profile.bio && <p>Bio: {profile.bio}</p>}
                                {profile.location && <p>Location: {profile.location}</p>}

                                {profile.profile_photo_url && (
                                    <div className="mb-2">
                                        <img
                                            src={profile.profile_photo_url}
                                            alt="Profile"
                                            style={{
                                                width: "100px",
                                                height: "100px",
                                                borderRadius: "10px",
                                                objectFit: "cover"
                                            }}
                                        />
                                    </div>
                                )}


                                <Link to="/profile" className="btn btn-sm btn-primary mt-2">
                                    Edit Profile
                                </Link>
                            </div>
                        ) : (
                            <p>Not available.</p>
                        )}
                    </div>

                    {/* QUICK LINKS */}
                    <div className="card p-3">
                        <h5>Quick Links</h5>
                        <ul className="list-unstyled">
                            <li><Link to="/trails">Find Trails</Link></li>
                            <li><Link to="/map">View Map</Link></li>
                            <li><Link to="/chat">Chat / Forum</Link></li>
                            <li><Link to="/messages">Direct Messages</Link></li>
                        </ul>
                        <hr />

                        <h6>Message a User</h6>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const name = e.target.user.value.trim();
                                if (name) window.location.href = `/messages?user=${name}`;
                            }}
                            className="d-flex gap-2"
                        >
                            <input
                                type="text"
                                name="user"
                                className="form-control"
                                placeholder="Enter username"
                            />
                            <button className="btn btn-sm btn-primary">Go</button>
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="col-md-8">
                    <div className="card p-3 mb-3">
                        <h5>Recent Trails</h5>
                        <p className="small-muted">Search trails on the Trails page to see results here.</p>
                    </div>

                    <div className="card p-3">
                        <h5>Activity</h5>
                        <p className="small-muted">No recent activity yet.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
