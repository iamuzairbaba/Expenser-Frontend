import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";

const MotionBox = motion(Box);

const empty = { name: "", type: "expense", color: "#0ea5e9", icon: "tag" };

const PRESET_COLORS = [
  "#0ea5e9", "#22c55e", "#ef4444", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
  "#06b6d4", "#a855f7",
];

function CategoryCard({ category, onEdit, onDelete, isDeleting }) {
  const bg = useColorModeValue("white", "#111827");
  const border = useColorModeValue("gray.100", "whiteAlpha.100");

  return (
    <MotionBox
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      bg={bg}
      border="1px solid"
      borderColor={border}
      borderRadius="12px"
      p={4}
      boxShadow="card"
      _hover={{ boxShadow: "cardHover", transform: "translateY(-1px)" }}
      sx={{ transition: "box-shadow 0.15s ease, transform 0.15s ease" }}
    >
      <Flex justify="space-between" align="flex-start">
        <Flex align="center" gap={3}>
          <Box
            w="40px"
            h="40px"
            borderRadius="10px"
            bg={`${category.color}20`}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <Box w="14px" h="14px" borderRadius="full" bg={category.color} />
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="700">{category.name}</Text>
            <HStack spacing={1} mt={0.5}>
              <Badge
                colorScheme={category.type === "income" ? "green" : "red"}
                fontSize="9px"
                variant="subtle"
              >
                {category.type}
              </Badge>
              {category.isDefault && (
                <Badge colorScheme="blue" fontSize="9px" variant="subtle">Default</Badge>
              )}
            </HStack>
          </Box>
        </Flex>

        <HStack spacing={1}>
          <IconButton
            aria-label="Edit"
            icon={<FiEdit2 />}
            size="xs"
            variant="ghost"
            borderRadius="6px"
            onClick={() => onEdit(category)}
          />
          {!category.isDefault && (
            <IconButton
              aria-label="Delete"
              icon={<FiTrash2 />}
              size="xs"
              variant="ghost"
              colorScheme="red"
              borderRadius="6px"
              isLoading={isDeleting === category._id}
              onClick={() => onDelete(category._id)}
            />
          )}
        </HStack>
      </Flex>
    </MotionBox>
  );
}

export default function Categories({ categories, actions }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const bg = useColorModeValue("white", "#111827");
  const border = useColorModeValue("gray.100", "whiteAlpha.100");
  const mutedColor = useColorModeValue("gray.500", "gray.400");

  const previewBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  function openNew() {
    setEditingId("");
    setForm(empty);
    onOpen();
  }

  function openEdit(category) {
    setEditingId(category._id);
    setForm({ name: category.name, type: category.type, color: category.color, icon: category.icon });
    onOpen();
  }

  async function submit(event) {
    event.preventDefault();
    setIsSaving(true);
    const ok = await actions.saveCategory(form, editingId);
    setIsSaving(false);
    if (ok) {
      setForm(empty);
      setEditingId("");
      onClose();
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    await actions.deleteCategory(id);
    setDeletingId("");
  }

  return (
    <VStack align="stretch" spacing={5}>
      <Flex justify="space-between" align="center">
        <Text fontSize="xs" color={mutedColor} fontWeight="600" textTransform="uppercase" letterSpacing="0.08em">
          {categories.length} categories
        </Text>
        <Button leftIcon={<FiPlus />} colorScheme="brand" size="sm" borderRadius="8px" onClick={openNew}>
          New Category
        </Button>
      </Flex>

      {/* Expense categories */}
      <Box>
        <Flex align="center" gap={2} mb={3}>
          <Box w="8px" h="8px" borderRadius="full" bg="expense.500" />
          <Text fontSize="sm" fontWeight="700">Expense Categories</Text>
          <Badge colorScheme="red" variant="subtle" fontSize="10px">{expenseCategories.length}</Badge>
        </Flex>
        {expenseCategories.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={3}>
            {expenseCategories.map((c) => (
              <CategoryCard key={c._id} category={c} onEdit={openEdit} onDelete={handleDelete} isDeleting={deletingId} />
            ))}
          </SimpleGrid>
        ) : (
          <Box bg={bg} border="1px solid" borderColor={border} borderRadius="12px" p={6} textAlign="center">
            <Text fontSize="sm" color={mutedColor}>No expense categories yet</Text>
          </Box>
        )}
      </Box>

      {/* Income categories */}
      <Box>
        <Flex align="center" gap={2} mb={3}>
          <Box w="8px" h="8px" borderRadius="full" bg="income.500" />
          <Text fontSize="sm" fontWeight="700">Income Categories</Text>
          <Badge colorScheme="green" variant="subtle" fontSize="10px">{incomeCategories.length}</Badge>
        </Flex>
        {incomeCategories.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={3}>
            {incomeCategories.map((c) => (
              <CategoryCard key={c._id} category={c} onEdit={openEdit} onDelete={handleDelete} isDeleting={deletingId} />
            ))}
          </SimpleGrid>
        ) : (
          <Box bg={bg} border="1px solid" borderColor={border} borderRadius="12px" p={6} textAlign="center">
            <Text fontSize="sm" color={mutedColor}>No income categories yet</Text>
          </Box>
        )}
      </Box>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="lg" fontWeight="800" pb={2}>
            {editingId ? "Edit Category" : "New Category"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="cat-form" onSubmit={submit}>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="600">Name</FormLabel>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Food & Dining"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">Type</FormLabel>
                  <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">Color</FormLabel>
                  <Flex gap={2} flexWrap="wrap" mb={2}>
                    {PRESET_COLORS.map((color) => (
                      <Tooltip key={color} label={color}>
                        <Box
                          w="28px"
                          h="28px"
                          borderRadius="8px"
                          bg={color}
                          cursor="pointer"
                          border="2px solid"
                          borderColor={form.color === color ? "white" : "transparent"}
                          boxShadow={form.color === color ? `0 0 0 2px ${color}` : "none"}
                          onClick={() => setForm({ ...form, color })}
                          transition="all 0.15s"
                          _hover={{ transform: "scale(1.1)" }}
                        />
                      </Tooltip>
                    ))}
                  </Flex>
                  <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} h="40px" p={1} />
                </FormControl>

                {/* Preview */}
                <Box bg={previewBg} borderRadius="10px" p={3}>
                  <Text fontSize="xs" color={mutedColor} mb={2} fontWeight="600">Preview</Text>
                  <Flex align="center" gap={3}>
                    <Box w="36px" h="36px" borderRadius="9px" bg={`${form.color}20`} display="flex" alignItems="center" justifyContent="center">
                      <Box w="12px" h="12px" borderRadius="full" bg={form.color} />
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="700">{form.name || "Category Name"}</Text>
                      <Badge colorScheme={form.type === "income" ? "green" : "red"} fontSize="9px" variant="subtle">{form.type}</Badge>
                    </Box>
                  </Flex>
                </Box>
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onClose} isDisabled={isSaving}>Cancel</Button>
            <Button type="submit" form="cat-form" colorScheme="brand" isLoading={isSaving} loadingText={editingId ? "Updating..." : "Creating..."}>
              {editingId ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
