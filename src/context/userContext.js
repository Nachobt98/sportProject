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
    setUsers((prevUserData) => ({
      ...prevUserData,
      ...newData,
    }));
  };

  return (
    <UserContext.Provider
      value={{ users, addUser, getUserData, updateUserData, deleteUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
