import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsersState] = useState(
    JSON.parse(localStorage.getItem("user")) || {}
  );

  const setUsers = useCallback((user) => {
    setUsersState(user);
    localStorage.setItem("user", JSON.stringify(user));
  }, []);

  const addUser = useCallback((user) => {
    setUsers(user);
  }, [setUsers]);

  const deleteUser = useCallback(() => {
    setUsersState({});
    localStorage.removeItem("user");
  }, []);

  const getUserData = useCallback(() => {
    return users;
  }, [users]);

  const updateUserData = useCallback((newData) => {
    setUsersState((prevUserData) => {
      const updatedUser = newData.userName !== undefined
        ? { ...prevUserData, userName: newData.userName }
        : { ...prevUserData, ...newData };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      users,
      addUser,
      setUsers,
      getUserData,
      updateUserData,
      deleteUser,
    }),
    [users, addUser, setUsers, getUserData, updateUserData, deleteUser]
  );

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
