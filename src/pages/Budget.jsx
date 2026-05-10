import { Alert, AlertIcon, Box, Button, Grid, HStack, Input, NumberInput, NumberInputField, Progress, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { currency } from "../utils/format";

export default function Budget({ month, budget, categories, actions }) {
  const [overallLimit, setOverallLimit] = useState(0);
  const [categoryLimits, setCategoryLimits] = useState({});

  useEffect(() => {
    setOverallLimit(budget?.budget?.overallLimit || 0);
    const next = {};
    budget?.budget?.categories?.forEach((item) => {
      next[item.category?._id] = item.limit;
    });
    setCategoryLimits(next);
  }, [budget]);

  function save() {
    actions.saveBudget({
      overallLimit,
      categories: Object.entries(categoryLimits)
        .filter(([, limit]) => Number(limit) > 0)
        .map(([category, limit]) => ({ category, limit })),
    });
  }

  const usage = budget?.usage;

  return (
    <VStack align="stretch" spacing={5}>
      <HStack justify="space-between">
        <Box>
          <Text fontSize="2xl" fontWeight="800">Budget</Text>
          <Text color="gray.500">Set monthly limits and spot overspending early.</Text>
        </Box>
        <Input type="month" maxW="180px" value={month} onChange={(e) => actions.setMonth(e.target.value)} />
      </HStack>

      {usage?.overallPercent > 100 ? <Alert status="error" borderRadius="8"><AlertIcon />Overall monthly budget exceeded.</Alert> : null}

      <Box border="1px solid" borderColor="gray.200" borderRadius="8" p={5}>
        <Grid templateColumns={{ base: "1fr", md: "1fr 2fr auto" }} gap={4} alignItems="end">
          <Box><Text fontWeight="700">Overall monthly budget</Text><Text color="gray.500">{currency(usage?.overallSpent)} spent</Text></Box>
          <Box><Progress value={usage?.overallPercent || 0} colorScheme={(usage?.overallPercent || 0) > 100 ? "red" : "blue"} borderRadius="8" /><Text mt={2}>{usage?.overallPercent || 0}% of {currency(overallLimit)}</Text></Box>
          <NumberInput value={overallLimit} min={0} onChange={(v) => setOverallLimit(v)}><NumberInputField /></NumberInput>
        </Grid>
      </Box>

      <VStack align="stretch">
        {categories.filter((category) => category.type === "expense").map((category) => {
          const categoryUsage = usage?.categories?.find((item) => item.category?._id === category._id);
          return (
            <Grid key={category._id} templateColumns={{ base: "1fr", md: "1fr 2fr 160px" }} gap={4} alignItems="center" border="1px solid" borderColor="gray.200" borderRadius="8" p={4}>
              <Box><Text fontWeight="700">{category.name}</Text><Text color="gray.500">{currency(categoryUsage?.spent)} spent</Text></Box>
              <Box><Progress value={categoryUsage?.percent || 0} colorScheme={(categoryUsage?.percent || 0) > 100 ? "red" : "teal"} borderRadius="8" /><Text mt={2}>{categoryUsage?.percent || 0}% used</Text></Box>
              <NumberInput value={categoryLimits[category._id] || ""} min={0} onChange={(v) => setCategoryLimits({ ...categoryLimits, [category._id]: v })}><NumberInputField placeholder="Limit" /></NumberInput>
            </Grid>
          );
        })}
      </VStack>
      <Button alignSelf="flex-start" colorScheme="blue" onClick={save}>Save budget</Button>
    </VStack>
  );
}
