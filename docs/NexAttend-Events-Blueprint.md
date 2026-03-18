# NexAttend Events — Complete Project Blueprint

> **A sub-project by Team NexAttend.** QR-based event attendance management platform for university events.
> No biometric data. No AI face detection. Just clean QR-based check-in.

---

## 1. Project Overview

### What Is This?

NexAttend Events is a **standalone web platform** that allows event managers to:
1. Create events with custom registration forms
2. Let participants register and receive unique QR codes
3. Scan QR codes at the event entrance to mark attendance
4. Export attendance data as CSV or Excel

### Why?

Our main SDGP project (NexAttend) uses AI face recognition for classroom attendance. However, for university events like **VisioNEX 2026**, where participants may be under 18, biometric data collection requires parental consent. This platform solves that problem with a privacy-first QR approach.

### Design Inspiration

This platform should visually feel like part of the NexAttend family:
- **Dark theme** (navy/charcoal background)
- **Cyan + purple gradient accents**
- **Glassmorphism cards**
- **Smooth animations** (use Framer Motion)
- **Clean, modern typography** (Inter or similar sans-serif)
- **Mobile-first** - the scanner and registration will be used on phones

---

## 2. Tech Stack

| Layer | Technology | Version | Why |
|---|---|---|---|
| **Frontend Framework** | React + TypeScript | React 19.x | Same as NexAttend |
| **Build Tool** | Vite | 6.x | Same as NexAttend |
| **Styling** | Tailwind CSS | 4.x | Same as NexAttend |
| **Animations** | Framer Motion | 12.x | Same as NexAttend |
| **Icons** | Lucide React | Latest | Same as NexAttend |
| **HTTP Client** | Axios | Latest | Same as NexAttend |
| **Routing** | React Router DOM | 7.x | Same as NexAttend |
| **Charts** | Recharts | 3.x | Same as NexAttend (for analytics) |
| **QR Generation (Frontend)** | `qrcode.react` | Latest | Generate QR codes in browser |
| **QR Scanning (Frontend)** | `html5-qrcode` | Latest | Camera-based QR scanning |
| **Backend Framework** | FastAPI | Latest | Same as NexAttend |
| **ASGI Server** | Uvicorn | Latest | Same as NexAttend |
| **Database** | MongoDB Atlas | — | Same as NexAttend |
| **DB Driver** | Motor (async) | Latest | Same as NexAttend |
| **Auth** | JWT (python-jose) + bcrypt | — | Same as NexAttend |
| **QR Generation (Backend)** | `qrcode` + `Pillow` | Latest | Generate QR as PNG for emails |
| **Email** | SendGrid | Latest | Same as NexAttend |
| **Excel Export** | `openpyxl` | Latest | Generate .xlsx files |
| **CSV Export** | Python built-in `csv` | — | Generate .csv files |
| **Frontend Hosting** | Vercel | — | Same as NexAttend |
| **Backend Hosting** | Render | — | Same as NexAttend |

---

## 3. Project Structure

### Root Structure

```
NexAttend-Events/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI app entry point
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py               # Dependency injection (DB, Auth)
│   │   │   └── routes/
│   │   │       ├── __init__.py        # Router registration
│   │   │       ├── auth.py            # Login, Register, /me
│   │   │       ├── events.py          # Event CRUD
│   │   │       ├── forms.py           # Form field CRUD for events
│   │   │       ├── registrations.py   # Participant registration + QR
│   │   │       ├── scanner.py         # QR scan + attendance marking
│   │   │       ├── export.py          # CSV/Excel download
│   │   │       └── health.py          # Health check
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py             # Settings from .env
│   │   │   └── security.py           # JWT + password hashing
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   └── mongodb.py            # MongoDB connection (Motor)
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py               # Event manager user model
│   │   │   ├── event.py              # Event model
│   │   │   ├── form_field.py         # Dynamic form field model
│   │   │   └── registration.py       # Participant registration model
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py               # User request/response schemas
│   │   │   ├── event.py              # Event schemas
│   │   │   ├── form_field.py         # Form field schemas
│   │   │   ├── registration.py       # Registration schemas
│   │   │   └── scanner.py            # Scanner response schemas
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py       # Auth logic
│   │   │   ├── event_service.py      # Event business logic
│   │   │   ├── qr_service.py         # QR code generation
│   │   │   ├── email_service.py      # Send registration emails with QR
│   │   │   └── export_service.py     # CSV/Excel generation
│   │   └── templates/
│   │       └── registration_email.html  # Email template with QR
│   ├── data/
│   │   └── exports/                  # Temp directory for generated files
│   │       └── .gitkeep
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── web/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── App.tsx                   # Main app + routing
│   │   ├── index.tsx                 # Entry point
│   │   ├── index.css                 # Global styles + Tailwind
│   │   ├── vite-env.d.ts
│   │   ├── components/
│   │   │   ├── Header.tsx            # Navigation bar
│   │   │   ├── Footer.tsx            # Site footer
│   │   │   ├── Sidebar.tsx           # Dashboard sidebar nav
│   │   │   ├── Loading.tsx           # Loading spinner
│   │   │   ├── Alert.tsx             # Success/Error alerts
│   │   │   ├── Modal.tsx             # Modal dialog
│   │   │   ├── EventCard.tsx         # Event card (used in discovery + dashboard)
│   │   │   ├── FormFieldBuilder.tsx  # Dynamic form field add/edit/remove
│   │   │   ├── QRCodeDisplay.tsx     # QR code display + download
│   │   │   ├── QRScanner.tsx         # Camera-based QR scanner component
│   │   │   ├── AttendanceTable.tsx   # Attendance data table
│   │   │   └── StatsCard.tsx         # Stats display card
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx       # Public landing page
│   │   │   ├── LoginPage.tsx         # Event manager login
│   │   │   ├── RegisterPage.tsx      # Event manager sign up
│   │   │   ├── DashboardPage.tsx     # Event manager dashboard
│   │   │   ├── CreateEventPage.tsx   # Create event + form builder
│   │   │   ├── EditEventPage.tsx     # Edit existing event
│   │   │   ├── EventDiscoveryPage.tsx # Public event search for participants
│   │   │   ├── EventRegistrationPage.tsx # Public registration form
│   │   │   ├── RegistrationSuccessPage.tsx # QR code confirmation
│   │   │   ├── ScannerPage.tsx       # QR scanner for check-in
│   │   │   └── AttendanceSheetPage.tsx # View + export attendance
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx       # Auth state management
│   │   ├── services/
│   │   │   └── api.ts                # Axios instance + API calls
│   │   └── utils/
│   │       └── helpers.ts            # Utility functions
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── postcss.config.js
│   └── .env.example
├── .gitignore
├── README.md
├── vercel.json
└── docs/
    └── NexAttend-Events-Blueprint.md  # This file
```

---

## 4. .gitignore

```gitignore
# General
.env
.DS_Store
Thumbs.db
*.log

# IDEs
.vscode/
.idea/
*.swp
*.swo

# Frontend (Web)
web/node_modules/
web/dist/
web/build/
web/.env
web/.env.local
web/.env.*.local
web/coverage/
web/npm-debug.log*
web/yarn-debug.log*
web/yarn-error.log*

# Backend (Python)
backend/venv/
backend/.venv/
**/__pycache__/
backend/*.pyc
backend/*.pyo
backend/*.pyd
backend/.Python
backend/env/
backend/.env
backend/.pytest_cache/
backend/htmlcov/
backend/.coverage

# Database
*.sqlite3
*.db

# Data exports (temp generated files)
backend/data/exports/*
!backend/data/exports/.gitkeep
```

---

## 5. Backend — requirements.txt

```txt
# Core Framework
fastapi>=0.104.1
uvicorn>=0.24.0
python-multipart>=0.0.6

# Database
pymongo>=4.6.0
motor>=3.3.2

# Authentication
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
bcrypt==4.0.1

# Validation
email-validator>=2.1.0
pydantic>=2.5.2
pydantic-settings>=2.1.0

# Environment
python-dotenv>=1.0.0
certifi>=2024.2.2

# QR Code Generation
qrcode[pil]>=7.4.2
Pillow>=10.1.0

# Email
sendgrid>=6.11.0
jinja2>=3.1.0

# Export
openpyxl>=3.1.2

# Google Auth (optional, if implementing Google Sign-In)
google-auth>=2.23.0
requests>=2.31.0
```

---

## 6. Frontend — package.json Dependencies

```json
{
  "dependencies": {
    "axios": "^1.13.5",
    "framer-motion": "^12.34.0",
    "html5-qrcode": "^2.3.8",
    "lucide-react": "^0.563.0",
    "qrcode.react": "^4.2.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.9.6",
    "recharts": "^3.3.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.18",
    "@types/node": "^22.14.0",
    "@types/react": "^19.2.10",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.0.0",
    "autoprefixer": "^10.4.23",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.18",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}
```

**Key new dependencies vs NexAttend:**
- `qrcode.react` — Render QR codes as React components (for confirmation page)
- `html5-qrcode` — Camera-based QR code scanning (for check-in page)

**Removed from NexAttend:**
- `face-api.js` — Not needed (no face detection)
- `@google/genai` — Not needed
- `mongoose` — Not needed (backend uses Motor)

---

## 7. Database Schema (MongoDB Collections)

### Collection: `users`

Event managers who create and manage events.

```json
{
  "_id": "ObjectId",
  "name": "string",                  // Full name
  "email": "string",                 // Unique, used for login
  "password_hash": "string",         // bcrypt hashed password
  "organization": "string",          // Optional: university/company
  "role": "string",                  // "event_manager" (for future role expansion)
  "created_at": "datetime",          // Account creation timestamp
  "updated_at": "datetime"           // Last update timestamp
}
```

**Indexes:** `{ "email": 1 }` (unique)

---

### Collection: `events`

Each event created by an event manager.

```json
{
  "_id": "ObjectId",
  "creator_id": "ObjectId",          // Reference to users._id
  "title": "string",                 // Event name (e.g., "VisioNEX 2026")
  "description": "string",           // Event description (supports markdown)
  "slug": "string",                  // URL-friendly slug (e.g., "visionex-2026")
  "cover_image_url": "string",       // URL to uploaded cover image (or base64)
  "event_date": "datetime",          // When the event takes place
  "event_end_date": "datetime",      // Optional: event end date
  "location": "string",              // Venue name or address
  "capacity": "number",              // Max participants (0 = unlimited)
  "status": "string",                // "draft" | "published" | "ongoing" | "completed"
  "category": "string",              // "hackathon" | "workshop" | "conference" | "seminar" | "other"
  "registration_count": "number",    // Cached count of registrations
  "checked_in_count": "number",      // Cached count of check-ins
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Indexes:**
- `{ "creator_id": 1 }`
- `{ "slug": 1 }` (unique)
- `{ "status": 1 }`
- `{ "title": "text" }` (text search for event discovery)

---

### Collection: `form_fields`

Dynamic form fields for each event's registration form.

```json
{
  "_id": "ObjectId",
  "event_id": "ObjectId",            // Reference to events._id
  "label": "string",                 // Field label (e.g., "Full Name")
  "field_type": "string",            // "text" | "email" | "number" | "phone" | "dropdown" | "checkbox" | "textarea"
  "placeholder": "string",           // Placeholder text for the input
  "required": "boolean",             // Is this field mandatory?
  "order": "number",                 // Display order (1, 2, 3, ...)
  "options": ["string"],             // Only for "dropdown" type — list of choices
  "created_at": "datetime"
}
```

**Indexes:** `{ "event_id": 1, "order": 1 }`

**Default fields (auto-created with every event):**
1. Full Name (text, required, order: 1)
2. Email (email, required, order: 2)
3. Phone Number (phone, required, order: 3)

Event managers can add/edit/remove/reorder fields beyond these defaults.

---

### Collection: `registrations`

Each participant's registration for an event.

```json
{
  "_id": "ObjectId",
  "event_id": "ObjectId",            // Reference to events._id
  "qr_code_id": "string",            // Unique QR identifier (e.g., "EVT-abc123-REG-xyz789")
  "form_data": {                     // Flexible JSON — stores all form field responses
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+94771234567",
    "university": "IIT",
    // ... any custom fields the form has
  },
  "email": "string",                 // Extracted email (for quick lookup + duplicate check)
  "checked_in": "boolean",           // Has this person checked in?
  "checked_in_at": "datetime|null",  // Timestamp of check-in (null if not checked in)
  "checked_out": "boolean",          // Optional: has this person checked out?
  "checked_out_at": "datetime|null", // Optional: timestamp of check-out
  "qr_emailed": "boolean",           // Has the QR email been sent?
  "registered_at": "datetime"        // Registration timestamp
}
```

**Indexes:**
- `{ "event_id": 1 }`
- `{ "qr_code_id": 1 }` (unique)
- `{ "event_id": 1, "email": 1 }` (unique compound — prevents duplicate registration)
- `{ "checked_in": 1, "event_id": 1 }`

---

## 8. QR Code Architecture

### How QR Codes Work (IMPORTANT)

```
┌──────────────────────────────────────────────────────┐
│  QR CODE CONTAINS ONLY:                              │
│                                                      │
│  "EVT-abc123-REG-xyz789"                             │
│                                                      │
│  This is the qr_code_id from the registrations       │
│  collection. NO personal data is embedded.            │
└──────────────────────────────────────────────────────┘
```

**Why this approach:**
1. **Privacy:** Anyone scanning the QR with a phone app only sees an ID, not personal data
2. **Size:** QR codes have data limits (~3KB). IDs are tiny, always scannable
3. **Security:** Data stays in the database, not embedded in a scannable image
4. **Flexibility:** Form data can change without regenerating QR codes

### QR Code ID Format

```
EVT-{event_short_id}-REG-{registration_short_id}

Example: EVT-a7b3c9-REG-x1y2z3
```

- `event_short_id`: First 6 chars of the event's ObjectId (hex)
- `registration_short_id`: First 6 chars of the registration's ObjectId (hex)
- This creates a human-readable, unique identifier

### QR Generation Flow

```
Participant submits form
    → Backend creates registration document in MongoDB
    → Backend generates qr_code_id
    → Backend generates QR image (using `qrcode` Python library)
    → Backend sends email with QR image attached (via SendGrid)
    → Frontend also generates QR using `qrcode.react` for instant display
```

---

## 9. API Endpoints (Complete Reference)

### Auth Routes (`/api/v1/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | No | Register new event manager |
| `POST` | `/api/v1/auth/login` | No | Login, returns JWT |
| `GET` | `/api/v1/auth/me` | Yes | Get current user info |

**POST `/api/v1/auth/register`**
```json
// Request
{ "name": "John", "email": "john@iit.lk", "password": "Pass123!", "organization": "IIT" }
// Response 201
{ "id": "...", "name": "John", "email": "john@iit.lk", "token": "eyJ..." }
```

**POST `/api/v1/auth/login`**
```json
// Request
{ "email": "john@iit.lk", "password": "Pass123!" }
// Response 200
{ "id": "...", "name": "John", "email": "john@iit.lk", "token": "eyJ..." }
```

---

### Event Routes (`/api/v1/events`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/events` | Yes | Create new event |
| `GET` | `/api/v1/events` | Yes | Get all events for current user |
| `GET` | `/api/v1/events/:id` | Yes | Get single event details |
| `PUT` | `/api/v1/events/:id` | Yes | Update event |
| `DELETE` | `/api/v1/events/:id` | Yes | Delete event |
| `PATCH` | `/api/v1/events/:id/status` | Yes | Update event status |
| `GET` | `/api/v1/events/public/discover` | No | Search/browse published events |
| `GET` | `/api/v1/events/public/:slug` | No | Get event by slug (for registration page) |

**POST `/api/v1/events`**
```json
// Request
{
  "title": "VisioNEX 2026",
  "description": "Annual hackathon competition",
  "event_date": "2026-04-15T09:00:00",
  "location": "IIT Main Hall",
  "capacity": 200,
  "category": "hackathon",
  "cover_image_url": "base64_or_url"
}
// Response 201
{ "id": "...", "slug": "visionex-2026", "status": "draft", ... }
```

**GET `/api/v1/events/public/discover?search=visionex&category=hackathon`**
```json
// Response 200
{
  "events": [
    {
      "id": "...", "title": "VisioNEX 2026", "slug": "visionex-2026",
      "event_date": "...", "location": "...", "capacity": 200,
      "registration_count": 156, "cover_image_url": "...", "category": "hackathon"
    }
  ],
  "total": 1
}
```

---

### Form Field Routes (`/api/v1/events/:event_id/fields`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/events/:event_id/fields` | No* | Get all form fields for an event |
| `POST` | `/api/v1/events/:event_id/fields` | Yes | Add a form field |
| `PUT` | `/api/v1/events/:event_id/fields/:field_id` | Yes | Update a form field |
| `DELETE` | `/api/v1/events/:event_id/fields/:field_id` | Yes | Delete a form field |
| `PUT` | `/api/v1/events/:event_id/fields/reorder` | Yes | Reorder all form fields |

*No auth for GET because participants need to fetch the form fields to display the registration form.

**POST `/api/v1/events/:event_id/fields`**
```json
// Request
{ "label": "University", "field_type": "text", "placeholder": "Enter your university", "required": true, "order": 4 }
// Response 201
{ "id": "...", "label": "University", "field_type": "text", ... }
```

---

### Registration Routes (`/api/v1/registrations`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/registrations` | No | Register for an event (public) |
| `GET` | `/api/v1/events/:event_id/registrations` | Yes | Get all registrations for an event |
| `GET` | `/api/v1/registrations/:qr_code_id` | No | Get registration by QR code ID |

**POST `/api/v1/registrations`**
```json
// Request
{
  "event_id": "...",
  "form_data": {
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+94771234567",
    "university": "IIT"
  }
}
// Response 201
{
  "id": "...",
  "qr_code_id": "EVT-a7b3c9-REG-x1y2z3",
  "qr_code_base64": "data:image/png;base64,...",
  "event_title": "VisioNEX 2026",
  "registered_at": "2026-03-18T10:00:00"
}
```

**Duplicate Registration Check:**
Before creating, check if `{ event_id, email }` already exists. If so, return `409 Conflict` with message "You are already registered for this event".

---

### Scanner Routes (`/api/v1/scanner`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/scanner/check-in` | Yes | Mark attendance by scanning QR |
| `POST` | `/api/v1/scanner/check-out` | Yes | Mark check-out (optional feature) |
| `GET` | `/api/v1/scanner/verify/:qr_code_id` | Yes | Check registration without marking |

**POST `/api/v1/scanner/check-in`**
```json
// Request
{ "qr_code_id": "EVT-a7b3c9-REG-x1y2z3" }

// Response 200 (success — first scan)
{
  "status": "checked_in",
  "participant": { "full_name": "John Doe", "email": "john@example.com", "university": "IIT" },
  "checked_in_at": "2026-04-15T09:15:00",
  "message": "✓ John Doe — Checked In"
}

// Response 200 (already checked in — duplicate scan)
{
  "status": "already_checked_in",
  "participant": { "full_name": "John Doe", ... },
  "checked_in_at": "2026-04-15T09:15:00",
  "message": "Already checked in at 9:15 AM"
}

// Response 404 (invalid QR)
{ "status": "not_found", "message": "No registration found for this QR code" }
```

---

### Export Routes (`/api/v1/export`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/export/:event_id/csv` | Yes | Download attendance as CSV |
| `GET` | `/api/v1/export/:event_id/excel` | Yes | Download attendance as Excel |

**Query Parameters:**
- `status` — Filter: `all` | `checked_in` | `not_checked_in`
- `search` — Search by name or email

**CSV Format:**
```csv
#,Full Name,Email,Phone,University,Status,Checked In At,Registered At
1,John Doe,john@example.com,+94771234567,IIT,Checked In,2026-04-15 09:15,2026-03-18 10:00
2,Jane Smith,jane@example.com,+94777654321,UoM,Not Yet,,2026-03-19 14:30
```

**Excel (.xlsx) Format:**
Same columns as CSV but in a properly formatted Excel workbook with:
- Header row with bold formatting
- Auto-sized columns
- Sheet name = Event title
- Status column with conditional coloring (green for checked in, red for not yet)

---

### Health Route

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/health` | No | Health check + DB status |

---

## 10. Frontend Pages — Detail

### Page 1: LandingPage.tsx

**Route:** `/`

**Purpose:** First impression. Explain the platform, CTAs to sign up or explore events.

**Sections:**
1. **Nav bar:** Logo "NexAttend Events", links: Explore Events, Dashboard, Login
2. **Hero:** Bold headline, subtitle, two CTAs: "Get Started" (signup) + "Explore Events"
3. **Features:** 3 cards — Custom Forms, Instant QR Codes, One-Click Export
4. **How It Works:** 4-step visual flow
5. **Footer:** Team NexAttend branding, links

---

### Page 2: LoginPage.tsx

**Route:** `/login`

**Purpose:** Event manager login.

**Fields:** Email, Password, "Login" button, link to Register.

---

### Page 3: RegisterPage.tsx

**Route:** `/register`

**Purpose:** Event manager sign up.

**Fields:** Full Name, Email, Organization, Password, Confirm Password, "Create Account" button.

---

### Page 4: DashboardPage.tsx

**Route:** `/dashboard` (Protected)

**Purpose:** Event manager's central hub.

**Sections:**
1. **Stats row:** 4 cards — Total Events, Active Events, Total Registrations, Total Checked In
2. **My Events grid:** Event cards showing title, date, status badge, registration count, action buttons

---

### Page 5: CreateEventPage.tsx

**Route:** `/events/create` (Protected)

**Purpose:** Create a new event with custom registration form.

**Layout: Two columns**
- **Left:** Event Title, Description, Event Date, Location, Capacity, Category dropdown, Cover Image upload
- **Right:** Form Builder — list of form field cards, each with label, type, required toggle, delete button. "+ Add Field" button at bottom. Drag-to-reorder.
- **Bottom:** "Save as Draft" + "Publish Event" buttons

---

### Page 6: EditEventPage.tsx

**Route:** `/events/:id/edit` (Protected)

**Purpose:** Same as CreateEventPage but pre-populated with existing data.

---

### Page 7: EventDiscoveryPage.tsx

**Route:** `/events` (Public)

**Purpose:** Participants search for events.

**Sections:**
1. **Search bar:** Full-width, searches by event title
2. **Category filter tags:** All, Hackathon, Workshop, Conference, Seminar
3. **Event cards grid:** Cover image, title, date, location, registration progress bar, "Register Now" button

---

### Page 8: EventRegistrationPage.tsx

**Route:** `/events/:slug/register` (Public)

**Purpose:** Participant fills the custom registration form.

**Sections:**
1. **Event header:** Cover image banner, title, date, location
2. **Dynamic form:** Renders form fields from the database based on what the event manager created
3. **Submit button:** "Register"

---

### Page 9: RegistrationSuccessPage.tsx

**Route:** `/registration/success/:qr_code_id` (Public)

**Purpose:** Show QR code after successful registration.

**Sections:**
1. **Success message:** ✅ "You're Registered!"
2. **QR code display:** Large QR code rendered with `qrcode.react`
3. **Details:** Event name, participant name, registration ID
4. **Actions:** "Download QR Code" button, "Check your email" reminder

---

### Page 10: ScannerPage.tsx

**Route:** `/events/:id/scanner` (Protected)

**Purpose:** QR scanner for check-in at event entrance.

**Sections:**
1. **Event title + live counter:** "VisioNEX 2026 — Check-In Scanner" + "127 / 200 Checked In"
2. **Camera viewfinder:** Uses `html5-qrcode` to open camera and scan
3. **Last scan result card:** Green = success, Yellow = already checked in, Red = invalid
4. **Manual Check-In button:** Opens search modal to find participant by name/email
5. **Sound feedback:** Beep on successful scan (optional)

**IMPORTANT: This page MUST be mobile-optimized. It will be used on phones at the event entrance.**

---

### Page 11: AttendanceSheetPage.tsx

**Route:** `/events/:id/attendance` (Protected)

**Purpose:** View and export attendance.

**Sections:**
1. **Stats bar:** Total Registered, Checked In, Not Yet, Check-In Rate %
2. **Controls:** Search bar, Status filter (All/Checked In/Not Yet), Export CSV button, Export Excel button
3. **Data table:** #, Name, Email, Phone, University, Status badge, Check-In Time
4. **Pagination:** For large events

---

## 11. Routing Map

```tsx
// App.tsx Routes
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/events" element={<EventDiscoveryPage />} />
  <Route path="/events/:slug/register" element={<EventRegistrationPage />} />
  <Route path="/registration/success/:qrCodeId" element={<RegistrationSuccessPage />} />

  {/* Protected Routes (require login) */}
  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
  <Route path="/events/create" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
  <Route path="/events/:id/edit" element={<ProtectedRoute><EditEventPage /></ProtectedRoute>} />
  <Route path="/events/:id/scanner" element={<ProtectedRoute><ScannerPage /></ProtectedRoute>} />
  <Route path="/events/:id/attendance" element={<ProtectedRoute><AttendanceSheetPage /></ProtectedRoute>} />
</Routes>
```

---

## 12. Email Integration

### Registration Confirmation Email

**When:** Immediately after a participant registers.

**Template:** HTML email (Jinja2 template) containing:
- Event name and date
- Participant name
- QR code as embedded PNG image (generated with Python `qrcode` library)
- Registration ID
- "Present this QR code at the event entrance"

**SendGrid Setup:**
- Use the same SendGrid API key pattern as NexAttend
- Sender: `noreply@nexattend-events.com` (or your verified domain)

### QR Code Email Generation (Backend)

```python
import qrcode
import io
import base64

def generate_qr_code(data: str) -> str:
    """Generate QR code and return as base64 PNG string."""
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode("utf-8")
```

---

## 13. Environment Variables

### Backend `.env`

```env
# Database
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net
DATABASE_NAME=nexattend_events_db
MONGODB_TLS=True

# Auth
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Email
SENDGRID_API_KEY=SG.xxxxxx
SENDGRID_FROM_EMAIL=noreply@nexattend-events.com

# Server
HOST=0.0.0.0
PORT=8000
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:8000
```

---

## 14. Deployment

### Frontend → Vercel

1. Connect GitHub repo to Vercel
2. Set Root Directory: `web`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`

### vercel.json (in project root)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Backend → Render

1. Connect GitHub repo to Render
2. Set Root Directory: `backend`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables from `.env`

---

## 15. Implementation Patterns

### Backend: FastAPI Main App (app/main.py)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.mongodb import connect_db, close_db
from app.api.routes import auth, events, forms, registrations, scanner, export, health

app = FastAPI(title="NexAttend Events API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(events.router, prefix="/api/v1/events", tags=["Events"])
app.include_router(registrations.router, prefix="/api/v1/registrations", tags=["Registrations"])
app.include_router(scanner.router, prefix="/api/v1/scanner", tags=["Scanner"])
app.include_router(export.router, prefix="/api/v1/export", tags=["Export"])

@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()
```

### Frontend: API Service Pattern (services/api.ts)

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (data: { email: string; password: string }) => api.post('/auth/login', data);
export const register = (data: any) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');

// Events
export const createEvent = (data: any) => api.post('/events', data);
export const getMyEvents = () => api.get('/events');
export const getEvent = (id: string) => api.get(`/events/${id}`);
export const updateEvent = (id: string, data: any) => api.put(`/events/${id}`, data);
export const deleteEvent = (id: string) => api.delete(`/events/${id}`);
export const discoverEvents = (search?: string, category?: string) =>
  api.get('/events/public/discover', { params: { search, category } });
export const getEventBySlug = (slug: string) => api.get(`/events/public/${slug}`);

// Form Fields
export const getFormFields = (eventId: string) => api.get(`/events/${eventId}/fields`);
export const addFormField = (eventId: string, data: any) => api.post(`/events/${eventId}/fields`, data);
export const updateFormField = (eventId: string, fieldId: string, data: any) =>
  api.put(`/events/${eventId}/fields/${fieldId}`, data);
export const deleteFormField = (eventId: string, fieldId: string) =>
  api.delete(`/events/${eventId}/fields/${fieldId}`);

// Registrations
export const registerForEvent = (data: any) => api.post('/registrations', data);
export const getRegistrations = (eventId: string) => api.get(`/events/${eventId}/registrations`);

// Scanner
export const checkIn = (qrCodeId: string) => api.post('/scanner/check-in', { qr_code_id: qrCodeId });
export const verifyQR = (qrCodeId: string) => api.get(`/scanner/verify/${qrCodeId}`);

// Export
export const exportCSV = (eventId: string, status?: string) =>
  api.get(`/export/${eventId}/csv`, { params: { status }, responseType: 'blob' });
export const exportExcel = (eventId: string, status?: string) =>
  api.get(`/export/${eventId}/excel`, { params: { status }, responseType: 'blob' });

export default api;
```

### Frontend: QR Scanner Component Pattern

```tsx
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef } from 'react';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scannerRef.current.render(
      (decodedText) => onScan(decodedText),
      (errorMessage) => onError?.(errorMessage)
    );

    return () => {
      scannerRef.current?.clear();
    };
  }, []);

  return <div id="qr-reader" style={{ width: '100%' }} />;
}
```

### Backend: Export Service Pattern

```python
import csv
import io
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

async def generate_csv(registrations: list, form_fields: list) -> io.StringIO:
    """Generate CSV from registrations."""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header row from form fields
    headers = ["#"] + [f["label"] for f in form_fields] + ["Status", "Checked In At", "Registered At"]
    writer.writerow(headers)
    
    for i, reg in enumerate(registrations, 1):
        row = [i]
        for field in form_fields:
            row.append(reg.get("form_data", {}).get(field["label"].lower().replace(" ", "_"), ""))
        row.append("Checked In" if reg.get("checked_in") else "Not Yet")
        row.append(reg.get("checked_in_at", ""))
        row.append(reg.get("registered_at", ""))
        writer.writerow(row)
    
    output.seek(0)
    return output

async def generate_excel(registrations: list, form_fields: list, event_title: str) -> io.BytesIO:
    """Generate Excel from registrations."""
    wb = Workbook()
    ws = wb.active
    ws.title = event_title[:31]  # Excel sheet name limit
    
    # Header styling
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="1a1a2e", end_color="1a1a2e", fill_type="solid")
    
    headers = ["#"] + [f["label"] for f in form_fields] + ["Status", "Checked In At", "Registered At"]
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center")
    
    # Data rows
    for i, reg in enumerate(registrations, 1):
        ws.cell(row=i+1, column=1, value=i)
        for j, field in enumerate(form_fields):
            key = field["label"].lower().replace(" ", "_")
            ws.cell(row=i+1, column=j+2, value=reg.get("form_data", {}).get(key, ""))
        
        status_col = len(form_fields) + 2
        status = "Checked In" if reg.get("checked_in") else "Not Yet"
        status_cell = ws.cell(row=i+1, column=status_col, value=status)
        if reg.get("checked_in"):
            status_cell.fill = PatternFill(start_color="d4edda", end_color="d4edda", fill_type="solid")
        else:
            status_cell.fill = PatternFill(start_color="f8d7da", end_color="f8d7da", fill_type="solid")
        
        ws.cell(row=i+1, column=status_col+1, value=str(reg.get("checked_in_at", "")))
        ws.cell(row=i+1, column=status_col+2, value=str(reg.get("registered_at", "")))
    
    # Auto-size columns
    for col in ws.columns:
        max_length = max(len(str(cell.value or "")) for cell in col)
        ws.column_dimensions[col[0].column_letter].width = min(max_length + 4, 30)
    
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    return output
```

---

## 16. Key Implementation Rules

1. **QR codes contain ONLY the registration ID** — never embed personal data
2. **Always check for duplicate registrations** before creating — use `{ event_id, email }` unique index
3. **Always handle duplicate scans** — return "already checked in" with timestamp, not an error
4. **Scanner page MUST work on mobile** — test on actual phones
5. **Form fields are dynamic** — store as flexible JSON in MongoDB, not fixed columns
6. **Slugs must be unique** — generate from title, append random chars if conflict
7. **Cache registration_count and checked_in_count** on the event document — update on each registration/check-in to avoid expensive count queries
8. **Export generates files on-the-fly** — don't store files permanently, generate and stream
9. **All protected routes require Bearer token** — use the same JWT middleware pattern as NexAttend
10. **Use the same dark theme aesthetic as NexAttend** — cyan gradients, glassmorphism, Framer Motion animations

---

*This document is the single source of truth for the NexAttend Events platform. Any AI agent reading this should have complete knowledge to implement any part of the system.*
