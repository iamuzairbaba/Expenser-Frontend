import { ChakraProvider } from "@chakra-ui/react";
import { useMemo, useContext } from "react";
import { GlobalContext } from "./index";
import { buildTheme } from "../theme";

export default function DynamicChakraProvider({ children }) {
  const ctx = useContext(GlobalContext);

  // Read accent color from user preferences, fall back to default
  const accentColor = ctx?.user?.preferences?.accentColor || "#0ea5e9";

  const theme = useMemo(() => buildTheme(accentColor), [accentColor]);

  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}
