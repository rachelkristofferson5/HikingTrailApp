import React from 'react';

export default function ParksList({ parks = [], onSelectPark }) {
    if (!parks || parks.length === 0) {
        return <div className="card p-3"><p>No parks found.</p></div>;
    }

    return (
        <div className="row">
            {parks.map(p => (
                <div key={p.park_id || p.id || p.parkCode} className="col-md-6 mb-3">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5>{p.name || p.fullName || p.park_name}</h5>
                            <p className="small text-muted">{p.description || p.states}</p>
                            <div className="d-flex gap-2">
                                {onSelectPark && <button className="btn btn-sm btn-outline-primary" onClick={() => onSelectPark(p.park_code || p.parkCode || p.parkCode)}>Show Trails</button>}
                                {p.url && <a className="btn btn-sm btn-outline-secondary" href={p.url} target="_blank" rel="noreferrer">Park Site</a>}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
