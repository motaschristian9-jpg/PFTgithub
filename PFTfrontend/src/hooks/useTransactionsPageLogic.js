import { useState, useEffect, useMemo } from "react";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { useMutationState } from "@tanstack/react-query"; // Import useMutationState
import { useDataContext } from "../components/DataLoader";
import { useTransactions, useDeleteTransaction } from "./useTransactions";
import { confirmDelete, showSuccess, showError } from "../utils/swal";
import { useTranslation } from "react-i18next";

export const useTransactionsPageLogic = () => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 768;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [datePreset, setDatePreset] = useState("all");

  const [page, setPage] = useState(1);
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [categoryId, setCategoryId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    user,
    categoriesData,
    transactionsData: initialContextData,
  } = useDataContext();

  const { data, isLoading, isError, isFetching } = useTransactions(
    {
      page,
      type: type === "all" ? undefined : type,
      search,
      sort_by: sortBy,
      sort_order: sortOrder,
      category_id: categoryId,
      start_date: startDate,
      end_date: endDate,
    },
    {
      placeholderData: (previousData) => previousData || initialContextData,
    }
  );

  const deleteTransactionMutation = useDeleteTransaction();

  // Track pending mutations
  const pendingMutations = useMutationState({
    filters: { status: "pending" },
    select: (mutation) => mutation.state.variables,
  });

  const isCreatingTransaction = pendingMutations.some(
    (variables) => !variables?.id && variables?.amount // Creation usually doesn't have ID yet, but has data
  );

  const updatingTransactionId = pendingMutations.find(
    (variables) => variables?.id && variables?.data // Update has ID and data
  )?.id;

  const transactions = data?.data || [];
  const totalIncome = data?.totals?.income || 0;
  const totalExpenses = data?.totals?.expenses || 0;

  const getPageNumber = (val) => {
    if (Array.isArray(val)) return Number(val[0]);
    return Number(val) || 1;
  };

  const pagination = {
    currentPage: getPageNumber(data?.meta?.current_page),
    lastPage: getPageNumber(data?.meta?.last_page),
  };

  const filteredCategories = useMemo(() => {
    return (categoriesData?.data || []).filter(
      (cat) => type === "all" || cat.type === type
    );
  }, [categoriesData, type]);

  useEffect(() => {
    const today = new Date();
    let start = "";
    let end = "";

    if (datePreset === "this_month") {
      start = format(startOfMonth(today), "yyyy-MM-dd");
      end = format(endOfMonth(today), "yyyy-MM-dd");
    } else if (datePreset === "last_month") {
      const lastMonthDate = subMonths(today, 1);
      start = format(startOfMonth(lastMonthDate), "yyyy-MM-dd");
      end = format(endOfMonth(lastMonthDate), "yyyy-MM-dd");
    }

    setStartDate(start);
    setEndDate(end);
    setPage(1);
  }, [datePreset]);

  useEffect(() => {
    if (pagination.lastPage > 0 && page > pagination.lastPage) {
      setPage(pagination.lastPage);
    }
  }, [pagination.lastPage, page]);

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleDelete = async (transactionId) => {
    const result = await confirmDelete(
      t('app.swal.confirmTitle'),
      t('app.swal.confirmText')
    );

    if (result.isConfirmed) {
      try {
        await deleteTransactionMutation.mutateAsync(transactionId);
        showSuccess(t('app.swal.transactionDeleted'), t('app.swal.transactionDeletedMsg'));
      } catch (error) {
        showError(t('app.swal.errorTitle'), t('app.swal.errorText'));
      }
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortBy === key && sortOrder === "asc") {
      direction = "desc";
    }
    setSortBy(key);
    setSortOrder(direction);
    setPage(1);
  };

  return {
    sidebarOpen,
    setSidebarOpen,
    mobileMenuOpen,
    setMobileMenuOpen,
    modalOpen,
    setModalOpen,
    editingTransaction,
    setEditingTransaction,
    datePreset,
    setDatePreset,
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
    user,
    isLoading,
    isFetching,
    isError,
    transactions,
    totalIncome,
    totalExpenses,
    pagination,
    filteredCategories,
    handleEdit,
    handleDelete,
    handleSort,
    isCreatingTransaction,
    updatingTransactionId,
  };
};
