import React from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Filter,
  Calendar,
  ArrowUpDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const TransactionsFilters = ({
  search,
  setSearch,
  setPage,
  pagination,
  type,
  setType,
  setCategoryId,
  categoryId,
  filteredCategories,
  datePreset,
  setDatePreset,
  sortBy,
  setSortBy,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center mb-5">
        <div className="relative w-full lg:max-w-md group">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder={t('app.transactions.filters.searchPlaceholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm text-gray-900 dark:text-gray-100"
          />
        </div>


      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <SlidersHorizontal size={16} />
          </div>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setCategoryId("");
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none text-sm text-gray-700 dark:text-gray-200 font-medium cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <option value="all">{t('app.transactions.filters.type.all')}</option>
            <option value="income">{t('app.transactions.filters.type.income')}</option>
            <option value="expense">{t('app.transactions.filters.type.expense')}</option>
          </select>
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Filter size={16} />
          </div>
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none text-sm text-gray-700 dark:text-gray-200 font-medium cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <option value="">{t('app.transactions.filters.categoryPlaceholder')}</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Calendar size={16} />
          </div>
          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none text-sm text-gray-700 dark:text-gray-200 font-medium cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <option value="all">{t('app.transactions.filters.date.all')}</option>
            <option value="this_month">{t('app.transactions.filters.date.thisMonth')}</option>
            <option value="last_month">{t('app.transactions.filters.date.lastMonth')}</option>
            <option value="custom">{t('app.transactions.filters.date.custom')}</option>
          </select>
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <ArrowUpDown size={16} />
          </div>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none text-sm text-gray-700 dark:text-gray-200 font-medium cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <option value="date">{t('app.transactions.filters.date.sortByDate')}</option>
            <option value="amount">{t('app.transactions.filters.date.sortByAmount')}</option>
            <option value="created_at">{t('app.transactions.filters.date.sortByCreated')}</option>
          </select>
        </div>
      </div>

      {datePreset === "custom" && (
        <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
              From
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
              To
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsFilters;
