import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  Grid,
  HStack,
  Icon,
  SimpleGrid,
  Skeleton,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import Chart from "react-apexcharts";
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowDownRight,
  FiArrowUpRight,
  FiCheckCircle,
  FiCreditCard,
  FiDollarSign,
  FiRepeat,
  FiShield,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import ChartBox from "../components/ui/ChartBox";
import StatCard from "../components/ui/StatCard";
import { currency } from "../utils/format";

const MotionBox = motion(Box);

function computeHealthScore(summary, budget) {
  if (!summary) return 0;
  let score = 50;
  const { income, expense } = summary;
  if (!income) return score;
  const savingsRatio = (income - expense) / income;
  if (savingsRatio >= 0.3) score += 25;
  else if (savingsRatio >= 0.15) score += 15;
  else if (savingsRatio >= 0) score += 5;
  else score -= 15;
  if (budget?.usage?.overallPercent !== undefined) {
    const pct = budget.usage.overallPercent;
    if (pct <= 80) score += 15;
    else if (pct <= 100) score += 5;
    else score -= 10;
  } else {
    score += 10;
  }
  if (summary.expenseChange < 0) score += 10;
  else if (summary.expenseChange > 20) score -= 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function detectSubscriptions(transactions) {
  const keywords = {
    Netflix: 15, Spotify: 10, "Amazon Prime": 15, Gym: 30,
    Internet: 50, Hulu: 12, Disney: 8, "Apple Music": 10,
    YouTube: 14, Notion: 8, Dropbox: 10, Slack: 8,
  };
  const items = transactions?.items || [];
  const found = [];
  Object.entries(keywords).forEach(([name, amount]) => {
    const match = items.find(
      (t) =>
        t.notes?.toLowerCase().includes(name.toLowerCase()) ||
        t.description?.toLowerCase().includes(name.toLowerCase())
    );
    if (match) found.push({ name, amount: match.amount, frequency: "monthly" });
  });
  return found.slice(0, 5);
}

function HealthScore({ score, bg, border, trackColor, descColor }) {
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "Excellent" : score >= 50 ? "Good" : "Needs Work";
  return (
    <MotionBox
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      bg={bg}
      border="1px solid"
      borderColor={border}
      borderRadius="14px"
      p={5}
      boxShadow="card"
    >
      <Flex align="center" gap={2} mb={4}>
        <Icon as={FiShield} color="brand.500" boxSize={4} />
        <Text fontSize="sm" fontWeight="700">Financial Health Score</Text>
      </Flex>
      <Flex align="center" gap={5}>
        <CircularProgress value={score} color={color} trackColor={trackColor} size="80px" thickness="8px">
          <CircularProgressLabel fontSize="lg" fontWeight="800" color={color}>{score}</CircularProgressLabel>
        </CircularProgress>
        <Box>
          <Badge colorScheme={score >= 75 ? "green" : score >= 50 ? "yellow" : "red"} fontSize="sm" px={3} py={1} borderRadius="full">
            {label}
          </Badge>
          <Text fontSize="xs" color={descColor} mt={2} maxW="160px">
            Based on savings ratio, spending habits & budget control
          </Text>
        </Box>
      </Flex>
    </MotionBox>
  );
}

function InsightCard({ icon: CardIcon, text, type, bgMap }) {
  const colors = bgMap[type] || bgMap.info;
  return (
    <Flex align="flex-start" gap={3} p={3.5} bg={colors.bg} borderRadius="10px">
      <Icon as={CardIcon} color={colors.color} boxSize={4} mt={0.5} flexShrink={0} />
      <Text fontSize="sm" fontWeight="500" lineHeight="1.5">{text}</Text>
    </Flex>
  );
}

function SubscriptionItem({ name, amount, frequency, border }) {
  return (
    <Flex justify="space-between" align="center" py={2.5} borderBottom="1px solid" borderColor={border} _last={{ borderBottom: "none" }}>
      <HStack gap={2}>
        <Icon as={FiRepeat} boxSize={3.5} color="brand.500" />
        <Text fontSize="sm" fontWeight="600">{name}</Text>
        <Badge fontSize="9px" colorScheme="blue" variant="subtle">{frequency}</Badge>
      </HStack>
      <Text fontSize="sm" fontWeight="700" color="expense.500">{currency(amount)}</Text>
    </Flex>
  );
}

export default function Dashboard({ analytics, isLoading, budget, transactions }) {
  // All color mode values at top level
  const chartMode = useColorModeValue("light", "dark");
  const textColor = useColorModeValue("#64748b", "#94a3b8");
  const gridColor = useColorModeValue("#f1f5f9", "#1e293b");
  const bg = useColorModeValue("white", "#111827");
  const border = useColorModeValue("gray.100", "whiteAlpha.100");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const trackColor = useColorModeValue("gray.100", "whiteAlpha.100");
  const descColor = useColorModeValue("gray.500", "gray.400");
  const infoBg = useColorModeValue("brand.50", "rgba(14,165,233,0.1)");
  const successBg = useColorModeValue("green.50", "rgba(34,197,94,0.1)");
  const warningBg = useColorModeValue("orange.50", "rgba(245,158,11,0.1)");
  const dangerBg = useColorModeValue("red.50", "rgba(239,68,68,0.1)");

  const insightBgMap = {
    info: { bg: infoBg, color: "brand.500" },
    success: { bg: successBg, color: "income.500" },
    warning: { bg: warningBg, color: "orange.500" },
    danger: { bg: dangerBg, color: "expense.500" },
  };

  const summary = analytics?.summary || {};
  const categories = analytics?.categoryBreakdown || [];
  const monthly = analytics?.monthlyComparison || [];
  const trend = analytics?.spendingTrend || [];
  const insights = analytics?.insights || {};

  const pieLabels = categories.length ? categories.map((c) => c.category.name) : ["No spending"];
  const pieSeries = categories.length ? categories.map((c) => c.total) : [0];
  const pieColors = categories.length ? categories.map((c) => c.category.color) : ["#CBD5E0"];

  const savingsRate = summary.income > 0
    ? Math.round(((summary.income - summary.expense) / summary.income) * 100)
    : 0;

  const healthScore = computeHealthScore(summary, budget);
  const subscriptions = detectSubscriptions(transactions);

  const chartCommon = {
    chart: { background: "transparent", toolbar: { show: false }, fontFamily: "Inter, sans-serif" },
    theme: { mode: chartMode },
    tooltip: { theme: chartMode, style: { fontFamily: "Inter, sans-serif", fontSize: "12px" } },
    grid: { borderColor: gridColor, strokeDashArray: 4 },
    xaxis: {
      labels: { style: { colors: textColor, fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: textColor, fontSize: "11px" },
        formatter: (v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}`,
      },
    },
  };

  const donutOptions = {
    labels: pieLabels,
    colors: pieColors,
    legend: { position: "bottom", fontSize: "12px", fontFamily: "Inter, sans-serif", labels: { colors: textColor } },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              color: textColor,
              formatter: (w) => currency(w.globals.seriesTotals.reduce((a, b) => a + b, 0)),
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    chart: { background: "transparent", toolbar: { show: false }, fontFamily: "Inter, sans-serif" },
    theme: { mode: chartMode },
    tooltip: { theme: chartMode, y: { formatter: (v) => currency(v) } },
  };

  const barOptions = {
    ...chartCommon,
    xaxis: { ...chartCommon.xaxis, categories: monthly.map((m) => m.month?.slice(5) || m.month) },
    colors: ["#22c55e", "#ef4444"],
    plotOptions: { bar: { borderRadius: 5, columnWidth: "55%", borderRadiusApplication: "end" } },
    dataLabels: { enabled: false },
    legend: { labels: { colors: textColor }, fontFamily: "Inter, sans-serif" },
  };

  const spendingTrendOptions = {
    ...chartCommon,
    xaxis: { ...chartCommon.xaxis, categories: trend.map((t) => t.date?.slice(5) || t.date) },
    colors: ["#ef4444"],
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.02, stops: [0, 100] } },
    stroke: { curve: "smooth", width: 2.5 },
    dataLabels: { enabled: false },
    tooltip: { ...chartCommon.tooltip, y: { formatter: (v) => currency(v) } },
  };

  const savingsTrend = monthly.map((m) => ({
    month: m.month,
    savings: Math.max(0, (m.income || 0) - (m.expense || 0)),
  }));

  const savingsTrendOptions = {
    ...chartCommon,
    xaxis: { ...chartCommon.xaxis, categories: savingsTrend.map((s) => s.month?.slice(5) || s.month) },
    colors: ["#22c55e"],
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.02, stops: [0, 100] } },
    stroke: { curve: "smooth", width: 2.5 },
    dataLabels: { enabled: false },
    tooltip: { ...chartCommon.tooltip, y: { formatter: (v) => currency(v) } },
  };

  const insightItems = [];
  if (insights.spendingMessage) {
    insightItems.push({
      icon: insights.expenseChange >= 0 ? FiArrowUpRight : FiArrowDownRight,
      text: insights.spendingMessage,
      type: insights.expenseChange >= 0 ? "warning" : "success",
    });
  }
  if (summary.income > 0) {
    insightItems.push({
      icon: FiTrendingUp,
      text: `You saved ${currency(summary.income - summary.expense)} this month (${savingsRate}% savings rate)`,
      type: savingsRate >= 20 ? "success" : savingsRate >= 0 ? "info" : "danger",
    });
  }
  if (insights.highestSpendingCategory && insights.highestSpendingCategory !== "No spending yet") {
    insightItems.push({
      icon: FiActivity,
      text: `Highest spending: ${insights.highestSpendingCategory} — avg ${currency(insights.averageDailySpending)}/day`,
      type: "info",
    });
  }
  if (budget?.usage?.overallPercent > 100) {
    insightItems.push({
      icon: FiAlertTriangle,
      text: "Monthly budget exceeded! Review your spending immediately.",
      type: "danger",
    });
  } else if (budget?.usage?.overallPercent >= 80) {
    insightItems.push({
      icon: FiAlertTriangle,
      text: `You've used ${budget.usage.overallPercent}% of your monthly budget. Slow down spending.`,
      type: "warning",
    });
  } else if (budget?.budget?.overallLimit > 0) {
    insightItems.push({
      icon: FiCheckCircle,
      text: `You're under budget — ${currency(budget.budget.overallLimit - (budget.usage?.overallSpent || 0))} remaining.`,
      type: "success",
    });
  }
  if (insights.budgetPrediction) {
    insightItems.push({ icon: FiAlertTriangle, text: insights.budgetPrediction, type: "warning" });
  }

  return (
    <VStack align="stretch" spacing={5}>
      {insights.budgetExceeded && (
        <Alert status="error" borderRadius="10px" fontSize="sm">
          <AlertIcon />
          Monthly budget exceeded — review your spending.
        </Alert>
      )}

      <SimpleGrid columns={{ base: 2, md: 3, xl: 5 }} spacing={4}>
        <StatCard label="Total Balance" value={summary.balance} icon={FiDollarSign} accent="brand" />
        <StatCard label="Income" value={summary.income} change={summary.incomeChange} icon={FiArrowUpRight} accent="income" />
        <StatCard label="Expenses" value={summary.expense} change={summary.expenseChange} icon={FiArrowDownRight} accent="expense" />
        <StatCard label="Savings Rate" value={savingsRate} isCurrency={false} suffix="%" icon={FiTrendingUp} accent="purple" />
        <StatCard
          label="Budget Used"
          value={budget?.usage?.overallPercent || 0}
          isCurrency={false}
          suffix="%"
          icon={FiActivity}
          accent={budget?.usage?.overallPercent > 100 ? "expense" : "brand"}
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={4}>
        <ChartBox title="Expense Breakdown" subtitle="By category this month" isLoading={isLoading}>
          <Chart type="donut" height={280} options={donutOptions} series={pieSeries} />
        </ChartBox>
        <ChartBox title="Income vs Expenses" subtitle="Monthly comparison" isLoading={isLoading}>
          <Chart
            type="bar"
            height={280}
            options={barOptions}
            series={[
              { name: "Income", data: monthly.map((m) => m.income || 0) },
              { name: "Expenses", data: monthly.map((m) => m.expense || 0) },
            ]}
          />
        </ChartBox>
      </Grid>

      <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={4}>
        <ChartBox title="Spending Trend" subtitle="Daily expenses this month" isLoading={isLoading}>
          <Chart type="area" height={220} options={spendingTrendOptions} series={[{ name: "Daily Spending", data: trend.map((t) => t.total || 0) }]} />
        </ChartBox>
        <ChartBox title="Savings Trend" subtitle="Monthly savings over time" isLoading={isLoading}>
          <Chart type="area" height={220} options={savingsTrendOptions} series={[{ name: "Savings", data: savingsTrend.map((s) => s.savings) }]} />
        </ChartBox>
      </Grid>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr 1fr" }} gap={4}>
        <MotionBox
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          bg={bg}
          border="1px solid"
          borderColor={border}
          borderRadius="14px"
          p={5}
          boxShadow="card"
        >
          <Flex align="center" gap={2} mb={4}>
            <Icon as={FiZap} color="brand.500" boxSize={4} />
            <Text fontSize="sm" fontWeight="700">Smart Insights</Text>
          </Flex>
          <VStack align="stretch" spacing={2}>
            {isLoading ? (
              [1, 2, 3].map((i) => <Skeleton key={i} h="48px" borderRadius="10px" />)
            ) : insightItems.length > 0 ? (
              insightItems.map((item, i) => (
                <InsightCard key={i} icon={item.icon} text={item.text} type={item.type} bgMap={insightBgMap} />
              ))
            ) : (
              <Text fontSize="sm" color={mutedColor} textAlign="center" py={4}>
                Add transactions to unlock insights
              </Text>
            )}
          </VStack>
        </MotionBox>

        <HealthScore score={healthScore} bg={bg} border={border} trackColor={trackColor} descColor={descColor} />

        <MotionBox
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          bg={bg}
          border="1px solid"
          borderColor={border}
          borderRadius="14px"
          p={5}
          boxShadow="card"
        >
          <Flex align="center" gap={2} mb={4}>
            <Icon as={FiCreditCard} color="brand.500" boxSize={4} />
            <Text fontSize="sm" fontWeight="700">Detected Subscriptions</Text>
          </Flex>
          {isLoading ? (
            <VStack spacing={2}>
              {[1, 2, 3].map((i) => <Skeleton key={i} h="36px" borderRadius="8px" />)}
            </VStack>
          ) : subscriptions.length > 0 ? (
            <Box>
              {subscriptions.map((sub, i) => (
                <SubscriptionItem key={i} name={sub.name} amount={sub.amount} frequency={sub.frequency} border={border} />
              ))}
            </Box>
          ) : (
            <Text fontSize="sm" color={mutedColor} textAlign="center" py={4}>
              No recurring subscriptions detected yet
            </Text>
          )}
        </MotionBox>
      </Grid>
    </VStack>
  );
}
