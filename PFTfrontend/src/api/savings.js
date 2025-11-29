import axios from "./axios";

export function getSavings(params = {}) {
  return axios.get("/savings", { params }).then(res => res.data);
}

export function createSaving(data) {
  return axios.post("/savings", data).then(res => res.data);
}

export function updateSaving(id, data) {
  return axios.put(`/savings/${id}`, data).then(res => res.data);
}

export function deleteSaving(id) {
  return axios.delete(`/savings/${id}`).then(res => res.data);
}
