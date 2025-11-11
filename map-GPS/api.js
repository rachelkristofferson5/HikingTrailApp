const API_URL = (location.hostname.endsWith('netlify.app') || location.hostname.includes('railway.app'))
  ? 'https://hikingtrailapp-production.up.railway.app/api'
  : 'http://localhost:8000';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: 'Token ' + token } : {};
}

function handleError(err) {
  if (err.response) {
    console.error('HTTP', err.response.status, err.response.data);
  } else {
    console.error(err.message || err);
  }
  throw err;
}

const GPSAPI = {
  async login(username, password) {
    try {
      const res = await axios.post(`${API_URL}/users/login/`, { username, password });
      return res.data;
    } catch (e) { handleError(e); }
  },

  async startHike(trail, started_at) {
    try {
      const res = await axios.post(`${API_URL}/tracking/hikes/`,
        { trail, started_at },
        { headers: getAuthHeader() }
      );
      return res.data;
    } catch (e) { handleError(e); }
  },

  async completeHike(hikeId, distance_miles, duration_min) {
    try {
      const res = await axios.post(`${API_URL}/tracking/hikes/${hikeId}/complete/`,
        { distance_miles, duration_min },
        { headers: getAuthHeader() }
      );
      return res.data;
    } catch (e) { handleError(e); }
  },

  async startTrack(hikeId) {
    try {
      const res = await axios.post(`${API_URL}/tracking/tracks/`,
        { hike: hikeId },
        { headers: getAuthHeader() }
      );
      return res.data;
    } catch (e) { handleError(e); }
  },

  async stopTrack(trackId) {
    try {
      const res = await axios.post(`${API_URL}/tracking/tracks/${trackId}/stop/`,
        {},
        { headers: getAuthHeader() }
      );
      return res.data;
    } catch (e) { handleError(e); }
  },

  async addTrackPoint(trackId, latitude, longitude) {
    try {
      const res = await axios.post(`${API_URL}/tracking/tracks/${trackId}/add_track_point/`,
        { latitude, longitude },
        { headers: getAuthHeader() }
      );
      return res.data;
    } catch (e) { handleError(e); }
  },
};

window.GPSAPI = GPSAPI;
window.API_URL = API_URL;
window.getAuthHeader = getAuthHeader;
window.handleError = handleError;
