import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

function getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Token ${token}` } : {};
}

function handleError(err) {
    console.error('API Error:', err.response?.data || err.message);
    throw err;
}

/* -------------------- AUTH -------------------- */
export async function register(username, email, password) {
    try {
        const res = await axios.post(`${API_URL}/users/register/`, { username, email, password });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function login(username, password) {
    try {
        const res = await axios.post(`${API_URL}/users/login/`, { username, password });
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
        }
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function logout() {
    try {
        const headers = getAuthHeader();
        await axios.post(`${API_URL}/users/logout/`, {}, { headers });
        localStorage.removeItem('token');
    } catch (err) {
        handleError(err);
    }
}

export async function getProfile() {
    try {
        const headers = getAuthHeader();
        const res = await axios.get(`${API_URL}/users/profile/`, { headers });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/* -------------------- NPS -------------------- */
export async function getParksByState(stateCode) {
    try {
        const headers = getAuthHeader();
        const res = await axios.get(`${API_URL}/users/nps/parks/?state=${stateCode}`, { headers });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function getNPSActivities() {
    try {
        const headers = getAuthHeader();
        const res = await axios.get(`${API_URL}/users/nps/activities/`, { headers });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/* -------------------- TRAILS -------------------- */
export async function getAllParks() {
    try {
        const headers = getAuthHeader();
        const res = await axios.get(`${API_URL}/trails/parks/`, { headers });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function createPark(data) {
    try {
        const headers = getAuthHeader();
        const res = await axios.post(`${API_URL}/trails/parks/`, data, { headers });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function getAllTrails() {
    try {
        const headers = getAuthHeader();
        const res = await axios.get(`${API_URL}/trails/trails/`, { headers });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function getTrailsByPark(parkId) {
    try {
        const headers = getAuthHeader();
        const res = await axios.get(`${API_URL}/trails/trails/by_park/?park_id=${parkId}`, { headers });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function getTrailDetails(trailId) {
    try {
        const headers = getAuthHeader();
        const res = await axios.get(`${API_URL}/trails/trails/${trailId}/`, { headers });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function getSavedTrails() {
    try {
        const headers = getAuthHeader();
        const res = await axios.get(`${API_URL}/trails/saved-trails/`, { headers });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/* -------------------- FORUMS -------------------- */
export async function getForumCategories() {
    try {
        const headers = getAuthHeader();
        const res = await axios.get(`${API_URL}/forums/categories/`, { headers });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function getForumThreads(categoryId) {
    try {
        const headers = getAuthHeader();
        const res = await axios.get(`${API_URL}/forums/threads/?category=${categoryId}`, { headers });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function getForumPosts(threadId) {
    try {
        const headers = getAuthHeader();
        const res = await axios.get(`${API_URL}/forums/posts/?thread=${threadId}`, { headers });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function createForumPost(threadId, content) {
    try {
    const headers = getAuthHeader();
    const res = await axios.post(`${API_URL}/forums/posts/`, { thread: threadId, content }, { headers });
    return res.data;
    } catch (err) {
        handleError(err);
    }
}

/* -------------------- TRACKING (GPS/HIKES) -------------------- */
export async function getMyHikes() {
    try {
        const headers = getAuthHeader();
        const res = await axios.get(`${API_URL}/tracking/hikes/`, { headers });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/* -------------------- MESSAGING -------------------- */
export async function getConversations() {
    try {
        const headers = getAuthHeader();
        const res = await axios.get(`${API_URL}/messaging/conversations/`, { headers });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function getMessages(conversationId) {
    try {
        const headers = getAuthHeader();
        const res = await axios.get(`${API_URL}/messaging/messages/?conversation=${conversationId}`, { headers });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

export async function sendMessage(conversationId, content) {
    try {
        const headers = getAuthHeader();
        const res = await axios.post(`${API_URL}/messaging/messages/`, { conversation: conversationId, content }, { headers });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}