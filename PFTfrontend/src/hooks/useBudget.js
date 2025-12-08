import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import axios from "../api/axios";

const KEYS = {
  all: ["budgets"],
  active: ["budgets", "active"],
  history: (page, filters) => ["budgets", "history", page, filters],
};

const getActiveBudgets = async () => {
  const { data } = await axios.get("/budgets", {
    params: { status: "active" },
  });
  return data;
};

const getBudgetHistory = async (page = 1, filters = {}) => {
  const params = {
    status: "history",
    page,
    search: filters.search,
    category_id: filters.categoryId,
    sort_by: filters.sortBy,
    sort_dir: filters.sortDir,
  };
  const { data } = await axios.get("/budgets", { params });
  return data;
};

const createBudget = (data) =>
  axios.post("/budgets", data).then((res) => res.data);
const updateBudget = ({ id, data }) =>
  axios.put(`/budgets/${id}`, data).then((res) => res.data);
const deleteBudget = (id) =>
  axios.delete(`/budgets/${id}`).then((res) => res.data);

export const useActiveBudgets = () => {
  return useQuery({
    queryKey: KEYS.active,
    queryFn: getActiveBudgets,
    staleTime: 5 * 60 * 1000,
    select: (data) => {
      const items = Array.isArray(data?.data) ? data.data : [];
      return { data: items };
    },
  });
};

export const useBudgetHistory = (page, filters) => {
  return useQuery({
    queryKey: KEYS.history(page, filters),
    queryFn: () => getBudgetHistory(page, filters),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};

const invalidateBudgetQueries = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: KEYS.all });
  queryClient.invalidateQueries({ queryKey: KEYS.active });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBudget,
    onMutate: async (newBudget) => {
      await queryClient.cancelQueries({ queryKey: KEYS.active });

      const previousBudgets = queryClient.getQueryData(KEYS.active);

      queryClient.setQueriesData({ queryKey: KEYS.active }, (oldData) => {
        const optimisticBudget = {
          id: `temp-${Date.now()}`,
          ...newBudget,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (!oldData) return { data: [optimisticBudget] };

        if (oldData.data) {
          return {
            ...oldData,
            data: [optimisticBudget, ...oldData.data],
          };
        }

        return Array.isArray(oldData)
          ? [optimisticBudget, ...oldData]
          : [optimisticBudget];
      });

      return { previousBudgets };
    },
    onError: (err, newBudget, context) => {
      if (context?.previousBudgets) {
        queryClient.setQueriesData({ queryKey: KEYS.active }, context.previousBudgets);
      }
    },
    onSettled: () => {
      invalidateBudgetQueries(queryClient);
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBudget,
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: KEYS.active });

      const previousBudgets = queryClient.getQueryData(KEYS.active);

      queryClient.setQueriesData({ queryKey: KEYS.active }, (oldData) => {
        if (!oldData) return oldData;

        if (oldData.data) {
          return {
            ...oldData,
            data: oldData.data.map((item) =>
              item.id === id ? { ...item, ...data } : item
            ),
          };
        }

        return oldData;
      });

      return { previousBudgets };
    },
    onError: (err, newBudget, context) => {
      if (context?.previousBudgets) {
        // handled by onSettled invalidation
      }
    },
    onSettled: () => {
      invalidateBudgetQueries(queryClient);
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBudget,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEYS.active });

      const previousBudgets = queryClient.getQueryData(KEYS.active);

      queryClient.setQueriesData({ queryKey: KEYS.active }, (oldData) => {
        if (!oldData) return oldData;

        if (oldData.data) {
          return {
            ...oldData,
            data: oldData.data.filter((item) => item.id !== id),
          };
        }

        return oldData;
      });

      return { previousBudgets };
    },
    onSettled: () => {
      invalidateBudgetQueries(queryClient);
    },
  });
};
