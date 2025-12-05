import { Eye, Trash2, PiggyBank } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

export default function SavingsHistoryTable({
  savings,
  loading,
  handleCardClick,
  handleDelete,
  userCurrency,
  historyPage,
  setHistoryPage,
  totalPages,
}) {
  return (
    <div className="rounded-2xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
        <h3 className="text-lg font-bold text-gray-900">Savings History</h3>
        <span className="text-sm text-gray-500">Completed Goals</span>
      </div>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                Target
              </th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                Final Amount
              </th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="p-8 text-center">
                  Loading history...
                </td>
              </tr>
            ) : savings.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center opacity-60">
                    <div className="mb-3 rounded-full bg-gray-100 p-3">
                      <PiggyBank size={24} className="text-gray-400" />
                    </div>
                    <p className="text-sm">No savings history found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              savings.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6 text-gray-900 font-medium">
                    {s.name}
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {formatCurrency(Number(s.target_amount), userCurrency)}
                  </td>
                  <td className="py-4 px-6 font-bold text-teal-600">
                    {formatCurrency(Number(s.current_amount), userCurrency)}
                  </td>
                  <td className="py-4 px-6 text-gray-500 text-sm">
                    {s.created_at
                      ? new Date(s.created_at).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                      Completed
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => handleCardClick(s)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(s.id)}
                      >
                        <Trash2 size={16} />
                      </button>
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
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading history...</div>
        ) : savings.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="flex flex-col items-center justify-center opacity-60">
              <div className="mb-3 rounded-full bg-gray-100 p-3">
                <PiggyBank size={24} className="text-gray-400" />
              </div>
              <p className="text-sm">No savings history found.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {savings.map((s) => (
              <div key={s.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{s.name}</h4>
                    <p className="text-xs text-gray-500">
                      {s.created_at
                        ? new Date(s.created_at).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-100 text-teal-800">
                    Completed
                  </span>
                </div>
                
                <div className="flex justify-between items-end mt-3">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">
                      Target: {formatCurrency(Number(s.target_amount), userCurrency)}
                    </div>
                    <div className="text-sm font-bold text-teal-600">
                      Final: {formatCurrency(Number(s.current_amount), userCurrency)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => handleCardClick(s)}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(s.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {savings.length > 0 && totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
              disabled={historyPage === 1}
              className="px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-gray-600">
              Page {historyPage} of {totalPages}
            </span>
            <button
              onClick={() => setHistoryPage((p) => p + 1)}
              disabled={historyPage >= totalPages}
              className="px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
