import React from "react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};
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
    <motion.div
      className="space-y-6 p-6 lg:p-8 max-w-[1600px] mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome back, <span className="font-semibold text-gray-900 dark:text-gray-200">{user?.name}</span>
          </p>
        </div>
        <div className="mt-4 flex items-center gap-2 sm:mt-0">
           <span className="text-xs font-medium text-gray-400 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
           </span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants}>
        <DashboardStats stats={stats} userCurrency={userCurrency} />
      </motion.div>

      {/* Charts & Activity Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <DashboardCharts data={lineChartData} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <RecentTransactions 
            transactions={recentTransactions} 
            userCurrency={userCurrency} 
          />
        </motion.div>
      </div>

      {/* Budgets & Savings */}
      <motion.div variants={itemVariants} className="space-y-6">
        <ActiveBudgets 
          budgets={budgetProgressData} 
          userCurrency={userCurrency} 
        />
        <SavingsGoals 
          savings={processedSavings} 
          userCurrency={userCurrency} 
        />
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
