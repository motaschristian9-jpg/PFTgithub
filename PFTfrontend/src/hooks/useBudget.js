import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../api/axios";

// API Functions
const getActiveBudgets = () => {
  return axios
    .get("/budgets", { params: { status: "active" } })
    .then((res) => res.data);
};

// Updated to accept filters
const getBudgetHistory = (page = 1, filters = {}) => {
  const params = {
    status: "history",
    page,
    search: filters.search,
    category_id: filters.categoryId,
    sort_by: filters.sortBy,
    sort_dir: filters.sortDir,
  };
  return axios.get("/budgets", { params }).then((res) => res.data);
};

export const createBudget = (data) =>
  axios.post("/budgets", data).then((res) => res.data);
export const updateBudget = (id, data) =>
  axios.put(`/budgets/${id}`, data).then((res) => res.data);
export const deleteBudget = (id) =>
  axios.delete(`/budgets/${id}`).then((res) => res.data);

// Hooks
export const useActiveBudgets = () => {
  return useQuery({
    queryKey: ["budgets", "active"],
    queryFn: getActiveBudgets,
    staleTime: 5 * 60 * 1000,
    select: (data) => {
      const items = Array.isArray(data?.data) ? data.data : [];
      return { data: items };
    },
  });
};

// Updated Hook Signature
export const useBudgetHistory = (page, filters) => {
  return useQuery({
    queryKey: ["budgets", "history", page, filters], // Include filters in key to trigger refetch
    queryFn: () => getBudgetHistory(page, filters),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
};

// Mutations
export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets", "active"] });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateBudget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};
