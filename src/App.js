import "./App.css";
import { Home } from "./pages/home";
import { Article } from "./pages/articles";
import { SearchCard } from "./pages/searchCard";
import { ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { Header } from "./components/header";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/login";
import { RegisterPage } from "./pages/register";
import { UserProvider } from "./context/userContext";
import { AuthProvider } from "./context/authContext";
import { Perfil } from "./pages/perfil";
import { FaqPage } from "./pages/faqPage";
import { CreateEvent } from "./pages/CreateEvent";
import { SearchCard2 } from "./pages/searchCard2";
import CardDetails from "./pages/CardDetails";
import { EventProvider } from "./context/eventContext";
import { Contact } from "./pages/contact";
import { Calendar } from "./pages/calendar";
import { useAuth } from "./context/authContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
function App() {
  const theme = createTheme({
    typography: {
      fontFamily: "Open Sans, sans-serif",
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
      <EventProvider>
        <UserProvider>
          <AuthProvider>
            <ThemeProvider theme={theme}>
              <Header />
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route
                  path="/article"
                  element={
                    <ProtectedRoute>
                      <Article />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/searchCard"
                  element={
                    <ProtectedRoute>
                      <SearchCard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/homepage"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route path="/registerpage" element={<RegisterPage />} />
                <Route
                  path="/Perfil"
                  element={
                    <ProtectedRoute>
                      <Perfil />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/faqPage"
                  element={
                    <ProtectedRoute>
                      <FaqPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/createEvent"
                  element={
                    <ProtectedRoute>
                      <CreateEvent />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/searchCard2"
                  element={
                    <ProtectedRoute>
                      <SearchCard2 />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cardDetails"
                  element={
                    <ProtectedRoute>
                      <CardDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/contact"
                  element={
                    <ProtectedRoute>
                      <Contact />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <ProtectedRoute>
                      <Calendar />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ThemeProvider>
          </AuthProvider>
        </UserProvider>
      </EventProvider>
    </>
  );
}

export default App;
