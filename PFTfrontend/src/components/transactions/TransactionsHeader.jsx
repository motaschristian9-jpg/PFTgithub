import React from "react";
import { Plus } from "lucide-react";

const TransactionsHeader = ({ onAddTransaction }) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Transactions
        </h1>
        <p className="text-sm text-gray-500">
          Manage and track your financial history
        </p>
      </div>

      <button
        onClick={onAddTransaction}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
      >
        <Plus size={18} />
        <span>Add Transaction</span>
      </button>
    </div>
  );
};

export default TransactionsHeader;
