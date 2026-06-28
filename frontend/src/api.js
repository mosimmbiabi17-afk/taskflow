import axios from "axios";

// Change this if your backend runs somewhere else.
export const API_BASE_URL = "https://taskflow-9p57.onrender.com";

// --- JWT is kept in MEMORY ONLY (never localStorage) -------------------------
let authToken = null;
export function setToken(t) {
  authToken = t;
}
export function getToken() {
  return authToken;
}
export function clearToken() {
  authToken = null;
}

function client() {
  const instance = axios.create({ baseURL: API_BASE_URL });
  // Attach the JWT as `Authorization: Bearer <token>` on every request.
  instance.interceptors.request.use((config) => {
    if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
    return config;
  });
  return instance;
}

// Exact mapping of the documented FastAPI backend.
export const api = {
  register: (body) => client().post("/auth/register", body).then((r) => r.data),
  login: (body) => client().post("/auth/login", body).then((r) => r.data),

  getBoards: () => client().get("/boards").then((r) => r.data),
  createBoard: (title) => client().post("/boards", { title }).then((r) => r.data),
  getBoard: (id) => client().get(`/boards/${id}`).then((r) => r.data),
  deleteBoard: (id) => client().delete(`/boards/${id}`).then(() => true),

  createList: (body) => client().post("/lists", body).then((r) => r.data),
  updateList: (id, body) => client().put(`/lists/${id}`, body).then((r) => r.data),
  deleteList: (id) => client().delete(`/lists/${id}`).then(() => true),

  createCard: (body) => client().post("/cards", body).then((r) => r.data),
  updateCard: (id, body) => client().put(`/cards/${id}`, body).then((r) => r.data),
  deleteCard: (id) => client().delete(`/cards/${id}`).then(() => true),

  getComments: (cardId) => client().get(`/cards/${cardId}/comments`).then((r) => r.data),
  addComment: (cardId, content) =>
    client().post(`/cards/${cardId}/comments`, { content }).then((r) => r.data),
};

// Extracts a readable message from a FastAPI error response.
export function apiErrorMessage(err, fallback) {
  if (err && err.response && err.response.data && err.response.data.detail) {
    const d = err.response.data.detail;
    return typeof d === "string" ? d : fallback;
  }
  return (err && err.message) || fallback;
}

export default api;
