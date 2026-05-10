import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import React from "react";
import Transaction from "../transaction/Transaction";
import TotalChart from "../chart/Chart";

const Summary = ({ onClose, isOpen, totalIncome, totalExpense }) => {
  return (
    <Box
      p={"6"}
      mt={'3'}
      border={"1px solid"}
      borderColor={"gray.100"}
      overflow={"hidden"}
      borderRadius={"10"}
      background={"#121111"}
      display={"flex"}
    >
      <Flex
        w="full"
        justifyContent={"center"}
        alignItems={"center"}
        flexDirection={{
          base: "column",
          sm: "column",
          md: "column",
          lg: "row",
          xl: "row",
        }}
      >
        <Flex
          flex={1}
          w="full"
          flexDirection={"column"}
          alignItems={"center"}
          justifyContent={"space-evenly"}
          mr={"2"}
        >
          <Heading size={"md"} mb={"4"} color={"white"}>
            Balance: ${totalIncome - totalExpense}
          </Heading>
          <Flex
            justifyContent={"space-evenly"}
            alignItems={"center"}
            bg={"gray.800"}
            w="full"
            h={"100px"}
            border={"1px solid"}
            borderColor={"gray.700"}
          >
            <Flex flexDirection={"column"}>
              <Heading color={"white"}>${totalIncome}</Heading>
              <Text color={"white"}>Total Income</Text>
            </Flex>
          </Flex>
          <Flex
            justifyContent={"space-evenly"}
            alignItems={"center"}
            bg={"gray.800"}
            w="full"
            h={"100px"}
            border={"1px solid"}
            borderColor={"gray.700"}
          >
            <Flex flexDirection={"column"}>
              <Heading color={"white"}>${totalExpense}</Heading>
              <Text color={"white"}>Total Expenses</Text>
            </Flex>
          </Flex>
        </Flex>
        <Box
          flex={1}
          mt={"10"}
          mr={"5"}
          width={"300px"}
          height={"300px"}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Heading>
            <TotalChart expense={totalExpense} income={totalIncome} />
          </Heading>
        </Box>
      </Flex>
      <Transaction onClose={onClose} isOpen={isOpen} />
    </Box>
  );
};

export default Summary;
