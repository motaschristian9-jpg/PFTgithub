import { useMemo } from "react";
import { useDataContext } from "../components/DataLoader";

export const useDashboardStats = () => {
  const { transactionsData, activeBudgetsData, activeSavingsData } = useDataContext();

  const transactions = useMemo(() => transactionsData?.data || [], [transactionsData]);
  const activeBudgets = useMemo(() => activeBudgetsData || [], [activeBudgetsData]);
  const savingsList = useMemo(() => activeSavingsData || [], [activeSavingsData]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [transactions]);

  const stats = useMemo(() => {
    const income = transactionsData?.totals?.income || 0;
    const expenses = transactionsData?.totals?.expenses || 0;

    const totalSavings = savingsList.reduce(
      (sum, s) => sum + Number(s.current_amount || 0),
      0
    );

    return {
      income,
      expenses,
      net: income - expenses,
      totalSavings,
    };
  }, [transactionsData, savingsList]);

  const barChartData = useMemo(
    () => [
      { name: "Income", amount: stats.income, color: "#10B981" },
      { name: "Expense", amount: stats.expenses, color: "#EF4444" },
      { name: "Saved", amount: stats.totalSavings, color: "#3B82F6" },
    ],
    [stats]
  );

  const budgetProgressData = useMemo(() => {
    return activeBudgets.map((b) => {
      const allocated = Number(b.amount || 0);
      // Trust backend total_spent
      const spent = Number(b.total_spent || 0);

      const remaining = allocated - spent;
      const rawPercent = allocated > 0 ? (spent / allocated) * 100 : 0;

      let statusColor = "bg-emerald-500";
      let statusText = "text-emerald-600";
      let label = "On Track";

      if (rawPercent > 100) {
        statusColor = "bg-red-600";
        statusText = "text-red-600";
        label = "Overspent";
      } else if (rawPercent >= 90) {
        statusColor = "bg-red-500";
        statusText = "text-red-500";
        label = "Near Limit";
      } else if (rawPercent >= 75) {
        statusColor = "bg-amber-500";
        statusText = "text-amber-600";
        label = "Watch";
      }

      return {
        ...b,
        spent,
        remaining,
        percent: rawPercent,
        widthPercent: Math.min(rawPercent, 100),
        statusColor,
        statusText,
        label,
      };
    });
  }, [activeBudgets]);

  const processedSavings = useMemo(() => {
    return savingsList.map((s) => {
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
    });
  }, [savingsList]);

  const lineChartData = useMemo(() => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });

    const dailyStats = last7Days.map((date) => ({
      date,
      name: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      income: 0,
      expense: 0,
      savings: 0,
    }));

    transactions.forEach((t) => {
      const tDate = t.date.split("T")[0];
      const dayStat = dailyStats.find((d) => d.date === tDate);
      if (dayStat) {
        if (t.type === "income") {
          dayStat.income += Number(t.amount);
        } else if (t.type === "expense") {
          // Check if it's a savings contribution
          if (t.saving_goal_id) {
            dayStat.savings += Number(t.amount);
          } else {
            dayStat.expense += Number(t.amount);
          }
        }
      }
    });

    return dailyStats;
  }, [transactions]);

  return {
    recentTransactions,
    stats,
    barChartData, // Keeping this for backward compatibility if needed, but we'll use lineChartData
    lineChartData,
    budgetProgressData,
    processedSavings,
  };
};
