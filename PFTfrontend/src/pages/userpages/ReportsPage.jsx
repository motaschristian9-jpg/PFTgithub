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
    budgetCompliance,
    handleExport,
  } = useReportsPageLogic();

  const userCurrency = user?.currency || "USD";

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <ReportsHeader onExport={handleExport} />

      <ReportsStats stats={stats} userCurrency={userCurrency} />

      <ReportsFilters
        datePreset={datePreset}
        setDatePreset={setDatePreset}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      <ReportsCharts
        expenseChartData={expenseChartData}
        barChartData={barChartData}
        userCurrency={userCurrency}
      />

      <BudgetComplianceTable
        budgetCompliance={budgetCompliance}
        userCurrency={userCurrency}
      />
    </div>
  );
}
