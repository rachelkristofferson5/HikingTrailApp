import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

export default function Map() {
     const mapRef = useRef(null);
      const polylineRef = useRef(null);
      const watchIdRef = useRef(null);
      const lastPointRef = useRef(null);
      const distanceRef = useRef(0);
      const hikeStartRef = useRef(null);
      const hikeIdRef = useRef(null);
      const trackIdRef = useRef(null);
    
      const [status, setStatus] = useState('');
      const [isPaused, setIsPaused] = useState(false);
    
      const API_URL = 'https://hikingtrailapp-production.up.railway.app/api';
    
      function getAuthHeader() {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Token ${token}` } : {};
      }
    
      function haversineMiles(lat1, lon1, lat2, lon2) {
        const toRad = (d) => (d * Math.PI) / 180;
        const R = 6371000;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c) / 1609.344;
      }
    useEffect(() => {
        const map = L.map('map').setView([45.0, -93.0], 6); // centered roughly on MN
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        // Try to show user's current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 13);
                L.marker([latitude, longitude])
                    .addTo(map)
                    .bindPopup('📍 You are here!')
                    .openPopup();
            }, () => {
                console.log('Geolocation not granted, showing default area.');
            });
        }

         
        return () => {
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
          map.remove();
        };
    }, []);

    
  async function apiStartHike(trail, start_time) {
       const headers = getAuthHeader();
     
       await axios.post(
         `${API_URL}/tracking/hikes/`,
         { trail, start_time },
         { headers }
       );
     
       const resActive = await axios.get(
         `${API_URL}/tracking/hikes/activate/`,
         { headers }
       );
     
       const data = resActive.data;
       console.log('Active hike from backend:', data); 
     
       if (Array.isArray(data) && data.length > 0) {
         return data[0];
       }
       return data;
     }          
    
      async function apiAddPoint(trackId, latitude, longitude) {
        const res = await axios.post(
          `${API_URL}/tracking/tracks/${trackId}/add_track_point/`,
          { latitude, longitude },
          { headers: getAuthHeader() }
        );
        return res.data;
      }
    
      async function apiStartTrack(hikeId) {
        const res = await axios.post(
          `${API_URL}/tracking/tracks/`,
          {hike_id: hikeId, started_at: new Date().toString()},
          {headers: getAuthHeader()}
        );
        return res.data;
      }

      async function apiStopTrack(trackId) {
        const res = await axios.post(
          `${API_URL}/tracking/tracks/${trackId}/stop/`,
          {},
          { headers: getAuthHeader() }
        );
        return res.data;
      }
    
      async function apiCompleteHike(hikeId, distance_miles, duration_min) {
        const res = await axios.post(
          `${API_URL}/tracking/hikes/${hikeId}/complete/`,
          { distance_miles, duration_min },
          { headers: getAuthHeader() }
        );
        return res.data;
      }
    
    
      async function onStartHike() {
       try {
         const startedAt = new Date().toISOString();
         const hike = await apiStartHike(199, startedAt);
          console.log('Hike object in onStartHike:', hike);
            
         hikeIdRef.current = hike.hike_id || hike.id;
     
         hikeStartRef.current = Date.now();
         distanceRef.current = 0;
         lastPointRef.current = null;
         setStatus(`Hike started (id=${hikeIdRef.current}).`);
       } catch (error){
          console.error('Start hike error:', error);
          console.error('Error response:', error.response?.data);
          setStatus(`Start hike failed: ${error.response?.data?.detail || error.message}`);
       }
     }
    
      async function onStartTrack() {
        if (!hikeIdRef.current) return setStatus('Start a hike first.');
        try {
          const data = await apiStartTrack(hikeIdRef.current);
          trackIdRef.current = data.track_id;
          setStatus(`Tracking started (track=${trackIdRef.current}).`);
          if (!navigator.geolocation) return setStatus('Geolocation not supported.');
          if (polylineRef.current) mapRef.current.removeLayer(polylineRef.current);
          polylineRef.current = L.polyline([], { weight: 4, color: 'blue' }).addTo(mapRef.current);
          setIsPaused(false);
          watchIdRef.current = navigator.geolocation.watchPosition(
            async (pos) => {
              const lat = pos.coords.latitude;
              const lon = pos.coords.longitude;
              await apiAddPoint(trackIdRef.current, lat, lon);
              polylineRef.current.addLatLng([lat, lon]);
              if (lastPointRef.current)
                distanceRef.current += haversineMiles(
                  lastPointRef.current.lat,
                  lastPointRef.current.lon,
                  lat,
                  lon
                );
              lastPointRef.current = { lat, lon };
            },
            null,
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
          );
        } catch {
          setStatus('Start track failed.');
        }
      }
    
      async function onStopTrack() {
        if (!trackIdRef.current) return setStatus('No active track.');
        try {
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
          await apiStopTrack(trackIdRef.current);
          setStatus('Tracking stopped.');
        } catch {
          setStatus('Stop track failed.');
        }
      }
    
      function onPause() {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
          setIsPaused(true);
          setStatus('Tracking paused.');
        }
      }
    
      function onResume() {
        if (!trackIdRef.current) return setStatus('No active track to resume.');
        if (!navigator.geolocation) return setStatus('Geolocation not supported.');
        if (watchIdRef.current !== null) return setStatus('Already tracking.');
        setIsPaused(false);
        watchIdRef.current = navigator.geolocation.watchPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            await apiAddPoint(trackIdRef.current, lat, lon);
            polylineRef.current.addLatLng([lat, lon]);
            if (lastPointRef.current)
              distanceRef.current += haversineMiles(
                lastPointRef.current.lat,
                lastPointRef.current.lon,
                lat,
                lon
              );
            lastPointRef.current = { lat, lon };
          },
          null,
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
        );
        setStatus('Tracking resumed.');
      }
    
      async function onCompleteHike() {
        if (!hikeIdRef.current) return setStatus('No active hike.');
        try {
          const durationMin = hikeStartRef.current ? Math.round((Date.now() - hikeStartRef.current) / 60000) : 0;
          await apiCompleteHike(hikeIdRef.current, Number(distanceRef.current.toFixed(2)), durationMin);
          setStatus('Hike completed.');
        } catch {
          setStatus('Complete hike failed.');
        }
      }

    return (
        <div className="container mt-4">
            <h2 className="mb-3 text-center">🗺️ Trail Map</h2>
            <div className="d-flex flex-wrap gap-2 justify-content-center mb-2">
              <button className="btn btn-success" onClick={onStartHike}>Start Hike</button>
              <button className="btn btn-outline-success" onClick={onStartTrack}>Start GPS Track</button>
              <button className="btn btn-outline-danger" onClick={onStopTrack}>Stop Track</button>
              <button className="btn btn-warning" onClick={onCompleteHike}>Complete Hike</button>
              <button className="btn btn-secondary" onClick={onPause} disabled={isPaused}>Pause</button>
              <button className="btn btn-secondary" onClick={onResume} disabled={!isPaused}>Resume</button>
            </div>
            <div className="text-center mb-3">
              <span className="text-muted">Status: {status}</span>
            </div>
            <div id="map" style={{ height: '500px', width: '100%', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}></div>
            <div className="text-center mt-3 text-muted small">
                <p>The map shows your location and can later display trails from the API.</p>
            </div>
        </div>
    );
}
