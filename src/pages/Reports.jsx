import { Box, Button, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { FiDownload, FiFileText } from "react-icons/fi";
import Chart from "react-apexcharts";
import ChartBox from "../components/ui/ChartBox";
import { exportCsv, exportExcel, exportPdf } from "../utils/export";

export default function Reports({ analytics, transactions }) {
  const categories = analytics?.categoryBreakdown || [];
  const items = transactions.items || [];
  const labels = categories.length ? categories.map((item) => item.category.name) : ["No spending"];
  const series = categories.length ? categories.map((item) => item.total) : [0];
  const colors = categories.length ? categories.map((item) => item.category.color) : ["#CBD5E0"];

  return (
    <VStack align="stretch" spacing={5}>
      <Box>
        <Text fontSize="2xl" fontWeight="800">Reports</Text>
        <Text color="gray.500">Export your transaction data and monthly summary.</Text>
      </Box>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Button leftIcon={<FiDownload />} onClick={() => exportCsv(items)}>Export CSV</Button>
        <Button leftIcon={<FiDownload />} onClick={() => exportExcel(items)}>Export Excel</Button>
        <Button leftIcon={<FiFileText />} colorScheme="blue" onClick={() => exportPdf(analytics?.summary, items)}>Export PDF</Button>
      </SimpleGrid>
      <ChartBox title="Report Snapshot" isLoading={false}>
        <Chart
          type="donut"
          height={320}
          options={{ labels, colors, legend: { position: "bottom" } }}
          series={series}
        />
      </ChartBox>
      <HStack color="gray.500"><Text>{items.length} transactions included from the current filtered page.</Text></HStack>
    </VStack>
  );
}
