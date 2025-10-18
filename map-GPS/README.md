Hiking Map (Maps/GPS Module)

This page adds a basic hiking map with GPS tracking and simple buttons to talk to the backend. It uses Leaflet for the map and the project’s /api endpoints for login, hikes, and GPS tracks.

What it does-

Shows an interactive map (OpenStreetMap via Leaflet).

Centers on the user’s current location (if allowed).

Buttons to:

Login (saves auth token)

Start Hike (creates a hike and stores its ID)

Start GPS Track (streams GPS points to the backend)

Stop Track

Complete Hike (sends sample distance/duration)
