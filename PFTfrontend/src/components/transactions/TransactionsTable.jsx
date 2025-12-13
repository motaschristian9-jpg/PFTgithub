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
  Loader2,
} from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { useTranslation } from "react-i18next";

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
  onPageChange,
}) => {
  const { t } = useTranslation();

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
    <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800 overflow-hidden min-h-[400px] flex flex-col">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('app.transactions.table.title')}</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">{t('app.transactions.table.subtitle')}</span>
      </div>

      <div className="hidden lg:grid grid-cols-12 gap-4 p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        <div
          onClick={() => handleSort("date")}
          className="col-span-2 cursor-pointer flex items-center hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          {t('app.transactions.table.headers.date')} {getSortIcon("date")}
        </div>
        <div className="col-span-3">{t('app.transactions.table.headers.description')}</div>
        <div className="col-span-2">{t('app.transactions.table.headers.category')}</div>
        <div
          onClick={() => handleSort("amount")}
          className="col-span-2 cursor-pointer flex items-center hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          {t('app.transactions.table.headers.amount')} {getSortIcon("amount")}
        </div>
        <div className="col-span-1">{t('app.transactions.table.headers.type')}</div>
        <div className="col-span-2 text-right">{t('app.transactions.table.headers.actions')}</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {[...Array(5)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-500">
            <p>Failed to load data.</p>
          </div>
        ) : transactions.length === 0 && !isCreatingTransaction ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500 opacity-60">
            <div className="mb-3 rounded-full bg-gray-100 dark:bg-gray-800 p-4">
              <Receipt size={32} className="text-gray-400 dark:text-gray-500" />
            </div>
            <p>{t('app.transactions.table.empty')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {isCreatingTransaction && <SkeletonRow />}
            {transactions.map((tx) =>
              tx.id === updatingTransactionId ? (
                <SkeletonRow key={tx.id} />
              ) : (
                <div
                  key={tx.id}
                  className={`group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                    tx.pending ? "bg-gray-50/80 dark:bg-gray-800/80" : ""
                  }`}
                >
                  <div className="hidden lg:grid grid-cols-12 gap-4 p-4 items-center">
                    <div className="col-span-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
                      {tx.pending ? t('app.transactions.table.syncing') : formatDate(tx.date)}
                    </div>
                    <div className="col-span-3">
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                        {tx.name || "Unnamed"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {tx.description}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                        {tx.category_name || "Uncategorized"}
                      </span>
                    </div>
                    <div
                      className={`col-span-2 text-sm font-bold ${
                        tx.pending
                          ? "text-gray-400 dark:text-gray-500"
                          : tx.type === "income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatAmount(tx.amount)}
                    </div>
                    <div className="col-span-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide ${
                          tx.type === "income"
                            ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                            : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {tx.type === "income" ? t('app.transactions.filters.type.income') : t('app.transactions.filters.type.expense')}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(tx)}
                        disabled={new Date() - new Date(tx.created_at) > 60 * 60 * 1000}
                        title={
                          new Date() - new Date(tx.created_at) > 60 * 60 * 1000
                            ? t('app.transactions.table.editingDisabled')
                            : t('app.transactions.table.editTooltip')
                        }
                        className={`p-2 rounded-lg transition-colors ${
                          new Date() - new Date(tx.created_at) > 60 * 60 * 1000
                            ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                            : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        }`}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
                            ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {tx.type === "income" ? (
                          <TrendingUp size={18} />
                        ) : (
                          <TrendingDown size={18} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 dark:text-white truncate">
                          {tx.name || "Unnamed"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
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
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {formatAmount(tx.amount)}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(tx)}
                          disabled={new Date() - new Date(tx.created_at) > 60 * 60 * 1000}
                          className={`p-1.5 ${
                            new Date() - new Date(tx.created_at) > 60 * 60 * 1000
                              ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                              : "text-gray-400 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          }`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 text-gray-400 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
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

      {transactions.length > 0 && pagination.lastPage > 1 && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-center bg-white dark:bg-gray-900">
          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {t('app.transactions.table.prev')}
            </button>
            <span className="px-3 py-1 text-gray-600 dark:text-gray-300 flex items-center">
              {t('app.transactions.table.page')} {pagination.currentPage} {t('app.transactions.table.of')} {pagination.lastPage}
            </span>
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.lastPage}
              className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {t('app.transactions.table.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsTable;
