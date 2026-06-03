# HireX — Complete Project Technical Overview & AI Context Prompt

---

## 1. Project Overview

**HireX** is an AI-powered recruitment SaaS platform that automates the full hiring lifecycle — from job creation and LinkedIn publishing, to candidate application, AI-driven CV ranking, interview scheduling with email notifications, and contract management. Built with a premium dark-mode-first glassmorphism UI.

**Branding:** "HireX — Hire Smarter with AI"

---

## 2. Features

### Core Features (Implemented)
- **Project Management** — Create, update, archive, toggle Active/Inactive status for recruitment campaigns
- **Position/Profile Management** — Define job positions within projects (title, skills, experience, education, contract type)
- **AI Job Description Generation** — Auto-generate structured job descriptions via OpenAI
- **LinkedIn OAuth Integration** — Connect LinkedIn account, auto-publish job posts with apply links
- **AI LinkedIn Post Generation** — Generate optimized job posts for LinkedIn
- **Public Application Page** — Candidates apply via `/apply/:profileId` with CV upload (PDF/DOCX/images)
- **AI CV Ranking** — Upload CV files directly to OpenAI for scoring (0-100), skill extraction, recommendation
- **Bulk AI Ranking** — Rank all unranked candidates in a project sequentially
- **CV Duplicate Detection** — SHA-256 hash-based deduplication to avoid redundant AI calls
- **Interview Scheduling** — Create interviews with candidate email invitations via SMTP
- **Interview Cancellation Emails** — Optional cancellation notification emails
- **AI Chat Assistant** — Scoped to recruitment/HR topics only
- **AI Analytics Recommendations** — Cached 24h TTL tips based on pipeline data
- **Dashboard/Workspace** — Stats overview (projects, candidates, interviews)
- **Analytics Page** — Visual recruitment pipeline analytics
- **Candidate Pipeline** — Status tracking: received → selected → validated → Declined → traited → discarded
- **User Profile Management** — Avatar upload, name, email, country editing
- **Role-Based Access** — Admin sees all projects; Recruiter sees own
- **Toast Notification System** — Premium glassmorphism toasts replacing native alerts
- **Confirm Dialog System** — Promise-based async confirmation modals via React Portals
- **Contract Management** — Track contracts with templates

### Planned Features
- Cloud storage migration
- Advanced analytics dashboard

---

## 3. Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.4 | UI framework |
| Vite | 8.0.4 | Build tool & dev server |
| React Router DOM | 7.14.0 | Client-side routing |
| Axios | 1.15.0 | HTTP client |
| Tailwind CSS | 4.2.2 | Utility-first CSS |
| Lucide React | 1.8.0 | Icon library |
| React Icons | 5.6.0 | Additional icons |
| OGL | 1.0.11 | WebGL background effects |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js + Express | 5.2.1 | REST API server |
| Sequelize | 6.37.8 | ORM for MySQL |
| MySQL2 | 3.22.0 | Database driver |
| JSON Web Token | 9.0.3 | Authentication |
| Bcrypt | 6.0.0 | Password hashing |
| Multer | 2.1.1 | File upload handling |
| Nodemailer | 8.0.7 | SMTP email sending |
| OpenAI SDK | 6.35.0 | AI integration |
| Axios | 1.16.0 | LinkedIn API calls |
| UUID | 14.0.0 | Unique token generation |
| Nodemon | 3.1.14 | Dev auto-reload |
| Sequelize CLI | 6.6.5 | DB migrations |

### Database
- **MySQL** (local, database name: `Hirex`)
- **ORM:** Sequelize with auto-sync (`sequelize.sync()`)

---

## 4. Frontend Details

### State Management
- **React Context API** — 3 contexts:
  - `AuthContext` — user state, login/signup/logout, profile updates, JWT token in localStorage
  - `ToastContext` — global toast notification system with deduplication
  - `ThemeContext` — dark/light mode toggle

### Routing (React Router v7)

**Public Routes:**
| Route | Component | Description |
|---|---|---|
| `/login` | Login | Auth page (login + signup) |
| `/apply/:profileId` | PublicApply | Public candidate application form |
| `/change-password` | ChangePassword | Password change page |
| `/unauthorized` | Unauthorized | 403 page |

**Protected Routes (inside AppLayout):**
| Route | Component | Description |
|---|---|---|
| `/workspace` | Workspace | Main dashboard |
| `/analytics` | Analytics | Pipeline analytics |
| `/ai-assistant` | AIAssistant | AI chat interface |
| `/projects` | ProjectsList | All projects |
| `/candidates` | AllCandidates | All candidates across projects |
| `/positions` | AllPositions | All positions across projects |
| `/interviews` | InterviewsHub | All interviews |
| `/posts` | PostCreator | LinkedIn post creator |
| `/profile` | Profile | User profile editor |
| `/settings` | Settings | LinkedIn OAuth + app settings |
| `/projects/:projectId/candidates` | Candidates | Project pipeline (candidates) |
| `/projects/:projectId/publication` | PostCreator | Project job publishing |
| `/projects/:projectId/interviews` | Interviews | Project interviews |
| `/projects/:projectId/contracts` | Contracts | Project contracts |
| `/users` | Users | Admin user management |

### Frontend API Layer (`src/api/index.js`)
- Centralized Axios instance with base URL `/api`
- Auto-attaches JWT Bearer token via request interceptor
- Global 401 handler: clears localStorage, redirects to `/login`
- Organized API modules: `projectsApi`, `profilesApi`, `candidatesApi`, `meetingsApi`, `aiApi`, `linkedinApi`

### Component Library (`src/components/ui/`)
| Component | Purpose |
|---|---|
| Avatar | User avatar display |
| Button | Styled button component |
| Card | Content card wrapper |
| ConfirmDialog | Promise-based confirmation modal (React Portal) |
| Dropdown | Dropdown menu |
| EmailPreview | Interview email preview |
| EmptyState | Empty data placeholder |
| Input | Styled form input |
| LoadingSpinner | Loading indicator |
| Modal | Generic modal dialog |
| ProgressRing | Circular progress indicator |
| StatusBadge | Candidate status badges |
| Toast | Toast notification item |

### Layout Components
- `AppLayout` — Main app shell with sidebar
- `Sidebar` — Navigation sidebar
- `Background` — WebGL animated background (OGL)
- `Surface` — Glass-morphism surface component

### Design System
- Dark-mode-first with glassmorphism aesthetic
- Premium SaaS-grade UI (inspired by Linear, Stripe)
- Custom CSS in `index.css` (24KB+ design tokens)
- Google Fonts integration
- Micro-animations and hover effects
- Primary color: `#5523e9` (purple)

---

## 5. Backend Details

### Architecture: MVC + Services

```
Backend/
├── Connection.js          # Express server entry point
├── config/config.json     # Sequelize DB config
├── controllers/           # Request handlers (7 controllers)
│   ├── aiController.js
│   ├── authController.js
│   ├── candidateController.js
│   ├── linkedinController.js
│   ├── meetingController.js
│   ├── profileController.js
│   └── projectController.js
├── middleware/             # Express middleware (3 files)
│   ├── auth.js            # JWT authentication + role authorization
│   ├── upload.js          # Multer file upload (10MB max)
│   └── validate.js        # Generic request validation factory
├── models/                # Sequelize models (22 files)
├── routes/                # Express route definitions (7 files)
├── services/              # Business logic services (3 files)
│   ├── aiService.js       # OpenAI API wrapper
│   ├── emailService.js    # Nodemailer SMTP service
│   └── linkedinService.js # LinkedIn REST API service
├── migrations/            # Sequelize migrations
├── seeders/               # Sequelize seeders
├── uploads/               # CV file storage (local disk)
├── sync.js                # Force DB sync utility
├── login.js               # Legacy login (deprecated)
└── fix-indexes.js         # DB index repair utility
```

### Server Configuration
- Port: `3000` (configurable via `PORT` env)
- CORS: allows `FRONTEND_URL` (default `http://localhost:5173`)
- Body parser: JSON limit `10mb`
- Static file serving: `/uploads` directory
- Global error handler with Multer error detection
- Vite dev proxy: `/api` → `http://localhost:3000`

---

## 6. APIs & Services

### REST API Endpoints

**Auth (`/api/auth`)**
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/login` | No | Login with email/password |
| POST | `/signup` | No | Register new account |
| PUT | `/profile` | Yes | Update user profile |

**Projects (`/api/projects`)**
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | List projects (filtered by role) |
| GET | `/stats` | Yes | Dashboard statistics |
| GET | `/:id` | Yes | Get project with profiles/candidates |
| POST | `/` | Yes | Create project |
| PUT | `/:id` | Yes | Update project |
| PATCH | `/:id/toggle-status` | Yes | Toggle Active/Inactive |
| DELETE | `/:id` | Yes | Archive project (soft delete) |

**Profiles/Positions (`/api/profiles`)**
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/project/:projectId` | Yes | List positions for project |
| GET | `/:id` | Yes | Get position details |
| POST | `/project/:projectId` | Yes | Create position (auto-creates JobOffer) |
| PUT | `/:id` | Yes | Update position |
| DELETE | `/:id` | Yes | Delete position |

**Candidates (`/api/candidates`)**
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/apply/:profileId` | **No** | Public candidate application + CV upload |
| POST | `/upload/:token` | **No** | CV upload via generated link |
| POST | `/profile/:profileId/generate-link` | Yes | Generate unique upload link |
| GET | `/profile/:profileId` | Yes | List candidates for position |
| GET | `/project/:projectId` | Yes | List candidates for project |
| GET | `/:id` | Yes | Get candidate details |
| GET | `/:id/cv/download` | Yes | Download candidate CV |
| PATCH | `/:id/status` | Yes | Update candidate status |
| DELETE | `/:id` | Yes | Delete candidate + CV file |

**Meetings/Interviews (`/api/meetings`)**
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/all` | Yes | List all meetings |
| GET | `/candidate/:candidateId` | Yes | Meetings for candidate |
| GET | `/project/:projectId` | Yes | Meetings for project |
| POST | `/` | Yes | Schedule interview + send email |
| PUT | `/:id` | Yes | Update interview |
| PATCH | `/:id/cancel` | Yes | Cancel interview (optional email) |
| DELETE | `/:id` | Yes | Delete interview (optional email) |

**AI (`/api/ai`)**
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/rank-cv/:candidateId` | Yes | AI rank single candidate CV |
| POST | `/rank-all/:projectId` | Yes | AI rank all unranked in project |
| POST | `/generate-description` | Yes | Generate job description |
| POST | `/recommendations` | Yes | AI analytics tips (cached 24h) |
| POST | `/generate-post` | Yes | Generate LinkedIn post text |
| POST | `/chat` | Yes | AI chat assistant |

**LinkedIn (`/api/linkedin`)**
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/auth-url` | Yes | Get OAuth authorization URL |
| GET | `/callback` | **No** | OAuth redirect handler |
| GET | `/status` | Yes | Check connection status |
| POST | `/publish` | Yes | Publish post to LinkedIn |
| DELETE | `/disconnect` | Yes | Remove LinkedIn connection |

### External APIs Used
1. **OpenAI API** (`gpt-4o-mini`) — CV ranking, job descriptions, recommendations, post generation, chat
2. **LinkedIn REST API** (`v202604`) — OAuth 2.0, profile info, post publishing
3. **LinkedIn OIDC** — User profile via `/v2/userinfo`
4. **Gmail SMTP** — Interview invitation and cancellation emails

---

## 7. Database

### MySQL Schema (22 Sequelize Models)

**Core Entities:**
| Model | Table | Description |
|---|---|---|
| `users` | `users` | Recruiters/Admins |
| `project` | `projects` | Recruitment campaigns |
| `profile` | `profiles` | Job positions within projects |
| `candidate` | `candidate` | Applicants with CV, AI scores |
| `meeting` | `meeting` | Interview schedules |
| `feedback` | `feedback` | Interview feedback |
| `contract` | `contract` | Employment contracts |

**Supporting Entities:**
| Model | Table | Description |
|---|---|---|
| `JobOffer` | `job_offers` | Auto-created per profile |
| `JobPosting` | `job_postings` | Platform-specific postings |
| `skill` | `skills` | Skill definitions |
| `profile_skill` | `profile_skills` | N-N join (profile↔skill) |
| `user_project` | `user_projects` | N-N join (user↔project) |
| `template` | `templates` | Contract templates |
| `templatefield` | `templatefields` | Template fields |
| `ai_analysis` | `ai_analyses` | AI analysis records |
| `ai_recommendation_cache` | `ai_recommendation_cache` | Cached AI recommendations (24h TTL) |
| `linkedin_token` | `linkedin_tokens` | OAuth tokens per user |
| `applications` | `applications` | Legacy application records |

### Key Relationships
```
User 1──N Project (owner)
User N──N Project (via user_project)
Project 1──N Profile (positions)
Profile 1──N Candidate
Profile N──N Skill (via profile_skill)
Profile 1──1 JobOffer
JobOffer 1──N JobPosting
Candidate 1──N Meeting
Candidate 1──N AiAnalysis
Meeting 1──1 Feedback
Meeting N──1 User (interviewer)
User 1──1 LinkedInToken
User 1──N AiRecommendationCache
Candidate 1──N Contract
Contract N──1 Template
Template 1──N TemplateField
```

---

## 8. Authentication

- **Method:** JWT (JSON Web Tokens)
- **Token Expiry:** 24 hours
- **Token Payload:** `{ id, email, role }`
- **Password Hashing:** bcrypt (salt rounds: 10)
- **Legacy Support:** Falls back to plain-text password comparison for old accounts
- **Storage:** Token + user object stored in `localStorage`
- **Middleware:** `authenticate` verifies Bearer token; `authorize(...roles)` checks role
- **Roles:** `Admin`, `Recruiter` (default on signup)
- **Features:** `must_change_password` flag for forced password reset

---

## 9. AI Systems

### OpenAI Integration (via `aiService.js`)
- **Model:** `gpt-4o-mini` (configurable via `OPENAI_MODEL` env)
- **Temperature:** 0.4-0.5

### AI Features

**1. CV Ranking (`rankCVWithFile`)**
- Sends CV file directly to OpenAI (PDF native, images as base64, text fallback)
- Returns: score (0-100), matchPercent, name, email, skills, recommendation (hire/consider/pass), strengths, weaknesses, seniority level
- Anti-duplicate: SHA-256 hash check, cached forever after first ranking
- Version tracking for cache invalidation

**2. Job Description Generation (`generateJobDescription`)**
- Input: title, skills, location, experience, contract type
- Output: structured JSON (title, summary, responsibilities, requirements, benefits, fullDescription)

**3. Analytics Recommendations (`generateRecommendations`)**
- Input: pipeline stats (candidates, positions, projects, screened, interviewed, hired)
- Output: 3 recruitment tips with priority and category
- Cached: SHA-256 data fingerprint + 24h TTL, max 5 cache entries per user

**4. LinkedIn Post Generation (`generatePost`)**
- Input: position title, skills, location, contract type
- Output: LinkedIn-ready post text (<800 chars)

**5. AI Chat Assistant (`chat`)**
- Strictly scoped to recruitment/HR/HireX topics
- Rejects off-topic queries
- Context: last 6 messages
- Max tokens: 400

### AI Prompts (All English)

**System Prompt (Core):**
> "You are a concise recruitment AI. Return minimal, compact JSON. No extra whitespace."

**Chat System Prompt:**
> "You are the HireX AI assistant — strictly limited to recruitment, HR, and HireX platform features. SCOPE: recruitment, candidates, CV analysis, hiring, interviews, HR analytics, job positions, dashboard help, application features. RULES: NEVER answer topics outside scope. If off-topic, reply ONLY: 'I'm specialized only in HireX recruitment features and HR-related assistance.' Keep answers short, professional, helpful. Use markdown bold for key terms. Max 3-4 sentences unless detail is requested."

---

## 10. Important Flows

### Recruiter Flow
1. Login/Register → JWT issued
2. Create Project → Create Position(s) within it
3. AI generates job description for position
4. Generate LinkedIn post via AI → Publish to LinkedIn (OAuth)
5. Candidates apply via public `/apply/:profileId` link
6. AI ranks CVs (single or bulk) → scores 0-100
7. Review candidates → update status pipeline
8. Schedule interviews → automatic email invitation
9. Cancel/delete interviews → optional cancellation email
10. Manage contracts

### Candidate Flow
1. See job post on LinkedIn
2. Click "Apply Now" → redirected to HireX `/apply/:profileId`
3. Fill application form + upload CV (PDF/DOCX/image)
4. Application stored with status "received"

### LinkedIn OAuth Flow
1. Recruiter clicks "Connect LinkedIn" in Settings
2. Backend generates auth URL with state (userId + nonce, base64)
3. User authorizes on LinkedIn
4. LinkedIn redirects to `/api/linkedin/callback` with code
5. Backend exchanges code for access token
6. Fetches profile via OIDC userinfo endpoint
7. Stores token + person URN in `linkedin_tokens`
8. Redirects to `/settings?linkedin=success`

### AI CV Ranking Flow
1. Check if candidate already ranked (cache check)
2. Check for duplicate CV hash across same profile
3. Read CV file from disk → send to OpenAI
4. Parse JSON response → save score + extracted data to candidate record
5. Cache full AI response in `ai_response_cache` column

---

## 11. Folder Structure

```
HireX/
├── src/                          # Frontend (React + Vite)
│   ├── App.jsx                   # Main app with routing
│   ├── main.jsx                  # React entry point
│   ├── index.css                 # Global styles + design tokens (24KB)
│   ├── api/index.js              # Centralized API client
│   ├── contexts/                 # React Context providers
│   │   ├── AuthContext.jsx
│   │   ├── ToastContext.jsx
│   │   └── ThemeContext.jsx
│   ├── components/
│   │   ├── Background.jsx        # WebGL animated background
│   │   ├── Surface.jsx           # Glassmorphism surface
│   │   ├── Layout/
│   │   │   ├── AppLayout.jsx     # Main app shell
│   │   │   └── Sidebar.jsx       # Navigation sidebar
│   │   └── ui/                   # 13 reusable UI components
│   ├── Screens/
│   │   ├── Workspace.jsx         # Dashboard
│   │   ├── Analytics.jsx         # Analytics page
│   │   ├── AIAssistant.jsx       # AI chat
│   │   ├── AllCandidates.jsx     # Global candidates view
│   │   ├── AllPositions.jsx      # Global positions view
│   │   ├── InterviewsHub.jsx     # Global interviews view
│   │   ├── PostCreator.jsx       # LinkedIn post editor
│   │   ├── Profile.jsx           # User profile
│   │   ├── Login.jsx             # Auth page
│   │   ├── Projects/ProjectsList.jsx
│   │   ├── Pipeline/
│   │   │   ├── Candidates.jsx    # Project candidate pipeline (45KB)
│   │   │   ├── Interviews.jsx    # Project interviews
│   │   │   ├── Contracts.jsx     # Project contracts
│   │   │   └── JobPosting.jsx    # Job posting management
│   │   ├── Settings/Settings.jsx # LinkedIn OAuth settings
│   │   ├── Apply/PublicApply.jsx # Public application form
│   │   ├── Auth/
│   │   │   ├── ChangePassword.jsx
│   │   │   └── Unauthorized.jsx
│   │   └── Admin/Users.jsx       # Admin user management
│   ├── Fonts/                    # Custom fonts
│   └── Images/                   # Static images
├── Backend/                      # Backend (Node.js + Express)
│   ├── Connection.js             # Server entry point
│   ├── config/config.json        # DB configuration
│   ├── controllers/              # 7 controllers
│   ├── middleware/               # auth, upload, validate
│   ├── models/                   # 22 Sequelize models
│   ├── routes/                   # 7 route files
│   ├── services/                 # AI, Email, LinkedIn services
│   ├── uploads/                  # CV file storage
│   ├── migrations/
│   ├── seeders/
│   ├── sync.js                   # DB force sync
│   └── .env                      # Environment variables
├── Ai/                           # AI module (empty, logic in Backend)
├── Guide/                        # Documentation
├── index.html                    # Vite entry HTML
├── vite.config.js                # Vite + Tailwind + proxy config
├── package.json                  # Frontend dependencies
└── README.md                     # Project documentation
```

---

## 12. Environment Variables

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | Backend server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_SECRET` | JWT signing secret | hardcoded fallback |
| `FRONTEND_URL` | CORS origin + email links | `http://localhost:5173` |
| `OPENAI_API_KEY` | OpenAI API authentication | required |
| `OPENAI_MODEL` | AI model selection | `gpt-4o-mini` |
| `LINKEDIN_CLIENT_ID` | LinkedIn OAuth app ID | required for LinkedIn |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth app secret | required for LinkedIn |
| `LINKEDIN_REDIRECT_URI` | LinkedIn OAuth callback URL | `http://localhost:5173/settings` |
| `SMTP_HOST` | Email server host | `smtp.gmail.com` |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Email sender address | required for emails |
| `SMTP_PASS` | Email sender password/app key | required for emails |
| `GEMINI_API_KEY` | Google Gemini (reserved) | unused |
| `GROK_API_KEY` | Grok AI (reserved) | unused |

---

## 13. Dependencies Analysis

### Frontend (10 deps + 6 devDeps)
- **Core:** React 19, React DOM 19, React Router DOM 7
- **HTTP:** Axios 1.15
- **Styling:** Tailwind CSS 4.2 + Vite plugin
- **Icons:** Lucide React, React Icons
- **3D:** OGL (WebGL backgrounds)
- **Build:** Vite 8, ESLint 9, @vitejs/plugin-react 6

### Backend (12 deps + 2 devDeps)
- **Server:** Express 5.2
- **Database:** Sequelize 6.37, MySQL2 3.22
- **Auth:** bcrypt 6, jsonwebtoken 9
- **AI:** OpenAI SDK 6.35
- **Files:** Multer 2.1
- **Email:** Nodemailer 8
- **HTTP:** Axios 1.16
- **Utils:** dotenv 17, uuid 14, cors 2.8
- **Dev:** Nodemon 3.1, Sequelize CLI 6.6

---

## 14. Architecture Notes

- **Monorepo structure** — Frontend and Backend in same repository
- **API Proxy** — Vite proxies `/api` to Express backend in development
- **File-first AI** — CVs sent directly to OpenAI (no local PDF parsing)
- **Aggressive caching** — CV rankings cached forever (per-candidate `ai_response_cache`), recommendations cached 24h with SHA-256 fingerprint
- **Soft deletes** — Projects use `is_archived` flag instead of hard delete
- **Auto-sync DB** — Sequelize `sync()` on server start (development mode)
- **Legacy code** — `login.js` contains old raw SQL auth (deprecated, replaced by `authController.js`)
- **No test suite** — No unit or integration tests currently

---

## 15. Security Notes

- ✅ JWT-based authentication with 24h expiry
- ✅ bcrypt password hashing (salt rounds: 10)
- ✅ Role-based authorization (Admin/Recruiter)
- ✅ CORS restricted to frontend URL
- ✅ File upload validation (type + 10MB size limit)
- ✅ Input sanitization (email normalization, trimming)
- ✅ Duplicate application prevention
- ✅ LinkedIn OAuth state parameter with user ID + nonce
- ⚠️ Legacy plain-text password fallback still active
- ⚠️ JWT secret has hardcoded fallback value
- ⚠️ No rate limiting on API endpoints
- ⚠️ No CSRF protection
- ⚠️ CV files stored on local disk (not encrypted)
- ⚠️ No input sanitization for XSS in some fields

---

## 16. Full AI Context Prompt

```
You are an AI assistant helping develop HireX, an AI-powered recruitment SaaS platform.

=== WHAT THE APP DOES ===
HireX automates the full hiring pipeline: recruiters create projects and positions,
AI generates job descriptions, posts are published to LinkedIn via OAuth, candidates
apply through public forms with CV uploads, AI (OpenAI gpt-4o-mini) ranks CVs with
scores 0-100, interviews are scheduled with automatic email invitations, and candidates
progress through a status pipeline (received→selected→validated→hired/declined).

=== TECH STACK ===
Frontend: React 19 + Vite 8 + Tailwind CSS 4 + React Router 7 + Axios + Lucide Icons
Backend: Node.js + Express 5 + Sequelize 6 ORM + MySQL
AI: OpenAI SDK (gpt-4o-mini) for CV ranking, job descriptions, chat, recommendations
Auth: JWT (24h) + bcrypt + role-based (Admin/Recruiter)
Email: Nodemailer + Gmail SMTP
LinkedIn: OAuth 2.0 + REST API v202604
Files: Multer (local disk, 10MB max)
Build: Vite with API proxy to Express

=== ARCHITECTURE ===
Monorepo: /src (React frontend) + /Backend (Express API)
Pattern: MVC + Services (controllers → services → models)
State: React Context (Auth, Toast, Theme)
API: Centralized Axios client with JWT interceptors
DB: 22 Sequelize models with extensive associations
Caching: AI results cached in DB (CV rankings forever, recommendations 24h TTL)

=== KEY CONVENTIONS ===
- Frontend components in /src/Screens (pages) and /src/components (reusable)
- Backend follows controller→service→model pattern
- All API routes prefixed with /api
- Public routes: /apply/:profileId, /api/candidates/apply, /api/linkedin/callback
- Auth middleware: authenticate (JWT verify) + authorize (role check)
- File naming: PascalCase for React components, camelCase for backend
- Models use Sequelize define() pattern with explicit associations in models/index.js
- Dark-mode-first UI with glassmorphism, purple primary (#5523e9)
- Toast notifications instead of native alert/confirm
- ConfirmDialog uses React Portals for proper z-index layering

=== IMPORTANT WORKFLOWS ===
1. CV Ranking: candidate → check cache → check hash duplicate → upload file to OpenAI → parse score → save to DB
2. LinkedIn: auth URL → OAuth consent → callback with code → exchange token → save to DB → publish posts
3. Interviews: create meeting → send SMTP email invitation → track status (Created/Cancelled/Updated)
4. Projects: Active/Inactive status gates position creation and candidate applications

=== GOALS ===
Build a production-ready, premium SaaS recruitment platform that combines AI automation,
LinkedIn integration, and modern UX to help companies hire smarter and faster.
The platform should feel world-class with premium dark-mode aesthetics.
```

---

*Generated automatically by deep codebase analysis on 2026-05-09.*
