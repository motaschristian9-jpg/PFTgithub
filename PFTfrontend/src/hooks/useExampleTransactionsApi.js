import { useState, useEffect, useMemo } from "react";
import { useTransactions } from "./useTransactions";
import { useDataContext } from "../components/DataLoader";

export function useExampleTransactionsApi() {
  // 1. State Management
  const [page, setPage] = useState(1);
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Filter states
  const [categoryId, setCategoryId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { transactionsData } = useDataContext();

  // 2. Reliability Fix: Auto-reset to Page 1 when filters change
  // This prevents "Empty" screens if you filter while on Page 5, for example.
  useEffect(() => {
    setPage(1);
  }, [type, search, categoryId, startDate, endDate]);

  // 3. Performance: Memoize params
  // This ensures useTransactions doesn't think "inputs changed" when they haven't
  const params = useMemo(
    () => ({
      page,
      per_page: 15,
      type: type !== "all" ? type : undefined,
      search: search || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      category_id: categoryId || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    }),
    [page, type, search, sortBy, sortOrder, categoryId, startDate, endDate]
  );

  const { data, isLoading, isError, refetch } = useTransactions(params);

  // 4. Performance: Memoize Data Transformation
  // Only loops through the array when data actually changes
  const transactions = useMemo(() => {
    return (data?.data || []).map((txn) => ({
      ...txn,
      amount: Number(txn.amount),
    }));
  }, [data?.data]);

  // 5. Pagination Extraction
  const pagination = useMemo(() => {
    const extract = (value) => (Array.isArray(value) ? value[0] : value);

    return {
      currentPage: extract(data?.meta?.current_page),
      lastPage: extract(data?.meta?.last_page),
      total: extract(data?.meta?.total),
      nextPageUrl: extract(data?.links?.next),
      prevPageUrl: extract(data?.links?.prev),
      firstPageUrl: extract(data?.links?.first),
      lastPageUrl: extract(data?.links?.last),
    };
  }, [data?.meta, data?.links]);

  return {
    transactions,
    totalIncome: transactionsData?.totals?.income || 0,
    totalExpenses: transactionsData?.totals?.expenses || 0,
    pagination,

    // State exposers
    page,
    setPage,
    type,
    setType,
    search,
    setSearch,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    categoryId,
    setCategoryId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,

    isLoading,
    isError,
    refetch,
  };
}
