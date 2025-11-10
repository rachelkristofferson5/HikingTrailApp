import React, { useState } from 'react';
import TrailsList from './TrailsList';
import { getParksByState } from '../api';

export default function TrailsPage() {
    const [stateCode, setStateCode] = useState('MN');
    const [trails, setTrails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e && e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await getParksByState(stateCode);
            const list = data.parks || data;
            setTrails(list);
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
                <h4 className="mb-3">Find Trails by State</h4>
                <form className="row g-3 align-items-center" onSubmit={handleSearch}>
                    <div className="col-auto">
                        <label className="form-label mb-0">State Code (e.g. MN, CA, CO)</label>
                    </div>
                    <div className="col-auto" style={{ minWidth: 160 }}>
                        <input
                            className="form-control"
                            value={stateCode}
                            onChange={e => setStateCode(e.target.value.toUpperCase())}
                        />
                    </div>
                    <div className="col-auto">
                        <button
                            className="btn btn-primary"
                            onClick={handleSearch}
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
            </div>

            <div>
                <TrailsList trails={trails} />
            </div>
        </div>
    );
}