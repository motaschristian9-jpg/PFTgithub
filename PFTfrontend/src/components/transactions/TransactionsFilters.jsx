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
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center mb-5">
        <div className="relative w-full lg:max-w-md group">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 text-sm"
          />
        </div>

        <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setPage(Math.max(pagination.currentPage - 1, 1))}
            disabled={pagination.currentPage === 1}
            className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <span className="px-3 text-sm font-semibold text-gray-700 min-w-[3rem] text-center">
            {pagination.currentPage} / {pagination.lastPage}
          </span>
          <button
            onClick={() =>
              setPage(
                Math.min(pagination.currentPage + 1, pagination.lastPage)
              )
            }
            disabled={pagination.currentPage === pagination.lastPage}
            className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
          >
            <ChevronRight size={18} className="text-gray-600" />
          </button>
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
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none text-sm text-gray-700 font-medium cursor-pointer hover:border-gray-300 transition-colors"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
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
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none text-sm text-gray-700 font-medium cursor-pointer hover:border-gray-300 transition-colors"
          >
            <option value="">All Categories</option>
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
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none text-sm text-gray-700 font-medium cursor-pointer hover:border-gray-300 transition-colors"
          >
            <option value="all">All Dates</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="custom">Custom Range</option>
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
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none text-sm text-gray-700 font-medium cursor-pointer hover:border-gray-300 transition-colors"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="created_at">Sort by Created</option>
          </select>
        </div>
      </div>

      {datePreset === "custom" && (
        <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
              From
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
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
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsFilters;
