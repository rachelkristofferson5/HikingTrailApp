import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

function getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Token ${token}` } : {};
}

export async function register(username, email, password) {
    const res = await axios.post(`${API_URL}/api/auth/register/`, { username, email, password });
    return res.data;
}

export async function login(username, password) {
    const res = await axios.post(`${API_URL}/api/auth/login/`, { username, password });
    return res.data;
}

export async function logout() {
    const headers = getAuthHeader();
    try {
        await axios.post(`${API_URL}/api/auth/logout/`, {}, { headers });
    } catch (err) {
        // backend logout may be optional; ignore errors
    }
    localStorage.removeItem('token');
}

export async function getProfile() {
    const headers = getAuthHeader();
    const res = await axios.get(`${API_URL}/api/auth/profile/`, { headers });
    return res.data;
}

export async function getTrails(state) {
    const headers = getAuthHeader();
    const res = await axios.get(`${API_URL}/api/auth/nps/parks/?state=${encodeURIComponent(state)}`, { headers });
    return res.data; // expects { parks: [...] } or similar
}
