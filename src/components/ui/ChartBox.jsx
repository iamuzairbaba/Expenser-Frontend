import { Box, Heading, Skeleton, useColorModeValue } from "@chakra-ui/react";

export default function ChartBox({ title, isLoading, children }) {
  return (
    <Box bg={useColorModeValue("white", "gray.900")} border="1px solid" borderColor={useColorModeValue("gray.200", "whiteAlpha.200")} borderRadius="8" p={5}>
      <Heading size="sm" mb={4}>
        {title}
      </Heading>
      <Skeleton isLoaded={!isLoading} minH="260px">
        {children}
      </Skeleton>
    </Box>
  );
}
