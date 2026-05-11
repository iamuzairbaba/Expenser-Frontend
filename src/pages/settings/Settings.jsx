import {
  Alert, AlertDescription, AlertIcon, Avatar, Badge, Box, Button,
  Divider, Flex, FormControl, FormLabel, Grid, HStack, Icon,
  IconButton, Input, InputGroup, InputRightElement, Modal,
  ModalBody, ModalCloseButton, ModalContent, ModalFooter,
  ModalHeader, ModalOverlay, NumberInput, NumberInputField,
  Select, SimpleGrid, Switch, Tab, TabList,
  Tabs, Text, VStack, useColorMode, useColorModeValue,
  useDisclosure, useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useContext, useState } from "react";
import {
  FiAlertTriangle, FiBell, FiDownload, FiEye, FiEyeOff,
  FiGlobe, FiLock, FiMoon, FiShield, FiSun, FiTrash2, FiUser,
} from "react-icons/fi";
import { GlobalContext } from "../../context";
import { api } from "../../services/api";
import { exportCsv } from "../../utils/export";

const MotionBox = motion(Box);

const ACCENT_COLORS = [
  "#0ea5e9", "#6366f1", "#8b5cf6", "#ec4899",
  "#22c55e", "#f59e0b", "#ef4444", "#14b8a6",
];

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD", "SGD", "AED"];

function SectionCard({ title, children }) {
  const bg = useColorModeValue("white", "#111827");
  const border = useColorModeValue("gray.100", "whiteAlpha.100");
  return (
    <MotionBox
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      bg={bg}
      border="1px solid"
      borderColor={border}
      borderRadius="14px"
      p={6}
      boxShadow="card"
    >
      {title && <Text fontSize="sm" fontWeight="700" mb={5}>{title}</Text>}
      {children}
    </MotionBox>
  );
}

function ToggleRow({ label, description, isChecked, onChange }) {
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  return (
    <Flex justify="space-between" align="center" py={3}>
      <Box>
        <Text fontSize="sm" fontWeight="600">{label}</Text>
        {description && <Text fontSize="xs" color={mutedColor} mt={0.5}>{description}</Text>}
      </Box>
      <Switch isChecked={isChecked} onChange={(e) => onChange(e.target.checked)} colorScheme="brand" />
    </Flex>
  );
}

// ── Profile ──────────────────────────────────────────────────────────────────
function ProfileSection({ user, token, onUpdate }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "", avatar: user?.avatar || "" });
  const [isSaving, setIsSaving] = useState(false);
  const mutedColor = useColorModeValue("gray.500", "gray.400");

  async function save() {
    setIsSaving(true);
    try {
      const result = await api.updateProfile(form, token);
      onUpdate(result.user);
      toast({ title: "Profile updated", status: "success", duration: 2500 });
    } catch (err) {
      toast({ title: "Failed to update", description: err.message, status: "error", duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      <SectionCard title="Profile Information">
        <VStack spacing={5} align="stretch">
          <Flex align="center" gap={4}>
            <Avatar size="xl" name={form.name} bg="brand.500" color="white" fontWeight="700" />
            <Box>
              <Text fontSize="sm" fontWeight="700">{form.name}</Text>
              <Text fontSize="xs" color={mutedColor}>{user?.email}</Text>
              <Badge mt={1} colorScheme={user?.provider === "google" ? "blue" : "gray"} fontSize="9px">
                {user?.provider === "google" ? "Google Account" : "Email Account"}
              </Badge>
            </Box>
          </Flex>
          <Divider />
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600">Full Name</FormLabel>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600">Email</FormLabel>
              <Input value={user?.email || ""} isReadOnly opacity={0.6} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600">Phone Number</FormLabel>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 8900" />
            </FormControl>
          </Grid>
          <Button colorScheme="brand" alignSelf="flex-start" onClick={save} isLoading={isSaving} loadingText="Saving...">
            Save Changes
          </Button>
        </VStack>
      </SectionCard>
    </VStack>
  );
}

// ── Security ─────────────────────────────────────────────────────────────────
function SecuritySection({ user, token }) {
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const bg = useColorModeValue("gray.50", "whiteAlpha.50");

  async function changePassword() {
    setError("");
    if (form.newPassword !== form.confirmPassword) { setError("New passwords do not match"); return; }
    if (form.newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    setIsSaving(true);
    try {
      await api.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword }, token);
      toast({ title: "Password changed successfully", status: "success", duration: 2500 });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  const loginHistory = user?.loginHistory?.slice().reverse() || [];

  return (
    <VStack spacing={4} align="stretch">
      {user?.provider !== "google" && (
        <SectionCard title="Change Password">
          <VStack spacing={4} align="stretch">
            {error && (
              <Alert status="error" borderRadius="10px" fontSize="sm">
                <AlertIcon /><AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {["current", "new", "confirm"].map((field) => (
              <FormControl key={field}>
                <FormLabel fontSize="sm" fontWeight="600">
                  {field === "current" ? "Current Password" : field === "new" ? "New Password" : "Confirm New Password"}
                </FormLabel>
                <InputGroup>
                  <Input
                    type={show[field] ? "text" : "password"}
                    value={form[field === "confirm" ? "confirmPassword" : `${field}Password`]}
                    onChange={(e) => setForm({ ...form, [field === "confirm" ? "confirmPassword" : `${field}Password`]: e.target.value })}
                    placeholder="••••••••"
                    pr="40px"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label="toggle"
                      icon={show[field] ? <FiEyeOff /> : <FiEye />}
                      size="xs"
                      variant="ghost"
                      onClick={() => setShow((s) => ({ ...s, [field]: !s[field] }))}
                      tabIndex={-1}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            ))}
            <Button colorScheme="brand" alignSelf="flex-start" onClick={changePassword} isLoading={isSaving} loadingText="Changing...">
              Change Password
            </Button>
          </VStack>
        </SectionCard>
      )}

      <SectionCard title="Login History">
        <VStack align="stretch" spacing={2}>
          {loginHistory.length === 0 ? (
            <Text fontSize="sm" color={mutedColor}>No login history available</Text>
          ) : (
            loginHistory.slice(0, 5).map((entry, i) => (
              <Flex key={i} justify="space-between" align="center" p={3} bg={bg} borderRadius="8px">
                <HStack gap={3}>
                  <Icon as={FiShield} color="brand.500" boxSize={4} />
                  <Box>
                    <Text fontSize="sm" fontWeight="600">{entry.device || "Web Browser"}</Text>
                    <Text fontSize="xs" color={mutedColor}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </Text>
                  </Box>
                </HStack>
                {i === 0 && <Badge colorScheme="green" fontSize="9px">Current</Badge>}
              </Flex>
            ))
          )}
        </VStack>
      </SectionCard>
    </VStack>
  );
}

// ── Preferences ───────────────────────────────────────────────────────────────
function PreferencesSection({ user, token, onUpdate }) {
  const toast = useToast();
  const [prefs, setPrefs] = useState({
    currency: user?.preferences?.currency || "USD",
    monthStartDate: user?.preferences?.monthStartDate || 1,
    budgetAlertThreshold: user?.preferences?.budgetAlertThreshold || 80,
    defaultTransactionType: user?.preferences?.defaultTransactionType || "expense",
    defaultDashboardView: user?.preferences?.defaultDashboardView || "overview",
    monthlyIncome: user?.preferences?.monthlyIncome || 0,
    monthlySavingsGoal: user?.preferences?.monthlySavingsGoal || 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    setIsSaving(true);
    try {
      const result = await api.updatePreferences(prefs, token);
      onUpdate(result.user);
      toast({ title: "Preferences saved", status: "success", duration: 2500 });
    } catch (err) {
      toast({ title: "Failed", description: err.message, status: "error", duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SectionCard title="Preferences">
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="600">Currency</FormLabel>
          <Select value={prefs.currency} onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="600">Month Start Date</FormLabel>
          <Select value={prefs.monthStartDate} onChange={(e) => setPrefs({ ...prefs, monthStartDate: Number(e.target.value) })}>
            {[1, 5, 10, 15, 20, 25].map((d) => <option key={d} value={d}>{d === 1 ? "1st" : `${d}th`}</option>)}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="600">Budget Alert Threshold</FormLabel>
          <Select value={prefs.budgetAlertThreshold} onChange={(e) => setPrefs({ ...prefs, budgetAlertThreshold: Number(e.target.value) })}>
            <option value={60}>60%</option>
            <option value={75}>75%</option>
            <option value={80}>80%</option>
            <option value={90}>90%</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="600">Default Transaction Type</FormLabel>
          <Select value={prefs.defaultTransactionType} onChange={(e) => setPrefs({ ...prefs, defaultTransactionType: e.target.value })}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="600">Monthly Income</FormLabel>
          <NumberInput value={prefs.monthlyIncome} min={0} onChange={(v) => setPrefs({ ...prefs, monthlyIncome: Number(v) })}>
            <NumberInputField />
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="600">Monthly Savings Goal</FormLabel>
          <NumberInput value={prefs.monthlySavingsGoal} min={0} onChange={(v) => setPrefs({ ...prefs, monthlySavingsGoal: Number(v) })}>
            <NumberInputField />
          </NumberInput>
        </FormControl>
      </Grid>
      <Button colorScheme="brand" mt={5} onClick={save} isLoading={isSaving} loadingText="Saving...">
        Save Preferences
      </Button>
    </SectionCard>
  );
}

// ── Notifications ─────────────────────────────────────────────────────────────
function NotificationsSection({ user, token, onUpdate }) {
  const toast = useToast();
  const [notifs, setNotifs] = useState({
    budgetAlerts: user?.notifications?.budgetAlerts ?? true,
    monthlySummary: user?.notifications?.monthlySummary ?? true,
    weeklyReports: user?.notifications?.weeklyReports ?? false,
    goalReminders: user?.notifications?.goalReminders ?? true,
    subscriptionReminders: user?.notifications?.subscriptionReminders ?? true,
    emailNotifications: user?.notifications?.emailNotifications ?? false,
    pushNotifications: user?.notifications?.pushNotifications ?? false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const border = useColorModeValue("gray.100", "whiteAlpha.100");

  function toggle(key, val) { setNotifs((n) => ({ ...n, [key]: val })); }

  async function save() {
    setIsSaving(true);
    try {
      const result = await api.updateNotifications(notifs, token);
      onUpdate(result.user);
      toast({ title: "Notifications updated", status: "success", duration: 2500 });
    } catch (err) {
      toast({ title: "Failed", description: err.message, status: "error", duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  }

  const rows = [
    { key: "budgetAlerts", label: "Budget Alerts", desc: "Notify when approaching budget limit" },
    { key: "monthlySummary", label: "Monthly Summary", desc: "End-of-month financial recap" },
    { key: "weeklyReports", label: "Weekly Reports", desc: "Weekly spending overview" },
    { key: "goalReminders", label: "Goal Reminders", desc: "Progress updates on your goals" },
    { key: "subscriptionReminders", label: "Subscription Reminders", desc: "Upcoming recurring payments" },
  ];

  return (
    <VStack spacing={4} align="stretch">
      <SectionCard title="In-App Notifications">
        <VStack align="stretch" divider={<Divider borderColor={border} />} spacing={0}>
          {rows.map((r) => (
            <ToggleRow key={r.key} label={r.label} description={r.desc} isChecked={notifs[r.key]} onChange={(v) => toggle(r.key, v)} />
          ))}
        </VStack>
      </SectionCard>
      <SectionCard title="Communication">
        <VStack align="stretch" divider={<Divider borderColor={border} />} spacing={0}>
          <ToggleRow label="Email Notifications" description="Receive reports via email" isChecked={notifs.emailNotifications} onChange={(v) => toggle("emailNotifications", v)} />
          <ToggleRow label="Push Notifications" description="Browser push notifications" isChecked={notifs.pushNotifications} onChange={(v) => toggle("pushNotifications", v)} />
        </VStack>
      </SectionCard>
      <Button colorScheme="brand" alignSelf="flex-start" onClick={save} isLoading={isSaving} loadingText="Saving...">
        Save Notifications
      </Button>
    </VStack>
  );
}

// ── Data & Privacy ────────────────────────────────────────────────────────────
function DataSection({ user, token, transactions, onLogout }) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const bg = useColorModeValue("gray.50", "whiteAlpha.50");

  function handleExport() {
    const items = transactions?.items || [];
    if (items.length === 0) { toast({ title: "No transactions to export", status: "warning", duration: 2500 }); return; }
    exportCsv(items);
    toast({ title: "Data exported", status: "success", duration: 2500 });
  }

  async function handleDelete() {
    setDeleteError("");
    setIsDeleting(true);
    try {
      await api.deleteAccount({ password: deletePassword }, token);
      toast({ title: "Account deleted", status: "info", duration: 3000 });
      onLogout();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      <SectionCard title="Export Data">
        <VStack align="stretch" spacing={3}>
          <Text fontSize="sm" color={mutedColor}>Download all your transaction data as a CSV file.</Text>
          <Button leftIcon={<FiDownload />} variant="outline" alignSelf="flex-start" onClick={handleExport}>
            Export All Transactions (CSV)
          </Button>
        </VStack>
      </SectionCard>

      <SectionCard title="Danger Zone">
        <VStack align="stretch" spacing={4}>
          <Box p={4} bg={bg} borderRadius="10px" border="1px solid" borderColor="expense.500">
            <HStack justify="space-between" align="flex-start">
              <Box>
                <Text fontSize="sm" fontWeight="700" color="expense.500">Delete Account</Text>
                <Text fontSize="xs" color={mutedColor} mt={1}>
                  Permanently delete your account and all data. This cannot be undone.
                </Text>
              </Box>
              <Button size="sm" colorScheme="red" variant="outline" leftIcon={<FiTrash2 />} onClick={onOpen}>
                Delete
              </Button>
            </HStack>
          </Box>
        </VStack>
      </SectionCard>

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Icon as={FiAlertTriangle} color="expense.500" />
              <Text>Delete Account</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="error" borderRadius="10px" fontSize="sm">
                <AlertIcon />
                <AlertDescription>This will permanently delete all your data including transactions, budgets, and categories.</AlertDescription>
              </Alert>
              {user?.provider !== "google" && (
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">Enter your password to confirm</FormLabel>
                  <Input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="••••••••" />
                </FormControl>
              )}
              {deleteError && <Text fontSize="sm" color="expense.500">{deleteError}</Text>}
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button colorScheme="red" onClick={handleDelete} isLoading={isDeleting} loadingText="Deleting...">
              Delete My Account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}

// ── Appearance ────────────────────────────────────────────────────────────────
function AppearanceSection({ user, token, onUpdate }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const [accent, setAccent] = useState(user?.preferences?.accentColor || "#0ea5e9");
  const [compact, setCompact] = useState(user?.preferences?.compactMode || false);
  const [animations, setAnimations] = useState(user?.preferences?.animationsEnabled ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const bg = useColorModeValue("gray.50", "whiteAlpha.50");
  const activeBorder = "brand.500";
  const inactiveBorder = useColorModeValue("gray.200", "whiteAlpha.100");
  const border = useColorModeValue("gray.100", "whiteAlpha.100");

  async function save() {
    setIsSaving(true);
    try {
      const result = await api.updatePreferences({ accentColor: accent, compactMode: compact, animationsEnabled: animations }, token);
      onUpdate(result.user);
      toast({ title: "Appearance saved", status: "success", duration: 2500 });
    } catch (err) {
      toast({ title: "Failed", description: err.message, status: "error", duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      <SectionCard title="Theme">
        <SimpleGrid columns={2} spacing={3}>
          {[
            { id: "light", label: "Light Mode", icon: FiSun },
            { id: "dark", label: "Dark Mode", icon: FiMoon },
          ].map((t) => (
            <Box
              key={t.id}
              p={4}
              bg={bg}
              borderRadius="12px"
              border="2px solid"
              borderColor={colorMode === t.id ? activeBorder : inactiveBorder}
              cursor="pointer"
              onClick={() => colorMode !== t.id && toggleColorMode()}
              transition="all 0.15s"
              _hover={{ borderColor: "brand.400" }}
            >
              <HStack>
                <Icon as={t.icon} boxSize={5} color={colorMode === t.id ? "brand.500" : undefined} />
                <Text fontSize="sm" fontWeight="700">{t.label}</Text>
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      </SectionCard>

      <SectionCard title="Accent Color">
        <HStack spacing={3} flexWrap="wrap">
          {ACCENT_COLORS.map((color) => (
            <Box
              key={color}
              w="32px"
              h="32px"
              borderRadius="8px"
              bg={color}
              cursor="pointer"
              border="3px solid"
              borderColor={accent === color ? "white" : "transparent"}
              boxShadow={accent === color ? `0 0 0 2px ${color}` : "none"}
              onClick={() => setAccent(color)}
              transition="all 0.15s"
              _hover={{ transform: "scale(1.1)" }}
            />
          ))}
        </HStack>
      </SectionCard>

      <SectionCard title="Display Options">
        <VStack align="stretch" divider={<Divider borderColor={border} />} spacing={0}>
          <ToggleRow label="Compact Mode" description="Reduce spacing for more content" isChecked={compact} onChange={setCompact} />
          <ToggleRow label="Animations" description="Enable smooth transitions and effects" isChecked={animations} onChange={setAnimations} />
        </VStack>
      </SectionCard>

      <Button colorScheme="brand" alignSelf="flex-start" onClick={save} isLoading={isSaving} loadingText="Saving...">
        Save Appearance
      </Button>
    </VStack>
  );
}

// ── Main Settings Page ────────────────────────────────────────────────────────
const TABS = [
  { id: "profile", label: "Profile", icon: FiUser },
  { id: "security", label: "Security", icon: FiLock },
  { id: "preferences", label: "Preferences", icon: FiGlobe },
  { id: "notifications", label: "Notifications", icon: FiBell },
  { id: "data", label: "Data & Privacy", icon: FiShield },
  { id: "appearance", label: "Appearance", icon: FiSun },
];

export default function Settings({ transactions, onLogout }) {
  const { user, token, updateUser } = useContext(GlobalContext);
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const bg = useColorModeValue("white", "#111827");
  const border = useColorModeValue("gray.100", "whiteAlpha.100");
  const activeBg = useColorModeValue("brand.50", "rgba(14,165,233,0.12)");

  const [activeTab, setActiveTab] = useState(0);

  const panels = [
    <ProfileSection user={user} token={token} onUpdate={updateUser} />,
    <SecuritySection user={user} token={token} />,
    <PreferencesSection user={user} token={token} onUpdate={updateUser} />,
    <NotificationsSection user={user} token={token} onUpdate={updateUser} />,
    <DataSection user={user} token={token} transactions={transactions} onLogout={onLogout} />,
    <AppearanceSection user={user} token={token} onUpdate={updateUser} />,
  ];

  return (
    <Grid templateColumns={{ base: "1fr", md: "200px 1fr" }} gap={5} alignItems="start">
      {/* Sidebar tabs */}
      <Box
        bg={bg}
        border="1px solid"
        borderColor={border}
        borderRadius="14px"
        p={3}
        boxShadow="card"
        display={{ base: "none", md: "block" }}
      >
        <VStack align="stretch" spacing={1}>
          {TABS.map((tab, i) => (
            <Flex
              key={tab.id}
              align="center"
              gap={3}
              px={3}
              py={2.5}
              borderRadius="10px"
              cursor="pointer"
              bg={activeTab === i ? activeBg : "transparent"}
              color={activeTab === i ? "brand.500" : mutedColor}
              fontWeight={activeTab === i ? "700" : "500"}
              fontSize="sm"
              onClick={() => setActiveTab(i)}
              transition="all 0.15s"
              _hover={{ bg: activeBg, color: "brand.500" }}
            >
              <Icon as={tab.icon} boxSize={4} />
              <Text>{tab.label}</Text>
            </Flex>
          ))}
        </VStack>
      </Box>

      {/* Mobile tabs */}
      <Box display={{ base: "block", md: "none" }}>
        <Tabs variant="soft-rounded" colorScheme="brand" index={activeTab} onChange={setActiveTab}>
          <TabList overflowX="auto" pb={1} flexWrap="nowrap">
            {TABS.map((tab) => (
              <Tab key={tab.id} fontSize="xs" whiteSpace="nowrap" flexShrink={0}>
                <Icon as={tab.icon} mr={1} boxSize={3} />{tab.label}
              </Tab>
            ))}
          </TabList>
        </Tabs>
      </Box>

      {/* Content */}
      <Box>
        <MotionBox
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {panels[activeTab]}
        </MotionBox>
      </Box>
    </Grid>
  );
}
