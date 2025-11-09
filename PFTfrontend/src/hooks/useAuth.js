import { useState, useEffect } from "react";
import { loginUser, registerUser } from "../api/auth.js";
import Swal from "sweetalert2";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (error) {
            console.warn("User data parsing failed:", error);
            localStorage.removeItem("user");
            sessionStorage.removeItem("user");
          }
        }
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials, rememberMe = false, navigate) => {
    if (!credentials.email?.trim() || !credentials.password?.trim()) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter both email and password.",
        confirmButtonColor: "#10B981",
      });
      return { success: false };
    }

    setLoading(true);

    try {
      const response = await loginUser(credentials);
      setLoading(false);

      if (response.data.token && response.data.user) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("token", response.data.token);
        storage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("rememberMe", rememberMe.toString());
        setToken(response.data.token);
        setUser(response.data.user);

        await Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: `Welcome back, ${response.data.user?.name || "User"}! 😊`,
          confirmButtonColor: "#10B981",
        });

        if (navigate) navigate("/dashboard");
        return { success: true, data: response };
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setLoading(false);

      let errorMessage = "Something went wrong. Please try again.";

      if (err.response) {
        const { status, data } = err.response;

        if (status === 422) {
          // Handle Laravel validation errors - this includes invalid credentials
          if (data?.error) {
            // Get the first validation error
            const error = Object.values(data.message).flat();
            errorMessage = error || "Invalid credentials or wrong password";
          } else if (data?.message) {
            errorMessage = data.message;
          } else {
            errorMessage = "Invalid credentials or wrong password";
          }
        } else if (status === 401) {
          errorMessage = "Invalid credentials or wrong password";
        } else if (data?.message) {
          errorMessage = data.message;
        }
      }

      console.log("Final errorMessage:", errorMessage);

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: errorMessage,
        confirmButtonColor: "#10B981",
      });

      return { success: false, error: err };
    }
  };

  const logout = (navigate) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setToken(null);
    setUser(null);

    Swal.fire({
      icon: "info",
      title: "Logged Out",
      text: "You have been logged out successfully.",
      confirmButtonColor: "#10B981",
    });

    if (navigate) navigate("/login");
  };

  const register = async (userData, navigate) => {
    if (
      !userData.name?.trim() ||
      !userData.email?.trim() ||
      !userData.password?.trim() ||
      !userData.password_confirmation?.trim()
    ) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "All fields are required.",
        confirmButtonColor: "#10B981",
      });
      return { success: false };
    }

    if (userData.password !== userData.password_confirmation) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Passwords do not match.",
        confirmButtonColor: "#10B981",
      });
      return { success: false };
    }

    setLoading(true);

    try {
      const response = await registerUser(userData);
      setLoading(false);

      if (response.success) {
        await Swal.fire({
          icon: "success",
          title: "Registration Successful!",
          text: `Welcome, ${
            response.data?.user?.name || "User"
          }! Please log in to continue.`,
          confirmButtonColor: "#10B981",
        });

        if (navigate) navigate("/login");
        return { success: true, data: response };
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Registration error:", err);

    //   console.error("Response data:", err.response?.data);
      console.error("Response status:", err.response?.status);
      setLoading(false);

      let errorMessage = "Something went wrong. Please try again.";

      if (err.response) {
        const { status, data } = err.response;

        if (status === 422) {
          // Handle Laravel validation errors
          if (data?.error) {
            // Get the first validation error
            const error = Object.values(data.message).flat();
            errorMessage = error || "Validation failed";
          } else if (data?.message) {
            errorMessage = data.message;
          } else {
            errorMessage = "Validation failed";
          }
        } else if (data?.message) {
          errorMessage = data.message;
        }
      }

      console.log("Final errorMessage:", errorMessage);

      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: errorMessage,
        confirmButtonColor: "#10B981",
      });

      return { success: false, error: err };
    }
  };

  const isAuthenticated = () => !!token && !!user;

  return {
    login,
    register,
    logout,
    loading,
    user,
    token,
    isAuthenticated,
  };
};
