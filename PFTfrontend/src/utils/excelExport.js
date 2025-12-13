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
  } = data;

  const symbol = "$";
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Finance App";
  workbook.created = new Date();

  // --- THEME COLORS (ARGB format for ExcelJS) ---
  // Matches Tailwind classes: emerald-600, red-600, blue-600, teal-600
  const THEME = {
    emerald: { text: "FF059669", bg: "FFD1FAE5", header: "FF10B981" },
    red: { text: "FFDC2626", bg: "FFFEE2E2", header: "FFEF4444" },
    blue: { text: "FF2563EB", bg: "FFDBEAFE", header: "FF3B82F6" },
    teal: { text: "FF0D9488", bg: "FFCCFBF1", header: "FF14B8A6" },
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
  titleCell.value = "Financial Overview";
  titleCell.font = { size: 18, bold: true, color: { argb: "FF1F2937" } };
  titleCell.alignment = { horizontal: "center" };
  overviewSheet.getRow(1).height = 30;

  // Period Info
  const fromDate = range?.from
    ? new Date(range.from).toLocaleDateString()
    : "Start";
  const toDate = range?.to ? new Date(range.to).toLocaleDateString() : "End";
  const periodText =
    range?.preset === "custom"
      ? `${fromDate} - ${toDate}`
      : (range?.preset || "All Time").replace("_", " ").toUpperCase();

  overviewSheet.mergeCells("A2:E2");
  const dateCell = overviewSheet.getCell("A2");
  dateCell.value = `Report Period: ${periodText}`;
  dateCell.font = { italic: true, color: { argb: "FF6B7280" } };
  dateCell.alignment = { horizontal: "center" };

  overviewSheet.addRow([]); // Spacer

  // --- KEY METRICS TABLE ---
  const metricsHeader = overviewSheet.addRow([
    "Metric",
    "Amount",
    "Status",
    "Notes",
  ]);
  styleHeader(metricsHeader, "gray");

  const metricsData = [
    {
      label: "Total Income",
      amount: stats.income,
      theme: "emerald",
      note: "Total earnings",
    },
    {
      label: "Total Expenses",
      amount: stats.expenses,
      theme: "red",
      note: "Total spending",
    },
    {
      label: "Net Flow",
      amount: stats.net,
      theme: stats.net >= 0 ? "blue" : "red",
      note: stats.net >= 0 ? "Surplus" : "Deficit",
    },
    {
      label: "Total Savings",
      amount: stats.totalSavings,
      theme: "teal",
      note: "Current savings balance",
    },
  ];

  metricsData.forEach((m) => {
    const row = overviewSheet.addRow([
      m.label,
      m.amount,
      m.amount >= 0 ? "Positive" : "Negative",
      m.note,
    ]);

    // Style Amount
    row.getCell(2).numFmt = `"${symbol}"#,##0.00`;
    row.getCell(2).font = { bold: true, color: { argb: THEME[m.theme].text } };

    // Row Background
    row.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: THEME[m.theme].bg },
      };
      cell.border = {
        bottom: { style: "dotted", color: { argb: "FFDDDDDD" } },
      };
    });
  });

  overviewSheet.addRow([]);

  // --- EXPENSE ALLOCATION ---
  overviewSheet.addRow(["Top Expense Categories"]).getCell(1).font = {
    bold: true,
    size: 12,
  };
  const expHeader = overviewSheet.addRow(["Category", "Amount", "% of Total"]);
  styleHeader(expHeader, "red");

  expenseAllocation.forEach((item) => {
    const pct = stats.expenses > 0 ? item.value / stats.expenses : 0;
    const r = overviewSheet.addRow([item.name, item.value, pct]);
    r.getCell(2).numFmt = `"${symbol}"#,##0.00`;
    r.getCell(3).numFmt = "0.00%";
  });

  overviewSheet.columns = [
    { width: 25 },
    { width: 20 },
    { width: 15 },
    { width: 35 },
    { width: 10 },
  ];

  // ============================================================================
  // 2. BUDGETS SHEET (Blue Theme)
  // ============================================================================
  const budgetSheet = workbook.addWorksheet("Budgets");

  const bHeader = budgetSheet.addRow([
    "Budget Name",
    "Category",
    "Allocated",
    "Spent (Period)",
    "Remaining",
    "Status",
    "% Used",
  ]);
  styleHeader(bHeader, "blue");

  budgets.forEach((b) => {
    const row = budgetSheet.addRow([
      b.name,
      b.category,
      b.allocated,
      b.spent,
      b.remaining,
      b.isOver ? "OVERSPENT" : "Under Budget",
      b.percent / 100,
    ]);

    // Formatting
    row.getCell(3).numFmt = `"${symbol}"#,##0.00`;
    row.getCell(4).numFmt = `"${symbol}"#,##0.00`;
    row.getCell(5).numFmt = `"${symbol}"#,##0.00`;
    row.getCell(7).numFmt = "0.0%";

    // Conditional Styling for Overspent
    if (b.isOver) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: THEME.red.bg },
        };
        cell.font = { color: { argb: THEME.red.text } };
      });
      row.getCell(6).font = { bold: true, color: { argb: THEME.red.text } };
    }
  });

  budgetSheet.columns = [
    { width: 20 },
    { width: 20 },
    { width: 15 },
    { width: 18 },
    { width: 15 },
    { width: 15 },
    { width: 10 },
  ];

  // ============================================================================
  // 3. SAVINGS SHEET (Teal Theme)
  // ============================================================================
  const savingsSheet = workbook.addWorksheet("Savings");

  const sHeader = savingsSheet.addRow([
    "Goal Name",
    "Target Amount",
    "Current Amount",
    "Remaining",
    "Progress",
  ]);
  styleHeader(sHeader, "teal");

  savings.forEach((s) => {
    const row = savingsSheet.addRow([
      s.name,
      s.target,
      s.current,
      s.target - s.current,
      s.percent / 100,
    ]);

    row.getCell(2).numFmt = `"${symbol}"#,##0.00`;
    row.getCell(3).numFmt = `"${symbol}"#,##0.00`;
    row.getCell(4).numFmt = `"${symbol}"#,##0.00`;
    row.getCell(5).numFmt = "0.0%";

    // Highlight completed goals
    if (s.percent >= 100) {
      row.getCell(5).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: THEME.teal.bg },
      };
      row.getCell(5).font = { bold: true, color: { argb: THEME.teal.text } };
    }
  });

  savingsSheet.columns = [
    { width: 25 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 12 },
  ];

  // ============================================================================
  // 4. INCOME & EXPENSES (Detailed Sheets)
  // ============================================================================

  // --- INCOME ---
  const incomeSheet = workbook.addWorksheet("Income Details");
  const incHeader = incomeSheet.addRow(["Date", "Category", "Name", "Amount"]);
  styleHeader(incHeader, "emerald");

  income.forEach((t) => {
    const row = incomeSheet.addRow([
      new Date(t.date).toLocaleDateString(),
      t.category_name || "Uncategorized",
      t.name,
      Number(t.amount),
    ]);
    row.getCell(4).numFmt = `"${symbol}"#,##0.00`;
    row.getCell(4).font = { color: { argb: THEME.emerald.text } };
  });
  incomeSheet.columns = [
    { width: 15 },
    { width: 20 },
    { width: 25 },
    { width: 15 },
  ];

  // --- EXPENSES ---
  const expenseSheet = workbook.addWorksheet("Expense Details");
  const expSheetHeader = expenseSheet.addRow([
    "Date",
    "Category",
    "Name",
    "Amount",
  ]);
  styleHeader(expSheetHeader, "red");

  expenses.forEach((t) => {
    const row = expenseSheet.addRow([
      new Date(t.date).toLocaleDateString(),
      t.category_name || "Uncategorized",
      t.name,
      Number(t.amount),
    ]);
    row.getCell(4).numFmt = `"${symbol}"#,##0.00`;
    row.getCell(4).font = { color: { argb: THEME.red.text } };
  });
  expenseSheet.columns = [
    { width: 15 },
    { width: 20 },
    { width: 25 },
    { width: 15 },
  ];

  // ============================================================================
  // DOWNLOAD
  // ============================================================================
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Financial_Report_${range?.preset || "custom"}_${
    new Date().toISOString().split("T")[0]
  }.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
};
