import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "./useAuth";

const fetchNotifications = async (token) => {
  const response = await axios.get("http://localhost:8000/api/notifications", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data;
};

export const useNotifications = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => fetchNotifications(token),
    enabled: !!user && !!token,
    refetchInterval: 30000, // Poll every 30 seconds
  });
};
