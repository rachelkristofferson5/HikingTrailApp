import React, { useState } from 'react';
import TrailsList from './TrailsList';
import ParksList from './ParksList';
import CreateTrailForm from './CreateTrailForm';
import CreateParkForm from './CreateParkForm';

import {
    searchTrailsByName,
    getParksByState,
    getStateParksWithTrails,
    searchTrailsByCoordinates,
    getAllTrails,
    getSavedTrails,
    saveTrail,
    deleteSavedTrail,
    createTrail,
    updateTrail,
    deleteTrail,
    getParkWithTrails,
    createPark,
} from '../api';

export default function TrailsPage() {
    const [query, setQuery] = useState('');
    const [stateCode, setStateCode] = useState('MN');
    const [trails, setTrails] = useState([]);
    const [parks, setParks] = useState([]);
    const [saved, setSaved] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('search');
    const [error, setError] = useState('');

    /* ---------------- SEARCH ---------------- */
    async function doSearch(e) {
        e?.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        try {
            const data = await searchTrailsByName(query, 50);
            setTrails(data.trails || data || []);
            setMode('search');
        } catch {
            setError('Search failed');
            setTrails([]);
        } finally { setLoading(false); }
    }

    /* ---------------- PARKS ---------------- */
    async function doParksByState(e) {
        e?.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await getParksByState(stateCode);
            setParks(data.parks || data || []);
            setMode('parks');
        } catch {
            setError('Failed to load parks.');
        } finally { setLoading(false); }
    }

    async function doStateParksWithTrails() {
        setLoading(true);
        setError('');
        try {
            const data = await getStateParksWithTrails(stateCode);
            setParks(data.parks || data || []);
            setMode('state-parks');
        } catch {
            setError('Failed to load state parks.');
        } finally { setLoading(false); }
    }

    async function onParkSelect(parkCode) {
        setLoading(true);
        try {
            const data = await getParkWithTrails(parkCode);
            setTrails(data.trails || data || []);
            setMode('search');
        } catch {
            setError('Failed loading park details');
        } finally { setLoading(false); }
    }

    /* ---------------- NEARBY ---------------- */
    async function doNearby(lat, lon) {
        setLoading(true);
        setError('');
        try {
            const data = await searchTrailsByCoordinates(lat, lon, 25);
            setTrails(data.trails || data || []);
            setMode('search');
        } catch {
            setError('Nearby search failed.');
        } finally { setLoading(false); }
    }

    /* ---------------- DB TRAILS ---------------- */
    async function loadDbTrails() {
        setLoading(true);
        try {
            const data = await getAllTrails();
            setTrails(data.trails || data || []);
            setMode('db');
        } catch {
            setError('Failed to load DB trails.');
        } finally { setLoading(false); }
    }

    /* ---------------- SAVED ---------------- */
    async function loadSavedTrails() {
        setLoading(true);
        try {
            const data = await getSavedTrails();
            setSaved(data.saved || data || []);
            setMode('saved');
        } catch {
            setError('Failed to load saved trails.');
        } finally { setLoading(false); }
    }

    async function onSaveTrail(id) {
        try {
            await saveTrail(id);
            await loadSavedTrails();
        } catch {
            alert('Save failed');
        }
    }

    async function onUnsave(id) {
        try {
            await deleteSavedTrail(id);
            await loadSavedTrails();
        } catch {
            alert('Unsave failed');
        }
    }

    /* ---------------- CREATE / UPDATE / DELETE ---------------- */
    async function onCreateTrail(body) {
        try {
            await createTrail(body);
            alert('Trail created');
            await loadDbTrails();
        } catch {
            alert('Create failed');
        }
    }

    async function onEditTrail(id) {
        // minimal use of updateTrail (required)
        const newName = prompt("New name?");
        if (!newName) return;

        try {
            await updateTrail(id, { title: newName });
            alert("Updated");
            await loadDbTrails();
        } catch {
            alert("Update failed");
        }
    }

    async function onDeleteTrail(id) {
        if (!window.confirm("Delete this trail?")) return;

        try {
            await deleteTrail(id);
            alert("Deleted");
            await loadDbTrails();
        } catch {
            alert("Delete failed");
        }
    }

    /* ---------------- CREATE PARK ---------------- */
    async function onCreatePark(body) {
        try {
            await createPark(body);
            alert('Park created');
        } catch {
            alert('Create park failed');
        }
    }

    /* ---------------- RENDER ---------------- */
    return (
        <div className="container mt-4">
            <div className="card p-3 mb-3 shadow-sm">
                <h4>Trails Hub</h4>

                <div className="d-flex gap-2 flex-wrap mb-3">
                    <button className="btn btn-outline-primary" onClick={() => setMode('search')}>
                        Search
                    </button>
                    <button className="btn btn-outline-primary" onClick={loadDbTrails}>
                        Local DB Trails
                    </button>
                    <button className="btn btn-outline-primary" onClick={loadSavedTrails}>
                        Saved Trails
                    </button>
                    <button className="btn btn-outline-secondary" onClick={() => setMode('manage')}>
                        Manage
                    </button>
                </div>

                {/* SEARCH */}
                <form className="row g-2 mb-2" onSubmit={doSearch}>
                    <div className="col-auto">
                        <input className="form-control"
                               placeholder="Search trails"
                               value={query}
                               onChange={e => setQuery(e.target.value)} />
                    </div>
                    <div className="col-auto">
                        <button className="btn btn-primary" disabled={loading}>
                            {loading ? '...' : 'Search'}
                        </button>
                    </div>
                </form>

                {/* STATE PARKS */}
                <form className="row g-2" onSubmit={doParksByState}>
                    <div className="col-auto">
                        <input className="form-control"
                               style={{ width: 120 }}
                               value={stateCode}
                               onChange={e => setStateCode(e.target.value.toUpperCase())} />
                    </div>
                    <div className="col-auto">
                        <button className="btn btn-outline-primary">State Parks</button>
                    </div>
                    <div className="col-auto">
                        <button type="button"
                                className="btn btn-outline-secondary"
                                onClick={doStateParksWithTrails}>
                            State Parks + Trails
                        </button>
                    </div>
                    <div className="col-auto">
                        <button type="button"
                                className="btn btn-outline-success"
                                onClick={() => navigator.geolocation?.getCurrentPosition(
                                    pos => doNearby(pos.coords.latitude, pos.coords.longitude),
                                    () => alert('Location denied')
                                )}>
                            Trails Near Me
                        </button>
                    </div>
                </form>

                {error && <div className="alert alert-danger mt-2">{error}</div>}
            </div>

            {/* PARKS */}
            {(mode === 'parks' || mode === 'state-parks') && (
                <ParksList
                    parks={parks}
                    onSelectPark={p => onParkSelect(
                        p.park_code || p.code || p.id
                    )}
                />
            )}

            {/* TRAILS */}
            {(mode === 'search' || mode === 'db') && (
                <TrailsList
                    trails={trails}
                    onSave={onSaveTrail}
                    onManageEdit={onEditTrail}   // required for TrailsList Edit button
                    onDeleteTrail={onDeleteTrail} // NEW minimal delete support
                />
            )}

            {/* SAVED */}
            {mode === 'saved' && (
                <div className="card p-3">
                    <h5>Saved Trails</h5>
                    {saved.length === 0 ? <p>No saved trails.</p> : (
                        <div className="row">
                            {saved.map(s => (
                                <div key={s.saved_id} className="col-md-6 mb-3">
                                    <div className="card p-2">
                                        <h6>{s.trail?.title || s.title}</h6>
                                        <div className="d-flex gap-2">
                                            <a className="btn btn-sm btn-outline-primary"
                                               href={`/trails/${s.trail?.trail_id || s.trail}`}>
                                                View
                                            </a>
                                            <button className="btn btn-sm btn-danger"
                                                    onClick={() => onUnsave(s.saved_id)}>
                                                Unsave
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* MANAGE */}
            {mode === 'manage' && (
                <div className="row">
                    <div className="col-md-6">
                        <CreateTrailForm onSubmit={onCreateTrail} />
                    </div>
                    <div className="col-md-6">
                        <CreateParkForm onSubmit={onCreatePark} />
                    </div>
                </div>
            )}
        </div>
    );
}
