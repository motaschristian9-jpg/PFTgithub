/**
 * Export Full Report to Excel
 * Generates a comprehensive report with Income, Expenses, Budgets, and Savings.
 * Uses ExcelJS to apply specific styling matching the application theme.
 */
export const exportFullReport = async (data) => {
  // Dynamically import ExcelJS so it keeps the main bundle small
  const { default: ExcelJS } = await import("exceljs");

  const {
    income,
    expenses,
    budgets,
    savings,
    stats,
    range,
    expenseAllocation,
    savingsMetrics,
    userCurrency
  } = data;

  const symbol = userCurrency || "$";
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "PFT Money Tracker";
  workbook.created = new Date();

  // --- THEME COLORS (ARGB format for ExcelJS) ---
  const THEME = {
    emerald: { text: "FF059669", bg: "FFD1FAE5", header: "FF10B981" },
    red: { text: "FFDC2626", bg: "FFFEE2E2", header: "FFEF4444" },
    blue: { text: "FF2563EB", bg: "FFDBEAFE", header: "FF3B82F6" },
    teal: { text: "FF0D9488", bg: "FFCCFBF1", header: "FF14B8A6" },
    violet: { text: "FF7C3AED", bg: "FFEDE9FE", header: "FF8B5CF6" },
    gray: { text: "FF374151", bg: "FFF3F4F6", header: "FF6B7280" },
    white: "FFFFFFFF",
  };

  // Helper to style header rows
  const styleHeader = (row, colorKey) => {
    row.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: THEME.white }, size: 11 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: THEME[colorKey].header },
      };
      cell.alignment = { horizontal: "center", vertical: "center" };
      cell.border = {
        top: { style: "thin", color: { argb: "FFCCCCCC" } },
        left: { style: "thin", color: { argb: "FFCCCCCC" } },
        bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
        right: { style: "thin", color: { argb: "FFCCCCCC" } },
      };
    });
  };

  // ============================================================================
  // 1. FINANCIAL OVERVIEW SHEET
  // ============================================================================
  const overviewSheet = workbook.addWorksheet("Financial Overview");

  // Title
  overviewSheet.mergeCells("A1:E1");
  const titleCell = overviewSheet.getCell("A1");
  titleCell.value = "FINANCIAL PERFORMANCE REPORT";
  titleCell.font = { size: 18, bold: true, color: { argb: "FF111827" } };
  titleCell.alignment = { horizontal: "center", vertical: "center" };
  overviewSheet.getRow(1).height = 40;

  // Period Info
  const fromDate = range?.from ? new Date(range.from).toLocaleDateString() : "Start";
  const toDate = range?.to ? new Date(range.to).toLocaleDateString() : "End";
  const periodText = range?.preset === "custom" 
    ? `${fromDate} - ${toDate}` 
    : (range?.preset || "All Time").replace("_", " ").toUpperCase();

  overviewSheet.mergeCells("A2:E2");
  const dateCell = overviewSheet.getCell("A2");
  dateCell.value = `Analysis Period: ${periodText}`;
  dateCell.font = { italic: true, color: { argb: "FF6B7280" }, size: 11 };
  dateCell.alignment = { horizontal: "center" };
  overviewSheet.getRow(2).height = 20;

  overviewSheet.addRow([]); // Spacer

  // --- 1.1 KEY PERFORMANCE INDICATORS ---
  const kpiHeader = overviewSheet.addRow(["Key Metric", "Value", "Indicator", "Context"]);
  styleHeader(kpiHeader, "gray");
  overviewSheet.getRow(kpiHeader.number).height = 20;

  const kpis = [
    { label: "Total Income", amount: stats.income, theme: "emerald", note: "Gross Earnings" },
    { label: "Total Expenses", amount: stats.expenses, theme: "red", note: "Total Outflow" },
    { label: "Net Cash Flow", amount: stats.net, theme: stats.net >= 0 ? "emerald" : "red", note: stats.net >= 0 ? "Surplus" : "Deficit" },
  ];

  kpis.forEach((k) => {
    const row = overviewSheet.addRow([k.label, k.amount, k.amount >= 0 ? "↗" : "↘", k.note]);
    row.getCell(2).numFmt = `"${symbol}"#,##0.00`;
    row.getCell(2).font = { bold: true, color: { argb: THEME[k.theme].text } };
    row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: THEME[k.theme].bg } };
        cell.border = { bottom: { style: "thin", color: { argb: "FFFFFFFF" } } };
    });
  });

  overviewSheet.addRow([]); // Spacer

  // --- 1.2 SAVINGS PERFORMANCE ---
  const savingsTitleRow = overviewSheet.addRow(["SAVINGS PERFORMANCE"]);
  savingsTitleRow.getCell(1).font = { bold: true, size: 12, color: { argb: THEME.teal.text } };
  
  const savHeader = overviewSheet.addRow(["Metric", "Result", "Efficiency", "Detail"]);
  styleHeader(savHeader, "teal");

  const savMetricsSet = [
    { label: "Total Period Savings", value: savingsMetrics?.totalSaved || 0, type: "currency", eff: "High", detail: "Contributions in period" },
    { label: "Savings Rate", value: (savingsMetrics?.savingsRate || 0) / 100, type: "percent", eff: (savingsMetrics?.savingsRate > 20 ? "Excellent" : "Targeting"), detail: "% of income saved" },
    { label: "Top Performing Goal", value: savingsMetrics?.topGoal?.name || "N/A", type: "text", eff: "-", detail: `Current: ${symbol}${savingsMetrics?.topGoal?.amount || 0}` },
  ];

  savMetricsSet.forEach(m => {
      const row = overviewSheet.addRow([m.label, m.value, m.eff, m.detail]);
      if (m.type === "currency") row.getCell(2).numFmt = `"${symbol}"#,##0.00`;
      if (m.type === "percent") row.getCell(2).numFmt = "0.0%";
      row.getCell(2).font = { bold: true, color: { argb: THEME.teal.text } };
      row.eachCell(c => {
          c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: THEME.teal.bg } };
          c.border = { bottom: { style: "thin", color: { argb: "FFFFFFFF" } } };
      });
  });

  overviewSheet.addRow([]); // Spacer

  // --- 1.3 BUDGET COMPLIANCE SUMMARY ---
  const budgetTitleRow = overviewSheet.addRow(["BUDGET COMPLIANCE SUMMARY"]);
  budgetTitleRow.getCell(1).font = { bold: true, size: 12, color: { argb: THEME.violet.text } };

  const budHeader = overviewSheet.addRow(["Metric", "Allocated", "Actual Spent", "Variance"]);
  styleHeader(budHeader, "violet");

  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const variance = totalAllocated - totalSpent;

  const budRow = overviewSheet.addRow(["Overall Budget Status", totalAllocated, totalSpent, variance]);
  budRow.getCell(2).numFmt = `"${symbol}"#,##0.00`;
  budRow.getCell(3).numFmt = `"${symbol}"#,##0.00`;
  budRow.getCell(4).numFmt = `"${symbol}"#,##0.00`;
  budRow.getCell(4).font = { bold: true, color: { argb: variance >= 0 ? THEME.emerald.text : THEME.red.text } };
  budRow.eachCell(c => {
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: THEME.violet.bg } };
  });

  overviewSheet.addRow([]); // Spacer

  // --- 1.4 EXPENSE ALLOCATION ---
  const allocationTitleRow = overviewSheet.addRow(["TOP EXPENSE ALLOCATION"]);
  allocationTitleRow.getCell(1).font = { bold: true, size: 12, color: { argb: THEME.red.text } };
  const expHeader = overviewSheet.addRow(["Category", "Amount", "% of Total Spending", "Contribution"]);
  styleHeader(expHeader, "red");

  expenseAllocation.forEach((item) => {
    const pct = stats.expenses > 0 ? item.value / stats.expenses : 0;
    const r = overviewSheet.addRow([item.name, item.value, pct, pct > 0.3 ? "Major" : "Controlled"]);
    r.getCell(2).numFmt = `"${symbol}"#,##0.00`;
    r.getCell(3).numFmt = "0.0%";
  });

  overviewSheet.columns = [
    { width: 30 }, { width: 20 }, { width: 15 }, { width: 35 }, { width: 10 }
  ];

  // ============================================================================
  // 2. BUDGETS SHEET
  // ============================================================================
  const budgetSheet = workbook.addWorksheet("Budgets");
  const bHeader = budgetSheet.addRow(["Budget Name", "Category", "Allocated", "Spent", "Remaining", "Status", "% Used"]);
  styleHeader(bHeader, "blue");

  budgets.forEach((b) => {
    const row = budgetSheet.addRow([b.name, b.category, b.allocated, b.spent, b.remaining, b.isOver ? "OVERSPENT" : "Under Budget", b.percent / 100]);
    row.getCell(3).numFmt = `"${symbol}"#,##0.00`;
    row.getCell(4).numFmt = `"${symbol}"#,##0.00`;
    row.getCell(5).numFmt = `"${symbol}"#,##0.00`;
    row.getCell(7).numFmt = "0.0%";

    if (b.isOver) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: THEME.red.bg } };
        cell.font = { color: { argb: THEME.red.text } };
      });
      row.getCell(6).font = { bold: true };
    }
  });
  budgetSheet.columns = [{ width: 25 }, { width: 20 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 10 }];

  // ============================================================================
  // 3. SAVINGS SHEET
  // ============================================================================
  const savingsSheet = workbook.addWorksheet("Savings");
  const sHeader = savingsSheet.addRow(["Goal Name", "Target Amount", "Current Amount", "Remaining", "Progress"]);
  styleHeader(sHeader, "teal");

  savings.forEach((s) => {
    const row = savingsSheet.addRow([s.name, s.target, s.current, s.target - s.current, s.percent / 100]);
    row.getCell(2).numFmt = `"${symbol}"#,##0.00`;
    row.getCell(3).numFmt = `"${symbol}"#,##0.00`;
    row.getCell(4).numFmt = `"${symbol}"#,##0.00`;
    row.getCell(5).numFmt = "0.0%";

    if (s.percent >= 100) {
      row.getCell(5).fill = { type: "pattern", pattern: "solid", fgColor: { argb: THEME.teal.bg } };
      row.getCell(5).font = { bold: true, color: { argb: THEME.teal.text } };
    }
  });
  savingsSheet.columns = [{ width: 30 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 15 }];

  // ============================================================================
  // 4. DETAILED LOGS (Income & Expenses)
  // ============================================================================
  const incomeSheet = workbook.addWorksheet("Income Details");
  styleHeader(incomeSheet.addRow(["Date", "Category", "Name", "Amount"]), "emerald");
  income.forEach(t => {
    const r = incomeSheet.addRow([new Date(t.date).toLocaleDateString(), t.category_name || "Uncategorized", t.name, Number(t.amount)]);
    r.getCell(4).numFmt = `"${symbol}"#,##0.00`;
    r.getCell(4).font = { color: { argb: THEME.emerald.text } };
  });
  incomeSheet.columns = [{ width: 15 }, { width: 20 }, { width: 30 }, { width: 20 }];

  const expenseSheet = workbook.addWorksheet("Expense Details");
  styleHeader(expenseSheet.addRow(["Date", "Category", "Name", "Amount"]), "red");
  expenses.forEach(t => {
    const r = expenseSheet.addRow([new Date(t.date).toLocaleDateString(), t.category_name || "Uncategorized", t.name, Number(t.amount)]);
    r.getCell(4).numFmt = `"${symbol}"#,##0.00`;
    r.getCell(4).font = { color: { argb: THEME.red.text } };
  });
  expenseSheet.columns = [{ width: 15 }, { width: 20 }, { width: 30 }, { width: 20 }];

  // ============================================================================
  // DOWNLOAD
  // ============================================================================
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `PFT_Financial_Report_${range?.preset || "custom"}_${new Date().toISOString().split("T")[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
