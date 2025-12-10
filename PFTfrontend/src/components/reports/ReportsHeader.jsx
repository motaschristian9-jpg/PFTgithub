import { BarChart as BarIcon, Download } from "lucide-react";

export default function ReportsHeader({ onExport }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full max-w-full">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 truncate">
          Financial Reports
        </h1>
        <p className="text-sm text-gray-500 truncate">
          Deep dive into your financial health
        </p>
      </div>

      <button
        onClick={onExport}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
      >
        <Download size={18} />
        <span>Export Report</span>
      </button>
    </div>
  );
}
