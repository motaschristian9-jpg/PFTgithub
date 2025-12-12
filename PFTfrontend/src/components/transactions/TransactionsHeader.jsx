import React from "react";
import { Plus, Upload, Download } from "lucide-react";

const TransactionsHeader = ({ onAddTransaction, onImport, onExport }) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Transactions
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage and track your financial history
        </p>
      </div>

      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl gap-1">
          <button
            onClick={onImport}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all"
            title="Import from CSV"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button
            onClick={onExport}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all"
            title="Export to CSV"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={onAddTransaction}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus size={18} />
            <span>Add Transaction</span>
          </button>
      </div>
    </div>
  );
};

export default TransactionsHeader;
