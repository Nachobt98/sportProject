import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";
import { useUser } from "./userContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const storedAuth = JSON.parse(localStorage.getItem("auth")) || {};
  const initialAuth = storedAuth.isAuthenticated && storedAuth.token
    ? storedAuth
    : {
        isAuthenticated: false,
        username: "",
        token: "",
      };
  const navigate = useNavigate();
  const { setUsers, deleteUser } = useUser();
  const [auth, setAuth] = useState(initialAuth);

  const login = (username, token) => {
    const newAuth = { isAuthenticated: true, username, token };
    setAuth(newAuth);
    localStorage.setItem("auth", JSON.stringify(newAuth));
  };

  const logout = useCallback((redirect = true) => {
    const newAuth = { isAuthenticated: false, username: "", token: "" };
    setAuth(newAuth);
    localStorage.setItem("auth", JSON.stringify(newAuth));
    deleteUser();

    if (redirect) {
      navigate("/");
    }
  }, [deleteUser, navigate]);

  useEffect(() => {
    if (!auth.token) {
      return;
    }

    let isMounted = true;

    async function validateSession() {
      try {
        const response = await apiFetch("/api/session");
        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          logout();
          return;
        }

        const data = await response.json();
        setUsers(data.user);
      } catch (error) {
        if (isMounted) {
          logout();
        }
      }
    }

    validateSession();

    return () => {
      isMounted = false;
    };
  }, [auth.token, logout, setUsers]);

  useEffect(() => {
    const handleUnauthorized = () => logout();

    window.addEventListener("sportlife:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("sportlife:unauthorized", handleUnauthorized);
    };
  }, [logout]);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
