import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

// ── Projects ──────────────────────────────────
export const projectsApi = {
  list: (params) => api.get("/projects", { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post("/projects", data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  archive: (id) => api.delete(`/projects/${id}`),
  stats: () => api.get("/projects/stats"),
};

// ── Profiles ──────────────────────────────────
export const profilesApi = {
  create: (projectId, data) => api.post(`/profiles/project/${projectId}`, data),
  listByProject: (projectId) => api.get(`/profiles/project/${projectId}`),
  getById: (id) => api.get(`/profiles/${id}`),
  update: (id, data) => api.put(`/profiles/${id}`, data),
  delete: (id) => api.delete(`/profiles/${id}`),
};

// ── Candidates ────────────────────────────────
export const candidatesApi = {
  apply: (profileId, formData) =>
    api.post(`/candidates/apply/${profileId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  listByProfile: (profileId, params) => api.get(`/candidates/profile/${profileId}`, { params }),
  listByProject: (projectId) => api.get(`/candidates/project/${projectId}`),
  getById: (id) => api.get(`/candidates/${id}`),
  downloadCv: (id) => api.get(`/candidates/${id}/cv/download`, { responseType: "blob" }),
  updateStatus: (id, status) => api.patch(`/candidates/${id}/status`, { status }),
  delete: (id) => api.delete(`/candidates/${id}`),
};

// ── Meetings ──────────────────────────────────
export const meetingsApi = {
  create: (data) => api.post("/meetings", data),
  listByCandidate: (candidateId) => api.get(`/meetings/candidate/${candidateId}`),
  listByProject: (projectId) => api.get(`/meetings/project/${projectId}`),
  update: (id, data) => api.put(`/meetings/${id}`, data),
  cancel: (id) => api.patch(`/meetings/${id}/cancel`),
};

// ── AI ────────────────────────────────────────
export const aiApi = {
  generateDescription: (data) => api.post("/ai/generate-description", data),
  parseCv: (candidateId) => api.post(`/ai/parse-cv/${candidateId}`, {}),
  matchScore: (candidateId, profileId) => api.post(`/ai/match-score/${candidateId}/${profileId}`, {}),
  rankCandidates: (profileId) => api.post(`/ai/rank/${profileId}`, {}),
};

// ── LinkedIn ──────────────────────────────────
export const linkedinApi = {
  getAuthUrl: () => api.get("/linkedin/auth-url"),
  callback: (code, state) => api.get("/linkedin/callback", { params: { code, state } }),
  status: () => api.get("/linkedin/status"),
  publish: (data) => api.post("/linkedin/publish", data),
  disconnect: () => api.delete("/linkedin/disconnect"),
};

export default api;
