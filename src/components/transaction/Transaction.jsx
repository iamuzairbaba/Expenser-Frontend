import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  useToast,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { GlobalContext } from "../../context";

const Transaction = ({ onClose, isOpen }) => {
  const { formData, setFormData, value, setValue, handleFormSubmit } =
    useContext(GlobalContext);
  const toast = useToast();
  function handleFormChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await handleFormSubmit(formData);
      onClose();
    } catch (error) {
      toast({
        title: "Could not save transaction",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Transaction</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Enter Description</FormLabel>
              <Input
                onChange={handleFormChange}
                placeholder="Enter Transaction Description"
                name="description"
                type="text"
                value={formData.description}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Enter Value</FormLabel>
              <Input
                onChange={handleFormChange}
                placeholder="Enter Transaction Amount"
                name="amount"
                type="number"
                value={formData.amount}
              />
            </FormControl>
            <RadioGroup
              mt={"5"}
              value={formData.type || value}
              onChange={(nextValue) => {
                setValue(nextValue);
                setFormData({ ...formData, type: nextValue });
              }}
            >
              <Radio
                value="income"
                name="type"
                colorScheme="blue"
                mr={"4"}
                checked={formData.type === "income"}
              >
                Income
              </Radio>
              <Radio
                value="expense"
                name="type"
                colorScheme="red"
                checked={formData.type === "expense"}
              >
                Expense
              </Radio>
            </RadioGroup>
          </ModalBody>
          <ModalFooter>
            <Button mr={"4"} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
};

export default Transaction;
