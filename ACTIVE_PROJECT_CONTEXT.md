# HireX — Active Runtime Project Context

> **Purpose:** This document describes ONLY the actively used, runtime-connected parts of the HireX codebase. Dead code, unused files, orphan components, and legacy modules are excluded. Another AI agent can use this to fully understand and continue development instantly.

---

## 1. Project Overview

**HireX** is an AI-powered recruitment SaaS platform automating the full hiring lifecycle: project/position creation → AI job description generation → LinkedIn publishing → candidate application with CV upload → AI-powered CV ranking → interview scheduling with email notifications → candidate pipeline management.

**Stack:** React 19 + Vite 8 (frontend) ↔ Express 5 + Sequelize + MySQL (backend) ↔ OpenAI API (AI) ↔ LinkedIn REST API (publishing) ↔ Gmail SMTP (emails)

---

## 2. Active Features

| Feature | Status | Key Files |
|---|---|---|
| JWT Authentication (login/signup) | ✅ Active | `authController.js`, `AuthContext.jsx`, `Login.jsx` |
| Project CRUD + Active/Inactive toggle | ✅ Active | `projectController.js`, `ProjectsList.jsx` |
| Position/Profile CRUD per project | ✅ Active | `profileController.js`, `AllPositions.jsx` |
| AI Job Description Generation | ✅ Active | `aiService.js`, `aiController.js` |
| LinkedIn OAuth 2.0 Connection | ✅ Active | `linkedinService.js`, `linkedinController.js`, `Settings.jsx` |
| AI LinkedIn Post Generation | ✅ Active | `aiService.js`, `PostCreator.jsx` |
| LinkedIn Post Publishing | ✅ Active | `linkedinService.js`, `PostCreator.jsx` |
| Public Candidate Application + CV Upload | ✅ Active | `candidateController.js`, `PublicApply.jsx` |
| AI CV Ranking (file-first, cached) | ✅ Active | `aiService.js`, `aiController.js`, `Candidates.jsx` |
| Bulk AI Ranking (all candidates in project) | ✅ Active | `aiController.js` |
| CV Duplicate Detection (SHA-256) | ✅ Active | `aiController.js`, `candidate.model.js` |
| Candidate Pipeline (status management) | ✅ Active | `candidateController.js`, `Candidates.jsx` |
| Interview Scheduling + Email Invitations | ✅ Active | `meetingController.js`, `emailService.js`, `Interviews.jsx` |
| Interview Cancel/Delete + Email | ✅ Active | `meetingController.js`, `InterviewsHub.jsx` |
| AI Chat Assistant (HR-scoped) | ✅ Active | `aiService.js`, `AIAssistant.jsx` |
| AI Analytics Recommendations (cached 24h) | ✅ Active | `aiController.js`, `Analytics.jsx` |
| Dashboard/Workspace Stats | ✅ Active | `projectController.js`, `Workspace.jsx` |
| User Profile Management | ✅ Active | `authController.js`, `Profile.jsx` |
| Toast Notification System | ✅ Active | `ToastContext.jsx`, used in 10 screens |
| Confirm Dialog (React Portal) | ✅ Active | `ConfirmDialog.jsx`, used in 7 screens |
| Dark/Light Theme Toggle | ✅ Active | `ThemeContext.jsx`, used in `Settings`, `Login`, `AppLayout` |
| Contract-Ready Candidates View | ✅ Active | `Contracts.jsx` (uses `candidatesApi`) |
| Admin Users Page | ✅ Stub | `Users.jsx` (placeholder, no backend API) |

---

## 3. Dead Code Identified (Excluded)

| File/Directory | Reason |
|---|---|
| `Backend/login.js` | Legacy raw-SQL auth, NOT imported by `Connection.js` |
| `Backend/fix-indexes.js` | Standalone utility script, not part of runtime |
| `Backend/sync.js` | Standalone DB force-sync script, not part of server |
| `Backend/models/init-models.js` | Explicitly excluded in `models/index.js` |
| `Backend/models/applications.js` | Loaded by Sequelize auto-discovery but no controller uses it |
| `Backend/models/SequelizeMeta.js` | Migration tracking only |
| `Backend/models/template.js` | No controller references this model |
| `Backend/models/templatefield.js` | No controller references this model |
| `Backend/models/contract.js` | No controller references this model |
| `Backend/models/question.js` | No controller references this model |
| `src/Screens/Pipeline/JobPosting.jsx` | Defined but NOT imported by `App.jsx` (orphan) |
| `src/components/ui/Toast.jsx` | Has duplicate `useToast` export; app uses `ToastContext.jsx` instead |
| `Ai/` directory | Empty |
| `src/theme/` directory | Empty |
| `Guide/` directory | Documentation only |

---

## 4. Runtime Architecture

### Execution Flow
```
index.html → src/main.jsx → ThemeProvider → ToastProvider → App.jsx
                                                              ├── AuthProvider (wraps all routes)
                                                              ├── BrowserRouter
                                                              │   ├── Public: /login, /apply/:profileId, /change-password
                                                              │   └── Protected: AppLayout (Sidebar + Outlet)
                                                              │       ├── /workspace (Dashboard)
                                                              │       ├── /projects, /candidates, /positions, /interviews
                                                              │       ├── /ai-assistant, /analytics, /posts
                                                              │       ├── /profile, /settings, /users
                                                              │       └── /projects/:id/(candidates|interviews|contracts|publication)
                                                              └── API calls → /api/* → Vite proxy → Express backend
```

### Backend Execution Flow
```
Connection.js (Express entry)
├── CORS + JSON + static /uploads
├── /api/auth → authRoutes → authController
├── /api/projects → projectRoutes → projectController
├── /api/profiles → profileRoutes → profileController
├── /api/candidates → candidateRoutes → candidateController
├── /api/meetings → meetingRoutes → meetingController
├── /api/ai → aiRoutes → aiController → aiService → OpenAI API
├── /api/linkedin → linkedinRoutes → linkedinController → linkedinService → LinkedIn API
└── sequelize.sync() → MySQL
```

---

## 5. Active Tech Stack

### Frontend (Runtime)
| Tech | Version | Usage |
|---|---|---|
| React | 19.2.4 | UI framework |
| React DOM | 19.2.4 | DOM rendering |
| React Router DOM | 7.14.0 | Client-side routing (19 routes) |
| Vite | 8.0.4 | Dev server + build + API proxy |
| Tailwind CSS | 4.2.2 | Utility CSS (via Vite plugin) |
| Axios | 1.15.0 | HTTP client (centralized in `src/api/index.js`) |
| Lucide React | 1.8.0 | Primary icon library |
| React Icons | 5.6.0 | Secondary icons |
| OGL | 1.0.11 | WebGL animated background (`Background.jsx`) |

### Backend (Runtime)
| Tech | Version | Usage |
|---|---|---|
| Express | 5.2.1 | HTTP server (7 route groups) |
| Sequelize | 6.37.8 | ORM (17 active models) |
| MySQL2 | 3.22.0 | Database driver |
| jsonwebtoken | 9.0.3 | JWT auth (24h expiry) |
| bcrypt | 6.0.0 | Password hashing |
| Multer | 2.1.1 | CV/avatar file uploads (disk, 10MB) |
| OpenAI SDK | 6.35.0 | AI integration (gpt-4o-mini) |
| Nodemailer | 8.0.7 | Interview emails (Gmail SMTP) |
| Axios | 1.16.0 | LinkedIn API calls |
| dotenv | 17.4.2 | Environment variables |
| cors | 2.8.6 | CORS middleware |
| uuid | 14.0.0 | Candidate upload tokens |
| crypto | built-in | SHA-256 hashing (CV dedup, OAuth state, AI cache) |

---

## 6. Active API Endpoints

### Auth (`/api/auth`) — `authController.js`
| Method | Route | Auth | Action |
|---|---|---|---|
| POST | `/login` | ✗ | Email/password login → JWT |
| POST | `/signup` | ✗ | Register (default role: Recruiter) → JWT |
| PUT | `/profile` | ✓ | Update user profile + avatar upload |

### Projects (`/api/projects`) — `projectController.js`
| Method | Route | Auth | Action |
|---|---|---|---|
| GET | `/` | ✓ | List projects (Admin=all, Recruiter=own) |
| GET | `/stats` | ✓ | Dashboard stats |
| GET | `/:id` | ✓ | Project + profiles + candidates + job postings |
| POST | `/` | ✓ | Create project |
| PUT | `/:id` | ✓ | Update project |
| PATCH | `/:id/toggle-status` | ✓ | Toggle Active↔Inactive |
| DELETE | `/:id` | ✓ | Soft archive (`is_archived=true`) |

### Profiles (`/api/profiles`) — `profileController.js`
| Method | Route | Auth | Action |
|---|---|---|---|
| GET | `/project/:projectId` | ✓ | List positions + candidates + skills + job offers |
| GET | `/:id` | ✓ | Position detail |
| POST | `/project/:projectId` | ✓ | Create position (auto-creates JobOffer, blocks if Inactive) |
| PUT | `/:id` | ✓ | Update position + skills |
| DELETE | `/:id` | ✓ | Delete position + skill associations |

### Candidates (`/api/candidates`) — `candidateController.js`
| Method | Route | Auth | Action |
|---|---|---|---|
| POST | `/apply/:profileId` | ✗ | **Public** — Apply + CV upload |
| POST | `/upload/:token` | ✗ | **Public** — CV upload via generated link |
| POST | `/profile/:profileId/generate-link` | ✓ | Generate unique upload link |
| GET | `/profile/:profileId` | ✓ | List (filterable: status, search, sortBy) |
| GET | `/project/:projectId` | ✓ | List all across project profiles |
| GET | `/:id` | ✓ | Candidate + profile + project + meetings + AI analyses |
| GET | `/:id/cv/download` | ✓ | Download CV file |
| PATCH | `/:id/status` | ✓ | Update status (received→selected→validated→Declined→traited→discarded) |
| DELETE | `/:id` | ✓ | Delete candidate + CV file |

### Meetings (`/api/meetings`) — `meetingController.js`
| Method | Route | Auth | Action |
|---|---|---|---|
| GET | `/all` | ✓ | All meetings + candidate + user + feedback |
| GET | `/candidate/:candidateId` | ✓ | Meetings for candidate |
| GET | `/project/:projectId` | ✓ | Meetings for project (via profile→candidate chain) |
| POST | `/` | ✓ | Create interview + send email invitation |
| PUT | `/:id` | ✓ | Update interview |
| PATCH | `/:id/cancel` | ✓ | Cancel + optional cancellation email |
| DELETE | `/:id` | ✓ | Delete + cleanup feedback + optional email |

### AI (`/api/ai`) — `aiController.js`
| Method | Route | Auth | Action |
|---|---|---|---|
| POST | `/rank-cv/:candidateId` | ✓ | Rank single CV (cached, dedup, `?force=true` override) |
| POST | `/rank-all/:projectId` | ✓ | Rank all unranked in project (sequential) |
| POST | `/generate-description` | ✓ | AI job description from title+skills |
| POST | `/recommendations` | ✓ | AI analytics tips (cached 24h, `?force=true` override) |
| POST | `/generate-post` | ✓ | AI LinkedIn post text |
| POST | `/chat` | ✓ | AI chat (HR-scoped, last 6 messages) |

### LinkedIn (`/api/linkedin`) — `linkedinController.js`
| Method | Route | Auth | Action |
|---|---|---|---|
| GET | `/auth-url` | ✓ | Generate OAuth URL (state = base64 userId+nonce) |
| GET | `/callback` | ✗ | **Public** — OAuth redirect handler → token exchange |
| GET | `/status` | ✓ | Connection status + lazy profile fetch |
| POST | `/publish` | ✓ | Publish post to LinkedIn feed |
| DELETE | `/disconnect` | ✓ | Remove LinkedIn token |

---

## 7. Active Database Schema

### MySQL (`Hirex` database) — 17 Active Models

**Core:**
| Model | Table | Key Fields |
|---|---|---|
| `users` | `users` | id, firstName, lastName, email, password, role, status, avatar, country, must_change_password |
| `project` | `projects` | id, title, description, department, fk_user, status (Active/Inactive), is_archived, startDate, endDate |
| `profile` | `profiles` | id, fk_project, title, description, location, yearsOfExperience, technicalSkills, softSkills, education, typeContract |
| `candidate` | `candidate` | id, fk_profile, name, email, phone, cv_s3_path, cv_hash, status, score_value, is_ranked, ai_response_cache, ranking_version, upload_token |
| `meeting` | `meeting` | id, fk_candidate, fk_user, type, subject, content, start_date, end_date, status, platform, link |
| `feedback` | `feedback` | id, fk_meeting, fk_user, comments |

**Supporting:**
| Model | Table | Purpose |
|---|---|---|
| `JobOffer` | `job_offers` | Auto-created per profile (1:1) |
| `JobPosting` | `job_postings` | Platform-specific postings per offer |
| `skill` | `skills` | Skill definitions |
| `profile_skill` | `profile_skills` | N:N join (profile↔skill with importance) |
| `user_project` | `user_projects` | N:N join (user↔project) |
| `ai_analysis` | `ai_analyses` | AI analysis records per candidate |
| `ai_recommendation_cache` | `ai_recommendation_cache` | Cached recommendations (24h TTL, SHA-256 fingerprint) |
| `linkedin_token` | `linkedin_tokens` | OAuth tokens per user (1:1) |

### Key Relationships
```
User 1──N Project (owner via fk_user)
User N──N Project (via user_project)
Project 1──N Profile
Profile 1──N Candidate
Profile N──N Skill (via profile_skill)
Profile 1──1 JobOffer 1──N JobPosting
Candidate 1──N Meeting N──1 User
Candidate 1──N AiAnalysis
Meeting 1──1 Feedback
User 1──1 LinkedInToken
User 1──N AiRecommendationCache
```

---

## 8. Authentication Flow

1. **Login:** `POST /api/auth/login` → bcrypt compare (+ legacy plain-text fallback) → JWT signed with `JWT_SECRET` (24h expiry, payload: `{id, email, role}`)
2. **Signup:** `POST /api/auth/signup` → bcrypt hash → create user (role: Recruiter) → JWT
3. **Frontend:** Token stored in `localStorage`, attached via Axios request interceptor (`Bearer` header)
4. **Backend:** `authenticate` middleware verifies JWT → `req.user = {id, email, role}`
5. **Authorization:** `authorize(...roles)` middleware checks `req.user.role`
6. **401 Handler:** Frontend Axios response interceptor clears storage + redirects to `/login`

---

## 9. AI Integration Details

**Provider:** OpenAI (`gpt-4o-mini` default, configurable via `OPENAI_MODEL`)
**SDK:** `openai` v6.35.0
**Temperature:** 0.4 (ranking/generation), 0.5 (chat)

### Active AI Functions

**CV Ranking (`rankCVWithFile`):**
- Sends CV file directly to OpenAI (PDF native, images as base64, text fallback)
- Returns: score 0-100, matchPercent, extracted info (name, email, skills), recommendation (hire/consider/pass), strengths, weaknesses, seniority
- Cache: forever per candidate (`ai_response_cache` column), SHA-256 dedup across candidates

**Job Description (`generateJobDescription`):**
- Input: title, skills, location, experience, contract → JSON output

**Recommendations (`generateRecommendations`):**
- Input: pipeline stats → 3 tips with priority/category
- Cache: 24h TTL, SHA-256 data fingerprint, max 5 entries/user

**LinkedIn Post (`generatePost`):**
- Input: title, skills, location, contract → plain text <800 chars

**Chat (`chat`):**
- Strictly scoped to recruitment/HR — rejects off-topic queries
- Context window: last 6 messages, max 400 tokens

---

## 10. Important Workflows

### Recruiter Workflow
```
Login → Create Project → Create Position(s) → AI generates job description
→ AI generates LinkedIn post → Publish to LinkedIn via OAuth
→ Candidates apply via public link → AI ranks CVs → Review pipeline
→ Schedule interviews (auto-email) → Manage status → Contracts view
```

### LinkedIn OAuth Flow
```
Settings.jsx → GET /api/linkedin/auth-url (state=base64{userId,nonce})
→ Redirect to linkedin.com/oauth → User authorizes
→ LinkedIn redirects to GET /api/linkedin/callback?code=X&state=Y
→ Exchange code for token → Fetch profile via OIDC /v2/userinfo
→ Save token+personURN to linkedin_tokens → Redirect /settings?linkedin=success
```

### AI CV Ranking Flow
```
POST /api/ai/rank-cv/:id → Check candidate.is_ranked (cache hit?)
→ Check cv_hash duplicate across same profile → Read CV file from /uploads
→ Send file to OpenAI → Parse JSON response → Save score + extracted data
→ Cache full response in ai_response_cache column
```

---

## 11. Active Folder Structure

```
HireX/
├── index.html                              # Vite entry HTML
├── vite.config.js                          # Vite + React + Tailwind + /api proxy
├── package.json                            # Frontend deps
├── src/
│   ├── main.jsx                            # Entry: ThemeProvider → ToastProvider → App
│   ├── App.jsx                             # Routes + AuthProvider + ProtectedRoute
│   ├── index.css                           # Design system (24KB)
│   ├── api/index.js                        # Centralized Axios client (6 API modules)
│   ├── contexts/
│   │   ├── AuthContext.jsx                 # Auth state + login/signup/logout
│   │   ├── ToastContext.jsx                # Toast notifications (10 consumers)
│   │   └── ThemeContext.jsx                # Dark/light mode (3 consumers)
│   ├── components/
│   │   ├── Background.jsx                  # WebGL animated bg (OGL)
│   │   ├── Surface.jsx                     # Glassmorphism wrapper
│   │   ├── Layout/
│   │   │   ├── AppLayout.jsx               # Shell: sidebar + header + outlet
│   │   │   └── Sidebar.jsx                 # Navigation sidebar
│   │   └── ui/                             # Reusable components (12 active)
│   │       ├── Avatar.jsx, Button.jsx, Card.jsx, Dropdown.jsx
│   │       ├── ConfirmDialog.jsx           # Promise-based modal (7 consumers)
│   │       ├── EmailPreview.jsx            # Interview email preview
│   │       ├── EmptyState.jsx, Input.jsx, LoadingSpinner.jsx
│   │       ├── Modal.jsx, ProgressRing.jsx, StatusBadge.jsx
│   └── Screens/
│       ├── Login.jsx                       # Auth (login + signup tabs)
│       ├── Workspace.jsx                   # Dashboard
│       ├── Analytics.jsx                   # Pipeline analytics
│       ├── AIAssistant.jsx                 # AI chat
│       ├── AllCandidates.jsx               # Global candidates
│       ├── AllPositions.jsx                # Global positions
│       ├── InterviewsHub.jsx               # Global interviews
│       ├── PostCreator.jsx                 # LinkedIn post editor
│       ├── Profile.jsx                     # User profile editor
│       ├── Projects/ProjectsList.jsx       # Projects list
│       ├── Pipeline/
│       │   ├── Candidates.jsx              # Project candidate pipeline (45KB, largest)
│       │   ├── Interviews.jsx              # Project interviews
│       │   └── Contracts.jsx               # Contract-ready candidates
│       ├── Settings/Settings.jsx           # LinkedIn OAuth + theme
│       ├── Apply/PublicApply.jsx            # Public application form
│       ├── Auth/
│       │   ├── ChangePassword.jsx
│       │   └── Unauthorized.jsx
│       └── Admin/Users.jsx                 # Stub (no backend)
├── Backend/
│   ├── Connection.js                       # Express entry (imports all routes)
│   ├── .env                                # Environment variables
│   ├── config/config.json                  # Sequelize DB config
│   ├── middleware/
│   │   ├── auth.js                         # JWT authenticate + role authorize
│   │   ├── upload.js                       # Multer (disk, 10MB, PDF/DOCX/images)
│   │   └── validate.js                     # Generic validation factory
│   ├── routes/                             # 7 route files (all imported by Connection.js)
│   ├── controllers/                        # 7 controllers
│   ├── services/
│   │   ├── aiService.js                    # OpenAI wrapper (5 functions)
│   │   ├── emailService.js                 # Nodemailer SMTP (invitation + notification)
│   │   └── linkedinService.js              # LinkedIn API (auth, profile, publish)
│   ├── models/                             # 17 active Sequelize models
│   └── uploads/                            # CV/avatar file storage (local disk)
```

---

## 12. Active Environment Variables

| Variable | Required | Usage |
|---|---|---|
| `PORT` | No (default: 3000) | Express server port |
| `JWT_SECRET` | **Yes** | JWT signing (⚠️ has hardcoded fallback) |
| `FRONTEND_URL` | No (default: localhost:5173) | CORS origin + email links + OAuth redirect |
| `OPENAI_API_KEY` | **Yes** | All AI features |
| `OPENAI_MODEL` | No (default: gpt-4o-mini) | AI model selection |
| `LINKEDIN_CLIENT_ID` | For LinkedIn | OAuth app ID |
| `LINKEDIN_CLIENT_SECRET` | For LinkedIn | OAuth app secret |
| `LINKEDIN_REDIRECT_URI` | For LinkedIn | OAuth callback URL |
| `SMTP_HOST` | For emails (default: smtp.gmail.com) | Mail server |
| `SMTP_PORT` | For emails (default: 587) | Mail port |
| `SMTP_USER` | For emails | Sender address |
| `SMTP_PASS` | For emails | Sender password/app key |

**Unused env vars in .env.example:** `GEMINI_API_KEY`, `GROK_API_KEY`, `NODE_ENV`

---

## 13. Security Assessment

### Active Protections
- ✅ JWT authentication (24h, Bearer token)
- ✅ bcrypt password hashing (10 salt rounds)
- ✅ Role-based authorization (Admin/Recruiter)
- ✅ CORS restricted to `FRONTEND_URL`
- ✅ File upload: type whitelist (PDF/DOCX/images) + 10MB limit
- ✅ Email normalization + input trimming
- ✅ Duplicate application prevention (email + profile)
- ✅ LinkedIn OAuth state with userId + nonce
- ✅ CV hash deduplication prevents redundant AI calls

### Known Risks
- ⚠️ Legacy plain-text password fallback in login
- ⚠️ JWT secret has hardcoded fallback value
- ⚠️ No rate limiting on any endpoint
- ⚠️ No CSRF protection
- ⚠️ CVs stored unencrypted on local disk

---

## 14. Build & Development

```bash
# Install
npm install && npm --prefix Backend install

# Development (two terminals)
npm run dev          # Vite dev server on :5173 (proxies /api → :3000)
npm run server       # Nodemon on :3000

# Production build
npm run build        # Vite → /dist
npm run server:start # Node (no nodemon)
```

**Vite Config:** React plugin + Tailwind CSS Vite plugin + `/api` proxy to `localhost:3000`

---

## 15. Full AI Context Prompt

```
You are an AI assistant developing HireX, an AI-powered recruitment SaaS.

WHAT IT DOES: Automates hiring — recruiters create projects/positions, AI generates
job descriptions, posts publish to LinkedIn via OAuth, candidates apply via public
forms with CV upload, AI (OpenAI gpt-4o-mini) ranks CVs 0-100, interviews are
scheduled with auto-email, candidates flow through a status pipeline.

TECH: React 19 + Vite 8 + Tailwind 4 + React Router 7 | Express 5 + Sequelize 6 +
MySQL | OpenAI SDK | LinkedIn REST API v202604 | Nodemailer SMTP | Multer file uploads

ARCHITECTURE: Monorepo. Frontend /src (React SPA) proxied via Vite to backend /Backend
(Express REST API). MVC+Services pattern. React Context for state (Auth, Toast, Theme).
Centralized Axios client with JWT interceptors. 17 Sequelize models. Local disk CV storage.

KEY PATTERNS:
- Controllers in /Backend/controllers, services in /Backend/services
- Frontend screens in /src/Screens, reusable UI in /src/components/ui
- All API routes prefixed /api, defined in /Backend/routes
- Public endpoints: /apply/:profileId, /api/candidates/apply, /api/linkedin/callback
- Auth: JWT (24h) via authenticate middleware → req.user = {id, email, role}
- AI results aggressively cached (CV rankings forever, recommendations 24h TTL)
- Dark-mode-first glassmorphism UI, primary purple #5523e9
- Toast notifications (ToastContext) replace native alerts
- ConfirmDialog (React Portal) for async confirmations

CONVENTIONS: PascalCase React components, camelCase backend files. Sequelize models
use define() with associations centralized in models/index.js. Controllers return
JSON with {message, data} or {error}. Frontend API layer exports typed modules
(projectsApi, candidatesApi, etc).
```
