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
import { showSuccess, showError } from "../utils/swal";

export const useReportsPageLogic = () => {
  const [datePreset, setDatePreset] = useState("this_month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    user,
    transactionsData,
    activeBudgetsData,
    activeSavingsData,
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
      setStartDate(start);
      setEndDate(end);
    }
  }, [datePreset]);

  const categoryLookup = useMemo(() => {
    const map = {};
    if (categoriesData?.data && Array.isArray(categoriesData.data)) {
      categoriesData.data.forEach((cat) => {
        map[cat.id] = cat.name;
      });
    }
    return map;
  }, [categoriesData]);

  const allTransactions = useMemo(
    () => transactionsData?.data || [],
    [transactionsData]
  );

  const filteredTransactions = useMemo(() => {
    if (!startDate && !endDate) return allTransactions;

    return allTransactions.filter((t) => {
      if (!t.date && !t.transaction_date) return false;
      const dateStr = t.date || t.transaction_date;

      const txDate = parseISO(dateStr);
      const start = startDate ? parseISO(startDate) : new Date("1900-01-01");
      const end = endDate ? parseISO(endDate) : new Date("2100-01-01");
      end.setHours(23, 59, 59, 999);

      return isWithinInterval(txDate, { start, end });
    });
  }, [allTransactions, startDate, endDate]);

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

  const barChartData = useMemo(
    () => [
      { name: "Income", amount: stats.income, color: "#10B981" },
      { name: "Expense", amount: stats.expenses, color: "#EF4444" },
    ],
    [stats]
  );

  const budgetCompliance = useMemo(() => {
    const spendingMap = {};
    allTransactions.forEach((t) => {
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
            : spendingMap[b.id] || 0;

        const remaining = allocated - spent;
        const rawPercent = allocated > 0 ? (spent / allocated) * 100 : 0;
        const isOver = spent > allocated;
        const catName = categoryLookup[b.category_id] || "Uncategorized";

        return {
          ...b,
          category: catName,
          spent: spent,
          allocated: allocated,
          remaining: remaining,
          percent: Math.min(rawPercent, 100),
          isOver: isOver,
        };
      })
      .sort((a, b) => a.remaining - b.remaining);
  }, [filteredBudgets, allTransactions, categoryLookup]);

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
      showSuccess("Exported!", "Financial report downloaded successfully.");
    } catch (error) {
      console.error("Export failed:", error);
      showError("Export Failed", "Could not generate the Excel report.");
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
    handleExport,
  };
};
