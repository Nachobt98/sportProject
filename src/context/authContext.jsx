import PropTypes from "prop-types";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentSession } from "../api/authApi";
import { useUser } from "./userContext";

const AuthContext = createContext();

const AUTH_STORAGE_KEY = "auth";

function sanitizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/[<>]/g, "").trim();
}

function sanitizeToken(value) {
  return sanitizeText(value).replace(/[^A-Za-z0-9._~+/=-]/g, "");
}

function sanitizeAuth(auth) {
  if (!auth || typeof auth !== "object") {
    return {
      isAuthenticated: false,
      username: "",
      token: "",
    };
  }

  return {
    isAuthenticated: Boolean(auth.isAuthenticated && auth.token),
    username: sanitizeText(auth.username),
    token: sanitizeToken(auth.token),
  };
}

function getAnonymousAuth() {
  return {
    isAuthenticated: false,
    username: "",
    token: "",
  };
}

function parseStoredAuth() {
  try {
    return sanitizeAuth(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "{}"));
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return getAnonymousAuth();
  }
}

function persistAuth(auth) {
  const sanitizedAuth = sanitizeAuth(auth);
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sanitizedAuth));
  return sanitizedAuth;
}

export const AuthProvider = ({ children }) => {
  const storedAuth = parseStoredAuth();
  const initialAuth = storedAuth.isAuthenticated && storedAuth.token
    ? storedAuth
    : getAnonymousAuth();
  const navigate = useNavigate();
  const { setUsers, deleteUser } = useUser();
  const [auth, setAuth] = useState(initialAuth);

  const login = (username, token) => {
    const newAuth = persistAuth({ isAuthenticated: true, username, token });
    setAuth(newAuth);
  };

  const logout = useCallback((redirect = true) => {
    const newAuth = persistAuth(getAnonymousAuth());
    setAuth(newAuth);
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
      } catch {
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

    globalThis.addEventListener("sportlife:unauthorized", handleUnauthorized);
    return () => {
      globalThis.removeEventListener("sportlife:unauthorized", handleUnauthorized);
    };
  }, [logout]);

  const contextValue = useMemo(
    () => ({ ...auth, login, logout }),
    [auth, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  return useContext(AuthContext);
};
