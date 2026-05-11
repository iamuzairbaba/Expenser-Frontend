import { Flex, Text, useColorModeValue } from "@chakra-ui/react";

export default function Logo({ compact = false, size = 36 }) {
  const textColor = useColorModeValue("#0f172a", "#f1f5f9");

  return (
    <Flex align="center" justify={{ base: "center", md: "flex-start" }} gap={2.5}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-label="Expenser logo">
        <defs>
          <linearGradient id="logoGrad1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="logoGrad2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        {/* Card base */}
        <rect x="3" y="8" width="34" height="24" rx="7" fill="url(#logoGrad1)" />
        {/* Chip */}
        <rect x="8" y="15" width="9" height="7" rx="2" fill="rgba(255,255,255,0.3)" />
        <rect x="9.5" y="16.5" width="2" height="4" rx="0.5" fill="rgba(255,255,255,0.6)" />
        <rect x="12.5" y="16.5" width="2" height="4" rx="0.5" fill="rgba(255,255,255,0.6)" />
        {/* Trend line */}
        <polyline
          points="8,27 13,22 18,25 24,18 32,14"
          stroke="url(#logoGrad2)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Dot at peak */}
        <circle cx="32" cy="14" r="2.5" fill="#22c55e" />
      </svg>
      {!compact && (
        <Text
          display={{ base: "none", md: "block" }}
          fontSize="xl"
          fontWeight="800"
          letterSpacing="-0.5px"
          color={textColor}
          lineHeight="1"
        >
          Expen
          <Text as="span" color="brand.500">ser</Text>
        </Text>
      )}
    </Flex>
  );
}
