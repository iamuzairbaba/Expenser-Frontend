import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { GlobalContext } from "../context";
import { api } from "../services/api";
import { currentMonth } from "../utils/format";

const defaultFilters = {
  page: 1,
  limit: 8,
  type: "",
  category: "",
  startDate: "",
  endDate: "",
  search: "",
};

const emptyTransactions = {
  items: [],
  page: 1,
  pages: 1,
  total: 0,
  limit: 8,
};

function normalizeTransactions(data) {
  if (Array.isArray(data)) {
    return {
      ...emptyTransactions,
      items: data,
      total: data.length,
    };
  }

  return {
    ...emptyTransactions,
    ...data,
    items: Array.isArray(data?.items) ? data.items : [],
  };
}

export function useAppData() {
  const { token } = useContext(GlobalContext);
  const toast = useToast();
  const [month, setMonth] = useState(currentMonth());
  const [filters, setFilters] = useState(defaultFilters);
  const [transactions, setTransactions] = useState(emptyTransactions);
  const [categories, setCategories] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [budget, setBudget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const notifyError = useCallback(
    (title, error) => {
      toast({
        title,
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    },
    [toast]
  );

  const loadCategories = useCallback(async () => {
    const data = await api.categories(token);
    const normalized = Array.isArray(data) ? data : [];
    setCategories(normalized);
    return normalized;
  }, [token]);

  const loadTransactions = useCallback(async () => {
    const data = await api.transactions(filters, token);
    const normalized = normalizeTransactions(data);
    setTransactions(normalized);
    return normalized;
  }, [filters, token]);

  const loadAnalytics = useCallback(async () => {
    const data = await api.analytics(month, token);
    setAnalytics(data);
    return data;
  }, [month, token]);

  const loadBudget = useCallback(async () => {
    const data = await api.budget(month, token);
    setBudget(data);
    return data;
  }, [month, token]);

  const refresh = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      await Promise.all([loadCategories(), loadTransactions(), loadAnalytics(), loadBudget()]);
    } catch (error) {
      notifyError("Could not load app data", error);
    } finally {
      setIsLoading(false);
    }
  }, [loadAnalytics, loadBudget, loadCategories, loadTransactions, notifyError, token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const actions = useMemo(
    () => ({
      setMonth,
      setFilters,
      async saveTransaction(payload, id) {
        try {
          if (id) await api.updateTransaction(id, payload, token);
          else await api.createTransaction(payload, token);
          toast({ title: id ? "Transaction updated" : "Transaction added", status: "success", duration: 2500 });
          await refresh();
          return true;
        } catch (error) {
          notifyError("Could not save transaction", error);
          return false;
        }
      },
      async deleteTransaction(id) {
        try {
          await api.deleteTransaction(id, token);
          toast({ title: "Transaction deleted", status: "success", duration: 2500 });
          await refresh();
        } catch (error) {
          notifyError("Could not delete transaction", error);
        }
      },
      async saveCategory(payload, id) {
        try {
          if (id) await api.updateCategory(id, payload, token);
          else await api.createCategory(payload, token);
          toast({ title: id ? "Category updated" : "Category created", status: "success", duration: 2500 });
          await refresh();
          return true;
        } catch (error) {
          notifyError("Could not save category", error);
          return false;
        }
      },
      async deleteCategory(id) {
        try {
          await api.deleteCategory(id, token);
          toast({ title: "Category deleted", status: "success", duration: 2500 });
          await refresh();
        } catch (error) {
          notifyError("Could not delete category", error);
        }
      },
      async saveBudget(payload) {
        try {
          await api.saveBudget({ ...payload, month }, token);
          toast({ title: "Budget saved", status: "success", duration: 2500 });
          await refresh();
        } catch (error) {
          notifyError("Could not save budget", error);
        }
      },
      refresh,
    }),
    [month, notifyError, refresh, toast, token]
  );

  return {
    month,
    filters,
    transactions,
    categories,
    analytics,
    budget,
    isLoading,
    actions,
  };
}
