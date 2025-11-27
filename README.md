# Green Wheels – MERN Carpool & Smart Tracking System

Green Wheels is a full‑stack carpooling platform built with the **MERN** stack. It connects **drivers** and **passengers** for shared rides and adds a light **smart tracking system** so passengers can see the live location of the car once a ride has started.

This repository contains both the **backend API** (Node/Express/MongoDB/Socket.IO) and the **frontend SPA** (React/Vite/Leaflet).

---

## Features

### Core functionality
- User authentication (JWT‑based login/signup)
- Three roles: **passenger**, **driver**, **admin**
- Drivers can:
  - Create rides with start/end locations, date/time, seats, and pricing
  - See their rides and incoming booking requests
  - Accept or reject booking requests
  - Cancel rides they created
  - Share live GPS location with passengers via Socket.IO
- Passengers can:
  - Search for rides by origin/destination/date, optional pickup radius
  - View ride details and seat availability
  - Request seats on a ride
  - See live tracking once the driver shares location
  - Cancel their bookings (pending or accepted)
- Admins (basic):
  - Have a dedicated panel for driver verification and analytics (scaffolding in place)

### UX details
- Clean layout with role‑specific sidebars for **Passenger Workspace**, **Driver Console**, and **Admin Panel**
- Landing page CTA buttons adapt to role:
  - Passengers: **Find a Ride**
  - Drivers: **Offer a Ride**
- Integrated toast notifications for key events:
  - Ride created / cancelled
  - Booking created / accepted / rejected / cancelled
- Map‑based pickup selection and live tracking using **Leaflet** and **react‑leaflet**

---

## Tech Stack

### Backend
- **Node.js** (ES modules)
- **Express** – REST API
- **MongoDB + Mongoose** – data models and querying
- **Socket.IO** – real‑time location updates
- **JWT (jsonwebtoken)** – authentication
- **bcrypt** – password hashing
- **dotenv** – environment configuration
- **express‑rate‑limit**, **morgan**, **cors** – security & logging

### Frontend
- **React 18+** with **Vite**
- **React Router** – client‑side routing
- **Axios** – API client
- **Leaflet + react‑leaflet** – maps and tracking
- **Tailwind‑style utility CSS** (via PostCSS/Tailwind config)

---

## Project Structure

```text
MERN-Carpool/
├── backend/
│   ├── src/
│   │   ├── app.js               # Express app wiring
│   │   ├── server.js            # HTTP + Socket.IO server bootstrap
│   │   ├── config/
│   │   │   ├── env.js           # Reads .env and exports config (PORT, MONGO_URI, etc.)
│   │   │   └── db.js            # MongoDB connection helper
│   │   ├── controllers/         # Route handlers (auth, rides, bookings, admin, notifications)
│   │   ├── middleware/          # auth, error handling, etc.
│   │   ├── models/              # Mongoose schemas (User, Ride, Booking, ...)
│   │   ├── routes/              # Express routers (/auth, /rides, /bookings, /admin, /notifications)
│   │   └── utils/               # Seed helpers, helpers
│   ├── package.json
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Route configuration
│   │   ├── main.jsx             # React entrypoint, providers
│   │   ├── config/api.js        # Axios instance
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Keeps logged‑in user in state
│   │   │   └── ToastContext.jsx # Simple toast notification system
│   │   ├── components/
│   │   │   ├── Layouts.jsx      # Top bar, sidebars, footer
│   │   │   ├── MapPicker.jsx    # Map‑based coordinate picker
│   │   │   └── TrackingMap.jsx  # Read‑only map for live tracking
│   │   └── pages/
│   │       ├── auth/            # Login / Signup
│   │       ├── user/            # Passenger flows (search, ride details, bookings, profile)
│   │       ├── driver/          # Driver flows (rides, requests, tracking, profile)
│   │       └── admin/           # Admin dashboard & tools
│   ├── package.json
│   └── ...
└── README.md                    # You are here
```

---

## Prerequisites

- **Node.js** ≥ 20
- **MongoDB** running locally (e.g. `mongodb://127.0.0.1:27017/carpool`) or in the cloud
- **npm** (comes with Node)

> The app is designed to work with a standalone MongoDB instance (transactions are not required).

---

## Getting Started

Clone the repo and install dependencies for both backend and frontend.

```bash
# Clone
git clone <your-fork-or-repo-url> MERN-Carpool
cd MERN-Carpool

# Install backend deps
cd backend
npm install

# Install frontend deps
cd ../frontend
npm install
```

### Environment variables

#### Backend (`backend/.env`)

The backend reads configuration from `src/config/env.js`. You can create `.env` in `backend/` with:

```bash
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/carpool
JWT_SECRET=super-secret-key-change-me
JWT_EXPIRES_IN=1h
CLIENT_ORIGIN=http://localhost:5173
```

Defaults (used if variables are missing):
- `PORT` → `5000`
- `MONGO_URI` → `mongodb://127.0.0.1:27017/carpool`
- `JWT_SECRET` → `change-me-in-production`
- `JWT_EXPIRES_IN` → `1h`
- `CLIENT_ORIGIN` → `http://localhost:5173`

#### Frontend (`frontend/.env`)

The frontend uses `VITE_API_BASE_URL`:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

If not provided, it defaults to `http://localhost:5000/api`.

---

## Running in Development

### 1. Start MongoDB

Make sure MongoDB is running locally or that your `MONGO_URI` points to a reachable database.

### 2. Backend (API + Socket.IO)

```bash
cd backend
npm run dev
```

- Starts the Express server on `http://localhost:5000`
- REST API is available under `http://localhost:5000/api`
- Socket.IO server shares the same port

You can verify with:

```bash
curl http://localhost:5000/health
```

### 3. Frontend (React + Vite)

```bash
cd frontend
npm run dev
```

Vite will show a local dev URL, typically `http://localhost:5173`.

Login, signup, and all role‑based dashboards are accessible via the SPA.

---

## Available Scripts

### Backend

From `backend/`:

- `npm run dev` – start the API and Socket.IO server
- `npm start` – same as `dev` in this project
- `npm test` – stub (currently prints "No tests yet")

### Frontend

From `frontend/`:

- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview production build locally
- `npm run lint` – run ESLint

---

## API Overview

All endpoints are prefixed with `/api` on the backend.

### Auth

Base path: `/api/auth`

- `POST /signup` – create a new user (default role: passenger)
- `POST /login` – login and receive a JWT
- `GET /me` – get current user profile (requires `Authorization: Bearer <token>`)

### Rides

Base path: `/api/rides`

- `GET /` – public ride search with filters:
  - `origin`, `destination` – text filters on start/end location
  - `date` – match rides starting on a given day
  - `seatsNeeded` – minimum remaining seats
  - `maxPrice` – maximum price per seat
  - `originLat`, `originLng`, `radiusKm` – approximate radius filter around pickup point
- `GET /me` – list rides owned by the authenticated driver
- `GET /:id` – get ride details by ID
- `POST /` – create a new ride (driver only)
- `DELETE /:id` – cancel a ride (driver or admin, enforced in controller)

### Bookings

Base path: `/api/bookings`

- `POST /` – create a booking request for a ride (passenger)
- `GET /me` – passenger’s own bookings
- `POST /:id/cancel` – cancel a booking:
  - allowed for the passenger, ride’s driver, or an admin
  - if the booking was accepted, seats are freed on the ride
- `GET /ride/:rideId` – list bookings for a driver’s ride
- `POST /:id/accept` – driver accepts a booking
- `POST /:id/reject` – driver rejects a booking

### Admin & Notifications

- `/api/admin/**` – admin‑only tools (driver verification, analytics); structure is present and can be extended.
- `/api/notifications` – simple notification listing for a user (used in UI; implementation can be extended with real pushes).

---

## Frontend Routes & Roles

Routes are defined in `App.jsx` using React Router and guarded by `ProtectedRoute` + `RoleGuard`.

### Public
- `/` – landing page (CTA buttons adapt to user role)
- `/auth/login` – login
- `/auth/signup` – sign up

### Passenger area (`/user/*`)
- `/user/dashboard` – passenger overview
- `/user/search` – ride search form + results
- `/user/rides/:id` – ride details & booking form
- `/user/bookings` – list and cancel bookings
- `/user/notifications` – notifications list
- `/user/profile` – profile page

### Driver area (`/driver/*`)
- `/driver/dashboard` – driver console
- `/driver/rides` – list and cancel rides
- `/driver/rides/new` – create ride form (with map pickers)
- `/driver/requests` – booking requests per ride (accept/reject/cancel)
- `/driver/track` – share live GPS location for a ride
- `/driver/profile` – driver profile & verification status

### Admin area (`/admin/*`)
- `/admin/dashboard` – high‑level overview
- `/admin/drivers/verification` – driver verification workflow
- `/admin/analytics` – analytics placeholder

Access to `/user`, `/driver`, `/admin` is guarded based on the `role` coming from `AuthContext`.

---

## Real‑Time Tracking

- Drivers open **Driver → Live tracking**, enter a ride ID, and start tracking.
- The frontend uses `navigator.geolocation.watchPosition` to stream location to the backend via `Socket.IO` (`driver_location` events).
- Passengers on the ride details page join a `ride:<rideId>` room and receive `location_update` events.
- Positions are displayed on a Leaflet map via the `TrackingMap` component.

> For local testing, you may need to allow browser location permissions.

---

## Production Build & Deployment

### Backend

1. Ensure `NODE_ENV=production` and all environment variables are set.
2. Start the server with a process manager (e.g. `pm2`, systemd, Docker) running `node src/server.js`.
3. Point MongoDB connection (`MONGO_URI`) to your production database.

### Frontend

```bash
cd frontend
npm run build
```

- This generates a static bundle in `frontend/dist/`.
- You can serve it with any static host (Nginx, Apache, Vercel, Netlify, etc.).
- In production, set `VITE_API_BASE_URL` to your deployed backend API URL before building.

---

## Development Notes & Next Steps

Some ideas / known areas for improvement:

- Add automated tests for critical flows (auth, ride creation, booking, cancellation)
- Implement persistent notification service (email/SMS/push) on top of `/api/notifications`
- Enhance admin analytics with real metrics (rides per day, occupancy, CO₂ saved)
- Improve driver verification workflows (document uploads, statuses, audits)
- Harden validation and rate‑limiting for production traffic

Contributions and customizations are welcome – this project is meant as a solid starting point for a modern, real‑time carpooling application.
