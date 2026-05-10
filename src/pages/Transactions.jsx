import {
  Badge,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  IconButton,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { currency, toInputDate, todayInput } from "../utils/format";

const blank = {
  type: "expense",
  amount: "",
  category: "",
  date: todayInput(),
  notes: "",
  recurring: { enabled: false, frequency: "monthly" },
};

export default function Transactions({ transactions, categories, filters, actions }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState("");
  const categoryList = useMemo(() => (Array.isArray(categories) ? categories : []), [categories]);
  const transactionList = useMemo(() => {
    if (Array.isArray(transactions?.items)) return transactions.items;
    if (Array.isArray(transactions)) return transactions;
    return [];
  }, [transactions]);
  const currentPage = transactions?.page || 1;
  const totalPages = transactions?.pages || 1;
  const totalTransactions = transactions?.total || transactionList.length;
  const safeFilters = filters || {};
  const visibleCategories = useMemo(
    () => categoryList.filter((category) => category.type === form.type),
    [categoryList, form.type]
  );

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startEdit(item) {
    setEditingId(item._id);
    setForm({
      type: item.type,
      amount: item.amount,
      category: item.category?._id || item.category,
      date: toInputDate(item.date),
      notes: item.notes || item.description || "",
      recurring: item.recurring || { enabled: false, frequency: "monthly" },
    });
    onOpen();
  }

  async function submit(event) {
    event.preventDefault();
    const ok = await actions.saveTransaction(form, editingId);
    if (ok) {
      setForm(blank);
      setEditingId("");
      onClose();
    }
  }

  return (
    <VStack align="stretch" spacing={5}>
      <HStack justify="space-between" align="center">
        <Box>
          <Text fontSize="2xl" fontWeight="800">Transactions</Text>
          <Text color="gray.500">Search, filter, add recurring items, and edit history.</Text>
        </Box>
        <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onOpen}>New</Button>
      </HStack>

      <Grid templateColumns={{ base: "1fr", md: "repeat(5, 1fr)" }} gap={3}>
        <Input placeholder="Search notes" value={safeFilters.search || ""} onChange={(e) => actions.setFilters({ ...safeFilters, search: e.target.value, page: 1 })} />
        <Select value={safeFilters.type || ""} onChange={(e) => actions.setFilters({ ...safeFilters, type: e.target.value, page: 1 })}>
          <option value="">All types</option><option value="income">Income</option><option value="expense">Expense</option>
        </Select>
        <Select value={safeFilters.category || ""} onChange={(e) => actions.setFilters({ ...safeFilters, category: e.target.value, page: 1 })}>
          <option value="">All categories</option>
          {categoryList.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
        </Select>
        <Input type="date" value={safeFilters.startDate || ""} onChange={(e) => actions.setFilters({ ...safeFilters, startDate: e.target.value, page: 1 })} />
        <Input type="date" value={safeFilters.endDate || ""} onChange={(e) => actions.setFilters({ ...safeFilters, endDate: e.target.value, page: 1 })} />
      </Grid>

      {isOpen ? (
        <Box as="form" onSubmit={submit} border="1px solid" borderColor="gray.200" borderRadius="8" p={5}>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
            <FormControl><FormLabel>Type</FormLabel><Select value={form.type} onChange={(e) => updateForm("type", e.target.value)}><option value="expense">Expense</option><option value="income">Income</option></Select></FormControl>
            <FormControl isRequired><FormLabel>Amount</FormLabel><NumberInput value={form.amount} min={0} onChange={(v) => updateForm("amount", v)}><NumberInputField /></NumberInput></FormControl>
            <FormControl isRequired><FormLabel>Category</FormLabel><Select value={form.category} onChange={(e) => updateForm("category", e.target.value)}><option value="">Auto select</option>{visibleCategories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</Select></FormControl>
            <FormControl><FormLabel>Date</FormLabel><Input type="date" value={form.date} onChange={(e) => updateForm("date", e.target.value)} /></FormControl>
            <FormControl><FormLabel>Recurring</FormLabel><Checkbox isChecked={form.recurring.enabled} onChange={(e) => updateForm("recurring", { ...form.recurring, enabled: e.target.checked })}>Repeat</Checkbox></FormControl>
            <FormControl><FormLabel>Frequency</FormLabel><Select isDisabled={!form.recurring.enabled} value={form.recurring.frequency} onChange={(e) => updateForm("recurring", { ...form.recurring, frequency: e.target.value })}><option value="monthly">Monthly</option><option value="weekly">Weekly</option></Select></FormControl>
          </Grid>
          <FormControl mt={4}><FormLabel>Notes</FormLabel><Textarea value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} /></FormControl>
          <HStack mt={4}><Button type="submit" colorScheme="blue">{editingId ? "Update" : "Add"}</Button><Button onClick={onClose}>Cancel</Button></HStack>
        </Box>
      ) : null}

      <Box overflowX="auto" border="1px solid" borderColor="gray.200" borderRadius="8">
        <Table>
          <Thead><Tr><Th>Date</Th><Th>Type</Th><Th>Category</Th><Th>Notes</Th><Th isNumeric>Amount</Th><Th /></Tr></Thead>
          <Tbody>
            {transactionList.map((item) => (
              <Tr key={item._id}>
                <Td>{new Date(item.date).toLocaleDateString()}</Td>
                <Td><Badge colorScheme={item.type === "income" ? "green" : "red"}>{item.type}</Badge></Td>
                <Td>{item.category?.name}</Td>
                <Td>{item.notes || item.description}</Td>
                <Td isNumeric>{currency(item.amount)}</Td>
                <Td><HStack justify="end"><IconButton aria-label="Edit" icon={<FiEdit2 />} size="sm" onClick={() => startEdit(item)} /><IconButton aria-label="Delete" icon={<FiTrash2 />} size="sm" colorScheme="red" variant="ghost" onClick={() => actions.deleteTransaction(item._id)} /></HStack></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      <HStack justify="space-between">
        <Text color="gray.500">
          Page {currentPage} of {totalPages} - {totalTransactions} total
        </Text>
        <HStack>
          <Button
            isDisabled={currentPage <= 1}
            onClick={() => actions.setFilters({ ...safeFilters, page: currentPage - 1 })}
          >
            Previous
          </Button>
          <Button
            isDisabled={currentPage >= totalPages}
            onClick={() => actions.setFilters({ ...safeFilters, page: currentPage + 1 })}
          >
            Next
          </Button>
        </HStack>
      </HStack>
    </VStack>
  );
}
