import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
});

// Attach token automatically if available
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Token ${token}`;
        return config;
    },
    error => Promise.reject(error)
);

// Centralized error handler
function handleError(err) {
    // If server sent JSON error body, prefer that
    const payload = err?.response?.data ?? err?.message ?? err;
    console.error('API Error:', payload);
    throw err;
}

/* -------------------- AUTH -------------------- */
export async function register(username, email, password) {
    try {
        const res = await api.post('/users/register/', { username, email, password });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function login(username, password) {
    try {
        const res = await api.post('/users/login/', { username, password });
        const token = res.data?.token || res.data?.access || res.data?.key;
        if (token) localStorage.setItem('token', token);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function logout() {
    try {
        await api.post('/users/logout/');
        localStorage.removeItem('token');
    } catch (err) {
        localStorage.removeItem('token');
        handleError(err);
    }
}

/* -------------------- USER / PROFILE -------------------- */
export async function getProfile() {
    try {
        const res = await api.get('/users/profile/');
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function updateProfile(patchData) {
    try {
        const res = await api.patch('/users/profile/update/', patchData);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function uploadProfilePhoto(file) {
    try {
        const form = new FormData();
        form.append('photo', file);
        const res = await api.post('/users/profile/upload-photo/', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function deleteProfilePhoto() {
    try {
        const res = await api.delete('/users/profile/delete-photo/');
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/* -------------------- TEST -------------------- */
export async function testBackend() {
    try {
        const res = await api.get('/users/test/');
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/* -------------------- NPS -------------------- */
export async function getParksByState(state) {
    try {
        const res = await api.get(`/users/nps/parks/?state=${encodeURIComponent(state)}`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function getNPSActivities() {
    try {
        const res = await api.get('/users/nps/activities/');
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/* -------------------- COMBINED NPS / RECREATION.GOV HELPERS -------------------- */
export async function getParkWithTrails(parkCode, radius = 25) {
    try {
        const res = await api.get(`/users/parks/trails/?park_code=${encodeURIComponent(parkCode)}&radius=${radius}`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function getStateParksWithTrails(state, limit = 100) {
    try {
        const res = await api.get(`/users/states/parks-trails/?state=${encodeURIComponent(state)}&limit=${limit}`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function searchTrailsByCoordinates(lat, lon, radius = 25) {
    try {
        const res = await api.get(`/users/trails/search/?lat=${lat}&lon=${lon}&radius=${radius}`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function searchTrailsByName(q, limit = 25) {
    try {
        const res = await api.get(`/users/trails/search-by-name/?q=${encodeURIComponent(q)}&limit=${limit}`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function getTrailsByState(state, limit = 50) {
    try {
        const res = await api.get(`/users/trails/state/?state=${encodeURIComponent(state)}&limit=${limit}`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/* -------------------- TRAILS (DB) -------------------- */
export async function getAllParks() {
    try {
        const res = await api.get('/trails/parks/');
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function createPark(data) {
    try {
        const res = await api.post('/trails/parks/', data);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function getPark(parkId) {
    try {
        const res = await api.get(`/trails/parks/${parkId}/`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function updatePark(parkId, data) {
    try {
        const res = await api.put(`/trails/parks/${parkId}/`, data);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function patchPark(parkId, data) {
    try {
        const res = await api.patch(`/trails/parks/${parkId}/`, data);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function deletePark(parkId) {
    try {
        const res = await api.delete(`/trails/parks/${parkId}/`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function getAllTrails() {
    try {
        const res = await api.get('/trails/trails/');
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function createTrail(data) {
    try {
        const res = await api.post('/trails/trails/', data);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function getTrailDetails(trailId) {
    try {
        const res = await api.get(`/trails/trails/${trailId}/`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function updateTrail(trailId, data) {
    try {
        const res = await api.put(`/trails/trails/${trailId}/`, data);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function deleteTrail(trailId) {
    try {
        const res = await api.delete(`/trails/trails/${trailId}/`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function getTrailsByPark(parkId) {
    try {
        const res = await api.get(`/trails/trails/by_park/?park_id=${parkId}`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/* -------------------- SAVED TRAILS -------------------- */
export async function getSavedTrails() {
    try {
        const res = await api.get('/trails/saved-trails/');
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function saveTrail(trailId) {
    try {
        const res = await api.post('/trails/saved-trails/', { trail: trailId });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function deleteSavedTrail(savedId) {
    try {
        const res = await api.delete(`/trails/saved-trails/${savedId}/`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/* -------------------- REVIEWS -------------------- */
export async function listReviews(trailId) {
    try {
        const res = await api.get(`/trails/reviews/?trail=${trailId}`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function createReview(reviewBody) {
    // reviewBody expects: { trail, rating, title, review_text, visited_date }
    try {
        const res = await api.post('/trails/reviews/', reviewBody);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/* -------------------- TRAIL CONDITIONS -------------------- */
export async function listConditions(trailId) {
    try {
        const res = await api.get(`/trails/conditions/?trail=${trailId}`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function reportCondition(conditionBody) {
    // conditionBody expects: { trail, condition_type, description, severity, reported_date }
    try {
        const res = await api.post('/trails/conditions/', conditionBody);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/* -------------------- TRAIL PHOTOS -------------------- */
export async function uploadTrailPhoto({ file, trail_id = null, caption = '', decimal_latitude = null, decimal_longitude = null }) {
    try {
        const form = new FormData();
        form.append('photo', file);
        if (trail_id) form.append('trail_id', trail_id);
        if (caption) form.append('caption', caption);
        if (decimal_latitude) form.append('decimal_latitude', decimal_latitude);
        if (decimal_longitude) form.append('decimal_longitude', decimal_longitude);

        const res = await api.post('/trails/photos/upload/', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function listTrailPhotos(trailId) {
    try {
        const res = await api.get(`/trails/photos/?trail_id=${trailId}`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/* -------------------- TAGS & FEATURES -------------------- */
export async function listTags() {
    try {
        const res = await api.get('/trails/tags/');
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function createTag(tagName) {
    try {
        const res = await api.post('/trails/tags/', { tag_name: tagName });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function listFeatures(trailId) {
    try {
        const res = await api.get(`/trails/features/?trail=${trailId}`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function createFeature(featureBody) {
    // { trail, feature_type, feature_name, decimal_latitude, decimal_longitude, description }
    try {
        const res = await api.post('/trails/features/', featureBody);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/* -------------------- TRACKING (GPS / HIKES) -------------------- */
export async function listMyHikes() {
    try {
        const res = await api.get('/tracking/hikes/');
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function getActiveHikes() {
    try {
        const res = await api.get('/tracking/hikes/activate/');
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function getHikeStats() {
    try {
        const res = await api.get('/tracking/hikes/stats/');
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function startHike(body) {
    // body: { trail, started_at }
    try {
        const res = await api.post('/tracking/hikes/', body);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function completeHike(hikeId, body) {
    // body: { distance_miles, duration_min }
    try {
        const res = await api.post(`/tracking/hikes/${hikeId}/complete/`, body);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/* TRACKS & POINTS */
export async function listTracks(hikeId) {
    try {
        const res = await api.get(`/tracking/tracks/?hike=${hikeId}`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function startTrack(hikeId) {
    try {
        const res = await api.post('/tracking/tracks/', { hike: hikeId });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function stopTrack(trackId) {
    try {
        const res = await api.post(`/tracking/tracks/${trackId}/stop/`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function addTrackPoint(trackId, latitude, longitude) {
    try {
        const res = await api.post(`/tracking/tracks/${trackId}/add_track_point/`, { latitude, longitude });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function listTrackPoints(trackId) {
    try {
        const res = await api.get(`/tracking/points/?track=${trackId}`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function createTrackPoint(pointBody) {
    // { track, latitude, longitude, timestamp(optional) }
    try {
        const res = await api.post('/tracking/points/', pointBody);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/* -------------------- FORUMS -------------------- */
export async function getForumCategories() {
    try {
        const res = await api.get('/forums/categories/');
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function listForumThreads(categoryId = null) {
    try {
        const url = categoryId ? `/forums/threads/?category=${categoryId}` : '/forums/threads/';
        const res = await api.get(url);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function getForumThread(threadId) {
    try {
        const res = await api.get(`/forums/threads/${threadId}/`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function createForumThread(title, categoryId, first_post_content) {
    try {
        const res = await api.post('/forums/threads/', { title, category: categoryId, first_post_content });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function pinThread(threadId) {
    try {
        const res = await api.post(`/forums/threads/${threadId}/pin/`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function lockThread(threadId) {
    try {
        const res = await api.post(`/forums/threads/${threadId}/lock/`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function getForumPosts(threadId) {
    try {
        // Get full thread details including posts[]
        const res = await api.get(`/forums/threads/${threadId}/`);
        return res.data; // includes posts, thread info, etc.
    } catch (err) {
        handleError(err);
    }
}

export async function createForumPost(threadId, contents, parent_post = null) {
    // contents: string, parent_post optional for replies
    try {
        const body = { thread: threadId, contents };
        if (parent_post) body.parent_post = parent_post;
        const res = await api.post('/forums/posts/', body);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function getForumPost(postId) {
    try {
        const res = await api.get(`/forums/posts/${postId}/`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function listPostReplies(postId) {
    try {
        const res = await api.get(`/forums/posts/${postId}/replies/`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function updateForumPost(postId, body) {
    try {
        const res = await api.put(`/forums/posts/${postId}/`, body);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function deleteForumPost(postId) {
    try {
        const res = await api.delete(`/forums/posts/${postId}/`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/* Forum photos (upload/delete/list) */
export async function uploadForumPhoto({ file, post_id, caption = '' }) {
    try {
        const form = new FormData();
        form.append('photo', file);
        form.append('post_id', post_id);
        if (caption) form.append('caption', caption);
        const res = await api.post('/forums/photos/upload/', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function listForumPhotos(postId) {
    try {
        const url = postId ? `/forums/photos/?post_id=${postId}` : '/forums/photos/';
        const res = await api.get(url);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function deleteForumPhoto(photoId) {
    try {
        const res = await api.delete(`/forums/photos/${photoId}/`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/* -------------------- MESSAGING (DIRECT) -------------------- */
export async function getConversations() {
    try {
        const res = await api.get('/messaging/conversations/');
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function getConversation(conversationId) {
    try {
        const res = await api.get(`/messaging/conversations/${conversationId}/`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function createConversation(participantIds = [], subject = '') {
    try {
        const res = await api.post('/messaging/conversations/', { participants: participantIds, subject });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function getMessages(conversationId) {
    try {
        const res = await api.get(`/messaging/messages/?conversation=${conversationId}`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function sendMessage(conversationId, content) {
    try {
        const res = await api.post('/messaging/messages/', { conversation: conversationId, content });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function listParticipants(conversationId) {
    try {
        const res = await api.get(`/messaging/participants/?conversation=${conversationId}`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function addParticipant(conversationId, userId) {
    try {
        const res = await api.post('/messaging/participants/', { conversation: conversationId, user: userId });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function searchUserByUsername(username) {
    try {
        const res = await api.get(`/users/search/?username=${encodeURIComponent(username)}`);
        return res.data;
    } catch (err) {
        handleError(err);
    }
}