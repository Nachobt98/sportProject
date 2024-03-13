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
import { UserProvider } from "./context/userContext";
import { AuthProvider } from "./context/authContext";
import { Perfil } from "./pages/perfil";
import { FaqPage } from "./pages/faqPage";
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
    components: {
      MuiMenu: {
        // Ajusta el fondo difuminado del Menú
        styleOverrides: {
          paper: {
            backgroundColor: "rgba(255, 255, 255, 0.8)", // Color y opacidad del fondo
            backdropFilter: "blur(10px)", // Efecto de difuminado
            minWidth: "200px", // Ajusta el ancho del menú
            minHeight: "200px", // Ajusta la altura del menú
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: "22px", // Ajusta el tamaño del texto
          },
        },
      },
    },
  });
  return (
    <>
      <UserProvider>
        <AuthProvider>
          <ThemeProvider theme={theme}>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/article" element={<Article />} />
              <Route path="/searchCard" element={<SearchCard />} />
              <Route path="/loginpage" element={<LoginPage />} />
              <Route path="/registerpage" element={<RegisterPage />} />
              <Route path="/Perfil" element={<Perfil />} />
              <Route path="/faqPage" element={<FaqPage />} />
            </Routes>
          </ThemeProvider>
        </AuthProvider>
      </UserProvider>
    </>
  );
}

export default App;
