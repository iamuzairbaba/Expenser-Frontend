import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { GlobalContext } from "../../context";
import Logo from "../brand/Logo";

const MotionBox = motion(Box);
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const emptyForm = { name: "", email: "", password: "", rememberMe: false };

function getFieldError(errorMsg, field) {
  if (!errorMsg) return "";
  const lower = errorMsg.toLowerCase();
  if (field === "email") {
    if (lower.includes("email") || lower.includes("account") || lower.includes("no account")) return errorMsg;
  }
  if (field === "password") {
    if (lower.includes("password") || lower.includes("incorrect")) return errorMsg;
  }
  if (field === "name" && lower.includes("name")) return errorMsg;
  return "";
}

function isGeneralError(errorMsg) {
  if (!errorMsg) return false;
  const lower = errorMsg.toLowerCase();
  return lower.includes("connect") || lower.includes("server") || lower.includes("failed");
}

function AuthForm({ mode }) {
  const { login, signup, isLoading, error, googleLogin, clearError } = useContext(GlobalContext);
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const googleButtonRef = useRef(null);
  const isSignup = mode === "signup";

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return;
    const renderGoogleButton = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => googleLogin(response.credential),
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline", size: "large", width: "100%",
      });
    };
    if (window.google) { renderGoogleButton(); return; }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.body.appendChild(script);
  }, [googleLogin]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (error) clearError();
    setForm((c) => ({ ...c, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSignup) await signup(form);
    else await login({ email: form.email, password: form.password });
  }

  const emailError = getFieldError(error, "email");
  const passwordError = getFieldError(error, "password");
  const nameError = getFieldError(error, "name");
  const generalError = isGeneralError(error) ? error : (!emailError && !passwordError && !nameError ? error : "");

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        {generalError && (
          <Alert status="error" borderRadius="10px" fontSize="sm">
            <AlertIcon />
            <Box>
              <AlertTitle fontSize="sm">Error</AlertTitle>
              <AlertDescription fontSize="xs">{generalError}</AlertDescription>
            </Box>
          </Alert>
        )}

        {isSignup && (
          <FormControl isRequired isInvalid={!!nameError}>
            <FormLabel fontSize="sm" fontWeight="600">Full Name</FormLabel>
            <Input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
            {nameError && <FormErrorMessage fontSize="xs">{nameError}</FormErrorMessage>}
          </FormControl>
        )}

        <FormControl isRequired isInvalid={!!emailError}>
          <FormLabel fontSize="sm" fontWeight="600">Email</FormLabel>
          <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
          {emailError && <FormErrorMessage fontSize="xs">{emailError}</FormErrorMessage>}
        </FormControl>

        <FormControl isRequired isInvalid={!!passwordError}>
          <FormLabel fontSize="sm" fontWeight="600">Password</FormLabel>
          <InputGroup>
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              minLength={6}
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              pr="40px"
            />
            <InputRightElement>
              <IconButton
                aria-label={showPassword ? "Hide password" : "Show password"}
                icon={showPassword ? <FiEyeOff /> : <FiEye />}
                size="xs"
                variant="ghost"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              />
            </InputRightElement>
          </InputGroup>
          {passwordError && <FormErrorMessage fontSize="xs">{passwordError}</FormErrorMessage>}
          {isSignup && !passwordError && (
            <Text fontSize="xs" color="gray.500" mt={1}>Minimum 6 characters</Text>
          )}
        </FormControl>

        {!isSignup && (
          <Checkbox name="rememberMe" isChecked={form.rememberMe} onChange={handleChange} size="sm" colorScheme="brand">
            <Text fontSize="sm">Remember me</Text>
          </Checkbox>
        )}

        <Button
          type="submit"
          colorScheme="brand"
          size="lg"
          isLoading={isLoading}
          loadingText={isSignup ? "Creating account..." : "Signing in..."}
        >
          {isSignup ? "Create account" : "Sign in"}
        </Button>

        <Flex align="center" gap={3}>
          <Divider />
          <Text fontSize="xs" color="gray.500" whiteSpace="nowrap" fontWeight="500">OR</Text>
          <Divider />
        </Flex>

        {googleClientId ? (
          <Box ref={googleButtonRef} minH="44px" />
        ) : (
          <Text color="gray.500" fontSize="xs" textAlign="center">Google login not configured</Text>
        )}
      </VStack>
    </form>
  );
}

export default function Auth() {
  const { isAuthReady, clearError } = useContext(GlobalContext);
  const bgGradient = useColorModeValue(
    "linear(to-br, brand.50, purple.50, pink.50)",
    "linear(to-br, #0b1120, #0d1526, #0f1729)"
  );
  const cardBg = useColorModeValue("white", "rgba(17,24,39,0.8)");
  const cardBorder = useColorModeValue("gray.100", "whiteAlpha.100");
  const tabListBg = useColorModeValue("gray.50", "whiteAlpha.50");

  if (!isAuthReady) {
    return (
      <Flex minH="100vh" align="center" justify="center" bgGradient={bgGradient}>
        <Spinner color="brand.500" size="xl" thickness="3px" />
      </Flex>
    );
  }

  return (
    <Flex minH="100vh" bgGradient={bgGradient} align="center" justify="center" px={4} position="relative" overflow="hidden">
      <Box position="absolute" top="10%" left="5%" w="300px" h="300px" bg="brand.400" opacity={0.08} borderRadius="full" filter="blur(80px)" />
      <Box position="absolute" bottom="10%" right="5%" w="400px" h="400px" bg="purple.400" opacity={0.08} borderRadius="full" filter="blur(100px)" />

      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        bg={cardBg}
        backdropFilter="blur(20px)"
        w="full"
        maxW="440px"
        borderRadius="18px"
        border="1px solid"
        borderColor={cardBorder}
        p={8}
        boxShadow="0 25px 50px rgba(0,0,0,0.15)"
        position="relative"
        zIndex={1}
      >
        <VStack spacing={1} mb={8} align="center">
          <Logo size={48} />
          <Heading size="lg" mt={3} letterSpacing="-0.5px">
            Welcome to{" "}
            <Text as="span" bgGradient="linear(to-r, brand.500, purple.500)" bgClip="text">
              Expenser
            </Text>
          </Heading>
          <Text color="gray.500" fontSize="sm" textAlign="center">
            Smart personal finance management
          </Text>
        </VStack>

        <Tabs isFitted colorScheme="brand" variant="soft-rounded" onChange={() => clearError?.()}>
          <TabList mb={6} bg={tabListBg} p={1} borderRadius="10px">
            <Tab borderRadius="8px">Sign In</Tab>
            <Tab borderRadius="8px">Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel p={0}><AuthForm mode="login" /></TabPanel>
            <TabPanel p={0}><AuthForm mode="signup" /></TabPanel>
          </TabPanels>
        </Tabs>

        <Text fontSize="xs" color="gray.500" textAlign="center" mt={6}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </MotionBox>
    </Flex>
  );
}
