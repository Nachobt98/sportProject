import React from "react";
import "./App.css";
import { ThemeProvider } from "@mui/material";
import { Navigate, Route, Routes } from "react-router-dom";
import { Header } from "./components/header";
import { AuthProvider, useAuth } from "./context/authContext";
import { UserProvider } from "./context/userContext";
import { Calendar } from "./pages/calendar";
import CardDetails from "./pages/CardDetails";
import { Contact } from "./pages/contact";
import { CreateEvent } from "./pages/CreateEvent";
import { FaqPage } from "./pages/faqPage";
import { Home } from "./pages/home";
import { LoginPage } from "./pages/login";
import { Perfil } from "./pages/perfil";
import { RegisterPage } from "./pages/register";
import { SearchCard2 } from "./pages/searchCard2";
import { appTheme } from "./theme";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

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
            <Route path="/profile" element={protectedElement(<Perfil />)} />
            <Route path="/events" element={protectedElement(<SearchCard2 />)} />
            <Route path="/events/new" element={protectedElement(<CreateEvent />)} />
            <Route path="/events/:eventId" element={protectedElement(<CardDetails />)} />
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
