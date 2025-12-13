import React from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  History,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const BudgetFilters = ({
  search,
  setSearch,
  activeTab,
  setActiveTab,
  categoryId,
  setCategoryId,
  categoriesData,
  sortBy,
  setSortBy,
  sortDir,
  setSortDir,
}) => {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800 flex flex-col gap-5">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full lg:max-w-md group">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-gray-100 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder={t('app.budgets.filters.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-full lg:w-auto">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 lg:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "active"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            <LayoutGrid size={16} /> <span>{t('app.budgets.filters.activeTab')}</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 lg:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "history"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            <History size={16} /> <span>{t('app.budgets.filters.historyTab')}</span>
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {activeTab === "history" && (
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Filter size={16} />
            </div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none appearance-none text-sm text-gray-700 dark:text-gray-200 font-medium cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              <option value="">{t('app.budgets.filters.allCategories')}</option>
              {categoriesData?.data
                ?.filter((c) => c.type === "expense")
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <ArrowUpDown size={16} />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none appearance-none text-sm text-gray-700 dark:text-gray-200 font-medium cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
            <option value="created_at">{t('app.budgets.filters.sortBy.newest')}</option>
            <option value="end_date">{t('app.budgets.filters.sortBy.endDate')}</option>
            <option value="amount">{t('app.budgets.filters.sortBy.amount')}</option>
            <option value="name">{t('app.budgets.filters.sortBy.name')}</option>
          </select>
        </div>

        <button
          onClick={() =>
            setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
          }
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors text-sm font-medium"
          title={sortDir === "asc" ? t('app.budgets.filters.ascending') : t('app.budgets.filters.descending')}
        >
          {sortDir === "asc" ? (
            <>
              <TrendingUp size={16} /> <span>{t('app.budgets.filters.ascending')}</span>
            </>
          ) : (
            <>
              <TrendingDown size={16} /> <span>{t('app.budgets.filters.descending')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BudgetFilters;
