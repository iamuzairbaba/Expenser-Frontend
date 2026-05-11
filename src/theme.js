import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

// Given a hex accent color, generate a simple 9-shade palette
function buildPalette(hex) {
  // We keep it simple — just override the key shades used in the app
  return {
    50: hex + "15",
    100: hex + "25",
    200: hex + "40",
    300: hex + "70",
    400: hex + "aa",
    500: hex,
    600: hex,
    700: hex,
    800: hex,
    900: hex,
  };
}

export function buildTheme(accentColor = "#0ea5e9") {
  return extendTheme({
    config: {
      initialColorMode: "dark",
      useSystemColorMode: false,
    },
    colors: {
      brand: buildPalette(accentColor),
      income: {
        50: "#f0fdf4",
        400: "#4ade80",
        500: "#22c55e",
        600: "#16a34a",
      },
      expense: {
        50: "#fef2f2",
        400: "#f87171",
        500: "#ef4444",
        600: "#dc2626",
      },
    },
    fonts: {
      heading: "'Inter', system-ui, sans-serif",
      body: "'Inter', system-ui, sans-serif",
      mono: "'Inter', monospace",
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    radii: {
      sm: "6px",
      md: "10px",
      lg: "14px",
      xl: "18px",
      "2xl": "24px",
    },
    shadows: {
      card: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)",
      cardHover: "0 4px 12px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.1)",
      glow: `0 0 20px ${accentColor}40`,
      glowGreen: "0 0 20px rgba(34,197,94,0.2)",
      glowRed: "0 0 20px rgba(239,68,68,0.2)",
    },
    styles: {
      global: (props) => ({
        "*, *::before, *::after": { boxSizing: "border-box" },
        body: {
          bg: mode("#f8fafc", "#0b1120")(props),
          color: mode("#0f172a", "#f1f5f9")(props),
          fontFeatureSettings: '"cv02","cv03","cv04","cv11"',
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        "::-webkit-scrollbar": { width: "6px", height: "6px" },
        "::-webkit-scrollbar-track": { bg: "transparent" },
        "::-webkit-scrollbar-thumb": {
          bg: mode("gray.300", "whiteAlpha.200")(props),
          borderRadius: "full",
        },
      }),
    },
    components: {
      Button: {
        baseStyle: {
          fontWeight: "600",
          borderRadius: "10px",
          _focus: { boxShadow: "none" },
        },
        variants: {
          solid: (props) => ({
            bg: props.colorScheme === "brand" ? "brand.500" : undefined,
            _hover: { transform: "translateY(-1px)", boxShadow: "md" },
            _active: { transform: "translateY(0)" },
            transition: "all 0.15s ease",
          }),
          ghost: {
            _hover: { bg: mode("blackAlpha.50", "whiteAlpha.100") },
          },
          glass: {
            bg: mode("whiteAlpha.700", "whiteAlpha.100"),
            backdropFilter: "blur(12px)",
            border: "1px solid",
            borderColor: mode("whiteAlpha.800", "whiteAlpha.200"),
            _hover: { bg: mode("whiteAlpha.900", "whiteAlpha.200"), transform: "translateY(-1px)" },
            transition: "all 0.15s ease",
          },
        },
      },
      Input: {
        variants: {
          filled: (props) => ({
            field: {
              bg: mode("gray.50", "whiteAlpha.50")(props),
              border: "1px solid",
              borderColor: mode("gray.200", "whiteAlpha.100")(props),
              borderRadius: "10px",
              _hover: { borderColor: "brand.400" },
              _focus: {
                borderColor: "brand.500",
                bg: mode("white", "whiteAlpha.100")(props),
                boxShadow: `0 0 0 1px ${accentColor}`,
              },
            },
          }),
        },
        defaultProps: { variant: "filled" },
      },
      Select: {
        variants: {
          filled: (props) => ({
            field: {
              bg: mode("gray.50", "whiteAlpha.50")(props),
              border: "1px solid",
              borderColor: mode("gray.200", "whiteAlpha.100")(props),
              borderRadius: "10px",
              _hover: { borderColor: "brand.400" },
              _focus: { borderColor: "brand.500", boxShadow: `0 0 0 1px ${accentColor}` },
            },
          }),
        },
        defaultProps: { variant: "filled" },
      },
      Textarea: {
        variants: {
          filled: (props) => ({
            bg: mode("gray.50", "whiteAlpha.50")(props),
            border: "1px solid",
            borderColor: mode("gray.200", "whiteAlpha.100")(props),
            borderRadius: "10px",
            _hover: { borderColor: "brand.400" },
            _focus: {
              borderColor: "brand.500",
              bg: mode("white", "whiteAlpha.100")(props),
              boxShadow: `0 0 0 1px ${accentColor}`,
            },
          }),
        },
        defaultProps: { variant: "filled" },
      },
      Modal: {
        baseStyle: (props) => ({
          dialog: {
            bg: mode("white", "#111827")(props),
            borderRadius: "18px",
            border: "1px solid",
            borderColor: mode("gray.100", "whiteAlpha.100")(props),
            boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
          },
          overlay: { backdropFilter: "blur(4px)" },
        }),
      },
      Card: {
        baseStyle: (props) => ({
          container: {
            bg: mode("white", "#111827")(props),
            borderRadius: "14px",
            border: "1px solid",
            borderColor: mode("gray.100", "whiteAlpha.100")(props),
            boxShadow: "card",
            overflow: "hidden",
          },
        }),
      },
      Badge: {
        baseStyle: { borderRadius: "6px", fontWeight: "600", fontSize: "11px" },
      },
      Progress: {
        baseStyle: { track: { borderRadius: "full" }, filledTrack: { borderRadius: "full" } },
      },
      Tabs: {
        variants: {
          "soft-rounded": (props) => ({
            tab: {
              borderRadius: "10px",
              fontWeight: "600",
              color: mode("gray.500", "gray.400")(props),
              _selected: {
                color: "brand.500",
                bg: mode("brand.50", "whiteAlpha.100")(props),
              },
            },
          }),
        },
      },
    },
  });
}

// Default theme export (used as fallback)
const theme = buildTheme("#0ea5e9");
export default theme;
