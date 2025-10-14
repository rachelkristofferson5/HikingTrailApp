import React, { useState } from 'react';
import TrailsList from './TrailsList';
import { getTrails } from '../api';

export default function TrailsPage() {
    const [stateCode, setStateCode] = useState('MN');
    const [trails, setTrails] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e && e.preventDefault();
        setLoading(true);
        try {
            const data = await getTrails(stateCode);
            const list = data.parks ? data.parks : data;
            setTrails(list);
        } catch (err) {
            setTrails([]);
            console.error('Trails fetch error:', err?.response?.data || err.message);
            alert('Error fetching trails. Make sure you are logged in and backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="col-md-10 offset-md-1">
            <div className="card p-3 mb-3">
                <h4>Find Trails</h4>
                <form className="row g-2 align-items-center" onSubmit={handleSearch}>
                    <div className="col-auto">
                        <label className="form-label">State</label>
                    </div>
                    <div className="col-auto" style={{minWidth: 160}}>
                        <input className="form-control" value={stateCode} onChange={e => setStateCode(e.target.value)} />
                    </div>
                    <div className="col-auto">
                        <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>
            </div>

            <div>
                <TrailsList trails={trails} />
            </div>
        </div>
    );
}
