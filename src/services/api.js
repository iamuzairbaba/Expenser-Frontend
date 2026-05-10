const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

async function request(path, { method = "GET", body, token } = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new Error(`Cannot connect to the backend at ${API_URL}. Start the backend server.`);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const api = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  googleLogin: (credential) => request("/auth/google", { method: "POST", body: { credential } }),
  me: (token) => request("/auth/me", { token }),
  transactions: (params, token) => request(`/transactions?${new URLSearchParams(params)}`, { token }),
  createTransaction: (payload, token) => request("/transactions", { method: "POST", body: payload, token }),
  updateTransaction: (id, payload, token) =>
    request(`/transactions/${id}`, { method: "PUT", body: payload, token }),
  deleteTransaction: (id, token) => request(`/transactions/${id}`, { method: "DELETE", token }),
  categories: (token) => request("/categories", { token }),
  createCategory: (payload, token) => request("/categories", { method: "POST", body: payload, token }),
  updateCategory: (id, payload, token) =>
    request(`/categories/${id}`, { method: "PUT", body: payload, token }),
  deleteCategory: (id, token) => request(`/categories/${id}`, { method: "DELETE", token }),
  budget: (month, token) => request(`/budget?${new URLSearchParams({ month })}`, { token }),
  saveBudget: (payload, token) => request("/budget", { method: "PUT", body: payload, token }),
  analytics: (month, token) =>
    request(`/analytics/dashboard?${new URLSearchParams({ month })}`, { token }),
};
