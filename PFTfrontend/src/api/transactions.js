import api from "./axios";

// Transactions API
export const createTransaction = async (transactionData) => {
  const response = await api.post("/transactions", transactionData);
  return response.data;
};

export const fetchTransactions = async (params = {}) => {
  const response = await api.get("/transactions", { params });
  return response.data;
};

export const updateTransaction = async (id, transactionData) => {
  const response = await api.put(`/transactions/${id}`, transactionData);
  console.log(response);
  return response.data;
};

export const deleteTransaction = async (id) => {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
};

// Savings API
export const createSaving = async (savingData) => {
  const response = await api.post("/savings", savingData);
  return response.data;
};

export const fetchSavings = async () => {
  const response = await api.get("/savings");
  return response.data.data;
};

export const updateSaving = async (id, savingData) => {
  const response = await api.put(`/savings/${id}`, savingData);
  return response.data;
};

// Budgets API
export const fetchBudgets = async () => {
  const response = await api.get("/budgets");
  return response.data.data;
};

// Categories API
export const fetchCategories = async (params = {}) => {
  // Remove internal react-query keys that cause malformed url params
  const { queryKey, signal, ...cleanParams } = params;
  const response = await api.get("/categories", { params: cleanParams });
  return response.data;
};
