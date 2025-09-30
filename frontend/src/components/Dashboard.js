import React, { useEffect, useState } from 'react';
import { getProfile, getTrails } from '../api';
import TrailsList from './TrailsList';

export default function Dashboard() {
    const [profile, setProfile] = useState(null);
    const [stateCode, setStateCode] = useState('MN'); // default
    const [trails, setTrails] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadProfile() {
            try {
                const data = await getProfile();
                setProfile(data);
            } catch (err) {
                // ignore for now
            }
        }
        loadProfile();
    }, []);

    const searchTrails = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await getTrails(stateCode);
            // backend returned maybe { parks: [...] } or direct array - normalize:
            const list = data.parks ? data.parks : data;
            setTrails(list);
        } catch (err) {
            setTrails([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Dashboard</h2>
            {profile && <div className="mb-3">Welcome, <strong>{profile.username || profile.user || profile.name}</strong></div>}
            <form className="row g-2 align-items-center mb-3" onSubmit={searchTrails}>
                <div className="col-auto">
                    <label htmlFor="stateInput" className="col-form-label">State</label>
                </div>
                <div className="col-auto">
                    <input id="stateInput" value={stateCode} onChange={e => setStateCode(e.target.value)} className="form-control" />
                </div>
                <div className="col-auto">
                    <button className="btn btn-primary" type="submit">Search Trails</button>
                </div>
            </form>

            {loading ? <div>Loading...</div> : <TrailsList trails={trails} />}
        </div>
    );
}
