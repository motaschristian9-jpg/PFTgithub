import React from "react";
import { PieChart, AlertTriangle, Clock, Calendar } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const ActiveBudgetsList = ({
  budgets,
  getBudgetSpent,
  getBudgetStatusInfo,
  getCategoryName,
  handleBudgetCardModalOpen,
  userCurrency,
}) => {
  if (budgets.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center border border-gray-100 shadow-sm">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 mx-auto">
          <PieChart className="text-gray-300" size={40} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          No active budgets found
        </h3>
        <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
          Try adjusting your filters or create a new budget to start tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {budgets.map((b) => {
        const spent = getBudgetSpent(b);
        const allocated = Number(b.amount);
        const rawPercent = allocated > 0 ? (spent / allocated) * 100 : 0;
        const widthPercent = Math.min(rawPercent, 100);
        const statusInfo = getBudgetStatusInfo(spent, allocated, b.status);

        return (
          <div
            key={b.id}
            className="group relative cursor-pointer"
            onClick={() => handleBudgetCardModalOpen(b)}
          >
            <div className="relative bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden hover:-translate-y-1">
              {/* Top Progress Line */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${statusInfo.barColor}`}
              ></div>

              <div className="flex items-start justify-between mb-4 mt-1">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-violet-600 transition-colors">
                    {b.name ?? "Unnamed"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 truncate uppercase tracking-wider font-medium">
                    {getCategoryName(b.category_id)}
                  </p>
                </div>
                <div className="ml-3">
                  {rawPercent > 100 ? (
                    <AlertTriangle className="text-red-500" size={20} />
                  ) : (
                    <Clock
                      className="text-gray-300 group-hover:text-violet-500 transition-colors"
                      size={20}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-6 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                <Calendar size={14} />
                <span className="truncate">
                  {b.start_date
                    ? new Date(b.start_date).toLocaleDateString()
                    : "-"}{" "}
                  —{" "}
                  {b.end_date
                    ? new Date(b.end_date).toLocaleDateString()
                    : "-"}
                </span>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Allocated</span>
                  <span className="font-bold text-violet-600">
                    {formatCurrency(allocated, userCurrency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Spent</span>
                  <span className="font-bold text-violet-600">
                    {formatCurrency(spent, userCurrency)}
                  </span>
                </div>
              </div>

              <div className="mb-2">
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${statusInfo.barColor}`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${statusInfo.colorClass}`}
                  >
                    {statusInfo.label}
                  </span>
                  <span className="text-xs font-medium text-gray-400">
                    {rawPercent.toFixed(0)}%
                  </span>
                </div>
                
                <div className="mt-4 flex justify-end">
                    <span className="text-xs font-medium text-violet-600">
                        View Details →
                    </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActiveBudgetsList;
