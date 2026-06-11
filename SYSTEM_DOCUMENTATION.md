# RoomEase System Overview

## Project Purpose
RoomEase is a full-stack student housing and roommate finder application built for Melbourne students. The system provides:
- User authentication (register/login)
- Role selection for Room Seekers and Property Owners
- Room seeker preference submission
- Property listing submission
- A dashboard view of saved data

## Repository Structure

- `backend/`
  - `app.py` - Flask backend API
  - `.env` - environment variables for backend configuration
  - `requirements.txt` - Python dependencies

- `frontend/`
  - `package.json` - frontend dependencies and scripts
  - `vite.config.js` - Vite configuration
  - `.env` - frontend environment variables
  - `src/` - React application source code
  - `public/` - static public assets

- `database/`
  - `schema.sql` - Supabase/Postgres database schema

## Technology Stack

- Frontend:
  - React 19
  - Vite 8
  - Lucide React icons
  - Vanilla CSS + React component structure

- Backend:
  - Python 3
  - Flask
  - Flask-CORS
  - python-dotenv
  - werkzeug security
  - Optional Supabase integration for production persistence

- Database:
  - Postgres-compatible schema designed for Supabase
  - Tables: `users`, `room_seekers`, `property_listings`

## High-Level Architecture

1. User opens the React frontend.
2. User registers or logs in via the auth UI.
3. Auth requests are sent to the Flask backend at `/api/auth/register` and `/api/auth/login`.
4. After login, the user chooses a role:
   - Room Seeker
   - Property Owner
5. Based on the selected role, the user submits either seeker preferences or a property listing.
6. The frontend persists session state in `localStorage` and displays a saved-data dashboard.

## Backend Details (`backend/app.py`)

### Environment and Startup
- Loads `.env` using `load_dotenv()`.
- Reads `SUPABASE_URL` and `SUPABASE_KEY` from environment.
- Reads `BACKEND_ALLOWED_ORIGINS` to control CORS for production frontend access.
- Reads `USE_IN_MEMORY_FALLBACK` to control whether the app uses Supabase or local fallback storage.
- Uses Supabase when valid credentials are present.
- Falls back to in-memory storage for development if Supabase is not configured or if fallback mode is enabled.
- Runs on `http://0.0.0.0:5000` by default.

### Supported Routes

- `GET /api/health`
  - Returns service health and whether database is connected.

- `POST /api/auth/register`
  - Registers a new user.
  - Validates email format and password length.
  - Returns `success: true` and user email on success.
  - Prevents duplicate email registration.

- `POST /api/auth/login`
  - Logs in an existing user.
  - Validates email and password fields.
  - Returns `success: true` and user data on success.

- `POST /api/room-seekers`
  - Submits room seeker details.
  - Validates required fields, budgets, and dates.
  - Stores record in Supabase or in-memory fallback.

- `GET /api/room-seekers`
  - Returns all room seeker records.

- `POST /api/property-listings`
  - Submits a property listing.
  - Validates required fields and weekly rent.
  - Stores record in Supabase or in-memory fallback.

- `GET /api/property-listings`
  - Returns all property listings.

### Auth Behavior
- User passwords are hashed with `werkzeug.security.generate_password_hash`.
- Login verifies password using `check_password_hash`.
- In-memory fallback stores user objects on `app._in_memory_users`.

## Frontend Details (`frontend/`)

### Core Files
- `src/App.jsx`
  - Main application layout and routing state.
  - Manages screens: login, role selection, seeker form, owner form, success, saved data.
  - Uses `import.meta.env.VITE_API_URL` or `http://localhost:5000` by default.

- `src/context/AuthContext.jsx`
  - Provides auth state, login/register actions, and persistent local storage.
  - Calls backend auth endpoints.
  - Returns structured `fieldErrors` and network-friendly messages.

- `src/components/Login.jsx`
  - User login/register form.
  - Handles validation for email, password, and confirm password.
  - Displays form errors and server messages.

- `src/components/RoleSelection.jsx`
  - Lets authenticated users choose between Room Seeker and Property Owner roles.

- `src/components/RoomSeekerForm.jsx`
  - Collects seeker preferences, budget, location, dates, and lifestyle notes.

- `src/components/PropertyOwnerForm.jsx`
  - Collects property listing details for owners.

- `src/components/SavedData.jsx`
  - Shows saved data from the backend.

### Frontend Environment Variables
- `VITE_API_URL`
  - Base URL used for all backend API calls.
  - Should point to the live Flask backend in production.

### Build and Run Commands
- `npm install`
- `npm run dev` - local development server
- `npm run build` - create production assets
- `npm run preview` - preview production build

## Database Schema (`database/schema.sql`)

### Tables

- `room_seekers`
  - `id`, `full_name`, `email`, `suburb`, `min_budget`, `max_budget`, `room_type`, `move_in_date`, `smoking_allowed`, `pets_allowed`, `lifestyle_notes`, `created_at`

- `property_listings`
  - `id`, `owner_name`, `email`, `address`, `suburb`, `room_type`, `weekly_rent`, `availability_date`, `amenities`, `description`, `created_at`

- `users`
  - `id`, `email`, `password_hash`, `created_at`

### Notes
- All tables use UUID primary keys.
- Row-level security is disabled in the schema file with `ALTER TABLE ... DISABLE ROW LEVEL SECURITY`.

## Deployment Notes

### Frontend Deployment
- Deploy the `frontend/` folder as a static React/Vite application.
- Set `VITE_API_URL` in production to point to the deployed backend.

### Backend Deployment
- Deploy `backend/app.py` as a Python Flask service.
- Ensure environment variables are configured:
  - `SUPABASE_URL`
  - `SUPABASE_KEY`
  - `BACKEND_ALLOWED_ORIGINS` (e.g. `https://your-vercel-app.vercel.app`)
  - `USE_IN_MEMORY_FALLBACK=false` for production
- If using Supabase, ensure the `users`, `room_seekers`, and `property_listings` tables exist.
- If Supabase is not configured, the backend can run in local fallback mode only.
- Use `backend/.env.example` as a template; do not commit real secrets.

## Local Development Setup

### Backend
1. Create a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Run the backend:
   ```bash
   python backend/app.py
   ```

### Frontend
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the app:
   ```bash
   npm run dev
   ```

## Important System Behavior

- Auth and form submissions depend on the backend API.
- The frontend currently defaults to `http://localhost:5000` if `VITE_API_URL` is not provided.
- The auth flow stores user session data in browser `localStorage` under `roomease_user`.

## Recommended Improvements

- Add a root-level `README.md` with this summary and running instructions.
- Add backend route protection and real session management.
- Move Supabase credentials out of source control.
- Add tests for auth flow and form validation.

---

_Last updated: 2026-06-11_
