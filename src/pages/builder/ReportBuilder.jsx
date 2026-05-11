import {
  Badge, Box, Button, Divider, Flex, FormControl, FormLabel,
  HStack, Icon, IconButton, Input, Modal, ModalBody,
  ModalCloseButton, ModalContent, ModalFooter, ModalHeader,
  ModalOverlay, Select, SimpleGrid, Text, Textarea, Tooltip,
  VStack, useColorModeValue, useDisclosure, useToast,
} from "@chakra-ui/react";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { useState } from "react";
import {
  FiArrowLeft, FiCheck, FiCopy, FiDownload, FiEdit2,
  FiFileText, FiPlus, FiRotateCcw, FiRotateCw,
  FiSave, FiTrash2,
} from "react-icons/fi";
import { THEMES, TEMPLATES, WIDGET_GROUPS, WIDGET_TYPES } from "./builderConfig";
import { exportReportPdf } from "./reportPdf";
import { useReportBuilder } from "./useReportBuilder";
import WidgetRenderer from "./WidgetRenderer";

const MotionBox = motion(Box);

// ─── Widget palette item ──────────────────────────────────────────────────────
function PaletteItem({ widgetDef, onAdd }) {
  const bg = useColorModeValue("gray.50", "whiteAlpha.50");
  const hoverBg = useColorModeValue("brand.50", "rgba(14,165,233,0.1)");
  const border = useColorModeValue("gray.200", "whiteAlpha.100");

  return (
    <Flex
      align="center"
      gap={2.5}
      px={3}
      py={2.5}
      borderRadius="8px"
      bg={bg}
      border="1px solid"
      borderColor={border}
      cursor="pointer"
      onClick={() => onAdd(widgetDef.type)}
      _hover={{ bg: hoverBg, borderColor: "brand.400" }}
      transition="all 0.15s"
      _active={{ transform: "scale(0.97)" }}
    >
      <Text fontSize="lg" flexShrink={0}>{widgetDef.icon}</Text>
      <Text fontSize="xs" fontWeight="600" noOfLines={1}>{widgetDef.label}</Text>
      <Icon as={FiPlus} boxSize={3} ml="auto" color="brand.500" flexShrink={0} />
    </Flex>
  );
}

// ─── Canvas widget card ───────────────────────────────────────────────────────
function CanvasCard({ widget, isSelected, onSelect, onRemove, onDuplicate, onEditConfig, analytics, transactions, theme }) {
  const toolbarBg = useColorModeValue("white", "#1e293b");
  const selectedBorder = useColorModeValue("brand.500", "brand.300");

  return (
    <Reorder.Item value={widget} id={widget.id}>
      <MotionBox
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        position="relative"
        border="2px solid"
        borderColor={isSelected ? selectedBorder : "transparent"}
        borderRadius="12px"
        cursor="pointer"
        onClick={() => onSelect(widget.id)}
        _hover={{ borderColor: isSelected ? selectedBorder : "brand.300" }}
        sx={{ transition: "border-color 0.15s" }}
      >
        {/* Drag handle + toolbar */}
        <Flex
          position="absolute"
          top="-1px"
          right="-1px"
          bg={toolbarBg}
          borderRadius="0 10px 0 8px"
          border="1px solid"
          borderColor={useColorModeValue("gray.200", "whiteAlpha.100")}
          opacity={isSelected ? 1 : 0}
          _groupHover={{ opacity: 1 }}
          zIndex={2}
          sx={{ ".canvas-card:hover &": { opacity: 1 } }}
        >
          <Tooltip label="Duplicate">
            <IconButton aria-label="Duplicate" icon={<FiCopy />} size="xs" variant="ghost" onClick={(e) => { e.stopPropagation(); onDuplicate(widget.id); }} />
          </Tooltip>
          <Tooltip label="Edit content">
            <IconButton aria-label="Edit" icon={<FiEdit2 />} size="xs" variant="ghost" onClick={(e) => { e.stopPropagation(); onEditConfig(widget); }} />
          </Tooltip>
          <Tooltip label="Remove">
            <IconButton aria-label="Remove" icon={<FiTrash2 />} size="xs" variant="ghost" colorScheme="red" onClick={(e) => { e.stopPropagation(); onRemove(widget.id); }} />
          </Tooltip>
        </Flex>

        <Box className="canvas-card" role="group">
          <WidgetRenderer widget={widget} analytics={analytics} transactions={transactions} theme={theme} />
        </Box>
      </MotionBox>
    </Reorder.Item>
  );
}

// ─── Widget config editor modal ───────────────────────────────────────────────
function WidgetConfigModal({ widget, isOpen, onClose, onSave }) {
  const [config, setConfig] = useState(widget?.config || {});

  function handleSave() {
    onSave(widget.id, { config });
    onClose();
  }

  if (!widget) return null;

  const isText = widget.type === "text_title" || widget.type === "text_note";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md" fontWeight="700">Edit Widget</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {widget.type === "text_title" && (
              <>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">Title Text</FormLabel>
                  <Input value={config.text || ""} onChange={(e) => setConfig({ ...config, text: e.target.value })} placeholder="Report Title" />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">Subtitle</FormLabel>
                  <Input value={config.subtitle || ""} onChange={(e) => setConfig({ ...config, subtitle: e.target.value })} placeholder="Optional subtitle" />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">Size</FormLabel>
                  <Select value={config.size || "2xl"} onChange={(e) => setConfig({ ...config, size: e.target.value })}>
                    <option value="xl">Large</option>
                    <option value="2xl">Extra Large</option>
                    <option value="3xl">Huge</option>
                  </Select>
                </FormControl>
              </>
            )}
            {widget.type === "text_note" && (
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">Note Text</FormLabel>
                <Textarea value={config.text || ""} onChange={(e) => setConfig({ ...config, text: e.target.value })} placeholder="Add your notes..." rows={4} />
              </FormControl>
            )}
            {!isText && (
              <Text fontSize="sm" color="gray.500">This widget uses live data — no configuration needed.</Text>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button colorScheme="brand" onClick={handleSave}>Apply</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ─── Template picker modal ────────────────────────────────────────────────────
function TemplateModal({ isOpen, onClose, onApply }) {
  const bg = useColorModeValue("gray.50", "whiteAlpha.50");
  const border = useColorModeValue("gray.200", "whiteAlpha.100");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const hoverBg = useColorModeValue("brand.50", "rgba(14,165,233,0.08)");

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md" fontWeight="700">Choose a Template</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            <Box
              p={4} bg={bg} borderRadius="12px" border="2px dashed" borderColor={border}
              cursor="pointer" textAlign="center"
              _hover={{ borderColor: "brand.400" }}
              onClick={() => { onApply(null); onClose(); }}
            >
              <Text fontSize="2xl" mb={2}>✨</Text>
              <Text fontWeight="700" fontSize="sm">Blank Report</Text>
              <Text fontSize="xs" color={mutedColor} mt={1}>Start from scratch</Text>
            </Box>
            {TEMPLATES.map((t) => (
              <Box
                key={t.id}
                p={4} bg={bg} borderRadius="12px" border="1px solid" borderColor={border}
                cursor="pointer"
                _hover={{ borderColor: "brand.400", bg: hoverBg }}
                onClick={() => { onApply(t); onClose(); }}
                transition="all 0.15s"
              >
                <HStack mb={2}>
                  <Text fontSize="xl">{t.icon}</Text>
                  <Badge colorScheme="brand" fontSize="9px">{THEMES[t.theme]?.name}</Badge>
                </HStack>
                <Text fontWeight="700" fontSize="sm">{t.name}</Text>
                <Text fontSize="xs" color={mutedColor} mt={1}>{t.description}</Text>
                <Text fontSize="xs" color={mutedColor} mt={1}>{t.widgets.length} widgets</Text>
              </Box>
            ))}
          </SimpleGrid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

// ─── Style panel ──────────────────────────────────────────────────────────────
function StylePanel({ theme, setTheme, applyTheme }) {
  const bg = useColorModeValue("white", "#111827");
  const border = useColorModeValue("gray.100", "whiteAlpha.100");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const activeBorder = "brand.500";
  const inactiveBorder = useColorModeValue("gray.200", "whiteAlpha.100");

  return (
    <Box
      w="240px"
      flexShrink={0}
      bg={bg}
      border="1px solid"
      borderColor={border}
      borderRadius="14px"
      overflow="hidden"
      display={{ base: "none", xl: "flex" }}
      flexDirection="column"
    >
      <Box px={4} py={3} borderBottom="1px solid" borderColor={border}>
        <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em" color={mutedColor}>
          Style
        </Text>
      </Box>
      <Box flex={1} overflowY="auto" p={4}>
        <VStack spacing={5} align="stretch">
          {/* Theme presets */}
          <Box>
            <Text fontSize="xs" fontWeight="700" mb={3} color={mutedColor} textTransform="uppercase" letterSpacing="0.06em">
              Theme Presets
            </Text>
            <VStack spacing={2} align="stretch">
              {Object.entries(THEMES).map(([key, t]) => (
                <Flex
                  key={key}
                  align="center"
                  gap={2.5}
                  p={2.5}
                  borderRadius="8px"
                  border="2px solid"
                  borderColor={theme.name === t.name ? activeBorder : inactiveBorder}
                  cursor="pointer"
                  onClick={() => applyTheme(key)}
                  _hover={{ borderColor: "brand.400" }}
                  transition="all 0.15s"
                >
                  <Box w="20px" h="20px" borderRadius="4px" bg={t.bg} border="1px solid" borderColor={inactiveBorder} flexShrink={0} />
                  <Text fontSize="xs" fontWeight="600">{t.name}</Text>
                  {theme.name === t.name && <Icon as={FiCheck} color="brand.500" boxSize={3} ml="auto" />}
                </Flex>
              ))}
            </VStack>
          </Box>

          <Divider />

          {/* Custom colors */}
          <Box>
            <Text fontSize="xs" fontWeight="700" mb={3} color={mutedColor} textTransform="uppercase" letterSpacing="0.06em">
              Custom Colors
            </Text>
            <VStack spacing={3} align="stretch">
              {[
                { label: "Background", key: "bg" },
                { label: "Card Background", key: "cardBg" },
                { label: "Accent Color", key: "accent" },
                { label: "Text Color", key: "text" },
              ].map(({ label, key }) => (
                <FormControl key={key}>
                  <FormLabel fontSize="xs" fontWeight="600" mb={1}>{label}</FormLabel>
                  <HStack>
                    <Input
                      type="color"
                      value={theme[key]?.startsWith("#") ? theme[key] : "#0b1120"}
                      onChange={(e) => setTheme((t) => ({ ...t, [key]: e.target.value }))}
                      h="32px"
                      p={1}
                      w="40px"
                      flexShrink={0}
                    />
                    <Input
                      value={theme[key] || ""}
                      onChange={(e) => setTheme((t) => ({ ...t, [key]: e.target.value }))}
                      fontSize="xs"
                      size="sm"
                    />
                  </HStack>
                </FormControl>
              ))}
            </VStack>
          </Box>

          <Divider />

          {/* Layout */}
          <Box>
            <Text fontSize="xs" fontWeight="700" mb={3} color={mutedColor} textTransform="uppercase" letterSpacing="0.06em">
              Layout
            </Text>
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="600" mb={1}>Border Radius</FormLabel>
              <Select
                size="sm"
                value={theme.borderRadius}
                onChange={(e) => setTheme((t) => ({ ...t, borderRadius: Number(e.target.value) }))}
              >
                <option value={0}>Sharp (0px)</option>
                <option value={6}>Subtle (6px)</option>
                <option value={10}>Rounded (10px)</option>
                <option value={14}>Soft (14px)</option>
                <option value={20}>Pill (20px)</option>
              </Select>
            </FormControl>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}

// ─── Main Report Builder ──────────────────────────────────────────────────────
export default function ReportBuilder({ analytics, transactions, onBack }) {
  const builder = useReportBuilder();
  const toast = useToast();
  const templateModal = useDisclosure();
  const configModal = useDisclosure();
  const [editingWidget, setEditingWidget] = useState(null);

  const bg = useColorModeValue("#f8fafc", "#0b1120");
  const panelBg = useColorModeValue("white", "#111827");
  const panelBorder = useColorModeValue("gray.100", "whiteAlpha.100");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const canvasBg = useColorModeValue("gray.100", "#0d1526");
  const emptyBorder = useColorModeValue("gray.300", "whiteAlpha.200");

  function handleEditConfig(widget) {
    setEditingWidget(widget);
    configModal.onOpen();
  }

  function handleExportPdf() {
    if (builder.widgets.length === 0) {
      toast({ title: "Add widgets first", status: "warning", duration: 2000 });
      return;
    }
    exportReportPdf(builder.reportMeta, builder.widgets, builder.theme, analytics, transactions);
  }

  const groupedWidgets = WIDGET_GROUPS.map((group) => ({
    group,
    items: Object.values(WIDGET_TYPES).filter((w) => w.group === group),
  }));

  return (
    <Flex direction="column" h="100vh" bg={bg} overflow="hidden">
      {/* ── Top toolbar ── */}
      <Flex
        align="center"
        justify="space-between"
        px={4}
        py={3}
        bg={panelBg}
        borderBottom="1px solid"
        borderColor={panelBorder}
        flexShrink={0}
        gap={3}
        flexWrap="wrap"
      >
        <HStack spacing={3}>
          <Tooltip label="Back to Reports">
            <IconButton aria-label="Back" icon={<FiArrowLeft />} variant="ghost" size="sm" borderRadius="8px" onClick={onBack} />
          </Tooltip>
          <Input
            value={builder.reportMeta.title}
            onChange={(e) => builder.setReportMeta((m) => ({ ...m, title: e.target.value }))}
            variant="unstyled"
            fontWeight="700"
            fontSize="md"
            maxW="280px"
            placeholder="Report title..."
          />
          {builder.lastSaved && (
            <Text fontSize="xs" color={mutedColor}>
              Saved {builder.lastSaved.toLocaleTimeString()}
            </Text>
          )}
        </HStack>

        <HStack spacing={2} flexWrap="wrap">
          <Tooltip label="Undo (Ctrl+Z)">
            <IconButton aria-label="Undo" icon={<FiRotateCcw />} size="sm" variant="ghost" borderRadius="8px" isDisabled={!builder.canUndo} onClick={builder.undo} />
          </Tooltip>
          <Tooltip label="Redo">
            <IconButton aria-label="Redo" icon={<FiRotateCw />} size="sm" variant="ghost" borderRadius="8px" isDisabled={!builder.canRedo} onClick={builder.redo} />
          </Tooltip>
          <Button leftIcon={<FiFileText />} size="sm" variant="outline" borderRadius="8px" onClick={templateModal.onOpen}>
            Templates
          </Button>
          <Button leftIcon={<FiDownload />} size="sm" variant="outline" borderRadius="8px" onClick={handleExportPdf}>
            Export PDF
          </Button>
          <Button
            leftIcon={<FiSave />}
            size="sm"
            colorScheme="brand"
            borderRadius="8px"
            onClick={() => builder.save(false)}
            isLoading={builder.isSaving}
            loadingText="Saving..."
          >
            Save
          </Button>
        </HStack>
      </Flex>

      {/* ── Three-panel layout ── */}
      <Flex flex={1} overflow="hidden" gap={0}>

        {/* Left: Widget Palette */}
        <Box
          w="220px"
          flexShrink={0}
          bg={panelBg}
          borderRight="1px solid"
          borderColor={panelBorder}
          overflowY="auto"
          display={{ base: "none", lg: "block" }}
        >
          <Box px={3} py={3} borderBottom="1px solid" borderColor={panelBorder}>
            <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em" color={mutedColor}>
              Widgets
            </Text>
          </Box>
          <Box p={3}>
            <VStack spacing={4} align="stretch">
              {groupedWidgets.map(({ group, items }) => (
                <Box key={group}>
                  <Text fontSize="10px" fontWeight="700" color={mutedColor} textTransform="uppercase" letterSpacing="0.1em" mb={2}>
                    {group}
                  </Text>
                  <VStack spacing={1.5} align="stretch">
                    {items.map((w) => (
                      <PaletteItem key={w.type} widgetDef={w} onAdd={builder.addWidget} />
                    ))}
                  </VStack>
                </Box>
              ))}
            </VStack>
          </Box>
        </Box>

        {/* Center: Canvas */}
        <Box flex={1} overflowY="auto" p={{ base: 3, md: 6 }} bg={canvasBg}>
          {/* Mobile widget add button */}
          <Box display={{ base: "block", lg: "none" }} mb={4}>
            <Select
              placeholder="Add widget..."
              size="sm"
              onChange={(e) => { if (e.target.value) { builder.addWidget(e.target.value); e.target.value = ""; } }}
            >
              {groupedWidgets.map(({ group, items }) => (
                <optgroup key={group} label={group}>
                  {items.map((w) => <option key={w.type} value={w.type}>{w.icon} {w.label}</option>)}
                </optgroup>
              ))}
            </Select>
          </Box>

          {builder.widgets.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              minH="400px"
              border="2px dashed"
              borderColor={emptyBorder}
              borderRadius="16px"
              gap={4}
              p={8}
              textAlign="center"
            >
              <Text fontSize="4xl">📊</Text>
              <Box>
                <Text fontWeight="700" fontSize="lg">Your canvas is empty</Text>
                <Text fontSize="sm" color={mutedColor} mt={1}>
                  Add widgets from the left panel or start with a template
                </Text>
              </Box>
              <HStack spacing={3}>
                <Button colorScheme="brand" size="sm" leftIcon={<FiFileText />} onClick={templateModal.onOpen}>
                  Use Template
                </Button>
                <Button variant="outline" size="sm" leftIcon={<FiPlus />} onClick={() => builder.addWidget("stat_income")}>
                  Add Widget
                </Button>
              </HStack>
            </Flex>
          ) : (
            <Box
              maxW="860px"
              mx="auto"
              p={6}
              borderRadius="16px"
              style={{ background: builder.theme.bg }}
            >
              <Reorder.Group
                axis="y"
                values={builder.widgets}
                onReorder={builder.reorderWidgets}
                style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}
              >
                <AnimatePresence>
                  {builder.widgets.map((widget) => (
                    <CanvasCard
                      key={widget.id}
                      widget={widget}
                      isSelected={builder.selectedId === widget.id}
                      onSelect={builder.setSelectedId}
                      onRemove={builder.removeWidget}
                      onDuplicate={builder.duplicateWidget}
                      onEditConfig={handleEditConfig}
                      analytics={analytics}
                      transactions={transactions}
                      theme={builder.theme}
                    />
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            </Box>
          )}
        </Box>

        {/* Right: Style Panel */}
        <StylePanel theme={builder.theme} setTheme={builder.setTheme} applyTheme={builder.applyTheme} />
      </Flex>

      {/* Modals */}
      <TemplateModal
        isOpen={templateModal.isOpen}
        onClose={templateModal.onClose}
        onApply={(template) => {
          if (template) builder.applyTemplate(template);
          else { builder.setWidgets([]); builder.setSelectedId(null); }
        }}
      />

      <WidgetConfigModal
        widget={editingWidget}
        isOpen={configModal.isOpen}
        onClose={configModal.onClose}
        onSave={builder.updateWidget}
      />
    </Flex>
  );
}
