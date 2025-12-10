import { Plus } from "lucide-react";

export default function SavingsHeader({ onAddSaving }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Savings Goals
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Visualize your dreams and track your progress
        </p>
      </div>

      <button
        onClick={onAddSaving}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
      >
        <Plus size={18} />
        <span>New Goal</span>
      </button>
    </div>
  );
}
