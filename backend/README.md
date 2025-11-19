README file for the backend work using Djanjo.

The backend for the Hiking Trail App is done using Django REST API and Python. Database is PostGRE.
The web app is hosted with Netlify and Railway. Photos are hosted using cloudinary and Django's pillow for processing the images.

Current Features:
  - User authentication: Registration, login, logout with token based authentication.
  - User profiles: Automatic hiking profile created
  - Trail management: Database for trails that include difficulty, location, and GPS data.
  - Trail completion tracking: Users may mark trails as completed and rate them 1-5 with optional notes.
  - Admin interface on web: Manage database and user info from admin.
  - Connection to NPS API as well as recreation.gov API for trails.
  - Ability to upload photo for user profile and for trails.


To Do:
  - Add in dummy data into all database tables.
  - Check that forums can pin/lock and create mods
  - Figure out how to get NPS and recreations.gov info into tables

Reminder on how to open local development:
  1) Create the virtual environment: python -m venv venv
                                     source venv/bin/activate
  2) Install dependencies: pip install django djangorestframework
  3) Run migrations: python manage.py migrate
  4) Start development server: python manage.py runserver


**API at http://127.0.0.1:8000**
**Admin at http://127.0.0.1:8000/admin/**
**Web app at https://hikingtrails.netlify.app/**


API endpoints:
  User/Authentication Endpoints
    Authentication
      - POST /api/users/register/ - Register new user
      - POST /api/users/login/ - Login (returns token)
      - POST /api/users/logout/ - Logout (deletes token)

    Profile Management
      - GET /api/users/profile/ - Get current user profile
      - PATCH /api/users/profile/update/ - Update profile (full_name, bio, experience_level)
      - POST /api/users/profile/upload-photo/ - Upload profile photo
      - DELETE /api/users/profile/delete-photo/ - Delete profile photo

    NPS (National Park Service)
      - GET /api/users/nps/parks/?state={STATE} - Search parks by state (e.g., ?state=MN)
      - GET /api/users/nps/activities/ - Get all activities

    Combined NPS and Recreation.gov (parks and trails)
      - GET /api/users/parks/trails/?park_code={PARK_CODE}&radius={MILES} - Get park with nearby trails
      - GET /api/users/states/parks-trails/?state={STATE} - Get all parks in state with trails

    Recreation.gov Trails
      - GET /api/users/trails/search/?lat={LAT}&lon={LON}&radius={MILES} - Search trails by coordinates
      - GET /api/users/trails/search-by-name/?q={QUERY}&limit={NUMBER} - Search trails by name
      - GET /api/users/trails/state/?state={STATE}&limit={NUMBER} - Get trails by state

    Testing
      - GET /api/users/test/ - Test backend connection


  Parks Endpoints
      - GET /api/trails/parks/ - List all parks
      - POST /api/trails/parks/ - Create park (authenticated)
      - GET /api/trails/parks/{park_id}/ - Get specific park
      - PUT /api/trails/parks/{park_id}/ - Update park (authenticated)
      - PATCH /api/trails/parks/{park_id}/ - Partial update park (authenticated)
      - DELETE /api/trails/parks/{park_id}/ - Delete park (authenticated)
  
  
  Trails Endpoints
      - GET /api/trails/trails/ - List all trails
      - POST /api/trails/trails/ - Create trail (authenticated)
      - GET /api/trails/trails/{trail_id}/ - Get specific trail
      - PUT /api/trails/trails/{trail_id}/ - Update trail (authenticated)
      - PATCH /api/trails/trails/{trail_id}/ - Partial update trail (authenticated)
      - DELETE /api/trails/trails/{trail_id}/ - Delete trail (authenticated)
      - GET /api/trails/trails/by_park/?park_id={PARK_ID} - Get trails by park ID (custom action)
  
  
    Saved Trails Endpoints
      - GET /api/trails/saved-trails/ - Get current user's saved trails
      - POST /api/trails/saved-trails/ - Save a trail
            Body: {"trail": trail_id}
      - GET /api/trails/saved-trails/{saved_id}/ - Get specific saved trail
      - DELETE /api/trails/saved-trails/{saved_id}/ - Remove saved trail
  
  
    Reviews Endpoints
      - GET /api/trails/reviews/ - List all reviews
      - POST /api/trails/reviews/ - Create review (authenticated)
            Body: {"trail": trail_id, "rating": 1-5, "title": "...", "review_text": "...", 
            "visited_date": "YYYY-MM-DD"}
      - GET /api/trails/reviews/{review_id}/ - Get specific review
      - PUT /api/trails/reviews/{review_id}/ - Update review (owner only)
      - PATCH /api/trails/reviews/{review_id}/ - Partial update review (owner only)
      - DELETE /api/trails/reviews/{review_id}/ - Delete review (owner only)
  
  
    Trail Conditions Endpoints
      - GET /api/trails/conditions/ - List all trail conditions
      - POST /api/trails/conditions/ - Report trail condition (authenticated)
              Body: { "trail": trail_id, "condition_type": "...", "description": "...", "severity": "...",                      "reported_date": "YYYY-MM-DD" }
      - GET /api/trails/conditions/{condition_id}/ - Get specific condition
      - PUT /api/trails/conditions/{condition_id}/ - Update condition (owner only)
      - PATCH /api/trails/conditions/{condition_id}/ - Partial update condition (owner only)
      - DELETE /api/trails/conditions/{condition_id}/ - Delete condition (owner only)
  
  
    Photos Endpoints
      Upload & Manage
        - POST /api/trails/photos/upload/ - Upload photo (authenticated)
              Form-data: photo (File), trail_id (optional), caption (optional), decimal_latitude (optional),                    decimal_longitude (optional)
      - GET /api/trails/photos/ - List all photos
      - GET /api/trails/photos/?trail_id={TRAIL_ID} - Get photos for specific trail
      - GET /api/trails/photos/?user_id={USER_ID} - Get photos by specific user
      - GET /api/trails/photos/{photo_id}/ - Get specific photo
      - PUT /api/trails/photos/{photo_id}/ - Update photo (owner only)
      - PATCH /api/trails/photos/{photo_id}/ - Partial update photo (owner only)
      - DELETE /api/trails/photos/{photo_id}/ - Delete photo (owner only)
  
  
    Tags Endpoints
      - GET /api/trails/tags/ - List all tags
      - POST /api/trails/tags/ - Create tag (authenticated)
              Body: {"tag_name": "waterfall"}
      - GET /api/trails/tags/{tag_id}/ - Get specific tag
      - PUT /api/trails/tags/{tag_id}/ - Update tag (authenticated)
      - PATCH /api/trails/tags/{tag_id}/ - Partial update tag (authenticated)
      - DELETE /api/trails/tags/{tag_id}/ - Delete tag (authenticated)
  
  
    Trail Features Endpoints
      - GET /api/trails/features/ - List all trail features (POIs)
      - POST /api/trails/features/ - Create feature (authenticated)
              Body: {"trail": trail_id, "feature_type": "viewpoint", "feature_name": "...", 
              "decimal_latitude": ..., "decimal_longitude": ..., "description": "..."}
      - GET /api/trails/features/{feature_id}/ - Get specific feature
      - PUT /api/trails/features/{feature_id}/ - Update feature (authenticated)
      - PATCH /api/trails/features/{feature_id}/ - Partial update feature (authenticated)
      - DELETE /api/trails/features/{feature_id}/ - Delete feature (authenticated)

Works Cited:

entire playlist of Django tutorial for Beginners by thenewboston
https://www.youtube.com/watch?v=qgGIqRFvFFk&list=PL6gx4Cwl9DGBlmzzFcLgDhKTTfNLfX1IK

Master Django & Python for Web Development by evlearn
https://www.youtube.com/watch?v=D584Rm9VLLc

Create superuser:
https://www.w3schools.com/django/django_admin_create_user.php

Install Django
https://code.visualstudio.com/docs/python/tutorial-django

Learn Django
https://www.w3schools.com/django/index.php

Django documentation
https://docs.djangoproject.com/en/5.2/


