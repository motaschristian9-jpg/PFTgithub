import React from "react";
import { useDataContext } from "../../components/DataLoader.jsx";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import DashboardStats from "../../components/dashboard/DashboardStats";
import DashboardCharts from "../../components/dashboard/DashboardCharts";
import RecentTransactions from "../../components/dashboard/RecentTransactions";
import ActiveBudgets from "../../components/dashboard/ActiveBudgets";
import SavingsGoals from "../../components/dashboard/SavingsGoals";

const Dashboard = () => {
  const { user } = useDataContext();
  const userCurrency = user?.currency || "USD";

  const {
    recentTransactions,
    stats,
    barChartData,
    lineChartData,
    budgetProgressData,
    processedSavings,
  } = useDashboardStats();

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Welcome back, <span className="font-semibold text-gray-900">{user?.name}</span>
          </p>
        </div>
        <div className="mt-4 flex items-center gap-2 sm:mt-0">
           <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
           </span>
        </div>
      </div>

      {/* Stats Grid */}
      <DashboardStats stats={stats} userCurrency={userCurrency} />

      {/* Charts & Activity Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardCharts data={lineChartData} />
        </div>
        <div>
          <RecentTransactions 
            transactions={recentTransactions} 
            userCurrency={userCurrency} 
          />
        </div>
      </div>

      {/* Budgets & Savings */}
      <div className="space-y-6">
        <ActiveBudgets 
          budgets={budgetProgressData} 
          userCurrency={userCurrency} 
        />
        <SavingsGoals 
          savings={processedSavings} 
          userCurrency={userCurrency} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
