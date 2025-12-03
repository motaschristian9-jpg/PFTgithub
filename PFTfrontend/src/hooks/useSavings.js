import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import axios from "../api/axios";

const KEYS = {
  all: ["savings"],
  active: ["savings", "active"],
  history: (page, filters) => ["savings", "history", page, filters],
};

const getActiveSavings = async () => {
  const { data } = await axios.get("/savings", {
    params: { status: "active" },
  });
  return data;
};

const getSavingsHistory = async (page = 1, filters = {}) => {
  const params = {
    status: "history",
    page,
    search: filters.search,
    sort_by: filters.sortBy,
    sort_dir: filters.sortDir,
  };
  const { data } = await axios.get("/savings", { params });
  return data;
};

const createSaving = (data) =>
  axios.post("/savings", data).then((res) => res.data);
const updateSaving = ({ id, data }) =>
  axios.put(`/savings/${id}`, data).then((res) => res.data);
const deleteSaving = (id) =>
  axios.delete(`/savings/${id}`).then((res) => res.data);

export const useActiveSavings = () => {
  return useQuery({
    queryKey: KEYS.active,
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
    queryKey: KEYS.history(page, filters),
    queryFn: () => getSavingsHistory(page, filters),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};

const invalidateSavingsQueries = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: KEYS.all });
};

export const useCreateSaving = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSaving,
    onSuccess: () => {
      invalidateSavingsQueries(queryClient);
    },
  });
};

export const useUpdateSaving = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSaving,
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: KEYS.all });

      const previousSavings = queryClient.getQueryData(KEYS.all);

      queryClient.setQueriesData({ queryKey: KEYS.all }, (oldData) => {
        if (!oldData) return oldData;

        if (oldData.data) {
          return {
            ...oldData,
            data: oldData.data.map((item) =>
              item.id === id ? { ...item, ...data } : item
            ),
          };
        }

        return Array.isArray(oldData)
          ? oldData.map((item) =>
              item.id === id ? { ...item, ...data } : item
            )
          : oldData;
      });

      return { previousSavings };
    },
    onError: (err, newSaving, context) => {
      if (context?.previousSavings) {
        // handled by onSettled invalidation
      }
    },
    onSettled: () => {
      invalidateSavingsQueries(queryClient);
    },
  });
};

export const useDeleteSaving = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSaving,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEYS.all });

      const previousSavings = queryClient.getQueryData(KEYS.all);

      queryClient.setQueriesData({ queryKey: KEYS.all }, (oldData) => {
        if (!oldData) return oldData;

        if (oldData.data) {
          return {
            ...oldData,
            data: oldData.data.filter((item) => item.id !== id),
          };
        }

        return Array.isArray(oldData)
          ? oldData.filter((item) => item.id !== id)
          : oldData;
      });

      return { previousSavings };
    },
    onSettled: () => {
      invalidateSavingsQueries(queryClient);
    },
  });
};
