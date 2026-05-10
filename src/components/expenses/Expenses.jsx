import { Box, Flex, Heading, IconButton, Text, Tooltip, useToast } from "@chakra-ui/react";
import React, { useContext } from "react";
import { FiTrash2 } from "react-icons/fi";
import { GlobalContext } from "../../context";

const Expenses = ({ type, data }) => {
  const { handleDeleteTransaction } = useContext(GlobalContext);
  const toast = useToast();

  async function deleteTransaction(id) {
    try {
      await handleDeleteTransaction(id);
    } catch (error) {
      toast({
        title: "Could not delete transaction",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  }

  return (
    <Box
      flex={1}
      w="full"
      bg={"white"}
      mr={"4"}
      mt={"10"}
      p={"5"}
      pb={"4"}
      border={"1px solid"}
      borderColor={"gray.100"}
      borderRadius={"12"}
    >
      <Flex justifyContent={"space-between"} alignItems={"center"}>
        <Heading size={"md"} color={type === "expense" ? "red.700" : "blue.700"}>
          {type === "income" ? "Income" : "Expense"}
        </Heading>
      </Flex>
      {data.map((item) => (
          <Flex
            key={item._id}
            bg={type === "expense" ? "red.50" : "blue.50"}
            mt={"4"}
            justifyContent={"space-between"}
            alignItems={"center"}
            border={"1px solid"}
            borderColor={type === "expense" ? "red.100" : "blue.100"}
            p={"4"}
            borderRadius={"8"}
          >
            <Flex alignItems={"center"} justifyContent={"center"}>
              <Text ml={"3"} fontWeight={"bold"} color={"gray.600"}>
                {item.description}
              </Text>
            </Flex>
            <Flex alignItems={"center"} gap={"3"}>
              <Text>$ {item.amount}</Text>
              <Tooltip label="Delete transaction">
              <IconButton
                size={"sm"}
                colorScheme={type === "expense" ? "red" : "blue"}
                variant={"ghost"}
                aria-label="Delete transaction"
                icon={<FiTrash2 />}
                onClick={() => deleteTransaction(item._id)}
              />
              </Tooltip>
            </Flex>
          </Flex>
      ))}
    </Box>
  );
};

export default Expenses;
