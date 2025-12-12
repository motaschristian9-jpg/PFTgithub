import React from "react";
import { Eye, Trash2, PieChart } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const BudgetHistoryTable = ({
  budgets,
  loading,
  getBudgetSpent,
  getBudgetStatusInfo,
  getCategoryName,
  handleBudgetCardModalOpen,
  handleDelete,
  userCurrency,
  historyPage,
  setHistoryPage,
  totalPages,
}) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Budget History</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">Completed & Expired</span>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
            <tr>
              <th className="py-4 px-6 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Allocated
              </th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Spent
              </th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  Loading history...
                </td>
              </tr>
            ) : budgets.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center justify-center opacity-60">
                    <div className="mb-3 rounded-full bg-gray-100 dark:bg-gray-800 p-3">
                      <PieChart size={24} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-sm">No budget history found matching your filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              budgets.map((b) => {
                const spent = getBudgetSpent(b);
                const allocated = Number(b.amount);
                const statusInfo = getBudgetStatusInfo(
                  spent,
                  allocated,
                  b.status
                );
                return (
                  <tr
                    key={b.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                  >
                    <td className="py-4 px-6 text-gray-900 dark:text-white font-medium">
                      {b.name}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        {getCategoryName(b.category_id)}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-600 dark:text-gray-300">
                      {formatCurrency(allocated, userCurrency)}
                    </td>
                    <td
                      className={`py-4 px-6 font-bold ${statusInfo.textClass}`}
                    >
                      {formatCurrency(spent, userCurrency)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${statusInfo.colorClass}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="p-2 rounded-lg text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                          onClick={() => handleBudgetCardModalOpen(b)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          onClick={() => handleDelete(b.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading history...</div>
        ) : budgets.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <div className="flex flex-col items-center justify-center opacity-60">
              <div className="mb-3 rounded-full bg-gray-100 dark:bg-gray-800 p-3">
                <PieChart size={24} className="text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm">No budget history found.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {budgets.map((b) => {
              const spent = getBudgetSpent(b);
              const allocated = Number(b.amount);
              const statusInfo = getBudgetStatusInfo(
                spent,
                allocated,
                b.status
              );
              return (
                <div key={b.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">{b.name}</h4>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                          {getCategoryName(b.category_id)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${statusInfo.colorClass}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-end mt-3">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Allocated: {formatCurrency(allocated, userCurrency)}
                      </div>
                      <div className={`text-sm font-bold ${statusInfo.textClass}`}>
                        Spent: {formatCurrency(spent, userCurrency)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        className="p-2 rounded-lg text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                        onClick={() => handleBudgetCardModalOpen(b)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        onClick={() => handleDelete(b.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {budgets.length > 0 && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-center bg-gray-50/30 dark:bg-gray-800/30">
          <div className="flex space-x-2">
            <button
              onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
              disabled={historyPage === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-sm font-medium shadow-sm"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-gray-600 dark:text-gray-300 text-sm font-medium flex items-center">
              Page {historyPage} of {totalPages}
            </span>
            <button
              onClick={() => setHistoryPage((p) => p + 1)}
              disabled={historyPage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-sm font-medium shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetHistoryTable;
