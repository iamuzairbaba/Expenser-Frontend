import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

export const GlobalContext = createContext(null);

export default function GlobalState({ children }) {
  const [token, setToken] = useState(localStorage.getItem("authToken") || "");
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuthSuccess = useCallback((data) => {
    localStorage.setItem("authToken", data.token);
    setToken(data.token);
    setUser(data.user);
    setError("");
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    setToken("");
    setUser(null);
  }, []);

  useEffect(() => {
    async function restoreSession() {
      if (!token) {
        setIsAuthReady(true);
        return;
      }

      try {
        const session = await api.me(token);
        setUser(session.user);
      } catch (sessionError) {
        logout();
      } finally {
        setIsAuthReady(true);
      }
    }

    restoreSession();
  }, [logout, token]);

  const runAuth = useCallback(
    async (action, payload) => {
      setIsLoading(true);
      setError("");
      try {
        const data = await action(payload);
        handleAuthSuccess(data);
        return true;
      } catch (authError) {
        setError(authError.message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthReady,
      isLoading,
      error,
      signup: (payload) => runAuth(api.signup, payload),
      login: (payload) => runAuth(api.login, payload),
      googleLogin: (credential) => runAuth(api.googleLogin, credential),
      logout,
    }),
    [error, isAuthReady, isLoading, logout, runAuth, token, user]
  );

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}
