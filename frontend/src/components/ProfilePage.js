import React, { useEffect, useState } from "react";
import {
    getProfile,
    updateProfile,
    uploadProfilePhoto,
    deleteProfilePhoto
} from "../api";

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [editData, setEditData] = useState({
        full_name: "",
        bio: "",
        experience_level: "",
    });

    // Load profile on mount
    useEffect(() => {
        async function loadProfile() {
            setLoading(true);
            try {
                const data = await getProfile();
                setProfile(data);

                // preload fields for editing
                setEditData({
                    full_name: data.full_name || "",
                    bio: data.bio || "",
                    experience_level: data.experience_level || "",
                });
            } catch (err) {
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);

    // Handle profile text update
    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const updated = await updateProfile(editData);
            setProfile(updated);
            setSuccess("Profile updated successfully!");
        } catch (err) {
            setError("Could not update profile.");
        } finally {
            setSaving(false);
        }
    }

    // Upload new photo
    async function handlePhotoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        setError("");
        setSuccess("");

        try {
            const updated = await uploadProfilePhoto(file);
            setProfile(updated);
            setSuccess("Profile photo updated!");
        } catch (err) {
            setError("Photo upload failed.");
        }
    }

    // Delete profile photo
    async function handleDeletePhoto() {
        if (!window.confirm("Remove your profile photo?")) return;

        try {
            const updated = await deleteProfilePhoto();
            setProfile(updated);
            setSuccess("Profile photo removed.");
        } catch (err) {
            setError("Failed to delete photo.");
        }
    }

    if (loading) return <p className="text-center mt-4">Loading profile...</p>;

    if (!profile) return <p className="text-center mt-4 text-danger">Profile not found.</p>;

    return (
        <div className="col-md-8 offset-md-2 mt-4">
            <div className="card p-4 shadow-sm">
                <h3 className="mb-3">My Profile</h3>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {/* Profile Photo Section */}
                <div className="text-center mb-4">
                    {profile.profile_photo_url ? (
                        <img
                            src={profile.profile_photo_url}
                            alt="Profile"
                            style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover" }}
                        />
                    ) : (
                        <div
                            style={{
                                width: 120,
                                height: 120,
                                borderRadius: "50%",
                                background: "#ddd",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 30,
                                margin: "auto",
                            }}
                        >
                            ?
                        </div>
                    )}

                    <div className="mt-2">
                        <input type="file" onChange={handlePhotoUpload} />
                    </div>

                    {profile.profile_photo_url && (
                        <button className="btn btn-outline-danger btn-sm mt-2" onClick={handleDeletePhoto}>
                            Delete Photo
                        </button>
                    )}
                </div>

                {/* Profile Fields This is where the user edits their profile */}
                <form onSubmit={handleSave}>
                    <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <input
                            className="form-control"
                            value={editData.full_name}
                            onChange={e => setEditData({ ...editData, full_name: e.target.value })}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Bio</label>
                        <textarea
                            className="form-control"
                            value={editData.bio}
                            onChange={e => setEditData({ ...editData, bio: e.target.value })}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Experience Level</label>
                        <select
                            className="form-control"
                            value={editData.experience_level}
                            onChange={e => setEditData({ ...editData, experience_level: e.target.value })}
                        >
                            <option value="">-- Select --</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>

                    <button className="btn btn-primary" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
}
