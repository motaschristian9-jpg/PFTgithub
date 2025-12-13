import { useState, useMemo, useEffect } from "react";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { useDataContext } from "../components/DataLoader";
import { exportFullReport } from "../utils/excelExport";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
} from "./useTransactions";
import { keepPreviousData } from "@tanstack/react-query";
import { confirmDelete, showSuccess, showError } from "../utils/swal";
import { useTranslation } from "react-i18next";

export const useReportsPageLogic = () => {
  const { t } = useTranslation();
  const [datePreset, setDatePreset] = useState("this_month");
  
  // Initialize with correct default dates to match DataLoader immediately
  const [startDate, setStartDate] = useState(() => 
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(() => 
    format(endOfMonth(new Date()), "yyyy-MM-dd")
  );

  const {
    user,
    activeBudgetsData,
    activeSavingsData,
    historySavingsData,
    categoriesData,
  } = useDataContext();

  useEffect(() => {
    const today = new Date();
    let start = "";
    let end = "";

    if (datePreset === "this_month") {
      start = format(startOfMonth(today), "yyyy-MM-dd");
      end = format(endOfMonth(today), "yyyy-MM-dd");
    } else if (datePreset === "last_month") {
      const lastMonthDate = subMonths(today, 1);
      start = format(startOfMonth(lastMonthDate), "yyyy-MM-dd");
      end = format(endOfMonth(lastMonthDate), "yyyy-MM-dd");
    } else if (datePreset === "all") {
      start = "";
      end = "";
    }

    if (datePreset !== "custom") {
       if (start !== startDate || end !== endDate) {
          console.log("[Reports] Preset changed, updating dates:", start, end);
          setStartDate(start);
          setEndDate(end);
       }
    }
  }, [datePreset, startDate, endDate]);



  const categoryLookup = useMemo(() => {
    const map = {};
    if (categoriesData?.data && Array.isArray(categoriesData.data)) {
      categoriesData.data.forEach((cat) => {
        map[cat.id] = cat.name;
      });
    }
    return map;
  }, [categoriesData]);

  // --- Data Fetching ---
  const queryParams = useMemo(() => {
    const params = { all: true }; // Always fetch all (no pagination) for reports

    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    // Only fetch if we have a valid range or "all" preset
    // (startDate/endDate are set by useEffect on mount, so initially might be empty string)
    // If they are empty and preset is NOT 'all', we might want to wait or fetch nothing?
    // But 'this_month' is default. 
    return params;
  }, [startDate, endDate]);

  const { data: reportData, isLoading: reportLoading } = useTransactions(queryParams, {
    placeholderData: keepPreviousData,
  });

  const filteredTransactions = useMemo(() => {
    return reportData?.data || [];
  }, [reportData]);

  const filteredBudgets = useMemo(() => {
    if (!startDate && !endDate) return activeBudgetsData || [];

    return (activeBudgetsData || []).filter((b) => {
      if (!b.created_at) return true;
      const createdDate = parseISO(b.created_at);
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      end.setHours(23, 59, 59, 999);

      return isWithinInterval(createdDate, { start, end });
    });
  }, [activeBudgetsData, startDate, endDate]);

  const processedSavings = useMemo(() => {
    const list = Array.isArray(activeSavingsData) ? activeSavingsData : [];

    const filteredList = list.filter((s) => {
      if (!s.created_at) return true;
      const createdDate = parseISO(s.created_at);
      const start = startDate ? parseISO(startDate) : new Date("1900-01-01");
      const end = endDate ? parseISO(endDate) : new Date("2100-01-01");
      end.setHours(23, 59, 59, 999);

      return isWithinInterval(createdDate, { start, end });
    });

    const totalSavings = filteredList.reduce(
      (sum, s) => sum + Number(s.current_amount || 0),
      0
    );

    return {
      list: filteredList.map((s) => {
        const current = Number(s.current_amount || 0);
        const target = Number(s.target_amount || 1);
        const percent = (current / target) * 100;
        return {
          ...s,
          current,
          target,
          percent,
          widthPercent: Math.min(percent, 100),
        };
      }),
      totalSavings,
    };
  }, [activeSavingsData, startDate, endDate]);

  const stats = useMemo(() => {
    let income = 0;
    let expenses = 0;

    filteredTransactions.forEach((t) => {
      const amt = Number(t.amount || 0);
      if (t.type === "income") income += amt;
      if (t.type === "expense") expenses += amt;
    });

    const net = income - expenses;
    const totalSavings = processedSavings.totalSavings;

    return {
      income,
      expenses,
      net,
      totalSavings,
    };
  }, [filteredTransactions, processedSavings]);

  const expenseChartData = useMemo(() => {
    const map = {};
    filteredTransactions.forEach((t) => {
      if (t.type === "expense") {
        const catName = categoryLookup[t.category_id] || "Uncategorized";
        map[catName] = (map[catName] || 0) + Number(t.amount || 0);
      }
    });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredTransactions, categoryLookup]);

  const savingsMetrics = useMemo(() => {
    // 1. Filter for savings-related transactions (Deposits)
    const savingsTx = filteredTransactions.filter(
      (t) => t.type === "expense" && t.saving_goal_id
    );

    // 2. Calculate Total Saved
    const totalSaved = savingsTx.reduce((sum, t) => sum + Number(t.amount || 0), 0);

    // 3. Calculate Savings Rate
    // Avoid division by zero
    const income = stats.income || 1; 
    const savingsRate = (totalSaved / income) * 100;

    // 4. Find Top Goal (Highest Current Value, independent of period contributions)
    let topGoal = null;
    let maxAmount = -1;
    
    // Combine active and history to find true Top Goal (like Savings Page)
    const allSavings = [
        ...(activeSavingsData && Array.isArray(activeSavingsData) ? activeSavingsData : []),
        ...(historySavingsData && Array.isArray(historySavingsData) ? historySavingsData : [])
    ];

    allSavings.forEach(s => {
        const current = Number(s.current_amount || 0);
        if (current > maxAmount) {
            maxAmount = current;
            topGoal = { name: s.name, amount: current };
        }
    });

    return {
        totalSaved,
        savingsRate,
        topGoal,
        hasActivity: savingsTx.length > 0
    };
  }, [filteredTransactions, activeSavingsData, stats.income]);

  const barChartData = useMemo(
    () => [
      { name: "Income", amount: stats.income, color: "#10B981" }, // Emerald-500
      { name: "Expense", amount: stats.expenses, color: "#F43F5E" }, // Rose-500
    ],
    [stats]
  );

  const budgetCompliance = useMemo(() => {
    const spendingMap = {};
    // Use filteredTransactions which now contains the FULL server dataset for the range
    filteredTransactions.forEach((t) => {
      if (t.type === "expense" && t.budget_id) {
        spendingMap[t.budget_id] =
          (spendingMap[t.budget_id] || 0) + Number(t.amount || 0);
      }
    });

    return filteredBudgets
      .map((b) => {
        const allocated = Number(b.amount || 0);
        const spent =
          b.total_spent !== undefined
            ? Number(b.total_spent)
            : spendingMap[b.id] || 0; // Use map if total_spent misses 
            // Note: server's total_spent might be "all time"? 
            // If we want "this month compliance", we MUST use spendingMap from the period's transactions.
            // But let's check: users usually want budget compliance for the budget's OWN period.
            // Reports Page "Budget Compliance" table usually implies "Did I stick to the budget IN THIS PERIOD?"
            // OR "How are my Active Budgets doing?".
            // The existing logic mixes them. 
            // Let's rely on spendingMap derived from the *date-filtered* transactions.
            // This effectively shows "Spending on this budget *within this report period*".
        
        // Override spent with our calculated period spent for consistency with the report range
        const periodSpent = spendingMap[b.id] || 0;
        
        const remaining = allocated - periodSpent;
        const rawPercent = allocated > 0 ? (periodSpent / allocated) * 100 : 0;
        const isOver = periodSpent > allocated;
        const catName = categoryLookup[b.category_id] || "Uncategorized";

        return {
          ...b,
          category: catName,
          spent: periodSpent,
          allocated: allocated,
          remaining: remaining,
          percent: Math.min(rawPercent, 100),
          isOver: isOver,
        };
      })
      .sort((a, b) => a.remaining - b.remaining);
  }, [filteredBudgets, filteredTransactions, categoryLookup]);

  const handleExport = async () => {
    try {
      const exportData = {
        income: filteredTransactions.filter((t) => t.type === "income"),
        expenses: filteredTransactions.filter((t) => t.type === "expense"),
        budgets: budgetCompliance,
        savings: processedSavings.list,
        stats: stats,
        range: {
          from: startDate,
          to: endDate,
          preset: datePreset,
        },
        expenseAllocation: expenseChartData,
      };

      await exportFullReport(exportData);
      showSuccess(t('app.swal.exportSuccess'), t('app.swal.exportSuccessMsg'));
    } catch (error) {
      console.error("Export failed:", error);
      showError(t('app.swal.exportFailed'), t('app.swal.exportFailedMsg'));
    }
  };

  return {
    datePreset,
    setDatePreset,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    user,
    stats,
    expenseChartData,
    barChartData,
    budgetCompliance,
    processedSavings,
    savingsMetrics,
    handleExport,
  };
};
