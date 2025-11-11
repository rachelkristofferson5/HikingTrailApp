import React, { useEffect, useState } from 'react';
import { getProfile } from '../api';

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
                <div className="col-md-4">
                    <div className="card p-3 mb-3">
                        <h5>Profile</h5>
                        {loading ? <p>Loading...</p> : profile ? (
                            <div>
                                <p><strong>{profile.username || profile.user || profile.name}</strong></p>
                                <p className="small-muted">Email: {profile.email || ''}</p>
                            </div>
                        ) : <p>Not available.</p>}
                    </div>

                    <div className="card p-3">
                        <h5>Quick Links</h5>
                        <ul className="list-unstyled">
                            <li><a href="/trails">Find Trails</a></li>
                            <li><a href="/map/Map">View Map</a></li>
                            <li><a href="/chat">Chat / Forum</a></li>
                        </ul>
                    </div>
                </div>

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
