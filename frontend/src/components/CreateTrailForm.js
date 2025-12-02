import React, { useState } from 'react';

export default function CreateTrailForm({ onSubmit }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [stateVal, setStateVal] = useState('');

    async function handle(e) {
        e.preventDefault();
        if (!title.trim()) return alert('Title required');
        await onSubmit({ title, description, state: stateVal });
        setTitle(''); setDescription(''); setStateVal('');
    }

    return (
        <div className="card p-3">
            <h5>Create Trail</h5>
            <form onSubmit={handle}>
                <div className="mb-2">
                    <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} placeholder="Trail title" />
                </div>
                <div className="mb-2">
                    <input className="form-control" value={stateVal} onChange={e => setStateVal(e.target.value)} placeholder="State code" />
                </div>
                <div className="mb-2">
                    <textarea className="form-control" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Short description" />
                </div>
                <button className="btn btn-sm btn-success">Create Trail</button>
            </form>
        </div>
    );
}
