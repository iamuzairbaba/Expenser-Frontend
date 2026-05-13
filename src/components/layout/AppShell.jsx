import {
  Avatar, Box, Flex, HStack, Icon, IconButton, Text,
  Tooltip, useColorMode, useColorModeValue, VStack,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiBarChart2, FiCreditCard, FiGrid, FiLogOut,
  FiMoon, FiPieChart, FiSettings, FiSun, FiTag, FiZap,
} from "react-icons/fi";
import Logo from "../brand/Logo";

const MotionBox = motion(Box);

const nav = [
  { id: "dashboard", label: "Dashboard", icon: FiGrid },
  { id: "transactions", label: "Transactions", icon: FiCreditCard },
  { id: "categories", label: "Categories", icon: FiTag },
  { id: "budget", label: "Budget", icon: FiPieChart },
  { id: "reports", label: "Reports", icon: FiBarChart2 },
  { id: "settings", label: "Settings", icon: FiSettings },
  { id: "pricing", label: "Plans", icon: FiZap },
];

function NavItem({ item, active, onClick }) {
  const activeBg = useColorModeValue("brand.50", "rgba(14,165,233,0.12)");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const hoverTextColor = useColorModeValue("gray.800", "gray.100");

  return (
    <Tooltip label="" placement="right" hasArrow>
      <Flex
        as="button"
        align="center"
        gap={3}
        px={3}
        py={2.5}
        borderRadius="10px"
        cursor="pointer"
        bg={active ? activeBg : "transparent"}
        color={active ? "brand.500" : textColor}
        fontWeight={active ? "700" : "500"}
        fontSize="sm"
        w="full"
        justify="flex-start"
        onClick={onClick}
        transition="all 0.15s ease"
        _hover={{ bg: active ? activeBg : hoverBg, color: active ? "brand.500" : hoverTextColor }}
        position="relative"
      >
        {active && (
          <Box position="absolute" left={0} top="20%" bottom="20%" w="3px" bg="brand.500" borderRadius="full" />
        )}
        <Icon as={item.icon} boxSize={4.5} flexShrink={0} />
        <Text>{item.label}</Text>
      </Flex>
    </Tooltip>
  );
}

export default function AppShell({ user, activePage, onPageChange, onLogout, children }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const appBg = useColorModeValue("#f8fafc", "#0b1120");
  const sidebarBg = useColorModeValue("white", "#0d1526");
  const sidebarBorder = useColorModeValue("gray.100", "whiteAlpha.80");
  const headerBg = useColorModeValue("rgba(248,250,252,0.85)", "rgba(11,17,32,0.85)");
  const headerBorder = useColorModeValue("gray.100", "whiteAlpha.80");
  const mobileNavBg = useColorModeValue("white", "#0d1526");
  const mobileNavBorder = useColorModeValue("gray.100", "whiteAlpha.100");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const nameColor = useColorModeValue("gray.800", "gray.100");
  const sidebarUserBorder = useColorModeValue("gray.100", "whiteAlpha.100");

  const activeLabel = nav.find((n) => n.id === activePage)?.label || "Dashboard";

  return (
    <Flex minH="100vh" bg={appBg}>
      {/* Desktop Sidebar */}
      <Box
        as="aside"
        display={{ base: "none", md: "flex" }}
        flexDirection="column"
        w="220px"
        flexShrink={0}
        borderRight="1px solid"
        borderColor={sidebarBorder}
        bg={sidebarBg}
        px={4}
        py={5}
        position="sticky"
        top={0}
        h="100vh"
        zIndex={10}
      >
        <Box mb={8}><Logo /></Box>

        <VStack align="stretch" spacing={1} flex={1}>
          {nav.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              active={activePage === item.id}
              onClick={() => onPageChange(item.id)}
            />
          ))}
        </VStack>

        <Box borderTop="1px solid" borderColor={sidebarUserBorder} pt={4} mt={4}>
          <Flex align="center" gap={3} mb={3}>
            <Avatar size="sm" name={user?.name} bg="brand.500" color="white" fontSize="xs" fontWeight="700" />
            <Box flex={1} minW={0}>
              <Text fontSize="sm" fontWeight="700" color={nameColor} noOfLines={1}>{user?.name}</Text>
              <Text fontSize="xs" color={mutedColor} noOfLines={1}>{user?.email}</Text>
            </Box>
          </Flex>
          <HStack spacing={1}>
            <Tooltip label={isDark ? "Light mode" : "Dark mode"}>
              <IconButton
                aria-label="Toggle color mode"
                icon={isDark ? <FiSun /> : <FiMoon />}
                onClick={toggleColorMode}
                variant="ghost"
                size="sm"
                borderRadius="8px"
                flex={1}
              />
            </Tooltip>
            <Tooltip label="Sign out">
              <IconButton
                aria-label="Logout"
                icon={<FiLogOut />}
                onClick={onLogout}
                variant="ghost"
                size="sm"
                borderRadius="8px"
                flex={1}
                color="expense.500"
                _hover={{ bg: "red.50", color: "expense.600" }}
              />
            </Tooltip>
          </HStack>
        </Box>
      </Box>

      {/* Main content */}
      <Box flex={1} minW={0} display="flex" flexDirection="column">
        <Flex
          as="header"
          align="center"
          justify="space-between"
          px={{ base: 4, md: 6 }}
          py={3.5}
          borderBottom="1px solid"
          borderColor={headerBorder}
          bg={headerBg}
          backdropFilter="blur(12px)"
          position="sticky"
          top={0}
          zIndex={9}
        >
          <Box>
            <Text fontSize="xs" color={mutedColor} fontWeight="500">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </Text>
            <Text fontSize="lg" fontWeight="800" letterSpacing="-0.3px" color={nameColor}>
              {activeLabel}
            </Text>
          </Box>
          <HStack spacing={2}>
            <IconButton
              display={{ base: "flex", md: "none" }}
              aria-label="Toggle color mode"
              icon={isDark ? <FiSun /> : <FiMoon />}
              onClick={toggleColorMode}
              variant="ghost"
              size="sm"
              borderRadius="8px"
            />
            <Avatar
              display={{ base: "flex", md: "none" }}
              size="sm"
              name={user?.name}
              bg="brand.500"
              color="white"
              fontSize="xs"
              fontWeight="700"
              cursor="pointer"
              onClick={() => onPageChange("settings")}
            />
          </HStack>
        </Flex>

        <Box flex={1} px={{ base: 4, md: 6 }} py={5} pb={{ base: "80px", md: 6 }} overflowY="auto">
          <AnimatePresence mode="wait">
            <MotionBox
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {children}
            </MotionBox>
          </AnimatePresence>
        </Box>
      </Box>

      {/* Mobile Bottom Navigation */}
      <Box
        display={{ base: "flex", md: "none" }}
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bg={mobileNavBg}
        borderTop="1px solid"
        borderColor={mobileNavBorder}
        zIndex={20}
        px={2}
        pt={2}
        pb={3}
        className="bottom-nav"
        boxShadow="0 -4px 20px rgba(0,0,0,0.1)"
      >
        {nav.map((item) => {
          const active = activePage === item.id;
          return (
            <Flex
              key={item.id}
              flex={1}
              direction="column"
              align="center"
              gap={0.5}
              py={1.5}
              px={1}
              borderRadius="10px"
              cursor="pointer"
              onClick={() => onPageChange(item.id)}
              color={active ? "brand.500" : mutedColor}
              transition="all 0.15s ease"
              _active={{ transform: "scale(0.92)" }}
            >
              <Icon as={item.icon} boxSize={active ? 5 : 4.5} />
              <Text fontSize="9px" fontWeight={active ? "700" : "500"} letterSpacing="0.02em">
                {item.label}
              </Text>
            </Flex>
          );
        })}
      </Box>
    </Flex>
  );
}
