import React from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2,
  Receipt,
} from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const TransactionsTable = ({
  isLoading,
  isFetching,
  isError,
  transactions,
  pagination,
  handleSort,
  sortBy,
  sortOrder,
  handleEdit,
  handleDelete,
  userCurrency,
  isCreatingTransaction,
  updatingTransactionId,
}) => {
  const getSortIcon = (key) => {
    if (sortBy !== key)
      return <ArrowUpDown size={14} className="text-gray-400 opacity-50" />;
    return sortOrder === "asc" ? (
      <ArrowUp size={14} className="text-blue-600" />
    ) : (
      <ArrowDown size={14} className="text-blue-600" />
    );
  };

  const formatAmount = (amount) =>
    formatCurrency(Math.abs(amount), userCurrency);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const SkeletonRow = () => (
    <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 animate-pulse">
      <div className="col-span-2 h-4 bg-gray-200 rounded w-24"></div>
      <div className="col-span-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="col-span-2 h-6 bg-gray-200 rounded w-20"></div>
      <div className="col-span-2 h-4 bg-gray-200 rounded w-16"></div>
      <div className="col-span-1 h-5 bg-gray-200 rounded w-12"></div>
      <div className="col-span-2 flex justify-end space-x-2">
        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden min-h-[400px] flex flex-col">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Transaction History</h3>
        <span className="text-sm text-gray-500">All Transactions</span>
      </div>

      <div className="hidden lg:grid grid-cols-12 gap-4 p-4 bg-white border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <div
          onClick={() => handleSort("date")}
          className="col-span-2 cursor-pointer flex items-center hover:text-gray-900 transition-colors"
        >
          Date {getSortIcon("date")}
        </div>
        <div className="col-span-3">Name & Description</div>
        <div className="col-span-2">Category</div>
        <div
          onClick={() => handleSort("amount")}
          className="col-span-2 cursor-pointer flex items-center hover:text-gray-900 transition-colors"
        >
          Amount {getSortIcon("amount")}
        </div>
        <div className="col-span-1">Type</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-500">
            <p>Failed to load data.</p>
          </div>
        ) : transactions.length === 0 && !isCreatingTransaction ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 opacity-60">
            <div className="mb-3 rounded-full bg-gray-100 p-4">
              <Receipt size={32} className="text-gray-400" />
            </div>
            <p>No transactions found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {isCreatingTransaction && <SkeletonRow />}
            {transactions.map((tx) =>
              tx.id === updatingTransactionId ? (
                <SkeletonRow key={tx.id} />
              ) : (
                <div
                  key={tx.id}
                  className="group hover:bg-gray-50 transition-colors"
                >
                  <div className="hidden lg:grid grid-cols-12 gap-4 p-4 items-center">
                    <div className="col-span-2 text-sm text-gray-600 font-medium">
                      {formatDate(tx.date)}
                    </div>
                    <div className="col-span-3">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {tx.name || "Unnamed"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {tx.description}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {tx.category_name || "Uncategorized"}
                      </span>
                    </div>
                    <div
                      className={`col-span-2 text-sm font-bold ${
                        tx.type === "income"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatAmount(tx.amount)}
                    </div>
                    <div className="col-span-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide ${
                          tx.type === "income"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(tx)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="lg:hidden p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          tx.type === "income"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {tx.type === "income" ? (
                          <TrendingUp size={18} />
                        ) : (
                          <TrendingDown size={18} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {tx.name || "Unnamed"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{formatDate(tx.date)}</span>
                          <span>•</span>
                          <span className="truncate max-w-[100px]">
                            {tx.category_name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-2">
                      <span
                        className={`text-sm font-bold ${
                          tx.type === "income"
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {formatAmount(tx.amount)}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(tx)}
                          className="p-1.5 text-gray-400 hover:text-blue-600"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <div className="lg:hidden p-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500">
        Page {pagination.currentPage} of {pagination.lastPage}
      </div>
    </div>
  );
};

export default TransactionsTable;
