import {
  Badge, Box, Button, Flex, HStack, Icon, List, ListIcon, ListItem,
  Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter,
  ModalHeader, ModalOverlay, Text, VStack, useColorModeValue, useDisclosure, useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useContext, useState } from "react";
import { FiAward, FiCheck, FiStar, FiX, FiZap } from "react-icons/fi";
import { GlobalContext } from "../context";
import { api } from "../services/api";

const MotionBox = motion(Box);

const PLANS = [
  {
    id: "free",
    name: "Expenser Free",
    price: 0,
    icon: FiStar,
    color: "#64748b",
    badge: null,
    features: [
      { text: "Track income & expenses", included: true },
      { text: "Default categories only", included: true },
      { text: "Basic dashboard & charts", included: true },
      { text: "Budget tracking", included: true },
      { text: "Custom categories", included: false },
      { text: "AI receipt scanning", included: false },
      { text: "Custom Report Builder", included: false },
    ],
  },
  {
    id: "tracker",
    name: "Expenser Tracker",
    price: 30,
    icon: FiZap,
    color: "#0ea5e9",
    badge: "Popular",
    features: [
      { text: "Everything in Free", included: true },
      { text: "Custom categories (unlimited)", included: true },
      { text: "Edit & delete categories", included: true },
      { text: "Advanced filters & search", included: true },
      { text: "Monthly reports", included: true },
      { text: "AI receipt scanning", included: false },
      { text: "Custom Report Builder", included: false },
    ],
  },
  {
    id: "pro",
    name: "Expenser Pro",
    price: 60,
    icon: FiAward,
    color: "#8b5cf6",
    badge: "Best Value",
    features: [
      { text: "Everything in Tracker", included: true },
      { text: "AI receipt scanning (Mindee OCR)", included: true },
      { text: "Custom Report Builder", included: true },
      { text: "PDF / Excel / CSV exports", included: true },
      { text: "Priority support", included: true },
    ],
  },
];

function PlanCard({ plan, currentTier, onUpgrade, isLoading }) {
  const bg = useColorModeValue("white", "#111827");
  const border = useColorModeValue("gray.100", "whiteAlpha.100");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const isCurrent = currentTier === plan.id;
  const isDowngrade = ["free", "tracker", "pro"].indexOf(plan.id) < ["free", "tracker", "pro"].indexOf(currentTier);

  return (
    <MotionBox
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      bg={bg}
      border="2px solid"
      borderColor={isCurrent ? plan.color : border}
      borderRadius="16px"
      p={6}
      boxShadow={isCurrent ? `0 0 0 1px ${plan.color}40, 0 8px 32px ${plan.color}20` : "card"}
      position="relative"
      flex={1}
      minW="0"
    >
      {plan.badge && (
        <Badge
          position="absolute"
          top="-12px"
          left="50%"
          transform="translateX(-50%)"
          bg={plan.color}
          color="white"
          fontSize="10px"
          fontWeight="700"
          px={3}
          py={1}
          borderRadius="full"
        >
          {plan.badge}
        </Badge>
      )}

      <VStack align="stretch" spacing={5}>
        <Box>
          <HStack mb={2}>
            <Box w="32px" h="32px" borderRadius="8px" bg={`${plan.color}20`} display="flex" alignItems="center" justifyContent="center">
              <Icon as={plan.icon} color={plan.color} boxSize={4} />
            </Box>
            {isCurrent && <Badge colorScheme="green" fontSize="9px">Current Plan</Badge>}
          </HStack>
          <Text fontWeight="800" fontSize="lg">{plan.name}</Text>
          <HStack align="baseline" mt={1} spacing={1}>
            {plan.price === 0 ? (
              <Text fontSize="2xl" fontWeight="800" color={plan.color}>Free</Text>
            ) : (
              <>
                <Text fontSize="xs" color={mutedColor} fontWeight="600">₹</Text>
                <Text fontSize="2xl" fontWeight="800" color={plan.color}>{plan.price}</Text>
                <Text fontSize="xs" color={mutedColor}>/month</Text>
              </>
            )}
          </HStack>
        </Box>

        <List spacing={2}>
          {plan.features.map((f, i) => (
            <ListItem key={i} display="flex" alignItems="center" gap={2}>
              <ListIcon
                as={f.included ? FiCheck : FiX}
                color={f.included ? "income.500" : mutedColor}
                boxSize={3.5}
                flexShrink={0}
              />
              <Text fontSize="sm" color={f.included ? undefined : mutedColor}>{f.text}</Text>
            </ListItem>
          ))}
        </List>

        {plan.price > 0 && !isCurrent && !isDowngrade && (
          <Button
            bg={plan.color}
            color="white"
            _hover={{ opacity: 0.9 }}
            borderRadius="10px"
            fontWeight="700"
            onClick={() => onUpgrade(plan)}
            isLoading={isLoading === plan.id}
            loadingText="Processing..."
          >
            Upgrade to {plan.name.split(" ")[1]}
          </Button>
        )}
        {isCurrent && plan.price > 0 && (
          <Button variant="outline" borderRadius="10px" isDisabled size="sm" color={mutedColor}>
            Active Plan
          </Button>
        )}
        {plan.price === 0 && isCurrent && (
          <Button variant="outline" borderRadius="10px" isDisabled size="sm" color={mutedColor}>
            Current Plan
          </Button>
        )}
      </VStack>
    </MotionBox>
  );
}

export default function Pricing({ onClose }) {
  const { user, token, updateUser } = useContext(GlobalContext);
  const toast = useToast();
  const { isOpen, onOpen, onClose: onModalClose } = useDisclosure();
  const [loadingPlan, setLoadingPlan] = useState("");
  const cardBg = useColorModeValue("white", "#111827");
  const border = useColorModeValue("gray.100", "whiteAlpha.100");
  const mutedColor = useColorModeValue("gray.500", "gray.400");

  const currentTier = user?.plan?.tier || "free";

  async function handleUpgrade(plan) {
    setLoadingPlan(plan.id);
    try {
      const { orderId, amount, currency } = await api.createOrder(plan.id, token);

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "Expenser",
        description: plan.name,
        order_id: orderId,
        config: {
          display: {
            blocks: {
              upi: { name: "Pay via UPI", instruments: [{ method: "upi" }] },
              other: { name: "Other Methods", instruments: [{ method: "card" }, { method: "netbanking" }] },
            },
            sequence: ["block.upi", "block.other"],
            preferences: { show_default_blocks: false },
          },
        },
        handler: async (response) => {
          try {
            const result = await api.verifyPayment(
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: plan.id,
              },
              token
            );
            updateUser({ plan: result.plan });
            toast({ title: `${plan.name} activated!`, description: "Enjoy your new features.", status: "success", duration: 4000 });
            if (onClose) onClose();
          } catch (err) {
            toast({ title: "Verification failed", description: err.message, status: "error", duration: 4000 });
          }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: plan.color },
        modal: { ondismiss: () => setLoadingPlan("") },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setLoadingPlan("");
        toast({
          title: "Payment failed",
          description: response.error?.description || "Your payment could not be processed.",
          status: "error",
          duration: 5000,
        });
      });
      rzp.open();
    } catch (err) {
      toast({ title: "Could not initiate payment", description: err.message, status: "error", duration: 3000 });
      setLoadingPlan("");
    }
  }

  async function handleCancel() {
    try {
      const result = await api.cancelPlan(token);
      updateUser({ plan: result.plan });
      toast({ title: "Plan cancelled", status: "info", duration: 3000 });
      onModalClose();
    } catch (err) {
      toast({ title: "Failed to cancel", description: err.message, status: "error", duration: 3000 });
    }
  }

  return (
    <VStack align="stretch" spacing={6}>
      {/* Header */}
      <Box textAlign="center">
        <Text fontSize="2xl" fontWeight="800" letterSpacing="-0.5px">Choose Your Plan</Text>
        <Text fontSize="sm" color={mutedColor} mt={1}>
          Unlock powerful features to take control of your finances
        </Text>
      </Box>

      {/* Plan cards */}
      <Flex gap={4} flexWrap={{ base: "wrap", lg: "nowrap" }} align="stretch">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentTier={currentTier}
            onUpgrade={handleUpgrade}
            isLoading={loadingPlan}
          />
        ))}
      </Flex>

      {/* Current plan info + cancel */}
      {currentTier !== "free" && (
        <Box bg={cardBg} border="1px solid" borderColor={border} borderRadius="12px" p={4}>
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
            <Box>
              <Text fontSize="sm" fontWeight="700">
                Active: {PLANS.find((p) => p.id === currentTier)?.name}
              </Text>
              {user?.plan?.validUntil && (
                <Text fontSize="xs" color={mutedColor}>
                  Valid until {new Date(user.plan.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </Text>
              )}
            </Box>
            <Button size="sm" variant="outline" colorScheme="red" borderRadius="8px" onClick={onOpen}>
              Cancel Plan
            </Button>
          </Flex>
        </Box>
      )}

      {/* Cancel confirmation modal */}
      <Modal isOpen={isOpen} onClose={onModalClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="md" fontWeight="800">Cancel Subscription?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color={mutedColor}>
              You'll lose access to paid features immediately. This cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onModalClose}>Keep Plan</Button>
            <Button colorScheme="red" onClick={handleCancel}>Yes, Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
