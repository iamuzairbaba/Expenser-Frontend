import { Button, Flex, Heading, Text, useDisclosure } from "@chakra-ui/react";
import React, { useContext, useEffect } from "react";
import Summary from "../../components/summary/Summary";
import Expenses from "../../components/expenses/Expenses";
import { GlobalContext } from "../../context";

const Main = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    totalIncome,
    transactions,
    setTotalIncome,
    totalExpense,
    setTotalExpense,
    user,
    logout,
  } = useContext(GlobalContext);
  useEffect(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((item) => {
      item.type === "income"
        ? (income += parseFloat(item.amount))
        : (expense += parseFloat(item.amount));
    });
    setTotalIncome(income);
    setTotalExpense(expense);
  }, [setTotalExpense, setTotalIncome, transactions]);
  return (
    <Flex textAlign={"center"} flexDirection={"column"} pr={"5"} pl={"5"}>
      <Flex alignItems={"center"} justifyContent={"space-between"} mt={"12"}>
        <Heading
          color={"blue.400"}
          display={["none", "block", "block", "block", "block"]}
        >
          EXPENSER
        </Heading>
        <Flex alignItems={"center"}>
          <Text color={"gray.300"} display={["none", "none", "block"]}>
            {user?.name}
          </Text>
          <Button bg={"blue.300"} color={"black"} ml={"4"} onClick={onOpen}>
            New Transaction
          </Button>
          <Button variant={"outline"} colorScheme={"whiteAlpha"} ml={"3"} onClick={logout}>
            Logout
          </Button>
        </Flex>
      </Flex>
      <Summary totalExpense={totalExpense} totalIncome={totalIncome} isOpen={isOpen} onClose={onClose} />
      <Flex
        w={"full"}
        alignItems={"flex-start"}
        justifyContent={"space-evenly"}
        flexDirection={["column", "column", "column", "row", "row"]}
      >
        <Expenses data={transactions.filter(item => item.type === 'expense')} type={'expense'}/>
        <Expenses data={transactions.filter(item => item.type === 'income')} type={'income'}/>
      </Flex>
    </Flex>
  );
};

export default Main;
