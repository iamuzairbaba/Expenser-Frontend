import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      blue: "#2563EB",
      teal: "#14B8A6",
      yellow: "#FACC15",
    },
  },
  fonts: {
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
  },
  styles: {
    global: (props) => ({
      body: {
        bg: mode("gray.50", "gray.950")(props),
        color: mode("gray.900", "gray.100")(props),
      },
    }),
  },
});

export default theme;
