import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const initialAuth = JSON.parse(localStorage.getItem("auth")) || {
    isAuthenticated: false,
    username: "",
  };
  const navigate = useNavigate();
  const [auth, setAuth] = useState(initialAuth);

  const login = (username) => {
    const newAuth = { isAuthenticated: true, username };
    setAuth(newAuth);
    localStorage.setItem("auth", JSON.stringify(newAuth));
  };

  const logout = () => {
    const newAuth = { isAuthenticated: false, username: "" };
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
