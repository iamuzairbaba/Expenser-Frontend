import { Box, Stat, StatArrow, StatHelpText, StatLabel, StatNumber, useColorModeValue } from "@chakra-ui/react";
import { currency } from "../../utils/format";

export default function StatCard({ label, value, change }) {
  return (
    <Box bg={useColorModeValue("white", "gray.900")} border="1px solid" borderColor={useColorModeValue("gray.200", "whiteAlpha.200")} borderRadius="8" p={5}>
      <Stat>
        <StatLabel color="gray.500">{label}</StatLabel>
        <StatNumber>{currency(value)}</StatNumber>
        {change !== undefined ? (
          <StatHelpText mb={0}>
            <StatArrow type={change >= 0 ? "increase" : "decrease"} />
            {Math.abs(change)}% vs previous month
          </StatHelpText>
        ) : null}
      </Stat>
    </Box>
  );
}
