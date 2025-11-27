import axios from "./axios";

export function getBudgets(params = {}) {
  return axios.get("/budgets", { params }).then(res => res.data);
}

export function createBudget(data) {
  return axios.post("/budgets", data).then(res => res.data);
}

export function updateBudget(id, data) {
  return axios.put(`/budgets/${id}`, data).then(res => res.data);
}

export function deleteBudget(id) {
  return axios.delete(`/budgets/${id}`).then(res => res.data);
}
