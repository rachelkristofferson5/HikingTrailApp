# Hiking Trail App - Backend

The backend for the Hiking Trail App is built using Django REST API and Python. Database is PostgreSQL. The web app is hosted with Netlify (frontend) and Railway (backend). Photos are hosted using Cloudinary and Django's Pillow for image processing.

## Current Features

- **User authentication**: Registration, login, logout with token-based authentication
- **User profiles**: Automatic hiking profile created with photo upload capability
- **Trail management**: Database for trails including difficulty, location, and GPS data
- **Trail completion tracking**: Users may mark trails as completed and rate them 1-5 with optional notes
- **Photo uploads**: Users can upload profile photos and trail photos
- **Forum system**: Discussion threads, posts, and replies with photo attachments
- **Admin interface**: Manage database and user info from admin panel
- **External API integration**: Connection to NPS API and Recreation.gov API for trails, parks and trail data added into database.

## To Do

- [ ] Add dummy data into all database tables
- [ ] Check that forums can pin/lock threads and create moderators

## Local Development Setup

### Create virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Install dependencies
```bash
pip install -r requirements.txt
```

### Run migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Start development server
```bash
python manage.py runserver
```

### Access Points
- **API**: http://127.0.0.1:8000
- **Admin**: http://127.0.0.1:8000/admin/
- **Web App**: https://hikingtrails.netlify.app/

---

## API Endpoints

### User/Authentication Endpoints

#### Authentication
- `POST /api/users/register/` - Register new user
- `POST /api/users/login/` - Login (returns token)
- `POST /api/users/logout/` - Logout (deletes token)

#### Profile Management
- `GET /api/users/profile/` - Get current user profile
- `PATCH /api/users/profile/update/` - Update profile (full_name, bio, experience_level)
- `POST /api/users/profile/upload-photo/` - Upload profile photo
- `DELETE /api/users/profile/delete-photo/` - Delete profile photo

#### NPS (National Park Service)
- `GET /api/users/nps/parks/?state={STATE}` - Search parks by state (e.g., `?state=MN`)
- `GET /api/users/nps/activities/` - Get all activities

#### Combined NPS and Recreation.gov
- `GET /api/users/parks/trails/?park_code={PARK_CODE}&radius={MILES}` - Get park with nearby trails
- `GET /api/users/states/parks-trails/?state={STATE}` - Get all parks in state with trails

#### Recreation.gov Trails
- `GET /api/users/trails/search/?lat={LAT}&lon={LON}&radius={MILES}` - Search trails by coordinates
- `GET /api/users/trails/search-by-name/?q={QUERY}&limit={NUMBER}` - Search trails by name
- `GET /api/users/trails/state/?state={STATE}&limit={NUMBER}` - Get trails by state

#### Testing
- `GET /api/users/test/` - Test backend connection

---

### Parks Endpoints

- `GET /api/trails/parks/` - List all parks
- `POST /api/trails/parks/` - Create park (authenticated)
- `GET /api/trails/parks/{park_id}/` - Get specific park
- `PUT /api/trails/parks/{park_id}/` - Update park (authenticated)
- `PATCH /api/trails/parks/{park_id}/` - Partial update park (authenticated)
- `DELETE /api/trails/parks/{park_id}/` - Delete park (authenticated)

---

### Trails Endpoints

- `GET /api/trails/trails/` - List all trails
- `POST /api/trails/trails/` - Create trail (authenticated)
- `GET /api/trails/trails/{trail_id}/` - Get specific trail
- `PUT /api/trails/trails/{trail_id}/` - Update trail (authenticated)
- `PATCH /api/trails/trails/{trail_id}/` - Partial update trail (authenticated)
- `DELETE /api/trails/trails/{trail_id}/` - Delete trail (authenticated)
- `GET /api/trails/trails/by_park/?park_id={PARK_ID}` - Get trails by park ID

---

### Saved Trails Endpoints

- `GET /api/trails/saved-trails/` - Get current user's saved trails
- `POST /api/trails/saved-trails/` - Save a trail
  - Body: `{"trail": trail_id}`
- `GET /api/trails/saved-trails/{saved_id}/` - Get specific saved trail
- `DELETE /api/trails/saved-trails/{saved_id}/` - Remove saved trail

---

### Reviews Endpoints

- `GET /api/trails/reviews/` - List all reviews
- `POST /api/trails/reviews/` - Create review (authenticated)
  - Body: `{"trail": trail_id, "rating": 1-5, "title": "...", "review_text": "...", "visited_date": "YYYY-MM-DD"}`
- `GET /api/trails/reviews/{review_id}/` - Get specific review
- `PUT /api/trails/reviews/{review_id}/` - Update review (owner only)
- `PATCH /api/trails/reviews/{review_id}/` - Partial update review (owner only)
- `DELETE /api/trails/reviews/{review_id}/` - Delete review (owner only)

---

### Trail Conditions Endpoints

- `GET /api/trails/conditions/` - List all trail conditions
- `POST /api/trails/conditions/` - Report trail condition (authenticated)
  - Body: `{"trail": trail_id, "condition_type": "...", "description": "...", "severity": "...", "reported_date": "YYYY-MM-DD"}`
- `GET /api/trails/conditions/{condition_id}/` - Get specific condition
- `PUT /api/trails/conditions/{condition_id}/` - Update condition (owner only)
- `PATCH /api/trails/conditions/{condition_id}/` - Partial update condition (owner only)
- `DELETE /api/trails/conditions/{condition_id}/` - Delete condition (owner only)

---

### Photos Endpoints

#### Upload & Manage
- `POST /api/trails/photos/upload/` - Upload photo (authenticated)
  - Form-data: `photo` (File), `trail_id` (optional), `caption` (optional), `decimal_latitude` (optional), `decimal_longitude` (optional)
- `GET /api/trails/photos/` - List all photos
- `GET /api/trails/photos/?trail_id={TRAIL_ID}` - Get photos for specific trail
- `GET /api/trails/photos/?user_id={USER_ID}` - Get photos by specific user
- `GET /api/trails/photos/{photo_id}/` - Get specific photo
- `PUT /api/trails/photos/{photo_id}/` - Update photo (owner only)
- `PATCH /api/trails/photos/{photo_id}/` - Partial update photo (owner only)
- `DELETE /api/trails/photos/{photo_id}/` - Delete photo (owner only)

---

### Tags Endpoints

- `GET /api/trails/tags/` - List all tags
- `POST /api/trails/tags/` - Create tag (authenticated)
  - Body: `{"tag_name": "waterfall"}`
- `GET /api/trails/tags/{tag_id}/` - Get specific tag
- `PUT /api/trails/tags/{tag_id}/` - Update tag (authenticated)
- `PATCH /api/trails/tags/{tag_id}/` - Partial update tag (authenticated)
- `DELETE /api/trails/tags/{tag_id}/` - Delete tag (authenticated)

---

### Trail Features Endpoints

- `GET /api/trails/features/` - List all trail features (POIs)
- `POST /api/trails/features/` - Create feature (authenticated)
  - Body: `{"trail": trail_id, "feature_type": "viewpoint", "feature_name": "...", "decimal_latitude": ..., "decimal_longitude": ..., "description": "..."}`
- `GET /api/trails/features/{feature_id}/` - Get specific feature
- `PUT /api/trails/features/{feature_id}/` - Update feature (authenticated)
- `PATCH /api/trails/features/{feature_id}/` - Partial update feature (authenticated)
- `DELETE /api/trails/features/{feature_id}/` - Delete feature (authenticated)

---

### Forum Endpoints

#### Categories
- `GET /api/forums/categories/` - List all forum categories
- `GET /api/forums/categories/{category_id}/` - Get specific category

#### Threads
- `GET /api/forums/threads/` - List all threads
- `GET /api/forums/threads/?category={CATEGORY_ID}` - Filter threads by category
- `POST /api/forums/threads/` - Create new thread (authenticated)
  - Body: `{"title": "...", "category": category_id, "first_post_content": "..."}`
- `GET /api/forums/threads/{thread_id}/` - Get thread details (increments view count)
- `PUT /api/forums/threads/{thread_id}/` - Update thread (author only)
- `DELETE /api/forums/threads/{thread_id}/` - Delete thread (author only)
- `POST /api/forums/threads/{thread_id}/pin/` - Pin/unpin thread (admin)
- `POST /api/forums/threads/{thread_id}/lock/` - Lock/unlock thread (admin)

#### Posts
- `GET /api/forums/posts/` - List all posts
- `GET /api/forums/posts/?thread={THREAD_ID}` - Filter posts by thread
- `POST /api/forums/posts/` - Create post/reply (authenticated)
  - Body: `{"thread": thread_id, "contents": "...", "parent_post": post_id (optional for replies)}`
- `GET /api/forums/posts/{post_id}/` - Get specific post
- `GET /api/forums/posts/{post_id}/replies/` - Get all replies to a post
- `PUT /api/forums/posts/{post_id}/` - Update post (author only)
- `DELETE /api/forums/posts/{post_id}/` - Delete post (author only)

#### Forum Photos
- `POST /api/forums/photos/upload/` - Upload photo to forum post
  - Form-data: `photo` (File), `post_id` (Text), `caption` (Text, optional)
- `GET /api/forums/photos/` - List all forum photos
- `GET /api/forums/photos/?post_id={POST_ID}` - Get photos for specific post
- `DELETE /api/forums/photos/{photo_id}/` - Delete photo (post author only)

---

## Authentication

All authenticated endpoints require a token in the header:
```
Authorization: Token {your_token_here}
```

Get your token from the `/api/users/login/` endpoint.

---

## Technologies Used

- **Backend Framework**: Django 5.1.3, Django REST Framework 3.15.2
- **Database**: PostgreSQL
- **Image Storage**: Cloudinary
- **Image Processing**: Pillow 11.0.0
- **External APIs**: National Park Service API, Recreation.gov API
- **Hosting**: Railway (backend), Netlify (frontend)
- **CORS**: django-cors-headers 4.6.0
- **API Testing**: Postman

---

## Works Cited

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

GitHub Markdown
https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax

Photos with cloudinary
https://www.youtube.com/watch?v=fQo9ivqX4xs
https://www.youtube.com/watch?v=CS5fm1nGpNA

Create superuser in railway
https://stackoverflow.com/questions/77712412/create-super-user-using-railway-cli


