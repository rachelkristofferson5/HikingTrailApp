import React from 'react';

export default function TrailsList({ trails }) {
    if (!trails || trails.length === 0) {
        return <div className="card p-3"><p>No trails found. Try another state code.</p></div>;
    }

    return (
        <div className="row">
            {trails.map((t, idx) => (
                <div className="col-md-6 mb-3" key={idx}>
                    <div className="card h-100">
                        {t.image ? (
                            <img src={t.image} alt={t.name} className="card-img-top" style={{ height: 180, objectFit: 'cover' }} />
                        ) : null}
                        <div className="card-body">
                            <h5 className="card-title">{t.name || t.park_name || t.fullName}</h5>
                            <p className="card-text">{(t.description || '').slice(0, 160)}{t.description && t.description.length > 160 ? '...' : ''}</p>
                            {t.url && <a href={t.url} className="btn btn-sm btn-outline-primary" target="_blank" rel="noreferrer">More</a>}
                        </div>
                        <div className="card-footer text-muted small">
                            {t.state && <span>{t.state}</span>}
                            {t.latitude && <span className="ms-3">Lat: {t.latitude}</span>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
