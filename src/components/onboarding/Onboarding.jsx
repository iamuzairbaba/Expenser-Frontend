import {
  Box, Button, Flex, FormControl, FormLabel, Grid, Heading,
  HStack, Icon, Input, NumberInput, NumberInputField, Progress,
  Select, SimpleGrid, Text, VStack, useColorModeValue, useToast,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useContext, useState } from "react";
import {
  FiArrowLeft, FiArrowRight, FiCheck, FiDollarSign,
  FiGlobe, FiStar, FiTarget, FiZap,
} from "react-icons/fi";
import { GlobalContext } from "../../context";
import { api } from "../../services/api";
import Logo from "../brand/Logo";

const MotionBox = motion(Box);

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD", "SGD", "AED"];

const GOAL_TYPES = [
  { id: "emergency", label: "Emergency Fund", icon: "🛡️", color: "#ef4444", desc: "3-6 months of expenses" },
  { id: "travel", label: "Travel", icon: "✈️", color: "#0ea5e9", desc: "Dream vacation fund" },
  { id: "gadget", label: "Gadgets", icon: "💻", color: "#8b5cf6", desc: "Tech & electronics" },
  { id: "custom", label: "Custom Goal", icon: "🎯", color: "#22c55e", desc: "Define your own goal" },
];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

function StepDots({ current, total }) {
  const activeBg = "brand.500";
  const inactiveBg = useColorModeValue("gray.200", "whiteAlpha.200");
  return (
    <HStack spacing={2} justify="center" mb={8}>
      {Array.from({ length: total }).map((_, i) => (
        <Box
          key={i}
          h="4px"
          w={i === current ? "32px" : "16px"}
          bg={i <= current ? activeBg : inactiveBg}
          borderRadius="full"
          transition="all 0.3s ease"
        />
      ))}
    </HStack>
  );
}

function WelcomeStep({ onNext }) {
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const featureBg = useColorModeValue("gray.50", "whiteAlpha.50");
  return (
    <VStack spacing={8} align="center" py={4}>
      <MotionBox
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Logo size={72} />
      </MotionBox>
      <VStack spacing={3} textAlign="center">
        <Heading size="xl" letterSpacing="-0.5px">
          Welcome to{" "}
          <Text as="span" bgGradient="linear(to-r, brand.500, purple.500)" bgClip="text">
            Expenser
          </Text>
        </Heading>
        <Text fontSize="lg" color={mutedColor} maxW="340px" lineHeight="1.6">
          Smart expense tracking for modern financial habits
        </Text>
      </VStack>
      <SimpleGrid columns={3} spacing={4} w="full" maxW="360px">
        {[
          { icon: FiZap, label: "Smart Insights", color: "brand.500" },
          { icon: FiTarget, label: "Goal Tracking", color: "income.500" },
          { icon: FiStar, label: "Budget Control", color: "purple.500" },
        ].map((f) => (
          <VStack key={f.label} p={4} bg={featureBg} borderRadius="12px" spacing={2}>
            <Icon as={f.icon} color={f.color} boxSize={5} />
            <Text fontSize="xs" fontWeight="600" textAlign="center">{f.label}</Text>
          </VStack>
        ))}
      </SimpleGrid>
      <Button colorScheme="brand" size="lg" px={10} rightIcon={<FiArrowRight />} onClick={onNext}>
        Get Started
      </Button>
      <Text fontSize="xs" color={mutedColor}>Takes about 2 minutes</Text>
    </VStack>
  );
}

function SetupStep({ data, onChange, onNext, onBack }) {
  const [errors, setErrors] = useState({});
  function validate() {
    const e = {};
    if (!data.currency) e.currency = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }
  return (
    <VStack spacing={6} align="stretch">
      <VStack spacing={1} align="center">
        <Icon as={FiDollarSign} boxSize={10} color="brand.500" />
        <Heading size="md" letterSpacing="-0.3px">Your Financial Profile</Heading>
        <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")} textAlign="center">
          Help us personalize your experience
        </Text>
      </VStack>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
        <FormControl isRequired isInvalid={!!errors.currency}>
          <FormLabel fontSize="sm" fontWeight="600">Preferred Currency</FormLabel>
          <Select value={data.currency} onChange={(e) => onChange("currency", e.target.value)}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="600">Monthly Income</FormLabel>
          <NumberInput value={data.monthlyIncome} min={0} onChange={(v) => onChange("monthlyIncome", v)}>
            <NumberInputField placeholder="5000" />
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="600">Monthly Savings Goal</FormLabel>
          <NumberInput value={data.monthlySavingsGoal} min={0} onChange={(v) => onChange("monthlySavingsGoal", v)}>
            <NumberInputField placeholder="1000" />
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="600">Month Start Date</FormLabel>
          <Select value={data.monthStartDate} onChange={(e) => onChange("monthStartDate", Number(e.target.value))}>
            {[1, 5, 10, 15, 20, 25].map((d) => (
              <option key={d} value={d}>{d === 1 ? "1st (Default)" : `${d}th`}</option>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <HStack justify="space-between" pt={2}>
        <Button variant="ghost" leftIcon={<FiArrowLeft />} onClick={onBack}>Back</Button>
        <Button colorScheme="brand" rightIcon={<FiArrowRight />} onClick={() => validate() && onNext()}>Continue</Button>
      </HStack>
    </VStack>
  );
}

function PreferencesStep({ data, onChange, onNext, onBack }) {
  const bg = useColorModeValue("gray.50", "whiteAlpha.50");
  const activeBorder = "brand.500";
  const inactiveBorder = useColorModeValue("gray.200", "whiteAlpha.100");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const themes = [
    { id: "dark", label: "Dark", icon: "🌙", desc: "Easy on the eyes" },
    { id: "light", label: "Light", icon: "☀️", desc: "Clean & bright" },
    { id: "system", label: "System", icon: "💻", desc: "Follow OS" },
  ];
  return (
    <VStack spacing={6} align="stretch">
      <VStack spacing={1} align="center">
        <Icon as={FiGlobe} boxSize={10} color="brand.500" />
        <Heading size="md" letterSpacing="-0.3px">Your Preferences</Heading>
        <Text fontSize="sm" color={mutedColor} textAlign="center">Customize how Expenser works for you</Text>
      </VStack>
      <Box>
        <Text fontSize="sm" fontWeight="700" mb={3}>Theme</Text>
        <SimpleGrid columns={3} spacing={3}>
          {themes.map((t) => (
            <Box
              key={t.id}
              p={4}
              bg={bg}
              borderRadius="12px"
              border="2px solid"
              borderColor={data.theme === t.id ? activeBorder : inactiveBorder}
              cursor="pointer"
              textAlign="center"
              onClick={() => onChange("theme", t.id)}
              transition="all 0.15s"
              _hover={{ borderColor: "brand.400" }}
            >
              <Text fontSize="2xl" mb={1}>{t.icon}</Text>
              <Text fontSize="sm" fontWeight="700">{t.label}</Text>
              <Text fontSize="xs" color={mutedColor}>{t.desc}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="600">Budget Alert Threshold</FormLabel>
          <Select value={data.budgetAlertThreshold} onChange={(e) => onChange("budgetAlertThreshold", Number(e.target.value))}>
            <option value={60}>60% — Early warning</option>
            <option value={75}>75% — Moderate</option>
            <option value={80}>80% — Standard</option>
            <option value={90}>90% — Late warning</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="600">Default Transaction Type</FormLabel>
          <Select value={data.defaultTransactionType} onChange={(e) => onChange("defaultTransactionType", e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>
        </FormControl>
      </Grid>
      <HStack justify="space-between" pt={2}>
        <Button variant="ghost" leftIcon={<FiArrowLeft />} onClick={onBack}>Back</Button>
        <Button colorScheme="brand" rightIcon={<FiArrowRight />} onClick={onNext}>Continue</Button>
      </HStack>
    </VStack>
  );
}

function GoalStep({ data, onChange, onNext, onBack }) {
  const bg = useColorModeValue("gray.50", "whiteAlpha.50");
  const activeBorder = "brand.500";
  const inactiveBorder = useColorModeValue("gray.200", "whiteAlpha.100");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  return (
    <VStack spacing={6} align="stretch">
      <VStack spacing={1} align="center">
        <Icon as={FiTarget} boxSize={10} color="brand.500" />
        <Heading size="md" letterSpacing="-0.3px">Set Your First Goal</Heading>
        <Text fontSize="sm" color={mutedColor} textAlign="center">What are you saving towards?</Text>
      </VStack>
      <SimpleGrid columns={2} spacing={3}>
        {GOAL_TYPES.map((g) => (
          <Box
            key={g.id}
            p={4}
            bg={bg}
            borderRadius="12px"
            border="2px solid"
            borderColor={data.goalType === g.id ? activeBorder : inactiveBorder}
            cursor="pointer"
            onClick={() => onChange("goalType", g.id)}
            transition="all 0.15s"
            _hover={{ borderColor: "brand.400" }}
          >
            <Text fontSize="2xl" mb={1}>{g.icon}</Text>
            <Text fontSize="sm" fontWeight="700">{g.label}</Text>
            <Text fontSize="xs" color={mutedColor}>{g.desc}</Text>
          </Box>
        ))}
      </SimpleGrid>
      {data.goalType && (
        <MotionBox initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600">Goal Name</FormLabel>
              <Input
                value={data.goalTitle}
                onChange={(e) => onChange("goalTitle", e.target.value)}
                placeholder={GOAL_TYPES.find((g) => g.id === data.goalType)?.label || "My Goal"}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600">Target Amount</FormLabel>
              <NumberInput value={data.goalAmount} min={1} onChange={(v) => onChange("goalAmount", v)}>
                <NumberInputField placeholder="10000" />
              </NumberInput>
            </FormControl>
          </Grid>
        </MotionBox>
      )}
      <HStack justify="space-between" pt={2}>
        <Button variant="ghost" leftIcon={<FiArrowLeft />} onClick={onBack}>Back</Button>
        <Button colorScheme="brand" rightIcon={<FiArrowRight />} onClick={onNext}>
          {data.goalType ? "Set Goal" : "Skip for now"}
        </Button>
      </HStack>
    </VStack>
  );
}

function CompletionStep({ data, onFinish, isLoading }) {
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const bg = useColorModeValue("gray.50", "whiteAlpha.50");
  return (
    <VStack spacing={8} align="center" py={4}>
      <MotionBox
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <Flex w="80px" h="80px" bg="income.500" borderRadius="full" align="center" justify="center" boxShadow="0 0 30px rgba(34,197,94,0.4)">
          <Icon as={FiCheck} color="white" boxSize={8} />
        </Flex>
      </MotionBox>
      <VStack spacing={2} textAlign="center">
        <Heading size="lg" letterSpacing="-0.5px">You're all set! 🎉</Heading>
        <Text color={mutedColor} maxW="320px">Your Expenser account is ready. Here's a quick summary:</Text>
      </VStack>
      <SimpleGrid columns={2} spacing={3} w="full" maxW="360px">
        {[
          { label: "Currency", value: data.currency || "USD" },
          { label: "Monthly Income", value: data.monthlyIncome ? `${data.monthlyIncome}` : "Not set" },
          { label: "Savings Goal", value: data.monthlySavingsGoal ? `${data.monthlySavingsGoal}/mo` : "Not set" },
          { label: "Theme", value: data.theme ? data.theme.charAt(0).toUpperCase() + data.theme.slice(1) : "Dark" },
        ].map((item) => (
          <Box key={item.label} p={3} bg={bg} borderRadius="10px">
            <Text fontSize="xs" color={mutedColor} fontWeight="600">{item.label}</Text>
            <Text fontSize="sm" fontWeight="700" mt={0.5}>{item.value}</Text>
          </Box>
        ))}
      </SimpleGrid>
      {data.goalType && data.goalTitle && (
        <Box p={4} bg={bg} borderRadius="12px" w="full" maxW="360px" border="1px solid" borderColor="brand.500">
          <HStack>
            <Text fontSize="xl">{GOAL_TYPES.find((g) => g.id === data.goalType)?.icon || "🎯"}</Text>
            <Box>
              <Text fontSize="sm" fontWeight="700">{data.goalTitle}</Text>
              <Text fontSize="xs" color={mutedColor}>Target: {data.currency || "$"}{Number(data.goalAmount || 0).toLocaleString()}</Text>
            </Box>
          </HStack>
        </Box>
      )}
      <Button colorScheme="brand" size="lg" px={10} rightIcon={<FiArrowRight />} onClick={onFinish} isLoading={isLoading} loadingText="Setting up...">
        Go to Dashboard
      </Button>
    </VStack>
  );
}

export default function Onboarding() {
  const { token, updateUser } = useContext(GlobalContext);
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState({
    currency: "USD", monthlyIncome: "", monthlySavingsGoal: "",
    monthStartDate: 1, theme: "dark", budgetAlertThreshold: 80,
    defaultTransactionType: "expense", goalType: "", goalTitle: "", goalAmount: "",
  });

  const bg = useColorModeValue("white", "#0d1526");
  const appBg = useColorModeValue("#f8fafc", "#0b1120");
  const cardBorder = useColorModeValue("gray.100", "whiteAlpha.100");

  function onChange(key, value) { setData((prev) => ({ ...prev, [key]: value })); }
  function goNext() { setDirection(1); setStep((s) => s + 1); }
  function goBack() { setDirection(-1); setStep((s) => s - 1); }

  async function finish() {
    setIsSaving(true);
    try {
      const payload = {
        preferences: {
          currency: data.currency,
          monthlyIncome: Number(data.monthlyIncome) || 0,
          monthlySavingsGoal: Number(data.monthlySavingsGoal) || 0,
          monthStartDate: data.monthStartDate,
          theme: data.theme,
          budgetAlertThreshold: data.budgetAlertThreshold,
          defaultTransactionType: data.defaultTransactionType,
        },
        goals: data.goalType && data.goalTitle
          ? [{ title: data.goalTitle, type: data.goalType, targetAmount: Number(data.goalAmount) || 1000 }]
          : [],
      };
      const result = await api.completeOnboarding(payload, token);
      updateUser(result.user);
      toast({ title: "Welcome to Expenser! 🎉", status: "success", duration: 3000 });
    } catch (err) {
      toast({ title: "Setup failed", description: err.message, status: "error", duration: 4000 });
    } finally {
      setIsSaving(false);
    }
  }

  const TOTAL = 5;
  const steps = [
    <WelcomeStep onNext={goNext} />,
    <SetupStep data={data} onChange={onChange} onNext={goNext} onBack={goBack} />,
    <PreferencesStep data={data} onChange={onChange} onNext={goNext} onBack={goBack} />,
    <GoalStep data={data} onChange={onChange} onNext={goNext} onBack={goBack} />,
    <CompletionStep data={data} onFinish={finish} isLoading={isSaving} />,
  ];

  return (
    <Flex minH="100vh" bg={appBg} align="center" justify="center" px={4} position="relative" overflow="hidden">
      <Box position="absolute" top="5%" left="10%" w="400px" h="400px" bg="brand.400" opacity={0.06} borderRadius="full" filter="blur(100px)" />
      <Box position="absolute" bottom="5%" right="10%" w="300px" h="300px" bg="purple.400" opacity={0.06} borderRadius="full" filter="blur(80px)" />
      <Box
        bg={bg}
        w="full"
        maxW="520px"
        borderRadius="20px"
        border="1px solid"
        borderColor={cardBorder}
        p={{ base: 6, md: 10 }}
        boxShadow="0 25px 60px rgba(0,0,0,0.2)"
        position="relative"
        zIndex={1}
        overflow="hidden"
      >
        <Progress value={(step / (TOTAL - 1)) * 100} size="xs" colorScheme="brand" position="absolute" top={0} left={0} right={0} borderTopRadius="20px" />
        <Box pt={2}>
          <StepDots current={step} total={TOTAL} />
          <AnimatePresence mode="wait" custom={direction}>
            <MotionBox
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {steps[step]}
            </MotionBox>
          </AnimatePresence>
        </Box>
      </Box>
    </Flex>
  );
}
