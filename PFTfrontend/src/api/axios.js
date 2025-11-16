import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Helper functions
const getToken = () =>
  sessionStorage.getItem("token") || localStorage.getItem("token");
const setToken = (token, remember) => {
  if (remember) localStorage.setItem("token", token);
  else sessionStorage.setItem("token", token);
};
const clearTokens = () => {
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
};

// Queue to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = getToken();
  // Don't add token for Google OAuth callback endpoints
  if (token && !config.url.includes('/auth/google/callback')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401s if the request wasn't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue all requests while a refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // Refresh the token silently
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/refresh`,
          {},
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          }
        );

        const newToken = refreshResponse.data.access_token;
        if (!newToken)
          throw new Error("Refresh endpoint did not return a token");

        const remember = !!localStorage.getItem("token");
        setToken(newToken, remember);

        // Update original request and retry
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        // Don't redirect to login for Google OAuth callback requests
        if (!originalRequest.url.includes('/auth/google/callback')) {
          window.location.href = "/login"; // optional: redirect to login
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Only log errors that aren't part of refresh flow
    if (error.response?.status !== 401) {
      console.error(error);
    }

    return Promise.reject(error);
  }
);

export default api;
