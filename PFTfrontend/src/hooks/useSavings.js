import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../api/axios";

// API Functions
const getActiveSavings = () => {
  return axios
    .get("/savings", { params: { status: "active" } })
    .then((res) => res.data);
};

const getSavingsHistory = (page = 1, filters = {}) => {
  const params = {
    status: "history",
    page,
    search: filters.search,
    sort_by: filters.sortBy,
    sort_dir: filters.sortDir,
  };
  return axios.get("/savings", { params }).then((res) => res.data);
};

export const createSaving = (data) =>
  axios.post("/savings", data).then((res) => res.data);
export const updateSaving = (id, data) =>
  axios.put(`/savings/${id}`, data).then((res) => res.data);
export const deleteSaving = (id) =>
  axios.delete(`/savings/${id}`).then((res) => res.data);

// Hooks
export const useActiveSavings = () => {
  return useQuery({
    queryKey: ["savings", "active"],
    queryFn: getActiveSavings,
    staleTime: 5 * 60 * 1000,
    select: (data) => {
      const items = Array.isArray(data?.data) ? data.data : [];
      return { data: items };
    },
  });
};

export const useSavingsHistory = (page, filters) => {
  return useQuery({
    queryKey: ["savings", "history", page, filters],
    queryFn: () => getSavingsHistory(page, filters),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
};

// Mutations
export const useCreateSaving = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSaving,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings", "active"] });
    },
  });
};

export const useUpdateSaving = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateSaving(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings"] });
    },
  });
};

export const useDeleteSaving = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSaving,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings"] });
    },
  });
};
