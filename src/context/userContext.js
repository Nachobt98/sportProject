import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsersState] = useState(
    JSON.parse(localStorage.getItem("user")) || {}
  );

  const setUsers = (user) => {
    setUsersState(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const addUser = (user) => {
    setUsers(user);
  };
  const deleteUser = () => {
    setUsers({});
    localStorage.removeItem("user");
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
      setUsersState((prevUserData) => {
        const updatedUser = { ...prevUserData, userName: newData.userName };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      });
    } else {
      // Si no hay cambios en el nombre de usuario, actualizar todos los datos del usuario
      setUsersState((prevUserData) => {
        const updatedUser = { ...prevUserData, ...newData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      });
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
