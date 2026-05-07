import React from "react";
import "./App.css";
import { ThemeProvider } from "@mui/material";
import { Navigate, Route, Routes } from "react-router-dom";
import { Header } from "./components/header";
import { AuthProvider, useAuth } from "./context/authContext";
import { EventProvider } from "./context/eventContext";
import { UserProvider } from "./context/userContext";
import { Article } from "./pages/articles";
import { Calendar } from "./pages/calendar";
import CardDetails from "./pages/CardDetails";
import { Contact } from "./pages/contact";
import { CreateEvent } from "./pages/CreateEvent";
import { FaqPage } from "./pages/faqPage";
import { Home } from "./pages/home";
import { LoginPage } from "./pages/login";
import { Perfil } from "./pages/perfil";
import { RegisterPage } from "./pages/register";
import { SearchCard } from "./pages/searchCard";
import { SearchCard2 } from "./pages/searchCard2";
import { appTheme } from "./theme";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function protectedElement(element) {
  return <ProtectedRoute>{element}</ProtectedRoute>;
}

function App() {
  return (
    <EventProvider>
      <UserProvider>
        <AuthProvider>
          <ThemeProvider theme={appTheme}>
            <Header />
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/registerpage" element={<RegisterPage />} />
              <Route path="/article" element={protectedElement(<Article />)} />
              <Route path="/searchCard" element={protectedElement(<SearchCard />)} />
              <Route path="/homepage" element={protectedElement(<Home />)} />
              <Route path="/Perfil" element={protectedElement(<Perfil />)} />
              <Route path="/faqPage" element={protectedElement(<FaqPage />)} />
              <Route path="/createEvent" element={protectedElement(<CreateEvent />)} />
              <Route path="/searchCard2" element={protectedElement(<SearchCard2 />)} />
              <Route path="/events/:eventId" element={protectedElement(<CardDetails />)} />
              <Route path="/cardDetails" element={<Navigate to="/searchCard2" replace />} />
              <Route path="/contact" element={protectedElement(<Contact />)} />
              <Route path="/calendar" element={protectedElement(<Calendar />)} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ThemeProvider>
        </AuthProvider>
      </UserProvider>
    </EventProvider>
  );
}

export default App;
