
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

import ReportsHeader from "../../components/reports/ReportsHeader.jsx";
import ReportsStats from "../../components/reports/ReportsStats.jsx";
import ReportsFilters from "../../components/reports/ReportsFilters.jsx";
import ReportsCharts from "../../components/reports/ReportsCharts.jsx";
import BudgetComplianceTable from "../../components/reports/BudgetComplianceTable.jsx";

import { useReportsPageLogic } from "../../hooks/useReportsPageLogic";

export default function ReportsPage() {
  const {
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
    savingsTrendData,
    savingsMetrics,
    budgetCompliance,
    handleExport,
  } = useReportsPageLogic();

  const userCurrency = user?.currency || "USD";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto"
    >
      <motion.div variants={itemVariants}>
        <ReportsHeader handleExport={handleExport} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <ReportsStats stats={stats} userCurrency={userCurrency} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <ReportsFilters
          datePreset={datePreset}
          setDatePreset={setDatePreset}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <ReportsCharts
          expenseChartData={expenseChartData}
          barChartData={barChartData}
          savingsMetrics={savingsMetrics}
          userCurrency={userCurrency}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <BudgetComplianceTable
          budgetCompliance={budgetCompliance}
          userCurrency={userCurrency}
        />
      </motion.div>
    </motion.div>
  );
}
