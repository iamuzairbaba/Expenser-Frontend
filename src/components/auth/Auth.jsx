import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { GlobalContext } from "../../context";

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const emptyForm = {
  name: "",
  email: "",
  password: "",
};

function AuthForm({ mode }) {
  const { login, signup, isLoading, error, googleLogin } = useContext(GlobalContext);
  const [form, setForm] = useState(emptyForm);
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
        theme: "outline",
        size: "large",
        width: "320",
      });
    };

    if (window.google) {
      renderGoogleButton();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.body.appendChild(script);
  }, [googleLogin]);

  function handleChange(event) {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSignup) {
      await signup(form);
      return;
    }

    await login({
      email: form.email,
      password: form.password,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        {error ? (
          <Alert status="error" borderRadius="8">
            <AlertIcon />
            {error}
          </Alert>
        ) : null}

        {isSignup ? (
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input name="name" value={form.name} onChange={handleChange} />
          </FormControl>
        ) : null}

        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input name="email" type="email" value={form.email} onChange={handleChange} />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Password</FormLabel>
          <Input
            name="password"
            type="password"
            minLength={6}
            value={form.password}
            onChange={handleChange}
          />
        </FormControl>

        <Button type="submit" colorScheme="blue" isLoading={isLoading}>
          {isSignup ? "Create account" : "Log in"}
        </Button>

        <Flex align="center" gap={3}>
          <Divider />
          <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
            or
          </Text>
          <Divider />
        </Flex>

        {googleClientId ? (
          <Flex justify="center">
            <Box ref={googleButtonRef} minH="44px" />
          </Flex>
        ) : (
          <Text color="gray.500" fontSize="sm" textAlign="center">
            Add REACT_APP_GOOGLE_CLIENT_ID to enable Google login.
          </Text>
        )}
      </VStack>
    </form>
  );
}

const Auth = () => {
  const { isAuthReady } = useContext(GlobalContext);

  if (!isAuthReady) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.950">
        <Spinner color="blue.300" size="xl" />
      </Flex>
    );
  }

  return (
    <Flex minH="100vh" bg="gray.950" align="center" justify="center" px={4}>
      <Box bg="white" w="full" maxW="440px" borderRadius="8" p={8} boxShadow="xl">
        <VStack spacing={2} mb={8}>
          <Heading color="blue.600">EXPENSER</Heading>
          <Text color="gray.500">Sign in to keep your income and expenses in MongoDB.</Text>
        </VStack>

        <Tabs isFitted colorScheme="blue">
          <TabList mb={6}>
            <Tab>Login</Tab>
            <Tab>Signup</Tab>
          </TabList>
          <TabPanels>
            <TabPanel p={0}>
              <AuthForm mode="login" />
            </TabPanel>
            <TabPanel p={0}>
              <AuthForm mode="signup" />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Flex>
  );
};

export default Auth;
