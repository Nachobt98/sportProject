import PropTypes from "prop-types";
import "./App.css";
import { ThemeProvider } from "@mui/material";
import { Navigate, Route, Routes } from "react-router-dom";
import { Header } from "./components/header";
import { AuthProvider, useAuth } from "./context/authContext";
import { UserProvider } from "./context/userContext";
import { Calendar } from "./pages/calendar";
import { Contact } from "./pages/contact";
import { EventDetailPage, EventFormPage, EventsPage } from "./pages/events";
import { FaqPage } from "./pages/faqPage";
import { Home } from "./pages/home";
import { LoginPage } from "./pages/login";
import { ProfilePage } from "./pages/profile";
import { RegisterPage } from "./pages/register";
import { appTheme } from "./theme";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function protectedElement(element) {
  return <ProtectedRoute>{element}</ProtectedRoute>;
}

function App() {
  return (
    <UserProvider>
      <AuthProvider>
        <ThemeProvider theme={appTheme}>
          <Header />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/home" element={protectedElement(<Home />)} />
            <Route path="/profile" element={protectedElement(<ProfilePage />)} />
            <Route path="/events" element={protectedElement(<EventsPage />)} />
            <Route path="/events/new" element={protectedElement(<EventFormPage />)} />
            <Route path="/events/:eventId/edit" element={protectedElement(<EventFormPage />)} />
            <Route path="/events/:eventId" element={protectedElement(<EventDetailPage />)} />
            <Route path="/faq" element={protectedElement(<FaqPage />)} />
            <Route path="/contact" element={protectedElement(<Contact />)} />
            <Route path="/calendar" element={protectedElement(<Calendar />)} />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </UserProvider>
  );
}

export default App;
