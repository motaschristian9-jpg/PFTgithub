import ExcelJS from "exceljs";

/**
 * Export Full Report to Excel
 * Generates a comprehensive report with both income and expenses
 */
export const exportFullReport = async (
  incomeData,
  expenseData,
  incomeSummary,
  expenseSummary,
  appliedRange,
  symbol = "$"
) => {
  const workbook = new ExcelJS.Workbook();
  const netSavings = incomeSummary.totalIncome - expenseSummary.totalExpenses;

  // ============================================================================
  // FINANCIAL OVERVIEW SHEET (Beautiful Violet Theme)
  // ============================================================================
  const overviewSheet = workbook.addWorksheet("Financial Overview");

  // --- TITLE ROW ---
  overviewSheet.mergeCells("A1:E1");
  const overviewTitle = overviewSheet.getCell("A1");
  overviewTitle.value = "Financial Overview";
  overviewTitle.font = { size: 18, bold: true, color: { argb: "FF7B1FA2" } };
  overviewTitle.alignment = { horizontal: "center", vertical: "center" };
  overviewSheet.getRow(1).height = 25;

  // --- DATE RANGE INFO ---
  const overviewDateRow = overviewSheet.addRow([]);
  overviewDateRow.getCell(1).value = `Report Period: ${
    appliedRange?.from
      ? new Date(appliedRange.from).toLocaleDateString()
      : "All Time"
  } - ${
    appliedRange?.to
      ? new Date(appliedRange.to).toLocaleDateString()
      : "Present"
  }`;
  overviewDateRow.getCell(1).font = {
    italic: true,
    color: { argb: "FF666666" },
  };

  overviewSheet.addRow([]);

  // --- KEY METRICS SECTION ---
  overviewSheet.addRow(["KEY METRICS", "", "", "", ""]);
  overviewSheet.getRow(4).getCell(1).font = {
    bold: true,
    size: 14,
    color: { argb: "FF7B1FA2" },
  };

  overviewSheet.addRow([]);

  // Headers for metrics table
  const metricsHeaderRow = overviewSheet.addRow([
    "Metric",
    "Symbol",
    "Amount",
    "Status",
    "Notes",
  ]);
  metricsHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF9C27B0" },
    };
    cell.alignment = {
      horizontal: "center",
      vertical: "center",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Total Income Row
  const incomeRow = overviewSheet.addRow([
    "Total Income",
    symbol,
    incomeSummary.totalIncome,
    "Received",
    "All income sources combined",
  ]);
  incomeRow.getCell(1).font = { bold: true, color: { argb: "FF1B5E20" } };
  incomeRow.getCell(3).font = { bold: true, color: { argb: "FF2E7D32" } };
  incomeRow.getCell(3).numFmt = '"$"#,##0.00';
  incomeRow.getCell(3).alignment = { horizontal: "right" };
  incomeRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF1F8E9" },
    };
  });

  // Total Expenses Row
  const expenseRow = overviewSheet.addRow([
    "Total Expenses",
    symbol,
    expenseSummary.totalExpenses,
    "Paid",
    "All expense categories combined",
  ]);
  expenseRow.getCell(1).font = { bold: true, color: { argb: "FFC62828" } };
  expenseRow.getCell(3).font = { bold: true, color: { argb: "FFC62828" } };
  expenseRow.getCell(3).numFmt = '"$"#,##0.00';
  expenseRow.getCell(3).alignment = { horizontal: "right" };
  expenseRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFF3E0" },
    };
  });

  // Net Savings Row
  const savingsRow = overviewSheet.addRow([
    "Net Savings",
    symbol,
    netSavings,
    netSavings >= 0 ? "Surplus" : "Deficit",
    netSavings >= 0 ? "Positive cash flow" : "Negative cash flow",
  ]);
  savingsRow.getCell(1).font = { bold: true, color: { argb: "FF7B1FA2" } };
  savingsRow.getCell(3).font = {
    bold: true,
    size: 12,
    color: { argb: netSavings >= 0 ? "FF2E7D32" : "FFC62828" },
  };
  savingsRow.getCell(3).numFmt = '"$"#,##0.00';
  savingsRow.getCell(3).alignment = { horizontal: "right" };
  savingsRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: netSavings >= 0 ? "FFE1BEE7" : "FFFFCCBC" },
    };
  });

  overviewSheet.addRow([]);

  // --- COLUMN WIDTHS ---
  overviewSheet.columns = [
    { width: 20 },
    { width: 8 },
    { width: 18 },
    { width: 15 },
    { width: 30 },
  ];

  // ============================================================================
  // INCOME SHEET (Green Theme)
  // ============================================================================
  const incomeSheet = workbook.addWorksheet("Income Report");

  // --- TITLE ROW ---
  incomeSheet.mergeCells("A1:E1");
  const incomeTitle = incomeSheet.getCell("A1");
  incomeTitle.value = "Income Report";
  incomeTitle.font = { size: 18, bold: true, color: { argb: "FF1B5E20" } };
  incomeTitle.alignment = { horizontal: "center", vertical: "center" };
  incomeSheet.getRow(1).height = 25;

  // --- HEADER ROW ---
  const incomeHeaders = ["Date", "Category", "Description", "Amount", "Status"];
  const incomeHeaderRow = incomeSheet.addRow(incomeHeaders);
  incomeHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4CAF50" },
    };
    cell.alignment = {
      horizontal: "center",
      vertical: "center",
      wrapText: true,
    };
  });

  // --- DATA ROWS ---
  incomeData.forEach((tx) => {
    const row = incomeSheet.addRow([
      new Date(tx.date).toLocaleDateString(),
      tx.category_name || "Uncategorized",
      tx.description || "-",
      parseFloat(tx.amount),
      "Completed",
    ]);

    const amountCell = row.getCell(4);
    amountCell.font = { color: { argb: "FF2E7D32" }, bold: true };
    amountCell.numFmt = '"$"#,##0.00';
    amountCell.alignment = { horizontal: "right" };

    if (row.number % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF1F8E9" },
        };
      });
    }
  });

  incomeSheet.columns = [
    { width: 15 },
    { width: 20 },
    { width: 35 },
    { width: 15 },
    { width: 12 },
  ];

  // ============================================================================
  // EXPENSE SHEET (Red Theme)
  // ============================================================================
  const expenseSheet = workbook.addWorksheet("Expense Report");

  // --- TITLE ROW ---
  expenseSheet.mergeCells("A1:E1");
  const expenseTitle = expenseSheet.getCell("A1");
  expenseTitle.value = "Expense Report";
  expenseTitle.font = { size: 18, bold: true, color: { argb: "FFC62828" } };
  expenseTitle.alignment = { horizontal: "center", vertical: "center" };
  expenseSheet.getRow(1).height = 25;

  // --- HEADER ROW ---
  const expenseHeaders = [
    "Date",
    "Category",
    "Description",
    "Amount",
    "Status",
  ];
  const expenseHeaderRow = expenseSheet.addRow(expenseHeaders);
  expenseHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEF5350" },
    };
    cell.alignment = {
      horizontal: "center",
      vertical: "center",
      wrapText: true,
    };
  });

  // --- DATA ROWS ---
  expenseData.forEach((tx) => {
    const row = expenseSheet.addRow([
      new Date(tx.date).toLocaleDateString(),
      tx.category_name || "Uncategorized",
      tx.description || "-",
      parseFloat(tx.amount),
      "Completed",
    ]);

    const amountCell = row.getCell(4);
    amountCell.font = { color: { argb: "FFC62828" }, bold: true };
    amountCell.numFmt = '"$"#,##0.00';
    amountCell.alignment = { horizontal: "right" };

    if (row.number % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFF3E0" },
        };
      });
    }
  });

  expenseSheet.columns = [
    { width: 15 },
    { width: 20 },
    { width: 35 },
    { width: 15 },
    { width: 12 },
  ];

  // --- EXPORT FILE ---
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Financial_Report_${
    new Date().toISOString().split("T")[0]
  }.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
};
