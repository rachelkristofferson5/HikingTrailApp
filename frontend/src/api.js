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

/* -------------------- NPS + RECREATION.GOV TRAILS -------------------- */

/**
 * Get a specific park with nearby trails from Recreation.gov
 */
export async function getParkWithTrails(parkCode, radius = 25) {
    try {
        const headers = getAuthHeader();
        const res = await axios.get(
            `${API_URL}/users/parks/trails/?park_code=${parkCode}&radius=${radius}`, 
            {headers});
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/**
 * Get all parks in a state with their nearby trails
 */
export async function getStateParksWithTrails(stateCode) {
    try {
        const headers = getAuthHeader();
        const res = await axios.get(
            `${API_URL}/users/states/parks-trails/?state=${stateCode}`, 
            {headers});
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/**
 * Search for trails near specific coordinates
 */
export async function searchTrailsByCoordinates(latitude, longitude, radius = 25) {
    try {
        const headers = getAuthHeader();
        const res = await axios.get(
            `${API_URL}/users/trails/search/?lat=${latitude}&lon=${longitude}&radius=${radius}`, 
            {headers});
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/**
 * Search for trails by name or keywords
 */
export async function searchTrailsByName(query, limit = 25) {
    try {
        const headers = getAuthHeader();
        const res = await axios.get(
            `${API_URL}/users/trails/search-by-name/?q=${encodeURIComponent(query)}&limit=${limit}`, 
            {headers});
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/**
 * Get all trails in a specific state
 */
export async function getTrailsByState(stateCode, limit = 50) {
    try {
        const headers = getAuthHeader();
        const res = await axios.get(
            `${API_URL}/users/trails/state/?state=${stateCode}&limit=${limit}`, 
            {headers});
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

/**
 * Generic getTrails function - searches by name
 * This is what TrailsPage.js is looking for
 */
export async function getTrails(searchQuery = '') {
    try {
        const headers = getAuthHeader();
        if (searchQuery) {
            const res = await axios.get(
                `${API_URL}/users/trails/search-by-name/?q=${encodeURIComponent(searchQuery)}&limit=50`, 
                {headers});
            return res.data;
        } else {
            // Return empty array if no search query
            return {trails: [], total: 0};
        }
    } catch (err) {
        handleError(err);
    }
}

/* -------------------- TRAILS (DATABASE) -------------------- */
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