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
  toggleStatus: (id) => api.patch(`/projects/${id}/toggle-status`),
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
  listAll: () => api.get("/meetings/all"),
  listByCandidate: (candidateId) => api.get(`/meetings/candidate/${candidateId}`),
  listByProject: (projectId) => api.get(`/meetings/project/${projectId}`),
  update: (id, data) => api.put(`/meetings/${id}`, data),
  cancel: (id, sendEmail = false) => api.patch(`/meetings/${id}/cancel`, { sendEmail }),
  delete: (id, sendEmail = false) => api.delete(`/meetings/${id}`, { data: { sendEmail } }),
};

// ── AI ────────────────────────────────────────
export const aiApi = {
  rankCV: (candidateId, force = false) => api.post(`/ai/rank-cv/${candidateId}${force ? '?force=true' : ''}`, {}),
  rankAll: (projectId, force = false) => api.post(`/ai/rank-all/${projectId}${force ? '?force=true' : ''}`, {}),
  generateDescription: (data) => api.post("/ai/generate-description", data),
  recommendations: (data, force = false) => api.post(`/ai/recommendations${force ? '?force=true' : ''}`, data),
  generatePost: (data) => api.post("/ai/generate-post", data),
  chat: (messages) => api.post("/ai/chat", { messages }),
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
