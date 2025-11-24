import { useState, useEffect } from "react";
import { useTransactions } from "./useTransactions";
import { useDataContext } from "../components/DataLoader";

export function useExampleTransactionsApi() {
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

  // Params for API
  const params = {
    page,
    per_page: 15,
    type: type !== "all" ? type : undefined,
    search: search || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
    category_id: categoryId || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  };

  const { data, isLoading, isError, refetch } = useTransactions(params);

  // Convert amounts
  const transactions = (data?.data || []).map((txn) => ({
    ...txn,
    amount: Number(txn.amount),
  }));

  // ----------------------------------------------------------
  // FIX PAGINATION HERE
  // Your backend returns arrays → we extract the first value
  // ----------------------------------------------------------

  const extract = (value) => {
    if (Array.isArray(value)) return value[0];
    return value;
  };

  const pagination = {
    currentPage: extract(data?.meta?.current_page),
    lastPage: extract(data?.meta?.last_page),
    total: extract(data?.meta?.total),
    nextPageUrl: extract(data?.links?.next),
    prevPageUrl: extract(data?.links?.prev),
    firstPageUrl: extract(data?.links?.first),
    lastPageUrl: extract(data?.links?.last),
  };

  // (Optional) Debug
  // console.log("Pagination:", pagination);

  return {
    transactions,
    totalIncome: transactionsData?.totals?.income || 0,
    totalExpenses: transactionsData?.totals?.expenses || 0,

    pagination,
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
