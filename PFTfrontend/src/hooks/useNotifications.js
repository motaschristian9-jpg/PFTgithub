import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../api/axios";
import { useAuth } from "./useAuth";

const fetchNotifications = async () => {
  const response = await axios.get("/notifications");
  return response.data.data;
};

const deleteNotification = async (id) => {
  const response = await axios.delete(`/notifications/${id}`);
  return response.data;
};

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: deleteNotification,
        onMutate: async (id) => {
             // Optimistic Update
             await queryClient.cancelQueries({ queryKey: ["notifications"] });
             const previousNotifications = queryClient.getQueryData({ queryKey: ["notifications"] });

             queryClient.setQueryData({ queryKey: ["notifications"] }, (old) => {
                 if (!old) return [];
                 return old.filter(n => n.id !== id);
             });

             return { previousNotifications };
        },
        onError: (err, id, context) => {
             queryClient.setQueryData({ queryKey: ["notifications"] }, context.previousNotifications);
        },
        onSettled: () => {
             queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
    });
};

export const useNotifications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => fetchNotifications(),
    enabled: !!user,
    refetchInterval: 30000, // Poll every 30 seconds
  });
};
