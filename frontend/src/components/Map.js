import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Map() {
    useEffect(() => {
        const L = window.L;
        const map = L.map('map').setView([45.0, -93.0], 6); // centered roughly on MN

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

        // Cleanup on unmount
        return () => {
            map.remove();
        };
    }, []);

    return (
        <div className="container mt-4">
            <h2 className="mb-3 text-center">🗺️ Trail Map</h2>
            <div id="map" style={{ height: '500px', width: '100%', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}></div>
            <div className="text-center mt-3 text-muted small">
                <p>The map shows your location and can later display trails from the API.</p>
            </div>
        </div>
    );
}
