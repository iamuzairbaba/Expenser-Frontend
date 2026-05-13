import { Box, Button, Icon, Text, useColorModeValue } from "@chakra-ui/react";
import { FiLock } from "react-icons/fi";

export default function UpgradePrompt({ feature, plan, onUpgrade, compact = false }) {
  const bg = useColorModeValue("gray.50", "whiteAlpha.50");
  const border = useColorModeValue("gray.200", "whiteAlpha.100");
  const planColor = plan === "pro" ? "#8b5cf6" : "#0ea5e9";
  const planName = plan === "pro" ? "Expenser Pro" : "Expenser Tracker";

  if (compact) {
    return (
      <Button
        size="sm"
        leftIcon={<FiLock />}
        variant="outline"
        borderColor={planColor}
        color={planColor}
        borderRadius="8px"
        onClick={onUpgrade}
        _hover={{ bg: `${planColor}10` }}
      >
        Upgrade to unlock
      </Button>
    );
  }

  return (
    <Box
      bg={bg}
      border="1px dashed"
      borderColor={border}
      borderRadius="14px"
      p={8}
      textAlign="center"
    >
      <Box
        w="48px"
        h="48px"
        borderRadius="12px"
        bg={`${planColor}15`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        mx="auto"
        mb={3}
      >
        <Icon as={FiLock} color={planColor} boxSize={5} />
      </Box>
      <Text fontWeight="800" mb={1}>{feature} is locked</Text>
      <Text fontSize="sm" color="gray.500" mb={4}>
        Available on <strong>{planName}</strong> and above
      </Text>
      <Button
        bg={planColor}
        color="white"
        _hover={{ opacity: 0.9 }}
        borderRadius="10px"
        fontWeight="700"
        onClick={onUpgrade}
      >
        Upgrade to {planName.split(" ")[1]}
      </Button>
    </Box>
  );
}
