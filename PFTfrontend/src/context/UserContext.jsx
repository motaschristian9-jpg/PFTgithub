import React, { createContext, useContext, useState, useEffect } from "react";
import { getUser } from "../api/auth";
import i18n from "../i18n";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token"); // Assuming token is stored in localStorage

      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }

      if (token) {
        try {
          const userData = await getUser();
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (error) {
          console.error("Failed to fetch fresh user data:", error);
          // Optional: if 401, clear user. For now, we keep the stored user to allow offline/optimistic access
          // or we could clear it if we want to force re-login on invalid token
          if (error.response?.status === 401) {
             setUser(null);
             setIsAuthenticated(false);
             localStorage.removeItem("user");
             localStorage.removeItem("token");
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    // Sync user state to localStorage whenever it changes
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      setIsAuthenticated(true);
      
      // Sync Language
      if (user.language && user.language !== i18n.language) {
        i18n.changeLanguage(user.language);
      }
    } else {
      localStorage.removeItem("user");
      setIsAuthenticated(false);
    }
  }, [user]);

  const clearUser = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ user, setUser, clearUser, isAuthenticated, setIsAuthenticated, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
