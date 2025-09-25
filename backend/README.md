README file for the backend work using Djanjo.

The backend for the Hiking Trail App is done using Django REST API and Python. Database is SQLite

Current Features:
  - User authentication: Registration, login, logout with token based authentication.
  - User profiles: Automatic hiking profile created
  - Trail management: Database for trails that include difficulty, location, and GPS data.
  - Trail completion tracking: Users may mark trails as completed and rate them 1-5 with optional notes.
  - Admin interface on web: Manage database and user info from admin.


To Do:
  - NPS API integration and endpoints

Reminder on how to open development:
  1) Create the virtual environment: python -m venv venv
                                     source venv/bin/activate
  2) Install dependencies: pip install django djangorestframework
  3) Run migrations: python manage.py migrate
  4) Start development server: python manage.py runserver


**API at http://127.0.0.1:8000**
**Admin at http://127.0.0.1:8000/admin/**


API endpoints:
  - `POST /api/auth/register/` - Create account
  - `POST /api/auth/login/` - Login
  - `POST /api/auth/logout/` - Logout

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


