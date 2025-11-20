import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Helper functions (now exported)
export const getToken = () =>
  sessionStorage.getItem("token") || localStorage.getItem("token");
export const setToken = (token, remember) => {
  if (remember) localStorage.setItem("token", token);
  else sessionStorage.setItem("token", token);
};
export const clearTokens = () => {
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
};

api.interceptors.request.use((config) => {
  const token = getToken();
  // Don't add token for Google OAuth callback endpoints
  if (token && !config.url.includes("/auth/google/callback")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors by clearing tokens and redirecting to login
    if (error.response?.status === 401) {
      clearTokens();
      // Don't redirect to login for Google OAuth callback requests
      if (!originalRequest.url.includes("/auth/google/callback")) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // Log other errors
    console.error(error);

    return Promise.reject(error);
  }
);

export default api;
