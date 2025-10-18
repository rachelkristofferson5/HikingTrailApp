import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';
const USE_MOCK = false; // toggle this to false when backend works

function getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Token ${token}` } : {};
}

export async function register(username, email, password) {
    if (USE_MOCK) {
        console.log('(mock) Registered:', username);
        return { success: true };
    }
    const res = await axios.post(`${API_URL}/api/auth/register/`, { username, email, password });
    return res.data;
}

export async function login(username, password) {
    if (USE_MOCK) {
        console.log('(mock) Logged in as:', username);
        localStorage.setItem('token', 'mock-token');
        return { token: 'mock-token' };
    }
    const res = await axios.post(`${API_URL}/api/auth/login/`, { username, password });
    return res.data;
}

export async function logout() {
    if (USE_MOCK) {
        console.log('(mock) Logged out');
        localStorage.removeItem('token');
        return;
    }
    const headers = getAuthHeader();
    try {
        await axios.post(`${API_URL}/api/auth/logout/`, {}, { headers });
    } catch {}
    localStorage.removeItem('token');
}

export async function getProfile() {
    if (USE_MOCK) {
        return { username: 'DemoUser', email: 'demo@example.com' };
    }
    const headers = getAuthHeader();
    const res = await axios.get(`${API_URL}/api/auth/profile/`, { headers });
    return res.data;
}

export async function getTrails(state) {
    if (USE_MOCK) {
        return {
            parks: [
                { name: 'Minnehaha Falls', description: 'A scenic trail with waterfalls.', state: 'MN', image: null },
                { name: 'Gooseberry Falls', description: 'Popular hiking and camping site.', state: 'MN', image: null },
            ]
        };
    }
    const headers = getAuthHeader();
    const res = await axios.get(`${API_URL}/api/auth/nps/parks/?state=${encodeURIComponent(state)}`, { headers });
    return res.data;
}
