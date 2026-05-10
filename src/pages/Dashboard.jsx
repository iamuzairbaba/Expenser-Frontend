import { Alert, AlertIcon, Box, Grid, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import Chart from "react-apexcharts";
import ChartBox from "../components/ui/ChartBox";
import StatCard from "../components/ui/StatCard";
import { currency } from "../utils/format";

export default function Dashboard({ analytics, isLoading }) {
  const summary = analytics?.summary || {};
  const categories = analytics?.categoryBreakdown || [];
  const monthly = analytics?.monthlyComparison || [];
  const trend = analytics?.spendingTrend || [];
  const insights = analytics?.insights || {};
  const pieLabels = categories.length ? categories.map((item) => item.category.name) : ["No spending"];
  const pieSeries = categories.length ? categories.map((item) => item.total) : [0];
  const pieColors = categories.length ? categories.map((item) => item.category.color) : ["#CBD5E0"];

  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <Heading size="lg">Dashboard</Heading>
        <Text color="gray.500">A clear view of your money, trends, and budget signals.</Text>
      </Box>

      {insights.budgetExceeded ? (
        <Alert status="warning" borderRadius="8">
          <AlertIcon />
          Your monthly budget has been exceeded.
        </Alert>
      ) : null}

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <StatCard label="Total Balance" value={summary.balance} />
        <StatCard label="Total Income" value={summary.income} change={summary.incomeChange} />
        <StatCard label="Total Expenses" value={summary.expense} change={summary.expenseChange} />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
        <Box border="1px solid" borderColor="gray.200" borderRadius="8" p={5}>
          <Text color="gray.500" fontSize="sm">Highest spending category</Text>
          <Heading size="md">{insights.highestSpendingCategory || "No spending yet"}</Heading>
        </Box>
        <Box border="1px solid" borderColor="gray.200" borderRadius="8" p={5}>
          <Text color="gray.500" fontSize="sm">Average daily spending</Text>
          <Heading size="md">{currency(insights.averageDailySpending)}</Heading>
        </Box>
        <Box border="1px solid" borderColor="gray.200" borderRadius="8" p={5}>
          <Text color="gray.500" fontSize="sm">Smart summary</Text>
          <Heading size="sm">{insights.spendingMessage || "Add transactions to unlock insights"}</Heading>
        </Box>
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={4}>
        <ChartBox title="Category Breakdown" isLoading={isLoading}>
          <Chart
            type="pie"
            height={280}
            options={{
              labels: pieLabels,
              colors: pieColors,
              legend: { position: "bottom" },
            }}
            series={pieSeries}
          />
        </ChartBox>
        <ChartBox title="Monthly Comparison" isLoading={isLoading}>
          <Chart
            type="bar"
            height={280}
            options={{
              xaxis: { categories: monthly.map((item) => item.month) },
              colors: ["#14B8A6", "#2563EB"],
              plotOptions: { bar: { borderRadius: 4 } },
            }}
            series={[
              { name: "Income", data: monthly.map((item) => item.income) },
              { name: "Expenses", data: monthly.map((item) => item.expense) },
            ]}
          />
        </ChartBox>
        <ChartBox title="Spending Trend" isLoading={isLoading}>
          <Chart
            type="line"
            height={280}
            options={{
              xaxis: { categories: trend.map((item) => item.date) },
              colors: ["#F97316"],
              stroke: { curve: "smooth", width: 3 },
            }}
            series={[{ name: "Daily spending", data: trend.map((item) => item.total) }]}
          />
        </ChartBox>
      </Grid>
    </VStack>
  );
}
