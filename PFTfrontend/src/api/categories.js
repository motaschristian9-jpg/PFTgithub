import api from "./axios";

export const fetchCategories = async (params = {}) => {
  const { queryKey, signal, ...cleanParams } = params;
  const response = await api.get("/categories", { params: cleanParams });
  return response.data;
};
