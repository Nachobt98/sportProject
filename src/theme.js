import { createTheme } from "@mui/material/styles";

const primary = "#1d4ed8";
const primaryDark = "#123a9f";
const secondary = "#0f766e";
const ink = "#0b1220";
const slate = "#475569";
const line = "#dce5ef";
const canvas = "#f6f9fc";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: primary,
      dark: primaryDark,
      light: "#60a5fa",
      contrastText: "#ffffff",
      soft: "#eaf1ff",
    },
    secondary: {
      main: secondary,
      dark: "#115e59",
      light: "#5eead4",
      contrastText: "#ffffff",
      soft: "#ddf7f3",
    },
    success: { main: "#16a34a", light: "#dcfce7" },
    warning: { main: "#f59e0b", light: "#fef3c7" },
    error: { main: "#dc2626", light: "#fee2e2" },
    background: { default: canvas, paper: "#ffffff" },
    text: { primary: ink, secondary: slate },
    divider: line,
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05 },
    h2: { fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.1 },
    h3: { fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.12 },
    h4: { fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.16 },
    h5: { fontWeight: 750, letterSpacing: "-0.018em", lineHeight: 1.2 },
    h6: { fontWeight: 750, letterSpacing: "-0.012em", lineHeight: 1.28 },
    subtitle1: { fontWeight: 700 },
    subtitle2: { fontWeight: 700 },
    button: { fontWeight: 800, textTransform: "none", letterSpacing: 0 },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 12, minHeight: 42, paddingInline: 18 },
        containedPrimary: { boxShadow: "0 14px 30px rgba(29, 78, 216, 0.2)" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: `1px solid ${line}`,
          boxShadow: "0 14px 36px rgba(15, 23, 42, 0.07)",
          backgroundImage: "none",
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none", borderRadius: 18 } } },
    MuiTextField: { defaultProps: { size: "small" } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12, backgroundColor: "#ffffff" } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 999, fontWeight: 700 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 14 } } },
    MuiMenu: { styleOverrides: { paper: { border: `1px solid ${line}`, boxShadow: "0 18px 48px rgba(15, 23, 42, 0.16)" } } },
  },
});
