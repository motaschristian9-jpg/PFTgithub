import axios from "./axios";

// Get all savings (supports filtering via params)
export function getSavings(params = {}) {
  return axios.get("/savings", { params }).then((res) => res.data);
}

// Create a new saving goal
export function createSaving(data) {
  return axios.post("/savings", data).then((res) => res.data);
}

// Update an existing saving goal
export function updateSaving(id, data) {
  return axios.put(`/savings/${id}`, data).then((res) => res.data);
}

// Delete a saving goal
export function deleteSaving(id) {
  return axios.delete(`/savings/${id}`).then((res) => res.data);
}
