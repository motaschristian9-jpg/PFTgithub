import api from "./axios";

// Profile
export const fetchProfile = async () => {
  const response = await api.get("/user");
  return response.data;
};

export const fetchTransactions = async () => {
  const response = await api.get("/transactions");
  return response.data;
};

export const fetchBudgets = async () => {
  const response = await api.get("/budgets");
  return response.data.data;
};

export const fetchSavings = async () => {
  const response = await api.get("/savings");
  return response.data.data;
};
