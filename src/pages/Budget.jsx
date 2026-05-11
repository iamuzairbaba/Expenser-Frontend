import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  Grid,
  HStack,
  Icon,
  Input,
  NumberInput,
  NumberInputField,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FiCheckCircle, FiSave, FiTrendingUp } from "react-icons/fi";
import { currency } from "../utils/format";

const MotionBox = motion(Box);

function BudgetRing({ label, spent, limit, color, icon: CardIcon }) {
  const bg = useColorModeValue("white", "#111827");
  const border = useColorModeValue("gray.100", "whiteAlpha.100");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const trackColor = useColorModeValue("gray.100", "whiteAlpha.100");

  const pct = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
  const exceeded = limit > 0 && spent > limit;
  const warning = pct >= 80 && !exceeded;
  const ringColor = exceeded ? "#ef4444" : warning ? "#f59e0b" : color || "#0ea5e9";
  const remaining = Math.max(0, limit - spent);

  return (
    <MotionBox
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      bg={bg}
      border="1px solid"
      borderColor={exceeded ? "expense.500" : warning ? "orange.300" : border}
      borderRadius="14px"
      p={5}
      boxShadow="card"
      position="relative"
      overflow="hidden"
    >
      {exceeded && (
        <Box position="absolute" top={0} left={0} right={0} h="3px" bg="expense.500" />
      )}
      {warning && !exceeded && (
        <Box position="absolute" top={0} left={0} right={0} h="3px" bg="orange.400" />
      )}

      <Flex align="center" gap={4}>
        <CircularProgress
          value={pct}
          color={ringColor}
          trackColor={trackColor}
          size="72px"
          thickness="8px"
        >
          <CircularProgressLabel fontSize="sm" fontWeight="800" color={ringColor}>
            {pct}%
          </CircularProgressLabel>
        </CircularProgress>

        <Box flex={1} minW={0}>
          <Flex align="center" gap={2} mb={1}>
            <Text fontSize="sm" fontWeight="700" noOfLines={1}>{label}</Text>
            {exceeded && <Badge colorScheme="red" fontSize="9px">Over</Badge>}
            {warning && !exceeded && <Badge colorScheme="orange" fontSize="9px">Near limit</Badge>}
          </Flex>
          <Text fontSize="xs" color={mutedColor}>
            {currency(spent)} of {currency(limit)}
          </Text>
          {limit > 0 && (
            <Text fontSize="xs" color={exceeded ? "expense.500" : "income.500"} fontWeight="600" mt={0.5}>
              {exceeded ? `${currency(spent - limit)} over` : `${currency(remaining)} left`}
            </Text>
          )}
        </Box>
      </Flex>
    </MotionBox>
  );
}

function BudgetPrediction({ category, spent, limit, daysElapsed, daysInMonth }) {
  if (!limit || !spent || !daysElapsed) return null;
  const dailyRate = spent / daysElapsed;
  const projectedTotal = dailyRate * daysInMonth;
  const daysToExceed = limit > spent ? Math.ceil((limit - spent) / dailyRate) : 0;
  const willExceed = projectedTotal > limit;

  if (!willExceed && daysToExceed > 10) return null;

  return (
    <Flex align="center" gap={2} p={2.5} bg="orange.50" _dark={{ bg: "rgba(245,158,11,0.1)" }} borderRadius="8px">
      <Icon as={FiTrendingUp} color="orange.500" boxSize={3.5} flexShrink={0} />
      <Text fontSize="xs" fontWeight="500">
        {willExceed
          ? `At current pace, you'll exceed ${category} budget by ${currency(projectedTotal - limit)}`
          : `${category} budget will run out in ~${daysToExceed} days`}
      </Text>
    </Flex>
  );
}

export default function Budget({ month, budget, categories, actions }) {
  const [overallLimit, setOverallLimit] = useState(0);
  const [categoryLimits, setCategoryLimits] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const bg = useColorModeValue("white", "#111827");
  const border = useColorModeValue("gray.100", "whiteAlpha.100");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const overallTrackColor = useColorModeValue("gray.100", "whiteAlpha.100");

  useEffect(() => {
    setOverallLimit(budget?.budget?.overallLimit || 0);
    const next = {};
    budget?.budget?.categories?.forEach((item) => {
      next[item.category?._id] = item.limit;
    });
    setCategoryLimits(next);
  }, [budget]);

  async function save() {
    setIsSaving(true);
    await actions.saveBudget({
      overallLimit,
      categories: Object.entries(categoryLimits)
        .filter(([, limit]) => Number(limit) > 0)
        .map(([category, limit]) => ({ category, limit: Number(limit) })),
    });
    setIsSaving(false);
  }

  const usage = budget?.usage;
  const expenseCategories = (categories || []).filter((c) => c.type === "expense");

  // Days calculation for prediction
  const now = new Date();
  const [year, monthNum] = (month || "").split("-").map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const daysElapsed = Math.max(1, now.getDate());

  const overallPct = usage?.overallPercent || 0;
  const overallSpent = usage?.overallSpent || 0;

  return (
    <VStack align="stretch" spacing={5}>
      {/* Header */}
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
        <Box>
          <Text fontSize="xs" color={mutedColor} fontWeight="600" textTransform="uppercase" letterSpacing="0.08em">
            Monthly Budget
          </Text>
        </Box>
        <HStack spacing={3}>
          <Input
            type="month"
            maxW="160px"
            size="sm"
            value={month}
            onChange={(e) => actions.setMonth(e.target.value)}
          />
          <Button
            leftIcon={<FiSave />}
            colorScheme="brand"
            size="sm"
            borderRadius="8px"
            onClick={save}
            isLoading={isSaving}
            loadingText="Saving..."
          >
            Save Budget
          </Button>
        </HStack>
      </Flex>

      {/* Alerts */}
      {overallPct > 100 && (
        <Alert status="error" borderRadius="10px" fontSize="sm">
          <AlertIcon />
          Monthly budget exceeded by {currency(overallSpent - overallLimit)}. Review your spending.
        </Alert>
      )}
      {overallPct >= 80 && overallPct <= 100 && (
        <Alert status="warning" borderRadius="10px" fontSize="sm">
          <AlertIcon />
          You've used {overallPct}% of your monthly budget. {currency(overallLimit - overallSpent)} remaining.
        </Alert>
      )}

      {/* Overall budget card */}
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
        <Text fontSize="sm" fontWeight="700" mb={4}>Overall Monthly Budget</Text>
        <Grid templateColumns={{ base: "1fr", md: "auto 1fr auto" }} gap={4} alignItems="center">
          <CircularProgress
            value={overallPct}
            color={overallPct > 100 ? "#ef4444" : overallPct >= 80 ? "#f59e0b" : "#0ea5e9"}
            trackColor={overallTrackColor}
            size="90px"
            thickness="8px"
          >
            <CircularProgressLabel fontSize="md" fontWeight="800">
              {overallPct}%
            </CircularProgressLabel>
          </CircularProgress>

          <Box>
            <Flex justify="space-between" mb={2}>
              <Text fontSize="sm" color={mutedColor}>Spent</Text>
              <Text fontSize="sm" fontWeight="700" color="expense.500">{currency(overallSpent)}</Text>
            </Flex>
            <Flex justify="space-between" mb={2}>
              <Text fontSize="sm" color={mutedColor}>Budget</Text>
              <Text fontSize="sm" fontWeight="700">{currency(overallLimit)}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text fontSize="sm" color={mutedColor}>Remaining</Text>
              <Text fontSize="sm" fontWeight="700" color={overallSpent > overallLimit ? "expense.500" : "income.500"}>
                {currency(Math.max(0, overallLimit - overallSpent))}
              </Text>
            </Flex>
          </Box>

          <Box>
            <Text fontSize="xs" color={mutedColor} mb={1} fontWeight="600">Set Limit</Text>
            <NumberInput value={overallLimit} min={0} onChange={(v) => setOverallLimit(v)} w="140px">
              <NumberInputField placeholder="0.00" />
            </NumberInput>
          </Box>
        </Grid>

        {/* Overall prediction */}
        {overallLimit > 0 && (
          <Box mt={4}>
            <BudgetPrediction
              category="overall"
              spent={overallSpent}
              limit={overallLimit}
              daysElapsed={daysElapsed}
              daysInMonth={daysInMonth}
            />
          </Box>
        )}
      </MotionBox>

      {/* Category budgets */}
      <Box>
        <Text fontSize="sm" fontWeight="700" mb={3}>Category Budgets</Text>
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
          {expenseCategories.map((category) => {
            const catUsage = usage?.categories?.find((u) => u.category?._id === category._id);
            const spent = catUsage?.spent || 0;
            const limit = Number(categoryLimits[category._id] || 0);

            return (
              <Box key={category._id}>
                <BudgetRing
                  label={category.name}
                  spent={spent}
                  limit={limit}
                  color={category.color}
                />
                <Flex align="center" gap={2} mt={2}>
                  <Text fontSize="xs" color={mutedColor} flexShrink={0}>Limit:</Text>
                  <NumberInput
                    value={categoryLimits[category._id] || ""}
                    min={0}
                    size="sm"
                    onChange={(v) => setCategoryLimits({ ...categoryLimits, [category._id]: v })}
                  >
                    <NumberInputField placeholder="Set limit" />
                  </NumberInput>
                </Flex>
                {limit > 0 && (
                  <Box mt={2}>
                    <BudgetPrediction
                      category={category.name}
                      spent={spent}
                      limit={limit}
                      daysElapsed={daysElapsed}
                      daysInMonth={daysInMonth}
                    />
                  </Box>
                )}
              </Box>
            );
          })}
        </Grid>
      </Box>

      {expenseCategories.length === 0 && (
        <Box
          bg={bg}
          border="1px solid"
          borderColor={border}
          borderRadius="14px"
          p={10}
          textAlign="center"
        >
          <Icon as={FiCheckCircle} boxSize={8} color={mutedColor} mb={3} />
          <Text fontWeight="700" mb={1}>No expense categories yet</Text>
          <Text fontSize="sm" color={mutedColor}>Create expense categories to set budgets</Text>
        </Box>
      )}
    </VStack>
  );
}
