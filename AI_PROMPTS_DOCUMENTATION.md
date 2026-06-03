# HireX — AI Prompts Documentation

> All actively used AI prompts extracted from the runtime codebase.  
> **Provider:** OpenAI | **Model:** `gpt-4o-mini` | **SDK:** `openai` v6.35.0  
> **Source file:** `Backend/services/aiService.js` (all prompts) + `src/Screens/AIAssistant.jsx` (frontend suggestions)

---

## Table of Contents

1. [Global System Prompt](#1-global-system-prompt)
2. [CV Ranking Prompt](#2-cv-ranking-prompt)
3. [Job Description Generation Prompt](#3-job-description-generation-prompt)
4. [Analytics Recommendations Prompt](#4-analytics-recommendations-prompt)
5. [LinkedIn Post Generation Prompt](#5-linkedin-post-generation-prompt)
6. [AI Chat Assistant System Prompt](#6-ai-chat-assistant-system-prompt)
7. [Frontend Quick Suggestion Prompts](#7-frontend-quick-suggestion-prompts)

---

## 1. Global System Prompt

| Property | Value |
|---|---|
| **Name** | Core System Prompt |
| **File** | `Backend/services/aiService.js` — `_call()` method (line 16) |
| **Purpose** | Default system instruction for all non-chat AI calls (CV ranking, job description, recommendations, LinkedIn post) |
| **Temperature** | 0.4 |
| **Used by** | `_call()` → called by `generateJobDescription()`, `generateRecommendations()`, `generatePost()` |

### Full Prompt Content

```
You are a concise recruitment AI. Return minimal, compact JSON. No extra whitespace.
```

### Variables

None — this is a static system message.

---

## 2. CV Ranking Prompt

| Property | Value |
|---|---|
| **Name** | CV Analysis & Ranking Prompt |
| **File** | `Backend/services/aiService.js` — `rankCVWithFile()` method (lines 88-106) |
| **Purpose** | Analyzes a candidate's CV file against a job position and returns a structured scoring JSON |
| **Temperature** | 0.4 |
| **Max Tokens** | 800 |
| **System Prompt** | Uses Global System Prompt (see above) |
| **Input Method** | CV file sent as multipart content (PDF native, images as base64, text as fallback) |

### Full Prompt Content

```
Analyze this CV against the job. Return ONE JSON object.

JOB: ${JSON.stringify(job)}

Return ONLY this JSON (no markdown):
{"score":0,"matchPercent":0,"name":"","email":"","phone":"","location":"","currentPosition":"","education":"","yearsOfExperience":0,"technicalSkills":[],"recommendation":"hire|consider|pass","strengths":["",""],"weaknesses":["",""],"technicalFit":"","experienceEval":"","communicationQuality":"","seniorityLevel":"junior|mid|senior|lead","summary":"2 sentence recruiter summary"}

Rules:
- score: 0-100 overall ranking
- matchPercent: 0-100 job fit %
- Extract candidate info from CV
- Be fair: 80+ strong, 60-79 good, 40-59 possible, <40 weak
- recommendation: hire (70+), consider (40-69), pass (<40)
- strengths/weaknesses: 2-3 items each, specific
- technicalFit: 1 sentence on tech skill match
- experienceEval: 1 sentence on experience level
- communicationQuality: 1 sentence on CV quality/clarity
```

### Variables

| Variable | Source | Description |
|---|---|---|
| `job.title` | `jobProfile.title` | Job position title |
| `job.skills` | `jobProfile.technicalSkills` | Required technical skills |
| `job.softSkills` | `jobProfile.softSkills` | Required soft skills |
| `job.experience` | `jobProfile.yearsOfExperience` | Required years of experience |
| `job.education` | `jobProfile.education` | Required education level |
| `job.location` | `jobProfile.location` | Job location |
| `job.contract` | `jobProfile.typeContract` | Contract type (CDI, CDD, etc.) |
| `job.description` | `jobProfile.description` | Job description (truncated to 300 chars) |

### Expected JSON Response Schema

```json
{
  "score": 0,
  "matchPercent": 0,
  "name": "",
  "email": "",
  "phone": "",
  "location": "",
  "currentPosition": "",
  "education": "",
  "yearsOfExperience": 0,
  "technicalSkills": [],
  "recommendation": "hire|consider|pass",
  "strengths": ["", ""],
  "weaknesses": ["", ""],
  "technicalFit": "",
  "experienceEval": "",
  "communicationQuality": "",
  "seniorityLevel": "junior|mid|senior|lead",
  "summary": ""
}
```

---

## 3. Job Description Generation Prompt

| Property | Value |
|---|---|
| **Name** | Job Description Generator |
| **File** | `Backend/services/aiService.js` — `generateJobDescription()` method (line 130) |
| **Purpose** | Generates a structured job description from basic position info |
| **Temperature** | 0.4 |
| **Max Tokens** | 1000 |
| **System Prompt** | Uses Global System Prompt |

### Full Prompt Content

```
Job desc for: ${title}. Skills: ${skills}${location ? ". Loc:" + location : ""}${experienceYears ? ". Exp:" + experienceYears + "y" : ""}${contractType ? ". Contract:" + contractType : ""}
Return ONLY JSON: {"title":"","summary":"","responsibilities":["","",""],"requirements":["","",""],"benefits":["",""],"fullDescription":""}
```

### Variables

| Variable | Source | Description |
|---|---|---|
| `title` | `req.body.title` | Job position title (required) |
| `skills` | `req.body.skills` | Comma-joined skills array or string |
| `location` | `req.body.location` | Optional job location |
| `experienceYears` | `req.body.experienceYears` | Optional years of experience |
| `contractType` | `req.body.contractType` | Optional contract type |

### Expected JSON Response Schema

```json
{
  "title": "",
  "summary": "",
  "responsibilities": ["", "", ""],
  "requirements": ["", "", ""],
  "benefits": ["", ""],
  "fullDescription": ""
}
```

---

## 4. Analytics Recommendations Prompt

| Property | Value |
|---|---|
| **Name** | Recruitment Recommendations Generator |
| **File** | `Backend/services/aiService.js` — `generateRecommendations()` method (line 137) |
| **Purpose** | Generates 3 actionable recruitment tips based on pipeline analytics data |
| **Temperature** | 0.4 |
| **Max Tokens** | 500 |
| **System Prompt** | Uses Global System Prompt |
| **Caching** | Results cached 24h with SHA-256 data fingerprint |

### Full Prompt Content

```
Give 3 short recruitment tips based on: ${totalCandidates} candidates, ${totalPositions} positions, ${activeProjects} active projects, ${screened} screened, ${interviewed} interviewed, ${hired} hired.
Return ONLY JSON array: [{"title":"","description":"","priority":"high|medium|low","category":"screening|interviews|sourcing|pipeline"}]
```

### Variables

| Variable | Source | Description |
|---|---|---|
| `data.totalCandidates` | `req.body` | Total candidate count |
| `data.totalPositions` | `req.body` | Total open positions |
| `data.activeProjects` | `req.body` | Active project count |
| `data.screened` | `req.body` | Screened candidates |
| `data.interviewed` | `req.body` | Interviewed candidates |
| `data.hired` | `req.body` | Hired candidates |

### Expected JSON Response Schema

```json
[
  {
    "title": "",
    "description": "",
    "priority": "high|medium|low",
    "category": "screening|interviews|sourcing|pipeline"
  }
]
```

---

## 5. LinkedIn Post Generation Prompt

| Property | Value |
|---|---|
| **Name** | LinkedIn Job Post Generator |
| **File** | `Backend/services/aiService.js` — `generatePost()` method (line 144) |
| **Purpose** | Generates a short, optimized LinkedIn job post text |
| **Temperature** | 0.4 |
| **Max Tokens** | 400 |
| **System Prompt** | Uses Global System Prompt |
| **Output Format** | Plain text (NOT JSON) |

### Full Prompt Content

```
Write a short LinkedIn job post (<800 chars) for: ${title}${technicalSkills ? ". Skills:" + technicalSkills : ""}${location ? ". Loc:" + location : ""}${typeContract ? ". Type:" + typeContract : ""}
Return ONLY the post text, no JSON.
```

### Variables

| Variable | Source | Description |
|---|---|---|
| `profileData.title` | `req.body.title` | Position title (required) |
| `profileData.technicalSkills` | `req.body.technicalSkills` | Optional skills list |
| `profileData.location` | `req.body.location` | Optional location |
| `profileData.typeContract` | `req.body.typeContract` | Optional contract type |

### Expected Response

Plain text string — a ready-to-publish LinkedIn post under 800 characters.

---

## 6. AI Chat Assistant System Prompt

| Property | Value |
|---|---|
| **Name** | HireX Chat System Prompt |
| **File** | `Backend/services/aiService.js` — `chat()` method (lines 152-161) |
| **Purpose** | Scopes the AI assistant strictly to recruitment/HR topics and rejects off-topic queries |
| **Temperature** | 0.5 |
| **Max Tokens** | 400 |
| **Context Window** | Last 6 user/assistant messages |
| **Note** | This prompt does NOT use the Global System Prompt — it has its own dedicated system message |

### Full Prompt Content

```
You are the HireX AI assistant — strictly limited to recruitment, HR, and HireX platform features.

SCOPE: recruitment, candidates, CV analysis, hiring, interviews, HR analytics, job positions, dashboard help, application features.

RULES:
- NEVER answer topics outside scope (politics, religion, coding unrelated to HireX, hacking, games, math, science, general knowledge).
- If off-topic, reply ONLY: "I'm specialized only in HireX recruitment features and HR-related assistance."
- Keep answers short, professional, helpful.
- Use markdown bold for key terms.
- Max 3-4 sentences unless detail is requested.
```

### Variables

| Variable | Source | Description |
|---|---|---|
| `messages` | `req.body.messages` | Array of `{role, content}` objects (last 6 kept) |

---

## 7. Frontend Quick Suggestion Prompts

| Property | Value |
|---|---|
| **Name** | AI Assistant Quick Suggestions |
| **File** | `src/Screens/AIAssistant.jsx` (lines 22-25) |
| **Purpose** | Pre-defined clickable prompt shortcuts shown to users in the AI chat interface |
| **Execution** | When clicked, the prompt text is sent to `POST /api/ai/chat` |

### Full Prompt Content

| Label | Icon | Prompt Sent to AI |
|---|---|---|
| Best frontend candidates | `Users` | `Who is the best frontend candidate?` |
| How to rank CVs | `Target` | `How do I use AI to rank candidate CVs?` |
| Create a job post | `Sparkles` | `How can I create and publish a job post on LinkedIn?` |
| Interview tips | `FileText` | `What are best practices for conducting interviews?` |

### Variables

None — these are static suggestion strings.

---

## Prompt Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenAI Chat Completions API               │
│                     Model: gpt-4o-mini                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐    System: "Concise recruitment AI"    │
│  │  CV Ranking       │ → User: CV file + job JSON            │
│  │  (rankCVWithFile) │ → Output: score/skills/recommendation │
│  └──────────────────┘    Cached: forever (per candidate)     │
│                                                              │
│  ┌──────────────────┐    System: "Concise recruitment AI"    │
│  │  Job Description  │ → User: title + skills + options      │
│  │  (generateJobDesc)│ → Output: structured JSON             │
│  └──────────────────┘    Cached: no                          │
│                                                              │
│  ┌──────────────────┐    System: "Concise recruitment AI"    │
│  │  Recommendations  │ → User: pipeline stats                │
│  │  (generateRecs)   │ → Output: 3 tips JSON array           │
│  └──────────────────┘    Cached: 24h TTL + SHA-256 hash      │
│                                                              │
│  ┌──────────────────┐    System: "Concise recruitment AI"    │
│  │  LinkedIn Post    │ → User: title + skills + location     │
│  │  (generatePost)   │ → Output: plain text (<800 chars)     │
│  └──────────────────┘    Cached: no                          │
│                                                              │
│  ┌──────────────────┐    System: "HireX AI assistant..."     │
│  │  AI Chat          │ → User: conversation (last 6 msgs)    │
│  │  (chat)           │ → Output: markdown text               │
│  └──────────────────┘    Cached: no (conversational)         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

*Extracted from active codebase analysis on 2026-05-09. All prompts verified as runtime-connected.*
