import { Flex, Text } from "@chakra-ui/react";

export default function Logo({ compact = false }) {
  return (
    <Flex align="center" justify={{ base: "center", md: "flex-start" }} gap={3}>
      <svg width="42" height="42" viewBox="0 0 42 42" fill="none" aria-hidden="true">
        <rect x="4" y="9" width="31" height="24" rx="7" fill="#2563EB" />
        <path d="M12 13h21a5 5 0 0 1 5 5v11a5 5 0 0 1-5 5H12a7 7 0 0 0 0-21Z" fill="#14B8A6" />
        <rect x="27" y="20" width="8" height="6" rx="3" fill="#F8FAFC" opacity=".95" />
        <path d="M12 27l5-5 4 3 7-9" stroke="#FACC15" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {!compact ? (
        <Text display={{ base: "none", md: "block" }} fontSize="xl" fontWeight="800" letterSpacing="0" color="blue.500">
          Expenser
        </Text>
      ) : null}
    </Flex>
  );
}
