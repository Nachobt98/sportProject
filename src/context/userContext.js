import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);

  const addUser = (user) => {
    setUsers([...users, user]);
  };

  const getUserData = (userId) => {
    // Buscar el usuario por ID y devolver sus datos
    const user = users.find((u) => u.id === userId);
    return user || {};
  };

  const updateUserData = (userId, newData) => {
    // Actualizar los datos del usuario con el nuevo objeto newData
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, ...newData } : user
      )
    );
  };

  return (
    <UserContext.Provider
      value={{ users, addUser, getUserData, updateUserData }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
