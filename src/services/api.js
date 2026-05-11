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
  } catch {
    throw new Error(`Cannot connect to the backend at ${API_URL}. Start the backend server.`);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const api = {
  // Auth
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  googleLogin: (credential) => request("/auth/google", { method: "POST", body: { credential } }),
  me: (token) => request("/auth/me", { token }),

  // Transactions
  transactions: (params, token) => request(`/transactions?${new URLSearchParams(params)}`, { token }),
  createTransaction: (payload, token) => request("/transactions", { method: "POST", body: payload, token }),
  updateTransaction: (id, payload, token) => request(`/transactions/${id}`, { method: "PUT", body: payload, token }),
  deleteTransaction: (id, token) => request(`/transactions/${id}`, { method: "DELETE", token }),

  // Categories
  categories: (token) => request("/categories", { token }),
  createCategory: (payload, token) => request("/categories", { method: "POST", body: payload, token }),
  updateCategory: (id, payload, token) => request(`/categories/${id}`, { method: "PUT", body: payload, token }),
  deleteCategory: (id, token) => request(`/categories/${id}`, { method: "DELETE", token }),

  // Budget
  budget: (month, token) => request(`/budget?${new URLSearchParams({ month })}`, { token }),
  saveBudget: (payload, token) => request("/budget", { method: "PUT", body: payload, token }),

  // Analytics
  analytics: (month, token) => request(`/analytics/dashboard?${new URLSearchParams({ month })}`, { token }),

  // Settings
  getSettings: (token) => request("/settings", { token }),
  updateProfile: (payload, token) => request("/settings/profile", { method: "PUT", body: payload, token }),
  updatePreferences: (payload, token) => request("/settings/preferences", { method: "PUT", body: payload, token }),
  updateNotifications: (payload, token) => request("/settings/notifications", { method: "PUT", body: payload, token }),
  changePassword: (payload, token) => request("/settings/password", { method: "PUT", body: payload, token }),
  completeOnboarding: (payload, token) => request("/settings/onboarding", { method: "POST", body: payload, token }),
  addGoal: (payload, token) => request("/settings/goals", { method: "POST", body: payload, token }),
  deleteAccount: (payload, token) => request("/settings/account", { method: "DELETE", body: payload, token }),

  // Report Builder
  listReports: (token) => request("/reports/builder", { token }),
  getReport: (id, token) => request(`/reports/builder/${id}`, { token }),
  createReport: (payload, token) => request("/reports/builder", { method: "POST", body: payload, token }),
  updateReport: (id, payload, token) => request(`/reports/builder/${id}`, { method: "PUT", body: payload, token }),
  deleteReport: (id, token) => request(`/reports/builder/${id}`, { method: "DELETE", token }),
  duplicateReport: (id, token) => request(`/reports/builder/${id}/duplicate`, { method: "POST", token }),
};
