import { Loader2, Check, FileText, Calendar } from "lucide-react";

export default function BudgetEditForm({
  register,
  handleSubmit,
  handleSaveChanges,
  isSaving,
  currencySymbol,
  startDateValue,
}) {
  return (
    <form onSubmit={handleSubmit(handleSaveChanges)} className="p-8 space-y-8 flex-1">
      <div className="flex flex-col items-center justify-center py-6">
        <label className="text-xs font-bold text-violet-600 uppercase tracking-wide mb-2">
          Total Budget Limit
        </label>
        <div className="flex items-baseline justify-center relative w-full group">
          <span className="text-4xl font-medium text-violet-400 absolute left-[15%] top-1 transition-colors duration-300">
            {currencySymbol}
          </span>
          <input
            type="number"
            {...register("amount", { required: true, min: 0.01 })}
            className="block w-full text-center text-6xl font-bold bg-transparent border-0 focus:ring-0 p-0 text-gray-900 placeholder-gray-300 tracking-tight outline-none"
            autoFocus
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <FileText size={12} /> Budget Name
          </label>
          <input
            type="text"
            {...register("name", { required: "Name is required" })}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-gray-900 text-sm font-medium shadow-sm"
            placeholder="Budget Name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <Calendar size={12} /> End Date
          </label>
          <input
            type="date"
            {...register("end_date", {
              required: true,
              validate: (val) =>
                !startDateValue ||
                new Date(val) >= new Date(startDateValue) ||
                "Invalid date",
            })}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-gray-900 text-sm font-medium shadow-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-200 transition-all duration-200 flex items-center justify-center gap-2 text-base transform hover:-translate-y-0.5"
      >
        {isSaving ? (
          <Loader2 className="animate-spin" size={24} />
        ) : (
          <>
            <Check size={20} strokeWidth={3} /> Save Changes
          </>
        )}
      </button>
    </form>
  );
}
