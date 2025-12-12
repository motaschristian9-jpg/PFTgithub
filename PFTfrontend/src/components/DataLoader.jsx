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
import { useActiveSavings, useSavingsHistory } from "../hooks/useSavings.js";
import { useNotifications } from "../hooks/useNotifications.js";
import { formatCurrency } from "../utils/currency.js";
import { parseISO, isAfter, startOfMonth, endOfMonth, format } from "date-fns";
import { acknowledgeNotificationsAPI } from "../api/auth";

const DataContext = createContext(null);

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};

const ACK_SESSION_KEY = "notifyAck_";

const DataLoader = ({ children }) => {
  const [hasUnread, setHasUnread] = useState(false);
  const [localSessionAckTime, setLocalSessionAckTime] = useState(null);

  const { user, isLoading: userLoading, error: userError, setUser } = useAuth();

  const {
    data: transactionsData,
    isLoading: transLoading,
    error: transError,
  } = useTransactions({ page: 1, limit: 15 });

  // --- PRE-FETCH REPORT DATA (Instant Load) ---
  const today = useMemo(() => new Date(), []);
  const reportParams = useMemo(() => ({
    all: true,
    start_date: format(startOfMonth(today), "yyyy-MM-dd"),
    end_date: format(endOfMonth(today), "yyyy-MM-dd"),
  }), [today]);

  // We don't use the data here, but calling the hook caches it for the Reports Page
  useTransactions(reportParams);
  // --------------------------------------------

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

  const { data: historySavingsRaw } = useSavingsHistory(1, {
    sortBy: "updated_at",
    sortDir: "desc",
  });

  const isLoading =
    userLoading ||
    transLoading ||
    catsLoading ||
    budgetsLoading ||
    savingsLoading;

  const error =
    userError || transError || catsError || budgetsError || savingsError;

  useEffect(() => {
    if (user?.id) {
      const key = ACK_SESSION_KEY + user.id;
      const savedTime = sessionStorage.getItem(key);
      if (savedTime) {
        setLocalSessionAckTime(parseISO(savedTime));
      } else {
        const serverTime = user.last_notification_ack_time
          ? parseISO(user.last_notification_ack_time)
          : null;
        setLocalSessionAckTime(serverTime);
      }
    } else {
      setLocalSessionAckTime(null);
    }
  }, [user?.id, user?.last_notification_ack_time]);

  const acknowledgeNotifications = useCallback(
    (value) => {
      setHasUnread(value);

      if (value === false && user?.id) {
        const clickTime = new Date();
        const key = ACK_SESSION_KEY + user.id;

        sessionStorage.setItem(key, clickTime.toISOString());
        setLocalSessionAckTime(clickTime);

        acknowledgeNotificationsAPI()
          .then((response) => {
            const acknowledgedTime =
              response.data.data.user.last_notification_ack_time;

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
          });
      }
    },
    [user, setUser]
  );

  const { data: backendNotifications } = useNotifications();

  const notifications = useMemo(() => {
    if (!backendNotifications) return [];

    return backendNotifications.map((n) => {
      const data = n.data || {};
      let type = "info";
      
      if (data.type === "budget_reached") type = "budget-error";
      if (data.type === "budget_warning") type = "budget-warning";
      if (data.type === "saving_completed") type = "savings-success";
      if (data.type === "saving_warning") type = "savings-warning";

      return {
        id: n.id,
        type: type,
        message: data.message || "New notification",
        timestamp: n.created_at,
        read_at: n.read_at
      };
    });
  }, [backendNotifications]);

  useEffect(() => {
    if (userLoading || !user) return;

    const lastAckTime = localSessionAckTime;

    const hasUnacknowledgedNotifications = notifications.some((n) => {
      if (!n.timestamp) return true;
      const notificationTime = parseISO(n.timestamp);
      return !lastAckTime || isAfter(notificationTime, lastAckTime);
    });

    if (hasUnacknowledgedNotifications && notifications.length > 0) {
      setHasUnread(true);
    } else {
      setHasUnread(false);
    }
  }, [notifications, user, userLoading, localSessionAckTime]);

  const contextValue = useMemo(() => {
    const getList = (source) => {
      if (!source) return [];
      if (Array.isArray(source)) return source;
      if (source.data && Array.isArray(source.data)) return source.data;
      return [];
    };

    const budgetsList = getList(activeBudgetsDataRaw);
    const savingsList = getList(activeSavingsDataRaw);
    const historyList = getList(historySavingsRaw); // Process history list

    return {
      user,
      transactionsData,
      categoriesData,
      activeBudgetsData: budgetsList,
      activeSavingsData: savingsList,
      historySavingsData: historyList, // Expose history
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
