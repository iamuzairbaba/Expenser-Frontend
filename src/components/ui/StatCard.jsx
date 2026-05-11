import { Box, Flex, Icon, Text, useColorModeValue } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FiArrowUpRight, FiArrowDownRight, FiMinus } from "react-icons/fi";
import { useAnimatedCounter } from "../../hooks/useAnimatedCounter";
import { currency } from "../../utils/format";

const MotionBox = motion(Box);

export default function StatCard({ label, value = 0, change, icon: CardIcon, accent = "brand", isCurrency = true, suffix = "" }) {
  const animated = useAnimatedCounter(value);
  const bg = useColorModeValue("white", "#111827");
  const border = useColorModeValue("gray.100", "whiteAlpha.100");
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const subColor = useColorModeValue("gray.400", "gray.500");

  const accentMap = {
    brand: { from: "#0ea5e9", to: "#6366f1", light: "brand.50", dark: "rgba(14,165,233,0.12)" },
    income: { from: "#22c55e", to: "#16a34a", light: "green.50", dark: "rgba(34,197,94,0.12)" },
    expense: { from: "#ef4444", to: "#dc2626", light: "red.50", dark: "rgba(239,68,68,0.12)" },
    purple: { from: "#8b5cf6", to: "#6366f1", light: "purple.50", dark: "rgba(139,92,246,0.12)" },
  };

  const colors = accentMap[accent] || accentMap.brand;
  const iconBg = useColorModeValue(colors.light, colors.dark);

  const displayValue = isCurrency
    ? currency(animated)
    : `${Math.round(animated)}${suffix}`;

  const TrendIcon = change === undefined || change === 0 ? FiMinus : change > 0 ? FiArrowUpRight : FiArrowDownRight;
  const trendColor = change === undefined || change === 0 ? "gray.400" : change > 0 ? "income.500" : "expense.500";

  return (
    <MotionBox
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      bg={bg}
      border="1px solid"
      borderColor={border}
      borderRadius="14px"
      p={5}
      boxShadow="card"
      _hover={{ boxShadow: "cardHover", transform: "translateY(-2px)" }}
      sx={{ transition: "box-shadow 0.2s ease, transform 0.2s ease" }}
      position="relative"
      overflow="hidden"
    >
      {/* Subtle gradient accent top bar */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="3px"
        bgGradient={`linear(to-r, ${colors.from}, ${colors.to})`}
        borderTopRadius="14px"
      />

      <Flex justify="space-between" align="flex-start">
        <Box flex={1}>
          <Text fontSize="xs" fontWeight="600" color={labelColor} textTransform="uppercase" letterSpacing="0.08em" mb={2}>
            {label}
          </Text>
          <Text
            fontSize="2xl"
            fontWeight="800"
            letterSpacing="-0.5px"
            className="tabular-nums"
            lineHeight="1.1"
          >
            {displayValue}
          </Text>
          {change !== undefined && (
            <Flex align="center" gap={1} mt={2}>
              <Icon as={TrendIcon} color={trendColor} boxSize={3.5} />
              <Text fontSize="xs" color={trendColor} fontWeight="600">
                {Math.abs(change)}% vs last month
              </Text>
            </Flex>
          )}
          {change === undefined && (
            <Text fontSize="xs" color={subColor} mt={2}>All time</Text>
          )}
        </Box>
        {CardIcon && (
          <Flex
            w={10}
            h={10}
            bg={iconBg}
            borderRadius="10px"
            align="center"
            justify="center"
            flexShrink={0}
          >
            <Icon
              as={CardIcon}
              boxSize={5}
              color={colors.from}
            />
          </Flex>
        )}
      </Flex>
    </MotionBox>
  );
}
