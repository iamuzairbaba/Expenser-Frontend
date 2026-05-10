import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Text,
  useColorMode,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { FiBarChart2, FiCreditCard, FiGrid, FiLogOut, FiMoon, FiPieChart, FiSun, FiTag } from "react-icons/fi";
import Logo from "../brand/Logo";

const nav = [
  { id: "dashboard", label: "Dashboard", icon: FiGrid },
  { id: "transactions", label: "Transactions", icon: FiCreditCard },
  { id: "categories", label: "Categories", icon: FiTag },
  { id: "budget", label: "Budget", icon: FiPieChart },
  { id: "reports", label: "Reports", icon: FiBarChart2 },
];

export default function AppShell({ user, activePage, onPageChange, onLogout, children }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const appBg = useColorModeValue("gray.50", "gray.950");
  const panelBg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const mutedColor = useColorModeValue("gray.500", "gray.400");

  return (
    <Flex minH="100vh" bg={appBg}>
      <Box
        as="aside"
        w={{ base: "72px", md: "248px" }}
        borderRight="1px solid"
        borderColor={borderColor}
        bg={panelBg}
        px={{ base: 3, md: 5 }}
        py={5}
        position="sticky"
        top={0}
        h="100vh"
      >
        <Logo />
        <VStack align="stretch" mt={8} spacing={2}>
          {nav.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.id;
            return (
              <Button
                key={item.id}
                justifyContent={{ base: "center", md: "flex-start" }}
                leftIcon={<Icon />}
                colorScheme={active ? "blue" : "gray"}
                variant={active ? "solid" : "ghost"}
                onClick={() => onPageChange(item.id)}
              >
                <Text display={{ base: "none", md: "inline" }}>{item.label}</Text>
              </Button>
            );
          })}
        </VStack>
      </Box>

      <Box flex="1" minW={0}>
        <Flex
          as="header"
          align="center"
          justify="space-between"
          px={{ base: 4, md: 8 }}
          py={4}
          borderBottom="1px solid"
          borderColor={borderColor}
          bg={panelBg}
        >
          <Box>
            <Text fontSize="sm" color={mutedColor}>
              Welcome back
            </Text>
            <Text fontWeight="700">{user?.name}</Text>
          </Box>
          <HStack>
            <IconButton
              aria-label="Toggle dark mode"
              icon={colorMode === "dark" ? <FiSun /> : <FiMoon />}
              onClick={toggleColorMode}
              variant="ghost"
            />
            <IconButton aria-label="Logout" icon={<FiLogOut />} onClick={onLogout} variant="ghost" />
          </HStack>
        </Flex>
        <Box px={{ base: 4, md: 8 }} py={6}>
          {children}
        </Box>
      </Box>
    </Flex>
  );
}
