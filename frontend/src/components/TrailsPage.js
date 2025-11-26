import React, { useState } from 'react';
import TrailsList from './TrailsList';
import { searchTrailsByName } from '../api';

export default function TrailsPage() {
    const [query, setQuery] = useState('');
    const [trails, setTrails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e && e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');

        try {
            const data = await searchTrailsByName(query, 50);
            setTrails(data.trails || []);
        } catch (err) {
            console.error('Trails fetch error:', err?.response?.data || err.message);
            setError('Error fetching trails.');
            setTrails([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="col-md-10 offset-md-1 mt-4">
            <div className="card p-4 shadow-sm mb-3">
                <h4 className="mb-3">Search Trails</h4>

                <form className="row g-3 align-items-center" onSubmit={handleSearch}>
                    <div className="col-auto">
                        <label className="form-label mb-0">Search by name, city, state, or keyword:</label>
                    </div>

                    <div className="col-auto" style={{ minWidth: 200 }}>
                        <input
                            className="form-control"
                            placeholder="e.g. Minnesota, Superior Hiking Trail"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <div className="col-auto">
                        <button
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>

                {error && <div className="alert alert-danger mt-3">{error}</div>}
            </div>

            <TrailsList trails={trails} />
        </div>
    );
}
