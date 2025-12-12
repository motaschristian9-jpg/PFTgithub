import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../api/axios";
import { useAuth } from "./useAuth";

const fetchNotifications = async () => {
  // Add timestamp to prevent browser caching
  const response = await axios.get(`/notifications?_t=${new Date().getTime()}`);
  const notifications = response.data.data;

  // Transform notifications to match Topbar expectations
  return notifications.map(n => {
      const data = n.data || {};
      
      // Map backend types to frontend styling types
      let type = data.type;
      if (type === 'budget_reached') type = 'budget-error';
      else if (type === 'budget_warning') type = 'budget-warning';
      else if (type === 'saving_completed') type = 'savings-success';
      else if (type === 'saving_warning') type = 'savings-warning';

      return {
          id: n.id,
          created_at: n.created_at,
          read_at: n.read_at,
          timestamp: n.created_at, // Topbar uses timestamp
          // Flatten data properties
          message: data.message,
          title: data.title,
          type: type,
          // Keep original data just in case
          data: data
      };
  });
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
