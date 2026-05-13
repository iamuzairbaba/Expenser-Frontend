import {
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  Icon,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Select,
  Skeleton,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useContext, useMemo, useState } from "react";
import {
  FiCreditCard,
  FiEdit2,
  FiFilter,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUpload,
  FiX,
  FiZap,
} from "react-icons/fi";
import { GlobalContext } from "../context";
import { autoDetectCategory } from "../utils/autoCategorize";
import ReceiptScanner from "../components/receipt/ReceiptScanner";
import { currency, toInputDate, todayInput } from "../utils/format";

const MotionBox = motion(Box);

const blank = {
  type: "expense",
  amount: "",
  category: "",
  date: todayInput(),
  notes: "",
  merchant: "",
  tags: "",
  recurring: { enabled: false, frequency: "monthly" },
};

function TransactionRow({ item, onEdit, onDelete, isDeleting }) {
  const bg = useColorModeValue("white", "#111827");
  const border = useColorModeValue("gray.100", "whiteAlpha.100");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");

  return (
    <MotionBox
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      bg={bg}
      border="1px solid"
      borderColor={border}
      borderRadius="10px"
      px={4}
      py={3}
      _hover={{ bg: hoverBg }}
      sx={{ transition: "background 0.15s ease" }}
    >
      <Flex align="center" gap={3}>
        {/* Color dot */}
        <Box
          w="10px"
          h="10px"
          borderRadius="full"
          bg={item.category?.color || (item.type === "income" ? "#22c55e" : "#ef4444")}
          flexShrink={0}
        />

        {/* Main info */}
        <Box flex={1} minW={0}>
          <Flex align="center" gap={2} flexWrap="wrap">
            <Text fontSize="sm" fontWeight="600" noOfLines={1}>
              {item.notes || item.description || item.merchant || "—"}
            </Text>
            {item.recurring?.enabled && (
              <Tooltip label={`Repeats ${item.recurring.frequency}`}>
                <Badge colorScheme="blue" fontSize="9px" variant="subtle">
                  <Icon as={FiRefreshCw} boxSize={2.5} mr={0.5} />
                  {item.recurring.frequency}
                </Badge>
              </Tooltip>
            )}
          </Flex>
          <Flex align="center" gap={2} mt={0.5}>
            <Text fontSize="xs" color={mutedColor}>
              {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </Text>
            {item.category?.name && (
              <>
                <Text fontSize="xs" color={mutedColor}>·</Text>
                <Text fontSize="xs" color={mutedColor}>{item.category.name}</Text>
              </>
            )}
          </Flex>
        </Box>

        {/* Amount */}
        <Text
          fontSize="sm"
          fontWeight="700"
          color={item.type === "income" ? "income.500" : "expense.500"}
          className="tabular-nums"
          flexShrink={0}
        >
          {item.type === "income" ? "+" : "-"}{currency(item.amount)}
        </Text>

        {/* Actions */}
        <HStack spacing={1} flexShrink={0}>
          <IconButton
            aria-label="Edit"
            icon={<FiEdit2 />}
            size="xs"
            variant="ghost"
            borderRadius="6px"
            onClick={() => onEdit(item)}
          />
          <IconButton
            aria-label="Delete"
            icon={<FiTrash2 />}
            size="xs"
            variant="ghost"
            colorScheme="red"
            borderRadius="6px"
            isLoading={isDeleting === item._id}
            onClick={() => onDelete(item._id)}
          />
        </HStack>
      </Flex>
    </MotionBox>
  );
}

function TransactionSkeleton() {
  return (
    <Box borderRadius="10px" border="1px solid" borderColor={useColorModeValue("gray.100", "whiteAlpha.100")} p={4}>
      <Flex align="center" gap={3}>
        <Skeleton w="10px" h="10px" borderRadius="full" />
        <Box flex={1}>
          <Skeleton h="14px" w="40%" mb={2} />
          <Skeleton h="11px" w="25%" />
        </Box>
        <Skeleton h="14px" w="60px" />
      </Flex>
    </Box>
  );
}

export default function Transactions({ transactions, categories, filters, actions, onUpgrade }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useContext(GlobalContext);
  const canScanReceipt = user?.plan?.tier === "pro";

  const bg = useColorModeValue("white", "#111827");
  const border = useColorModeValue("gray.100", "whiteAlpha.100");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const filterBg = useColorModeValue("gray.50", "whiteAlpha.50");

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
  const isLoading = transactions === null || transactions === undefined;

  const visibleCategories = useMemo(
    () => categoryList.filter((c) => c.type === form.type),
    [categoryList, form.type]
  );

  function updateForm(key, value) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      // Auto-categorize when notes/merchant changes
      if ((key === "notes" || key === "merchant") && value.length > 2) {
        const detected = autoDetectCategory(value);
        if (detected) {
          const match = categoryList.find(
            (c) => c.name.toLowerCase() === detected.toLowerCase() && c.type === next.type
          );
          if (match && !current.category) next.category = match._id;
        }
      }
      return next;
    });
  }

  function startEdit(item) {
    setEditingId(item._id);
    setForm({
      type: item.type,
      amount: item.amount,
      category: item.category?._id || item.category,
      date: toInputDate(item.date),
      notes: item.notes || item.description || "",
      merchant: item.merchant || "",
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : item.tags || "",
      recurring: item.recurring || { enabled: false, frequency: "monthly" },
    });
    onOpen();
  }

  function openNew() {
    setEditingId("");
    setForm(blank);
    onOpen();
  }

  function handleReceiptResult(parsed) {
    setForm((current) => {
      const match = categoryList.find(
        (c) => c.name.toLowerCase() === (parsed.category || "").toLowerCase() && c.type === "expense"
      );
      return {
        ...current,
        amount: parsed.amount ?? current.amount,
        notes: parsed.merchant || current.notes,
        merchant: parsed.merchant || current.merchant,
        date: parsed.date || current.date,
        category: match?._id || current.category,
      };
    });
  }

  async function submit(event) {
    event.preventDefault();
    setIsSaving(true);
    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };
    const ok = await actions.saveTransaction(payload, editingId);
    setIsSaving(false);
    if (ok) {
      setForm(blank);
      setEditingId("");
      onClose();
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    await actions.deleteTransaction(id);
    setDeletingId("");
  }

  function setFilter(key, value) {
    actions.setFilters({ ...safeFilters, [key]: value, page: 1 });
  }

  const hasActiveFilters = safeFilters.type || safeFilters.category || safeFilters.startDate || safeFilters.endDate;

  return (
    <VStack align="stretch" spacing={4}>
      {/* Header */}
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
        <Box>
          <Text fontSize="xs" color={mutedColor} fontWeight="600" textTransform="uppercase" letterSpacing="0.08em">
            {totalTransactions} transactions
          </Text>
        </Box>
        <HStack spacing={2}>
          <Button
            leftIcon={<FiFilter />}
            variant="ghost"
            size="sm"
            borderRadius="8px"
            onClick={() => setShowFilters(!showFilters)}
            colorScheme={hasActiveFilters ? "brand" : "gray"}
          >
            Filters {hasActiveFilters ? "•" : ""}
          </Button>
          <Button leftIcon={<FiPlus />} colorScheme="brand" size="sm" borderRadius="8px" onClick={openNew}>
            Add Transaction
          </Button>
        </HStack>
      </Flex>

      {/* Search bar */}
      <Box position="relative">
        <Icon as={FiSearch} position="absolute" left={3} top="50%" transform="translateY(-50%)" color={mutedColor} boxSize={4} zIndex={1} />
        <Input
          pl={9}
          placeholder="Search transactions..."
          value={safeFilters.search || ""}
          onChange={(e) => setFilter("search", e.target.value)}
          size="md"
        />
      </Box>

      {/* Advanced filters */}
      {showFilters && (
        <MotionBox
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          bg={filterBg}
          borderRadius="10px"
          p={4}
          border="1px solid"
          borderColor={border}
        >
          <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={3}>
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="600" mb={1}>Type</FormLabel>
              <Select size="sm" value={safeFilters.type || ""} onChange={(e) => setFilter("type", e.target.value)}>
                <option value="">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="600" mb={1}>Category</FormLabel>
              <Select size="sm" value={safeFilters.category || ""} onChange={(e) => setFilter("category", e.target.value)}>
                <option value="">All categories</option>
                {categoryList.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="600" mb={1}>From</FormLabel>
              <Input size="sm" type="date" value={safeFilters.startDate || ""} onChange={(e) => setFilter("startDate", e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="600" mb={1}>To</FormLabel>
              <Input size="sm" type="date" value={safeFilters.endDate || ""} onChange={(e) => setFilter("endDate", e.target.value)} />
            </FormControl>
          </Grid>
          {hasActiveFilters && (
            <Button
              size="xs"
              variant="ghost"
              leftIcon={<FiX />}
              mt={3}
              onClick={() => actions.setFilters({ ...safeFilters, type: "", category: "", startDate: "", endDate: "", page: 1 })}
            >
              Clear filters
            </Button>
          )}
        </MotionBox>
      )}

      {/* Transaction list */}
      <VStack align="stretch" spacing={2}>
        {isLoading ? (
          [1, 2, 3, 4, 5].map((i) => <TransactionSkeleton key={i} />)
        ) : transactionList.length === 0 ? (
          <Box
            bg={bg}
            border="1px solid"
            borderColor={border}
            borderRadius="14px"
            p={12}
            textAlign="center"
          >
            <Icon as={FiCreditCard} boxSize={10} color={mutedColor} mb={3} />
            <Text fontWeight="700" mb={1}>No transactions found</Text>
            <Text fontSize="sm" color={mutedColor} mb={4}>
              {hasActiveFilters ? "Try adjusting your filters" : "Add your first transaction to get started"}
            </Text>
            <Button leftIcon={<FiPlus />} colorScheme="brand" size="sm" onClick={openNew}>
              Add Transaction
            </Button>
          </Box>
        ) : (
          transactionList.map((item) => (
            <TransactionRow
              key={item._id}
              item={item}
              onEdit={startEdit}
              onDelete={handleDelete}
              isDeleting={deletingId}
            />
          ))
        )}
      </VStack>

      {/* Pagination */}
      {totalPages > 1 && (
        <Flex justify="space-between" align="center" pt={2}>
          <Text fontSize="xs" color={mutedColor}>
            Page {currentPage} of {totalPages} · {totalTransactions} total
          </Text>
          <HStack spacing={2}>
            <Button
              size="sm"
              variant="ghost"
              borderRadius="8px"
              isDisabled={currentPage <= 1}
              onClick={() => actions.setFilters({ ...safeFilters, page: currentPage - 1 })}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="ghost"
              borderRadius="8px"
              isDisabled={currentPage >= totalPages}
              onClick={() => actions.setFilters({ ...safeFilters, page: currentPage + 1 })}
            >
              Next
            </Button>
          </HStack>
        </Flex>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="lg" fontWeight="800" pb={2}>
            {editingId ? "Edit Transaction" : "New Transaction"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="txn-form" onSubmit={submit}>
              <VStack spacing={4} align="stretch">
                {/* Receipt scanner */}
                {!editingId && (
                  canScanReceipt ? (
                    <ReceiptScanner
                      onResult={handleReceiptResult}
                      categoryList={categoryList}
                    />
                  ) : (
                    <Box
                      border="2px dashed"
                      borderColor={border}
                      borderRadius="10px"
                      p={4}
                      textAlign="center"
                      cursor="pointer"
                      onClick={onUpgrade}
                      _hover={{ borderColor: "#8b5cf6" }}
                      transition="border-color 0.15s"
                    >
                      <Icon as={FiUpload} boxSize={5} color="#8b5cf6" mb={1} />
                      <Text fontSize="xs" color="#8b5cf6" fontWeight="600">Upgrade to Expenser Pro to scan receipts</Text>
                    </Box>
                  )
                )}

                <Grid templateColumns="1fr 1fr" gap={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600">Type</FormLabel>
                    <Select value={form.type} onChange={(e) => updateForm("type", e.target.value)}>
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600">Amount</FormLabel>
                    <NumberInput value={form.amount} min={0} onChange={(v) => updateForm("amount", v)}>
                      <NumberInputField placeholder="0.00" />
                    </NumberInput>
                  </FormControl>
                </Grid>

                <Grid templateColumns="1fr 1fr" gap={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600">
                      Category
                      {form.notes && autoDetectCategory(form.notes) && (
                        <Badge ml={2} colorScheme="brand" fontSize="9px">
                          <Icon as={FiZap} boxSize={2.5} mr={0.5} />
                          Auto
                        </Badge>
                      )}
                    </FormLabel>
                    <Select value={form.category} onChange={(e) => updateForm("category", e.target.value)}>
                      <option value="">Auto-detect</option>
                      {visibleCategories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600">Date</FormLabel>
                    <Input type="date" value={form.date} onChange={(e) => updateForm("date", e.target.value)} />
                  </FormControl>
                </Grid>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">Description / Notes</FormLabel>
                  <Input
                    value={form.notes}
                    onChange={(e) => updateForm("notes", e.target.value)}
                    placeholder="e.g. Uber ride to airport"
                  />
                </FormControl>

                <Grid templateColumns="1fr 1fr" gap={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600">Merchant</FormLabel>
                    <Input
                      value={form.merchant}
                      onChange={(e) => updateForm("merchant", e.target.value)}
                      placeholder="e.g. Amazon"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600">Tags</FormLabel>
                    <Input
                      value={form.tags}
                      onChange={(e) => updateForm("tags", e.target.value)}
                      placeholder="work, personal (comma separated)"
                    />
                  </FormControl>
                </Grid>

                <Box bg={filterBg} borderRadius="10px" p={3}>
                  <Checkbox
                    isChecked={form.recurring.enabled}
                    onChange={(e) => updateForm("recurring", { ...form.recurring, enabled: e.target.checked })}
                    colorScheme="brand"
                    fontWeight="600"
                    fontSize="sm"
                  >
                    Recurring transaction
                  </Checkbox>
                  {form.recurring.enabled && (
                    <Select
                      mt={3}
                      size="sm"
                      value={form.recurring.frequency}
                      onChange={(e) => updateForm("recurring", { ...form.recurring, frequency: e.target.value })}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </Select>
                  )}
                </Box>
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onClose} isDisabled={isSaving}>Cancel</Button>
            <Button
              type="submit"
              form="txn-form"
              colorScheme="brand"
              isLoading={isSaving}
              loadingText={editingId ? "Updating..." : "Adding..."}
            >
              {editingId ? "Update" : "Add Transaction"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}


