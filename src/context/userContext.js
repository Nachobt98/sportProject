import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState({});

  const addUser = (user) => {
    setUsers(user);
  };
  const deleteUser = () => {
    setUsers({});
  };
  const getUserData = () => {
    return users;
  };

  const updateUserData = (newData) => {
    console.log("newData", newData);

    // Verificar si newData contiene un nuevo nombre de usuario
    if (newData.userName !== undefined) {
      // Realizar cualquier validación necesaria para el nombre de usuario

      // Actualizar el estado solo con el nuevo nombre de usuario
      setUsers((prevUserData) => ({
        ...prevUserData,
        userName: newData.userName,
      }));
    } else {
      // Si no hay cambios en el nombre de usuario, actualizar todos los datos del usuario
      setUsers((prevUserData) => ({
        ...prevUserData,
        ...newData,
      }));
    }
  };

  return (
    <UserContext.Provider
      value={{
        users,
        addUser,
        setUsers,
        getUserData,
        updateUserData,
        deleteUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
