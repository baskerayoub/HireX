# Pages Documentation

## Frontend Pages (React)

### Authentication & Authorization Pages

#### Login Page
- **Route:** `/login`
- **Description:** Allows users to authenticate into the platform using their email and password.
- **Features:** 
  - Login form with validation
  - JWT authentication handling
  - Animated UI and responsive design
- **API Calls:** `authApi.login`

#### Change Password Page
- **Route:** `/change-password`
- **Description:** Allows authenticated users to securely update their password.
- **Features:** Password validation form, security checks.
- **API Calls:** `authApi.changePassword`

#### Unauthorized Page
- **Route:** `/unauthorized`
- **Description:** Displays an access denied message when a user attempts to access a page requiring higher privileges (e.g., Admin routes).

---

### Public Pages

#### Public Apply Page
- **Route:** `/apply/:profileId` *(Dynamic)*
- **Description:** Public-facing page where candidates can submit their applications for a specific job profile without needing an account.
- **Features:** 
  - Application form (Name, Email, etc.)
  - CV file upload functionality
  - Success confirmation state

---

### Core Dashboard & Global Pages

#### Workspace (Dashboard)
- **Route:** `/workspace`
- **Description:** The main landing area for logged-in recruiters. Displays a high-level overview of their recruitment workspace.
- **Features:** Quick access navigation cards, summary metrics, recent activity feed.

#### Analytics Page
- **Route:** `/analytics`
- **Description:** Shows comprehensive data and statistics regarding the recruitment process.
- **Features:** 
  - Interactive charts and graphs
  - Metrics dashboard (time-to-hire, candidate sources)
  - Filtering by date and project

#### AI Assistant Page
- **Route:** `/ai-assistant`
- **Description:** Dedicated chat interface for recruiters to interact with the platform's AI assistant for HR-specific queries.
- **Features:** Chat UI, suggested prompts, markdown rendering for AI responses.
- **API Calls:** `aiApi.chat`

#### Projects List
- **Route:** `/projects`
- **Description:** Displays all recruitment projects the user has access to.
- **Features:** 
  - Project creation modal/form
  - Status toggle (Active/Inactive)
  - Grid and list views

#### All Candidates Page
- **Route:** `/candidates`
- **Description:** A global view of all candidates across all projects.
- **Features:** 
  - Search and advanced filtering (by status, skills)
  - Data table/list view with pagination
  - Candidate details modal and AI resume screening triggers

#### All Positions Page
- **Route:** `/positions`
- **Description:** A global view of all job profiles/positions.
- **Features:** Filter by location/contract type, position details, active/inactive status management.

#### Interviews Hub
- **Route:** `/interviews`
- **Description:** Global calendar and list view of all upcoming and past interviews across the workspace.
- **Features:** Calendar view, interview scheduling, feedback submission forms.

#### Post Creator
- **Route:** `/posts`
- **Description:** Global tool to generate job descriptions using AI and publish them to social platforms.
- **Features:** AI description generation, LinkedIn publish button, copy link functionality.

---

### Project-Specific Pipeline Pages

#### Project Candidates (Pipeline)
- **Route:** `/projects/:projectId/candidates` *(Dynamic)*
- **Description:** Kanban board or detailed list view managing the recruitment pipeline for a specific project.
- **Features:** Drag-and-drop status updates, AI resume parsing, manual candidate addition form.

#### Project Job Publication
- **Route:** `/projects/:projectId/publication` *(Dynamic)*
- **Description:** Project-specific instance of the Post Creator for generating and publishing jobs to LinkedIn.

#### Project Interviews
- **Route:** `/projects/:projectId/interviews` *(Dynamic)*
- **Description:** Interview management specific to a single project.
- **Features:** Scheduling forms, meeting links, feedback submission.

#### Project Contracts
- **Route:** `/projects/:projectId/contracts` *(Dynamic)*
- **Description:** Manages offers and contracts for candidates in a specific project.
- **Features:** Document status tracking, contract generation.

---

### Admin & Settings Pages

#### Admin Users Page
- **Route:** `/users`
- **Description:** Admin panel to manage system users.
- **Features:** Data table, role management (Admin/Recruiter), user creation and deletion modals.

#### Profile Page
- **Route:** `/profile`
- **Description:** User's personal account details and preferences.
- **Features:** Avatar upload, detail editing form.

#### Settings Page
- **Route:** `/settings`
- **Description:** Application settings and third-party integrations.
- **Features:** 
  - LinkedIn OAuth connection status and disconnect toggle
  - UI preferences (e.g., Dark mode)

---

## Backend API Routes (Express.js)

The backend utilizes `express.Router()` to modularize its endpoints.

1. **Authentication API (`/api/auth`)**
   - Handles login, password changes, token validation, and user session management.
2. **Projects API (`/api/projects`)**
   - CRUD operations for recruitment projects.
3. **Profiles API (`/api/profiles`)**
   - CRUD operations for job profiles/positions linked to projects.
4. **Candidates API (`/api/candidates`)**
   - Manages candidate data, handles file uploads (CV parsing), and application pipeline statuses.
5. **Meetings API (`/api/meetings`)**
   - Scheduling and retrieving interview meetings, and managing interview feedback.
6. **AI Features API (`/api/ai`)**
   - Interfaces with the LLM (Gemini) for resume parsing, job description generation, and the AI assistant chat.
7. **LinkedIn API (`/api/linkedin`)**
   - Handles OAuth callbacks, token status checking, and job post publishing functionality directly to LinkedIn.
