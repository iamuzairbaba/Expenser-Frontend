import {
  Box, Button, Flex, Grid, Icon, SimpleGrid, Text, VStack, useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useState } from "react";
import Chart from "react-apexcharts";
import { FiDownload, FiFileText, FiGrid, FiLayout, FiTrendingUp } from "react-icons/fi";
import ChartBox from "../components/ui/ChartBox";
import ReportBuilder from "./builder/ReportBuilder";
import { exportCsv, exportExcel, exportPdf } from "../utils/export";
import { currency } from "../utils/format";

const MotionBox = motion(Box);

function SummaryCard({ label, value, color }) {
  const bg = useColorModeValue("white", "#111827");
  const border = useColorModeValue("gray.100", "whiteAlpha.100");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  return (
    <Box bg={bg} border="1px solid" borderColor={border} borderRadius="12px" p={4} boxShadow="card">
      <Text fontSize="xs" color={mutedColor} fontWeight="600" textTransform="uppercase" letterSpacing="0.08em" mb={1}>{label}</Text>
      <Text fontSize="xl" fontWeight="800" color={color} className="tabular-nums">{value}</Text>
    </Box>
  );
}

export default function Reports({ analytics, transactions }) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [isExporting, setIsExporting] = useState("");

  const bg = useColorModeValue("white", "#111827");
  const border = useColorModeValue("gray.100", "whiteAlpha.100");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const textColor = useColorModeValue("#64748b", "#94a3b8");
  const gridColor = useColorModeValue("#f1f5f9", "#1e293b");
  const chartMode = useColorModeValue("light", "dark");

  const categories = analytics?.categoryBreakdown || [];
  const monthly = analytics?.monthlyComparison || [];
  const summary = analytics?.summary || {};
  const items = transactions?.items || [];

  const labels = categories.length ? categories.map((c) => c.category.name) : ["No spending"];
  const series = categories.length ? categories.map((c) => c.total) : [0];
  const colors = categories.length ? categories.map((c) => c.category.color) : ["#CBD5E0"];
  const savingsRate = summary.income > 0 ? Math.round(((summary.income - summary.expense) / summary.income) * 100) : 0;

  async function handleExport(type) {
    setIsExporting(type);
    await new Promise((r) => setTimeout(r, 300));
    if (type === "csv") exportCsv(items);
    else if (type === "excel") exportExcel(items);
    else if (type === "pdf") exportPdf(summary, items);
    setIsExporting("");
  }

  const chartCommon = {
    chart: { background: "transparent", toolbar: { show: false }, fontFamily: "Inter, sans-serif" },
    theme: { mode: chartMode },
    grid: { borderColor: gridColor, strokeDashArray: 4 },
    xaxis: { labels: { style: { colors: textColor, fontSize: "11px" } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: textColor, fontSize: "11px" }, formatter: (v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}` } },
    tooltip: { theme: chartMode, style: { fontFamily: "Inter, sans-serif" } },
  };

  // Full-screen builder mode
  if (showBuilder) {
    return (
      <Box position="fixed" inset={0} zIndex={200}>
        <ReportBuilder
          analytics={analytics}
          transactions={transactions}
          onBack={() => setShowBuilder(false)}
        />
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={5}>
      {/* Report Builder CTA */}
      <MotionBox
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        bg="linear-gradient(135deg, #0ea5e9, #6366f1)"
        borderRadius="14px"
        p={5}
        boxShadow="0 4px 24px rgba(14,165,233,0.3)"
      >
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Box>
            <Text fontWeight="800" fontSize="lg" color="white">Custom Report Builder</Text>
            <Text fontSize="sm" color="whiteAlpha.800" mt={1}>
              Drag & drop widgets to build beautiful financial reports
            </Text>
          </Box>
          <Button
            leftIcon={<FiLayout />}
            bg="white"
            color="brand.600"
            _hover={{ bg: "whiteAlpha.900" }}
            borderRadius="10px"
            fontWeight="700"
            onClick={() => setShowBuilder(true)}
          >
            Open Builder
          </Button>
        </Flex>
      </MotionBox>

      {/* Summary cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <SummaryCard label="Total Income" value={currency(summary.income)} color="income.500" />
        <SummaryCard label="Total Expenses" value={currency(summary.expense)} color="expense.500" />
        <SummaryCard label="Net Balance" value={currency(summary.balance)} color="brand.500" />
        <SummaryCard label="Savings Rate" value={`${savingsRate}%`} color="purple.500" />
      </SimpleGrid>

      {/* Export buttons */}
      <MotionBox
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        bg={bg}
        border="1px solid"
        borderColor={border}
        borderRadius="14px"
        p={5}
        boxShadow="card"
      >
        <Text fontSize="sm" fontWeight="700" mb={4}>Quick Export</Text>
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={3}>
          <Button leftIcon={<FiDownload />} variant="outline" borderRadius="10px" isLoading={isExporting === "csv"} loadingText="Exporting..." onClick={() => handleExport("csv")} isDisabled={items.length === 0}>
            Export CSV
          </Button>
          <Button leftIcon={<FiGrid />} variant="outline" borderRadius="10px" isLoading={isExporting === "excel"} loadingText="Exporting..." onClick={() => handleExport("excel")} isDisabled={items.length === 0}>
            Export Excel
          </Button>
          <Button leftIcon={<FiFileText />} colorScheme="brand" borderRadius="10px" isLoading={isExporting === "pdf"} loadingText="Generating PDF..." onClick={() => handleExport("pdf")} isDisabled={items.length === 0}>
            Export PDF
          </Button>
        </Grid>
        {items.length === 0 && <Text fontSize="xs" color={mutedColor} mt={3}>Add transactions to enable exports</Text>}
      </MotionBox>

      {/* Charts */}
      <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={4}>
        <ChartBox title="Spending by Category" subtitle="Donut breakdown" isLoading={false}>
          <Chart
            type="donut"
            height={300}
            options={{
              labels,
              colors,
              legend: { position: "bottom", fontSize: "12px", fontFamily: "Inter, sans-serif", labels: { colors: textColor } },
              plotOptions: { pie: { donut: { size: "60%", labels: { show: true, total: { show: true, label: "Total", color: textColor, formatter: (w) => currency(w.globals.seriesTotals.reduce((a, b) => a + b, 0)) } } } } },
              dataLabels: { enabled: false },
              stroke: { width: 0 },
              chart: { background: "transparent", toolbar: { show: false }, fontFamily: "Inter, sans-serif" },
              theme: { mode: chartMode },
              tooltip: { theme: chartMode, y: { formatter: (v) => currency(v) } },
            }}
            series={series}
          />
        </ChartBox>
        <ChartBox title="Monthly Overview" subtitle="Income vs expenses trend" isLoading={false}>
          <Chart
            type="bar"
            height={300}
            options={{
              ...chartCommon,
              xaxis: { ...chartCommon.xaxis, categories: monthly.map((m) => m.month?.slice(5) || m.month) },
              colors: ["#22c55e", "#ef4444"],
              plotOptions: { bar: { borderRadius: 5, columnWidth: "55%", borderRadiusApplication: "end" } },
              dataLabels: { enabled: false },
              legend: { labels: { colors: textColor }, fontFamily: "Inter, sans-serif" },
            }}
            series={[
              { name: "Income", data: monthly.map((m) => m.income || 0) },
              { name: "Expenses", data: monthly.map((m) => m.expense || 0) },
            ]}
          />
        </ChartBox>
      </Grid>

      <Flex align="center" gap={2}>
        <Icon as={FiTrendingUp} color={mutedColor} boxSize={3.5} />
        <Text fontSize="xs" color={mutedColor}>Showing {items.length} transactions from current filter</Text>
      </Flex>
    </VStack>
  );
}
