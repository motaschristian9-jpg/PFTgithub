import { CheckCircle2 } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

export default function BudgetComplianceTable({ budgetCompliance, userCurrency }) {
  return (
    <div className="rounded-2xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden min-w-0">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle2 size={20} className="text-gray-400" />
          Budget Compliance
        </h3>
      </div>
      {/* Desktop View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                Budget Name
              </th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                Allocated
              </th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                Spent
              </th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                Remaining
              </th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {budgetCompliance.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  No budget data found for this period.
                </td>
              </tr>
            ) : (
              budgetCompliance.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6 font-medium text-gray-900">
                    {b.name}
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {b.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {formatCurrency(b.allocated, userCurrency)}
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-900">
                    {formatCurrency(b.spent, userCurrency)}
                  </td>
                  <td
                    className={`py-4 px-6 font-medium ${
                      b.remaining < 0 ? "text-rose-600" : "text-violet-600"
                    }`}
                  >
                    {formatCurrency(b.remaining, userCurrency)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            b.isOver ? "bg-rose-500" : "bg-violet-500"
                          }`}
                          style={{ width: `${b.percent}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {b.percent.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        {budgetCompliance.length === 0 ? (
           <div className="p-8 text-center text-gray-500">
              No budget data found for this period.
           </div>
        ) : (
           <div className="divide-y divide-gray-100">
              {budgetCompliance.map((b) => (
                <div key={b.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                     <div className="min-w-0 flex-1 pr-2">
                       <h4 className="text-sm font-bold text-gray-900 truncate">{b.name}</h4>
                       <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                          {b.category}
                       </span>
                     </div>
                     <div className="text-right shrink-0">
                        <div className={`text-sm font-bold ${b.remaining < 0 ? "text-rose-600" : "text-violet-600"}`}>
                           {formatCurrency(b.remaining, userCurrency)}
                        </div>
                        <div className="text-xs text-gray-500">Remaining</div>
                     </div>
                  </div>

                  <div className="mb-3 space-y-1">
                     <div className="flex justify-between text-xs text-gray-500 gap-2">
                        <span className="truncate">Spent: {formatCurrency(b.spent, userCurrency)}</span>
                        <span className="truncate">Allocated: {formatCurrency(b.allocated, userCurrency)}</span>
                     </div>
                     <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            b.isOver ? "bg-rose-500" : "bg-violet-500"
                          }`}
                          style={{ width: `${b.percent}%` }}
                        />
                     </div>
                  </div>
                </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );
}
