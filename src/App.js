import "./App.css";
import { Home } from "./pages/home";
import { ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { Route, Routes } from "react-router-dom";
function App() {
  const theme = createTheme({
    typography: {
      fontFamily: "'Nunito Sans', sans-serif;",
    },
  });
  return (
    <>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </ThemeProvider>
    </>
  );
}

export default App;
