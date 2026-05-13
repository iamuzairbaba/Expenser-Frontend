import { Box, Flex, Spinner, Text, useColorModeValue } from "@chakra-ui/react";
import { useContext, useState } from "react";
import "./App.css";
import AppShell from "./components/layout/AppShell";
import Auth from "./components/auth/Auth";
import Onboarding from "./components/onboarding/Onboarding";
import { GlobalContext } from "./context";
import { useAppData } from "./hooks/useAppData";
import Budget from "./pages/Budget";
import Categories from "./pages/Categories";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import Reports from "./pages/Reports";
import Settings from "./pages/settings/Settings";
import Transactions from "./pages/Transactions";

function GlobalLoadingOverlay({ isLoading }) {
  const overlayBg = useColorModeValue("rgba(248,250,252,0.7)", "rgba(11,17,32,0.7)");
  const textColor = useColorModeValue("gray.600", "gray.300");
  return (
    <Box
      position="fixed"
      inset={0}
      bg={overlayBg}
      backdropFilter="blur(2px)"
      zIndex={100}
      display={isLoading ? "flex" : "none"}
      alignItems="center"
      justifyContent="center"
      pointerEvents={isLoading ? "all" : "none"}
    >
      <Flex direction="column" align="center" gap={3}>
        <Spinner size="lg" color="brand.500" thickness="3px" speed="0.65s" />
        <Text fontSize="sm" fontWeight="600" color={textColor}>Loading...</Text>
      </Flex>
    </Box>
  );
}

function AuthedApp() {
  const { user, logout } = useContext(GlobalContext);
  const [activePage, setActivePage] = useState("dashboard");
  const data = useAppData();

  // Show onboarding only for brand-new users.
  // Existing users (onboardingCompleted undefined OR true) go straight to dashboard.
  const needsOnboarding = user?.onboardingCompleted === false;
  if (needsOnboarding) {
    return <Onboarding />;
  }

  const page = {
    dashboard: (
      <Dashboard
        analytics={data.analytics}
        isLoading={data.isLoading}
        budget={data.budget}
        transactions={data.transactions}
      />
    ),
    transactions: (
      <Transactions
        transactions={data.transactions}
        categories={data.categories}
        filters={data.filters}
        actions={data.actions}
        onUpgrade={() => setActivePage("pricing")}
      />
    ),
    categories: <Categories categories={data.categories} actions={data.actions} onUpgrade={() => setActivePage("pricing")} />,
    budget: (
      <Budget
        month={data.month}
        budget={data.budget}
        categories={data.categories}
        actions={data.actions}
      />
    ),
    reports: <Reports analytics={data.analytics} transactions={data.transactions} onUpgrade={() => setActivePage("pricing")} />,
    settings: <Settings transactions={data.transactions} onLogout={logout} />,
    pricing: <Pricing onClose={() => setActivePage("settings")} />,
  }[activePage] || null;

  return (
    <>
      <GlobalLoadingOverlay isLoading={data.isLoading} />
      <AppShell user={user} activePage={activePage} onPageChange={setActivePage} onLogout={logout}>
        {page}
      </AppShell>
    </>
  );
}

function AppLoader() {
  const bg = useColorModeValue("#f8fafc", "#0b1120");
  return (
    <Flex minH="100vh" align="center" justify="center" bg={bg}>
      <Flex direction="column" align="center" gap={3}>
        <Spinner size="xl" color="brand.500" thickness="3px" />
        <Text fontSize="sm" fontWeight="600" color="gray.500">Starting Expenser...</Text>
      </Flex>
    </Flex>
  );
}

function App() {
  const { user, isAuthReady } = useContext(GlobalContext);
  if (!isAuthReady) return <AppLoader />;
  return user ? <AuthedApp /> : <Auth />;
}

export default App;
