import api from "./axios";

export const loginUser = async (credentials) => {
  const response = await api.post("/login", credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post("/register", userData);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (data) => {
  // data should contain email, token, password, password_confirmation
  const response = await api.post("/reset-password", data);
  return response.data;
};

export const resendVerificationEmail = async (data) => {
  const response = await api.post("/email/verification-notification", data);
  return response.data;
};

export const updateProfile = async (formData) => {
  const response = await api.post("/update-profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getGoogleOAuthUrl = async (state, redirectUri) => {
  const response = await api.get("/auth/google/login", {
    params: { state, redirect_uri: redirectUri },
  });
  return response.data;
};

export const googleCallback = async (data) => {
  const response = await api.get("/auth/google/callback", { params: data });
  return response.data;
};

// --- FIX: The function that was missing the 'export' keyword ---
export const acknowledgeNotificationsAPI = async () => {
  const now = new Date().toISOString();
  return api.put("/user/acknowledge-notifications", {
    ack_time: now,
  });
};

// --- FIX: The function causing the error in SettingsPage.jsx ---
export const setLocalPasswordAPI = async (data) => {
  return api.put("/user/set-password", data);
};

export const logoutUser = async () => {
  try {
    const response = await api.post("/logout");
    window.location.href = "/login";
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      window.location.href = "/login";
      return { message: "Logged out successfully" };
    }
    throw error;
  }
};
