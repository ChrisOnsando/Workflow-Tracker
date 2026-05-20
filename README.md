# Workflow Tracker

A full-stack application workflow management system built with Django + Django Ninja on the backend and React (Vite) on the frontend.

Applications move through a structured review pipeline:

```
Draft → Submitted → Under Review → Approved 
                               └→ Rejected
                               └→ Need More Information → Submitted → ...
```

---

## Project Structure

```
workflow-tracker/
├── venv/                   # Python virtual environment (not committed)
├── workflow/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── workflows/
│   ├── models.py           # Application model + enums
│   ├── schemas.py          # Pydantic request/response schemas
│   └── api.py              # Django Ninja router + endpoints
├── manage.py
├── db.sqlite3              # Auto-generated after migrations
└── frontend/
    ├── src/
    │   ├── api/            # Axios client + endpoint wrappers
    │   ├── components/     # Shared UI: Button, StatusBadge, FormField
    │   ├── pages/          # ApplicationList, ApplicationForm, ApplicationDetail
    │   ├── constants.js    # Statuses, types, colour map
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── package.json
```

---

## Prerequisites

 Tool | Version
 Python | 3.10+ 
 Node.js | 18+ 
 npm | 9+ 

## Clone the repository
```bash
git clone https://github.com/ChrisOnsando/Workflow-Tracker.git
```
## Backend

### 1. Create and activate a virtual environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Use this if using Windows: venv\Scripts\activate
```

### 2. Install Python dependencies

```bash
pip install django django-ninja django-cors-headers
```

### 3. Run migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. (Optional) Create a superuser for the Django admin

```bash
python manage.py createsuperuser
```

### 5. Start the development server

```bash
python manage.py runserver
```

The API is now live at `http://127.0.0.1:8000/api/`.

| URL | Description |
|-----|-------------|
| `http://127.0.0.1:8000/api/docs` | Interactive Swagger UI |
| `http://127.0.0.1:8000/api/v1/workflows/` | REST API root |
| `http://127.0.0.1:8000/admin/` | Django admin panel |

---

## Frontend

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Start the development server

```bash
npm run dev
```

The app is now live at `http://localhost:5173`.

> The frontend calls `http://127.0.0.1:8000/api/` by default. Make sure the Django server is running before using the frontend.

---

## Running Both Together

Open two terminals from the project root:

```bash
# Terminal 1 — backend
cd backend
source venv/bin/activate # Use this if using Windows: venv\Scripts\activate
python manage.py runserver

# Terminal 2 — frontend
cd frontend && npm run dev
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/workflows/` | Create a draft application |
| `GET` | `/api/v1/workflows/` | List all applications |
| `GET` | `/api/v1/workflows/{id}` | Get application detail |
| `PATCH` | `/api/v1/workflows/{id}` | Update a draft application |
| `POST` | `/api/v1/workflows/{id}/submit` | Submit for review |
| `POST` | `/api/v1/workflows/{id}/start-review` | Move to Under Review |
| `POST` | `/api/v1/workflows/{id}/decision` | Record reviewer decision |

---

## Workflow Rules

- Only `Draft` and `Need More Information` applications can be edited.
- Only `Draft` and `Need More Information` applications can be submitted.
- Only `Submitted` applications can be moved to `Under Review`.
- Only `Under Review` applications can receive a reviewer decision.
- `Rejected` and `Need More Information` decisions require a comment — the API enforces this and returns a `400` if omitted.
- `Approved` and `Rejected` applications are immutable.

---

## Assumptions Made

**Authentication is out of scope.** The API has no auth layer. All endpoints are publicly accessible. In a real system you would add JWT or session-based auth and distinguish between applicant and reviewer roles — the workflow rules (who can submit vs who can decide) would then be enforced at the permission level, not just the status level.

**A single SQLite database is used.** This is fine for local development and evaluation but is not suitable for production or concurrent users. SQLite has no connection pooling and poor write concurrency.

**No file attachments.** Real applications of this type (recordation, change of ownership, etc.) typically require supporting documents. The model only stores text fields. Adding file upload would require integrating Django's file storage and potentially a service like S3.

**Tracking numbers are generated at creation time**, not submission time. The format is `APP-` followed by 8 random hex characters. No sequential numbering or year prefix — both of which are common in production systems — were added to keep the implementation simple.

**CORS is open (`CORS_ALLOW_ALL_ORIGINS = True`).** This is intentional for local development. Any production deployment must restrict this to the actual frontend domain.

**The reviewer and the applicant are the same user conceptually.** The frontend shows all actions (submit, start review, decide) to whoever is viewing the page. In production these would be gated by role.

---

## What I Would Improve With More Time

**Authentication and roles.** Introduce a proper user model with at minimum two roles: `Applicant` and `Reviewer`. Applicants create and submit; reviewers start reviews and record decisions. JWT via `djangorestframework-simplejwt` or `django-ninja-jwt` would be the natural fit here given the Ninja setup.

**Automated tests.** The backend has no test suite. With more time I would add `pytest-django` with `factory-boy` for model factories and test every state transition, including invalid ones (trying to edit an Approved application should return 400, etc.). The workflow rules are the core business logic and deserve full coverage.

**Pagination and filtering on the list endpoint.** Right now `GET /api/v1/workflows/` returns every record. This breaks at any meaningful scale. Django Ninja has built-in pagination support — adding `?status=Draft&page=2` filtering and a cursor-based paginator would be the right next step.

**Better error handling on the frontend.** API errors currently surface as bare `alert()` calls or are silently swallowed. A proper toast/notification system and per-field API error mapping (especially for email validation failures) would significantly improve the UX.

**Audit log / status history.** Right now there's no record of *when* each status transition happened beyond `submitted_at` and `reviewed_at`. A separate `ApplicationEvent` model (event type, timestamp, actor, comment) would give a full audit trail, which is essential for any regulated process.

**File attachment support.** Applications in the real world need to carry supporting documents. This would involve adding a `DocumentUpload` model with a foreign key to `Application`, wiring up Django's file storage backend, and adding an upload endpoint and file preview to the frontend.

**Production hardening.** Swap SQLite for PostgreSQL, set `DEBUG = False`, move `SECRET_KEY` to an environment variable (e.g. via `python-decouple` or a `.env` file), pin `CORS_ALLOWED_ORIGINS` to the frontend domain, and put the app behind `gunicorn` + `nginx`.

**Email notifications.** Applicants should receive an email when their status changes (submitted → under review → decision). Django's email backend + Celery for async delivery would handle this cleanly without blocking the request cycle.

# Author

Built by **Chris Onsando Nemwel**

- Email: chrisnemwel@gmail.com
