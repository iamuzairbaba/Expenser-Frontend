import { Spinner, Flex } from "@chakra-ui/react";
import { useContext, useState } from "react";
import "./App.css";
import AppShell from "./components/layout/AppShell";
import Auth from "./components/auth/Auth";
import { GlobalContext } from "./context";
import { useAppData } from "./hooks/useAppData";
import Budget from "./pages/Budget";
import Categories from "./pages/Categories";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Transactions from "./pages/Transactions";

function AuthedApp() {
  const { user, logout } = useContext(GlobalContext);
  const [activePage, setActivePage] = useState("dashboard");
  const data = useAppData();

  const page = {
    dashboard: <Dashboard analytics={data.analytics} isLoading={data.isLoading} />,
    transactions: (
      <Transactions
        transactions={data.transactions}
        categories={data.categories}
        filters={data.filters}
        actions={data.actions}
      />
    ),
    categories: <Categories categories={data.categories} actions={data.actions} />,
    budget: (
      <Budget
        month={data.month}
        budget={data.budget}
        categories={data.categories}
        actions={data.actions}
      />
    ),
    reports: <Reports analytics={data.analytics} transactions={data.transactions} />,
  }[activePage];

  return (
    <AppShell user={user} activePage={activePage} onPageChange={setActivePage} onLogout={logout}>
      {page}
    </AppShell>
  );
}

function App() {
  const { user, isAuthReady } = useContext(GlobalContext);

  if (!isAuthReady) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return user ? <AuthedApp /> : <Auth />;
}

export default App;
