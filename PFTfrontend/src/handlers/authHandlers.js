import api from "../api/axios.js";

export const loginWithGoogle = async () => {
  try {
    const response = await api.get("/auth/google/login");
    if (response.data.success && response.data.redirect_url) {
      window.location.href = response.data.redirect_url;
    } else {
      console.error("Failed to get Google login URL");
    }
  } catch (error) {
    console.error("Error fetching Google login URL:", error);
  }
};
