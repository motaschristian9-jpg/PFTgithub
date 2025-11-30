import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSavings,
  createSaving,
  updateSaving,
  deleteSaving,
} from "../api/savings";

// 1. FETCH HOOK (Reading Data)
export const useSavings = (status = "active", options = {}) => {
  return useQuery({
    queryKey: ["savings", status],
    queryFn: () => getSavings({ status }),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true, // Prevents flickering when switching tabs
    select: (data) => {
      const savings = Array.isArray(data?.data) ? data.data : [];
      return {
        ...data,
        data: savings,
        totals: {
          totalTarget: savings.reduce(
            (sum, saving) => sum + parseFloat(saving.target_amount || 0),
            0
          ),
          totalCurrent: savings.reduce(
            (sum, saving) => sum + parseFloat(saving.current_amount || 0),
            0
          ),
        },
      };
    },
    ...options,
  });
};

// 2. CREATE HOOK
export const useCreateSaving = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSaving,
    onSuccess: () => {
      // Invalidate all savings lists (active, history, etc.)
      queryClient.invalidateQueries({ queryKey: ["savings"] });
    },
  });
};

// 3. UPDATE HOOK (With Optimistic UI)
export const useUpdateSaving = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateSaving(id, data),
    onMutate: async ({ id, data }) => {
      // A. Cancel outgoing fetches
      await queryClient.cancelQueries({ queryKey: ["savings"] });

      // B. Snapshot previous data
      const previousData = queryClient.getQueriesData({
        queryKey: ["savings"],
      });

      // C. Optimistically update
      queryClient.setQueriesData({ queryKey: ["savings"] }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((s) => (s.id === id ? { ...s, ...data } : s)),
        };
      });

      return { previousData };
    },
    onError: (err, vars, context) => {
      // D. Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      // E. Refetch to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: ["savings"] });
    },
  });
};

// 4. DELETE HOOK (With Optimistic UI)
export const useDeleteSaving = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSaving,
    onMutate: async (deletedId) => {
      // A. Cancel outgoing fetches
      await queryClient.cancelQueries({ queryKey: ["savings"] });

      // B. Snapshot previous data
      const previousData = queryClient.getQueriesData({
        queryKey: ["savings"],
      });

      // C. Optimistically update (Remove item from list)
      queryClient.setQueriesData({ queryKey: ["savings"] }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((s) => s.id !== deletedId),
        };
      });

      return { previousData };
    },
    onError: (err, vars, context) => {
      // D. Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["savings"] });
    },
  });
};
