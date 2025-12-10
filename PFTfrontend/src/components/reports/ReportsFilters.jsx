import { Calendar } from "lucide-react";

export default function ReportsFilters({
  datePreset,
  setDatePreset,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 min-w-0">
      <div className="flex flex-wrap items-center gap-2 w-full">
        <button
          onClick={() => setDatePreset("this_month")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
            datePreset === "this_month"
              ? "bg-gray-900 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => setDatePreset("last_month")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
            datePreset === "last_month"
              ? "bg-gray-900 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          Last Month
        </button>
        <button
          onClick={() => setDatePreset("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
            datePreset === "all"
              ? "bg-gray-900 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          All Time
        </button>
        <button
          onClick={() => setDatePreset("custom")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
            datePreset === "custom"
              ? "bg-gray-900 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          Custom
        </button>
      </div>

      {datePreset === "custom" && (
        <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
              Start Date
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none text-sm transition-all hover:border-gray-300"
              />
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
              End Date
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none text-sm transition-all hover:border-gray-300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
