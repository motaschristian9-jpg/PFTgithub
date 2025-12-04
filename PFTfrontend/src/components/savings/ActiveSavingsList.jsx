import {
  Target,
  ArrowRight,
  PiggyBank,
  AlertTriangle,
  Clock,
  Calendar,
} from "lucide-react";
import { formatCurrency } from "../../utils/currency";

export default function ActiveSavingsList({
  savings,
  getProgressInfo,
  handleCardClick,
  userCurrency,
}) {
  if (savings.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <PiggyBank className="text-gray-300" size={40} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          No active savings goals
        </h3>
        <p className="text-gray-500 text-sm mt-1 max-w-xs">
          Start saving for your dreams by creating a new goal.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {savings.map((s) => {
        const current = Number(s.current_amount || 0);
        const target = Number(s.target_amount || 0);
        const percent = target > 0 ? (current / target) * 100 : 0;
        const widthPercent = Math.min(percent, 100);
        const progressInfo = getProgressInfo(current, target);

        return (
          <div
            key={s.id}
            onClick={() => handleCardClick(s)}
            className="group relative bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1"
          >
            <div
              className={`absolute top-0 left-0 right-0 h-1.5 ${progressInfo.barColor}`}
            ></div>
            <div className="flex justify-between items-start mb-4 mt-2">
              <div>
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-teal-700 transition-colors truncate">
                  {s.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 font-bold uppercase tracking-wider">
                  Target: {formatCurrency(target, userCurrency)}
                </p>
              </div>
              <div
                className={`w-10 h-10 ${progressInfo.iconBg} rounded-xl flex items-center justify-center ${progressInfo.textClass}`}
              >
                <Target size={20} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Saved</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {formatCurrency(current, userCurrency)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${progressInfo.textClass}`}
                  >
                    {percent.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="relative w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${progressInfo.barColor}`}
                  style={{ width: `${widthPercent}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${progressInfo.colorClass}`}
                >
                  {progressInfo.label}
                </span>
                <div className="flex items-center text-gray-400 text-xs group-hover:text-teal-600 transition-colors">
                  <span>View Details</span>
                  <ArrowRight size={14} className="ml-1" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
