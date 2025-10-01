BugBase
=======

A modern, role-based bug tracking app with a Kanban workflow, polished UI (light/dark themes), and developer/QA/admin dashboards.

Features
--------
- Role-based access: Admin, Developer, QA, User
- Kanban board with drag & drop (smooth hover/lift/scale)
- Admin overview + board; assign bugs to developers
- Developer dashboard with submit-to-QA flow
- QA dashboard for review, approve/reject
- Detailed user bug report form with environment, steps, severity, etc.
- Light/Dark theme toggle with persistence

Tech Stack
---------
- Frontend: React + Vite, MUI (Material UI)
- Drag-and-drop: @hello-pangea/dnd
- Backend: Node.js + Express + Mongoose (MongoDB)
- Auth: JWT (Bearer token)

Monorepo Structure
------------------
```
BugBase/
  backend/            # Express API
  frontend/           # Vite + React app
  README.md           # This file
```

Getting Started
---------------

Prerequisites
-------------
- Node.js LTS (v18+ recommended)
- MongoDB (local or cloud)

Backend Setup
-------------
1. Navigate and install
   ```bash
   cd backend
   npm install
   ```
2. Create a .env in backend/ with:
   ```
   ACCESS_TOKEN_SECRET=replace_with_strong_secret
   MONGODB_URI=mongodb://localhost:27017/bugbase
   PORT=5000
   ```
3. Start the API
   ```bash
   npm start
   ```
   API runs at http://localhost:5000.

Frontend Setup
--------------
1. Navigate and install
   ```bash
   cd frontend
   npm install
   ```
2. Start the dev server
   ```bash
   npm run dev
   ```
   App runs at http://localhost:5173.

Default Flow (Quick Demo)
-------------------------
1. Register or create users via API for roles: admin, dev, qa, user.
2. Login from the app (Login page).
3. As a User, report a bug (User page).
4. As Admin, approve/assign bugs to Developers (Admin → Board).
5. As Developer, work the bug and Submit for QA.
6. As QA, approve or reject.

Important Endpoints (Backend)
-----------------------------
- Auth & Users
  - POST /api/users/register
  - POST /api/users/login → returns { token, user }
  - GET  /api/users/me (auth)
  - GET  /api/users/developers (auth, list devs)
- Bugs
  - POST /api/bugs (auth user)
  - GET  /api/bugs (auth; filtered by role)
  - GET  /api/bugs/:id (auth)
  - PUT  /api/bugs/:id/assign (auth admin)
  - PUT  /api/bugs/:id/status (auth admin/dev/qa; allows open|inprogress|qa|closed)
  - GET  /api/bugs/assigned (auth dev)
  - GET  /api/bugs/qa/list (auth qa/admin)

Notes:
- All protected routes expect Authorization: Bearer <JWT>.
- Status qa is used for QA queue; devs transition to it via “Submit for QA”.

Theming & UX
------------
- Theme toggle in the header; preference is saved and respects system theme.
- Gradient page headers across dashboards for a cohesive look.
- Smooth DnD card shadows and drag-over highlights.
- Scrollbars styled for both light and dark themes.

Environment Tips
----------------
- If you reload and get redirected to login, ensure the backend is running and the token remains valid. The app restores session from localStorage and verifies with /api/users/me on load.
- Update MONGODB_URI to point to your MongoDB.

Scripts
-------
Backend:
```
npm start        # start API
```
Frontend:
```
npm run dev      # start web app in dev
npm run build    # production build
npm run preview  # preview production build
```

Roadmap Ideas
-------------
- File uploads (screenshots) on bug report
- Global “New Bug” quick-create dialog
- Avatars and richer metadata on cards
- Pagination and server-side filters

License
-------
MIT


