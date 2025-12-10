import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { updateProfile } from "../api/auth";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { user, setUser } = useAuth();
  
  // Initialize from local storage or system
  const [theme, setTheme] = useState(() => {
    // If we have a user from a hydrated state, use it (though usually user is null on first render)
    // We'll rely on useEffect to sync with user preference
    const saved = localStorage.getItem("theme");
    return saved || "system";
  });

  // Apply theme to HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Smooth transition style
    root.style.transition = "background-color 0.3s ease, color 0.3s ease";

    let effectiveTheme = theme;

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      effectiveTheme = systemTheme;
    }

    // Explicitly handle class toggling
    if (effectiveTheme === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
    } else {
        root.classList.remove("dark");
        root.classList.add("light");
    }

    localStorage.setItem("theme", theme);
    
  }, [theme, user]);

  // Sync with user preference from DB
  useEffect(() => {
    if (user?.theme_preference) {
      setTheme(user.theme_preference);
    }
  }, [user?.theme_preference]); // Only run if the *DB value* changes

  const updateTheme = async (newTheme) => {
    setTheme(newTheme);
    
    // If logged in, save to DB
    if (user) {
        // Optimistically update user state to prevent immediate reversion by useEffect
        setUser(prevUser => ({
            ...prevUser,
            theme_preference: newTheme
        }));

        try {
            const formData = new FormData();
            formData.append('name', user.name); // Required by API validation
            formData.append('currency', user.currency || 'USD'); // Required
            formData.append('theme_preference', newTheme);
            
            // We use the existing updateProfile API which expects all fields
            //Ideally we should have a dedicated endpoint or make fields optional, 
            // but for now we re-send required fields.
            await updateProfile(formData);
        } catch (error) {
            console.error("Failed to sync theme preference", error);
            // Optionally revert user state here if needed, but for theme it's probably better to keep local pref
        }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within ThemeProvider");
    return context;
};
