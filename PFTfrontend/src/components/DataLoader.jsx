import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import LoadingScreen from "./LoadingScreen.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useTransactions } from "../hooks/useTransactions.js";
import { useCategories } from "../hooks/useCategories.js";
import { useActiveBudgets } from "../hooks/useBudget.js";
import { useActiveSavings } from "../hooks/useSavings.js";
import { formatCurrency } from "../utils/currency.js";
import { parseISO, isAfter } from "date-fns";
import { acknowledgeNotificationsAPI } from "../api/auth";

const DataContext = createContext(null);

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};

// --- CONSTANT FOR SESSION STORAGE KEY ---
const ACK_SESSION_KEY = "notifyAck_";

const DataLoader = ({ children }) => {
  const [hasUnread, setHasUnread] = useState(false);
  // NEW: Local state to hold the immediate acknowledgment time for the CURRENT session, linked to user ID.
  const [localSessionAckTime, setLocalSessionAckTime] = useState(null);

  const { user, isLoading: userLoading, error: userError, setUser } = useAuth();

  const {
    data: transactionsData,
    isLoading: transLoading,
    error: transError,
  } = useTransactions({}, { fetchAll: true });

  const {
    data: categoriesData,
    isLoading: catsLoading,
    error: catsError,
  } = useCategories();

  const {
    data: activeBudgetsDataRaw,
    isLoading: budgetsLoading,
    error: budgetsError,
  } = useActiveBudgets();

  const {
    data: activeSavingsDataRaw,
    isLoading: savingsLoading,
    error: savingsError,
  } = useActiveSavings();

  const isLoading =
    userLoading ||
    transLoading ||
    catsLoading ||
    budgetsLoading ||
    savingsLoading;

  const error =
    userError || transError || catsError || budgetsError || savingsError;

  // --- INITIAL LOAD: Load session storage time on user change ---
  useEffect(() => {
    if (user?.id) {
      const key = ACK_SESSION_KEY + user.id;
      const savedTime = sessionStorage.getItem(key);
      if (savedTime) {
        setLocalSessionAckTime(parseISO(savedTime));
      } else {
        // Use the server time if available, otherwise start null
        const serverTime = user.last_notification_ack_time
          ? parseISO(user.last_notification_ack_time)
          : null;
        setLocalSessionAckTime(serverTime);
      }
    } else {
      setLocalSessionAckTime(null);
    }
  }, [user?.id, user?.last_notification_ack_time]); // Dependency on user ID and server time

  const acknowledgeNotifications = useCallback(
    (value) => {
      setHasUnread(value);

      if (value === false && user?.id) {
        const clickTime = new Date();
        const key = ACK_SESSION_KEY + user.id;

        // 1. Immediate local persistence (SessionStorage) to prevent flicker
        sessionStorage.setItem(key, clickTime.toISOString());
        setLocalSessionAckTime(clickTime);

        acknowledgeNotificationsAPI()
          .then((response) => {
            const acknowledgedTime =
              response.data.data.user.last_notification_ack_time;

            // 2. Update the user context with the guaranteed server time
            setUser((prevUser) => ({
              ...prevUser,
              last_notification_ack_time: acknowledgedTime,
            }));
          })
          .catch((err) => {
            console.error(
              "Failed to acknowledge notifications on server:",
              err
            );
            // Note: The dot won't reappear locally because sessionStorage is set.
            // However, the server value hasn't updated. It will eventually sync.
          });
      }
    },
    [user, setUser]
  );

  const notifications = useMemo(() => {
    const getList = (source) => {
      if (!source) return [];
      if (Array.isArray(source)) return source;
      if (source.data && Array.isArray(source.data)) return source.data;
      return [];
    };

    const userCurrency = user?.currency || "USD";

    const budgetsList = getList(activeBudgetsDataRaw);
    const savingsList = getList(activeSavingsDataRaw);
    const activeBudgetsData = budgetsList;
    const activeSavingsData = savingsList;

    const getBudgetSpent = (budget) => {
      if (budget.total_spent !== undefined && budget.total_spent !== null) {
        return parseFloat(budget.total_spent);
      }
      const spentAmount = getList(transactionsData).reduce((sum, t) => {
        if (t.type === "expense" && t.budget_id == budget.id) {
          return sum + parseFloat(t.amount || 0);
        }
        return sum;
      }, 0);
      return spentAmount;
    };

    const notificationList = [];

    activeSavingsData.forEach((s) => {
      const current = Number(s.current_amount || 0);
      const target = Number(s.target_amount || 1);
      const percent = target > 0 ? (current / target) * 100 : 0;
      const timestamp = s.updated_at || s.created_at;

      if (percent >= 100) {
        notificationList.push({
          id: `s-${s.id}-complete`,
          type: "success",
          message: `Goal **${
            s.name
          }** is Complete! You reached ${formatCurrency(
            target,
            userCurrency
          )}.`,
          timestamp: timestamp,
        });
      } else if (percent >= 85) {
        notificationList.push({
          id: `s-${s.id}-near`,
          type: "warning",
          message: `Goal **${s.name}** is ${percent.toFixed(
            0
          )}% complete. Only ${formatCurrency(
            target - current,
            userCurrency
          )} remaining!`,
          timestamp: timestamp,
        });
      }
    });

    activeBudgetsData.forEach((b) => {
      const spent = getBudgetSpent(b);
      const allocated = Number(b.amount || 0);
      const percent = allocated > 0 ? (spent / allocated) * 100 : 0;
      const timestamp = b.updated_at || b.created_at;

      if (spent > allocated) {
        notificationList.push({
          id: `b-${b.id}-overspent`,
          type: "error",
          message: `**${
            b.name
          }** Budget is Overspent! You are over by ${formatCurrency(
            spent - allocated,
            userCurrency
          )}.`,
          timestamp: timestamp,
        });
      } else if (percent >= 85) {
        notificationList.push({
          id: `b-${b.id}-near`,
          type: "warning",
          message: `**${b.name}** Budget is ${percent.toFixed(
            0
          )}% used. Only ${formatCurrency(
            allocated - spent,
            userCurrency
          )} remaining.`,
          timestamp: timestamp,
        });
      }
    });

    return notificationList.sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
      const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
      return dateB - dateA;
    });
  }, [user, transactionsData, activeBudgetsDataRaw, activeSavingsDataRaw]);

  useEffect(() => {
    // This check is now the single source of truth for the dot state.
    if (userLoading || !user) return;

    // Use the local state for immediate feedback, which is initialized from the server on load.
    const lastAckTime = localSessionAckTime;

    const hasUnacknowledgedNotifications = notifications.some((n) => {
      if (!n.timestamp) return true;
      const notificationTime = parseISO(n.timestamp);

      // Check against the current effective acknowledgment time.
      return !lastAckTime || isAfter(notificationTime, lastAckTime);
    });

    if (hasUnacknowledgedNotifications && notifications.length > 0) {
      setHasUnread(true);
    } else {
      setHasUnread(false);
    }
  }, [notifications, user, userLoading, localSessionAckTime]); // Depend on the stable localSessionAckTime

  const contextValue = useMemo(() => {
    const getList = (source) => {
      if (!source) return [];
      if (Array.isArray(source)) return source;
      if (source.data && Array.isArray(source.data)) return source.data;
      return [];
    };

    const budgetsList = getList(activeBudgetsDataRaw);
    const savingsList = getList(activeSavingsDataRaw);

    const activeBudgetsData = budgetsList;
    const activeSavingsData = savingsList;

    return {
      user,
      transactionsData,
      categoriesData,
      activeBudgetsData,
      activeSavingsData,

      notifications,
      hasUnread,
      setHasUnread: acknowledgeNotifications,
    };
  }, [
    user,
    transactionsData,
    categoriesData,
    activeBudgetsDataRaw,
    activeSavingsDataRaw,
    notifications,
    hasUnread,
    acknowledgeNotifications,
  ]);

  if (isLoading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Unable to Load Data
          </h2>
          <p className="text-gray-600">
            {error.message || "An unexpected error occurred."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

export default DataLoader;
