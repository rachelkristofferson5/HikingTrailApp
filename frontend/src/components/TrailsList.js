import React from 'react';
import { Link } from 'react-router-dom';

export default function TrailsList({ trails = [], onSave, onManageEdit }) {
    if (!trails || trails.length === 0) {
        return <div className="card p-3"><p>No trails found. Try another search.</p></div>;
    }

    return (
        <div className="row">
            {trails.map((t) => {
                const id = t.trail_id || t.id || t.id;
                return (
                    <div className="col-md-6 mb-3" key={id}>
                        <div className="card h-100">
                            {t.image && <img src={t.image} alt={t.title || t.name} className="card-img-top" style={{height:180, objectFit:'cover'}} />}
                            <div className="card-body">
                                <h5 className="card-title">{t.title || t.name}</h5>
                                <p className="card-text">{(t.description||'').slice(0,160)}{t.description && t.description.length>160 ? '...' : ''}</p>
                                <div className="d-flex gap-2">
                                    <Link to={`/trails/${id}`} className="btn btn-sm btn-outline-primary">View</Link>
                                    {onSave && <button className="btn btn-sm btn-success" onClick={() => onSave(id)}>Save</button>}
                                    {onManageEdit && <button className="btn btn-sm btn-secondary" onClick={() => onManageEdit(id)}>Edit</button>}
                                </div>
                            </div>
                            <div className="card-footer text-muted small">
                                {t.state && <span>{t.state}</span>}
                                {t.latitude && <span className="ms-3">Lat: {t.latitude}</span>}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
