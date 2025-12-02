import React, { useState } from 'react';

export default function CreateParkForm({ onSubmit }) {
    const [name, setName] = useState('');
    const [stateVal, setStateVal] = useState('');
    const [description, setDescription] = useState('');

    async function handle(e) {
        e.preventDefault();
        if (!name.trim()) return alert('Name required');
        await onSubmit({ name, state: stateVal, description });
        setName(''); setStateVal(''); setDescription('');
    }

    return (
        <div className="card p-3">
            <h5>Create Park</h5>
            <form onSubmit={handle}>
                <div className="mb-2"><input className="form-control" value={name} onChange={e=>setName(e.target.value)} placeholder="Park name" /></div>
                <div className="mb-2"><input className="form-control" value={stateVal} onChange={e=>setStateVal(e.target.value)} placeholder="State (e.g. MN)" /></div>
                <div className="mb-2"><textarea className="form-control" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" /></div>
                <button className="btn btn-sm btn-success">Create Park</button>
            </form>
        </div>
    );
}
