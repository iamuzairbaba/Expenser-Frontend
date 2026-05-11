import { Box, Flex, Skeleton, Text, useColorModeValue } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

export default function ChartBox({ title, subtitle, isLoading, children, action, minH = "300px" }) {
  const bg = useColorModeValue("white", "#111827");
  const border = useColorModeValue("gray.100", "whiteAlpha.100");
  const titleColor = useColorModeValue("gray.800", "gray.100");
  const subColor = useColorModeValue("gray.500", "gray.400");

  return (
    <MotionBox
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      bg={bg}
      border="1px solid"
      borderColor={border}
      borderRadius="14px"
      p={5}
      boxShadow="card"
      overflow="hidden"
    >
      <Flex justify="space-between" align="flex-start" mb={4}>
        <Box>
          <Text fontSize="sm" fontWeight="700" color={titleColor} letterSpacing="-0.2px">
            {title}
          </Text>
          {subtitle && (
            <Text fontSize="xs" color={subColor} mt={0.5}>{subtitle}</Text>
          )}
        </Box>
        {action}
      </Flex>
      <Skeleton isLoaded={!isLoading} borderRadius="10px" minH={isLoading ? minH : undefined}>
        {children}
      </Skeleton>
    </MotionBox>
  );
}
