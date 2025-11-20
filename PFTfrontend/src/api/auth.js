import api from "./axios";

// Login
export const loginUser = async (credentials) => {
  const response = await api.post("/login", credentials);
  return response.data;
};

// Register
export const registerUser = async (userData) => {
  const response = await api.post("/register", userData);
  return response.data;
};

// Send password reset email
export const forgotPassword = async (email) => {
  const response = await api.post("/forgot-password", { email });
  return response.data;
};

// Reset password
export const resetPassword = async (data) => {
  // data should contain email, token, password, password_confirmation
  const response = await api.post("/reset-password", data);
  return response.data;
};

// Resend verification email
export const resendVerificationEmail = async (data) => {
  const response = await api.post("/email/verification-notification", data);
  return response.data;
};

// Get Google OAuth URL
export const getGoogleOAuthUrl = async (state, redirectUri) => {
  const response = await api.get("/auth/google/login", {
    params: { state, redirect_uri: redirectUri }
  });
  return response.data;
};

// Google OAuth callback
export const googleCallback = async (data) => {
  const response = await api.get("/auth/google/callback", { params: data });
  return response.data;
};

// Logout
export const logoutUser = async () => {
  try {
    const response = await api.post("/logout");
    // Force full page refresh after logout
    window.location.href = "/login";
    return response.data;
  } catch (error) {
    // If logout fails due to invalid token, that's okay - we still want to clear local data
    if (error.response?.status === 401) {
      window.location.href = "/login";
      return { message: "Logged out successfully" };
    }
    throw error;
  }
};
