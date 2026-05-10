import { Badge, Box, Button, Grid, HStack, IconButton, Input, Select, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const empty = { name: "", type: "expense", color: "#2563EB", icon: "tag" };

export default function Categories({ categories, actions }) {
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState("");

  async function submit(event) {
    event.preventDefault();
    const ok = await actions.saveCategory(form, editingId);
    if (ok) {
      setForm(empty);
      setEditingId("");
    }
  }

  return (
    <VStack align="stretch" spacing={5}>
      <Box>
        <Text fontSize="2xl" fontWeight="800">Categories</Text>
        <Text color="gray.500">Customize colors and labels for cleaner reporting.</Text>
      </Box>

      <Box as="form" onSubmit={submit} border="1px solid" borderColor="gray.200" borderRadius="8" p={5}>
        <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr 1fr auto" }} gap={3}>
          <Input placeholder="Category name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="expense">Expense</option><option value="income">Income</option></Select>
          <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
          <Input placeholder="Icon name" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          <Button type="submit" colorScheme="blue">{editingId ? "Update" : "Create"}</Button>
        </Grid>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
        {categories.map((category) => (
          <HStack key={category._id} border="1px solid" borderColor="gray.200" borderRadius="8" p={4} justify="space-between">
            <HStack>
              <Box w="12px" h="36px" bg={category.color} borderRadius="4" />
              <Box>
                <Text fontWeight="700">{category.name}</Text>
                <HStack><Badge>{category.type}</Badge>{category.isDefault ? <Badge colorScheme="blue">Default</Badge> : null}</HStack>
              </Box>
            </HStack>
            <HStack>
              <IconButton aria-label="Edit category" icon={<FiEdit2 />} size="sm" onClick={() => { setEditingId(category._id); setForm({ name: category.name, type: category.type, color: category.color, icon: category.icon }); }} />
              <IconButton aria-label="Delete category" icon={<FiTrash2 />} size="sm" colorScheme="red" variant="ghost" onClick={() => actions.deleteCategory(category._id)} />
            </HStack>
          </HStack>
        ))}
      </SimpleGrid>
    </VStack>
  );
}
