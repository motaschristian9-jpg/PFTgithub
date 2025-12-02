// src/layout/DashboardLayout.jsx (Conceptual File)

import React, { useState, useEffect } from "react";
// ... imports for Topbar, Sidebar, etc.
import useSmartNotifications from "../hooks/useSmartNotifications.js";
import { useDataContext } from "../components/DataLoader.jsx";

export default function DashboardLayout({ children }) {
  const { user } = useDataContext();

  // 1. Get notifications and initial unread status
  const { notifications, initialHasUnread } = useSmartNotifications();

  // 2. Local state for the red badge (allows Topbar to clear it)
  const [hasUnread, setHasUnread] = useState(initialHasUnread);

  // 3. Keep hasUnread status updated when the notification list changes
  useEffect(() => {
    if (notifications.length > 0) {
      setHasUnread(true); // Light up the badge when new alerts appear
    }
  }, [notifications.length]);

  // ... (Your other layout logic)

  return (
    <div className="flex-1 flex flex-col relative z-10">
      {/* 4. Pass the required props to Topbar */}
      <Topbar
        // ... other props (toggleMobileMenu)
        notifications={notifications} // <-- The array of generated alerts
        hasUnread={hasUnread} // <-- The state for the red dot
        setHasUnread={setHasUnread} // <-- The setter to clear the red dot
        user={user}
      />
      {/* ... rest of the layout / {children} */}
    </div>
  );
}
