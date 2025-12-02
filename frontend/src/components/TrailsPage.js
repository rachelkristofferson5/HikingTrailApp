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
    getParkWithTrails
} from '../api';

export default function TrailsPage() {
    const [query, setQuery] = useState('');
    const [stateCode, setStateCode] = useState('MN');
    const [trails, setTrails] = useState([]);
    const [parks, setParks] = useState([]);
    const [saved, setSaved] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('search'); // 'search' | 'parks' | 'state-parks' | 'db' | 'saved' | 'manage'
    const [error, setError] = useState('');

    async function doSearch(e) {
        e?.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        setError('');
        try {
            const data = await searchTrailsByName(query, 50);
            setTrails(data.trails || data || []);
            setMode('search');
        } catch (err) {
            console.error(err);
            setError('Search failed.');
            setTrails([]);
        } finally { setLoading(false); }
    }

    async function doParksByState(e) {
        e?.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await getParksByState(stateCode);
            setParks(data.parks || data || []);
            setMode('parks');
        } catch (err) {
            console.error(err);
            setError('Failed to load parks.');
            setParks([]);
        } finally { setLoading(false); }
    }

    async function doStateParksWithTrails() {
        setLoading(true);
        setError('');
        try {
            const data = await getStateParksWithTrails(stateCode);
            setParks(data.parks || data || []);
            setMode('state-parks');
        } catch (err) {
            console.error(err);
            setError('Failed to load state parks.');
            setParks([]);
        } finally { setLoading(false); }
    }

    async function doNearby(lat, lon) {
        setLoading(true);
        setError('');
        try {
            const data = await searchTrailsByCoordinates(lat, lon, 25);
            setTrails(data.trails || data || []);
            setMode('search');
        } catch (err) {
            console.error(err);
            setError('Nearby search failed.');
        } finally { setLoading(false); }
    }

    async function loadDbTrails() {
        setLoading(true);
        setError('');
        try {
            const data = await getAllTrails();
            setTrails(data.trails || data || []);
            setMode('db');
        } catch (err) {
            console.error(err);
            setError('Failed to load DB trails.');
        } finally { setLoading(false); }
    }

    async function loadSavedTrails() {
        setLoading(true);
        setError('');
        try {
            const data = await getSavedTrails();
            setSaved(data.saved || data || []);
            setMode('saved');
        } catch (err) {
            console.error(err);
            setError('Failed to load saved trails.');
        } finally { setLoading(false); }
    }

    // Save / unsave actions
    async function onSaveTrail(trailId) {
        try {
            await saveTrail(trailId);
            await loadSavedTrails();
        } catch (err) {
            console.error(err);
            alert('Save failed');
        }
    }
    async function onUnsave(savedId) {
        try {
            await deleteSavedTrail(savedId);
            await loadSavedTrails();
        } catch (err) {
            console.error(err);
            alert('Unsave failed');
        }
    }

    // Manage (create/update/delete)
    async function onCreateTrail(body) {
        try {
            await createTrail(body);
            alert('Created trail');
            await loadDbTrails();
        } catch (err) {
            console.error(err);
            alert('Create failed');
        }
    }
    async function onUpdateTrail(id, body) {
        try {
            await updateTrail(id, body);
            alert('Updated');
            await loadDbTrails();
        } catch (err) {
            console.error(err);
            alert('Update failed');
        }
    }
    async function onDeleteTrail(id) {
        if (!window.confirm('Delete this trail?')) return;
        try {
            await deleteTrail(id);
            alert('Deleted');
            await loadDbTrails();
        } catch (err) {
            console.error(err);
            alert('Delete failed');
        }
    }

    // get park with trails (recreation.gov combine)
    async function onParkSelect(parkCode) {
        setLoading(true);
        try {
            const data = await getParkWithTrails(parkCode);
            // backend returns park + trails shape — adapt as needed
            setTrails(data.trails || data. trails || []);
            setMode('search');
        } catch (err) {
            console.error(err);
            setError('Failed loading park details');
        } finally { setLoading(false); }
    }

    return (
        <div className="container mt-4">
            <div className="card p-3 mb-3 shadow-sm">
                <h4>Trails Hub</h4>
                <div className="d-flex gap-2 flex-wrap mb-3">
                    <button className="btn btn-outline-primary" onClick={() => { setMode('search'); setTrails([]); }}>Search</button>
                    <button className="btn btn-outline-primary" onClick={loadDbTrails}>Local DB Trails</button>
                    <button className="btn btn-outline-primary" onClick={loadSavedTrails}>Saved Trails</button>
                    <button className="btn btn-outline-secondary" onClick={() => setMode('manage')}>Manage (Create/Edit)</button>
                </div>

                {/* Search by name */}
                <form className="row g-2 align-items-center mb-2" onSubmit={doSearch}>
                    <div className="col-auto">
                        <input className="form-control" placeholder="Search trails (name, city, keyword)" value={query} onChange={e => setQuery(e.target.value)} />
                    </div>
                    <div className="col-auto">
                        <button className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Search'}</button>
                    </div>
                </form>

                {/* Parks by state */}
                <form className="row g-2 align-items-center" onSubmit={doParksByState}>
                    <div className="col-auto">
                        <input className="form-control" style={{width:120}} value={stateCode} onChange={e => setStateCode(e.target.value.toUpperCase())} />
                    </div>
                    <div className="col-auto">
                        <button className="btn btn-outline-primary">State Parks</button>
                    </div>
                    <div className="col-auto">
                        <button type="button" className="btn btn-outline-secondary" onClick={doStateParksWithTrails}>State Parks + Trails</button>
                    </div>
                    <div className="col-auto">
                        <button type="button" className="btn btn-outline-success" onClick={() => {
                            if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => doNearby(p.coords.latitude, p.coords.longitude));
                            else alert('Geolocation not supported');
                        }}>Trails Near Me</button>
                    </div>
                </form>
                {error && <div className="alert alert-danger mt-2">{error}</div>}
            </div>

            {/* Mode sections */}
            {mode === 'parks' || mode === 'state-parks' ? (
                <ParksList parks={parks} onSelectPark={p => onParkSelect(p.park_code || p.parkCode || p.parkCode)} />
            ) : null}

            {mode === 'search' || mode === 'db' ? (
                <TrailsList
                    trails={trails}
                    onSave={onSaveTrail}
                    onManageEdit={(id) => setMode('manage')}
                />
            ) : null}

            {mode === 'saved' ? (
                <div className="card p-3">
                    <h5>Saved Trails</h5>
                    {saved.length === 0 ? <p>No saved trails yet.</p> : (
                        <div className="row">
                            {saved.map(s => (
                                <div key={s.saved_id} className="col-md-6 mb-3">
                                    <div className="card p-2">
                                        <h6>{s.trail?.title || s.title}</h6>
                                        <div className="d-flex gap-2">
                                            <a className="btn btn-sm btn-outline-primary" href={`/trails/${s.trail?.trail_id || s.trail}`}>View</a>
                                            <button className="btn btn-sm btn-danger" onClick={() => onUnsave(s.saved_id)}>Unsave</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : null}

            {mode === 'manage' ? (
                <div className="row">
                    <div className="col-md-6"><CreateTrailForm onSubmit={onCreateTrail} /></div>
                    <div className="col-md-6"><CreateParkForm onSubmit={createPark} /></div>
                </div>
            ) : null}
        </div>
    );
}
