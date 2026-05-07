import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentSession } from "../api/authApi";
import { useUser } from "./userContext";

const AuthContext = createContext();

function getStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem("auth") || "{}") || {};
  } catch (error) {
    localStorage.removeItem("auth");
    return {};
  }
}

export const AuthProvider = ({ children }) => {
  const storedAuth = getStoredAuth();
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
        const data = await getCurrentSession();
        if (isMounted) {
          setUsers(data.user);
        }
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
