import "./App.css";
import { Home } from "./pages/home";
import { Article } from "./pages/articles";
import { SearchCard } from "./pages/searchCard";
import { ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { Header } from "./components/header";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/login";
import { RegisterPage } from "./pages/register";
function App() {
  const theme = createTheme({
    typography: {
      fontFamily: "'Nunito Sans', sans-serif",
    },
    palette: {
      secondary: {
        main: "#c59c00",
      },
    },
  });
  return (
    <>
      <ThemeProvider theme={theme}>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/article" element={<Article />} />
          <Route path="/searchCard" element={<SearchCard />} />
          <Route path="/loginpage" element={<LoginPage />} />
          <Route path="/registerpage" element={<RegisterPage />} />
        </Routes>
      </ThemeProvider>
    </>
  );
}

export default App;
