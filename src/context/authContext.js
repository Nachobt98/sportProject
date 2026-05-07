import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const storedAuth = JSON.parse(localStorage.getItem("auth")) || {};
  const initialAuth = storedAuth.token
    ? storedAuth
    : {
        isAuthenticated: false,
        username: "",
        token: "",
      };
  const navigate = useNavigate();
  const [auth, setAuth] = useState(initialAuth);

  const login = (username, token) => {
    const newAuth = { isAuthenticated: true, username, token };
    setAuth(newAuth);
    localStorage.setItem("auth", JSON.stringify(newAuth));
  };

  const logout = () => {
    const newAuth = { isAuthenticated: false, username: "", token: "" };
    setAuth(newAuth);
    localStorage.setItem("auth", JSON.stringify(newAuth));
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
