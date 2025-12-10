import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../api/axios";

// API Functions
const getActiveBudgets = () => {
  return axios
    .get("/budgets", { params: { status: "active" } })
    .then((res) => res.data);
};

const getBudgetHistory = (page = 1) => {
  return axios
    .get("/budgets", { params: { status: "history", page } })
    .then((res) => res.data);
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

export const useBudgetHistory = (page) => {
  return useQuery({
    queryKey: ["budgets", "history", page],
    queryFn: () => getBudgetHistory(page),
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
