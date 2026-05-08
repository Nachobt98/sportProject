import PropTypes from "prop-types";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

const UserContext = createContext();

const USER_STORAGE_KEY = "user";
const USER_TEXT_FIELDS = [
  "_id",
  "id",
  "firstName",
  "lastName",
  "userName",
  "city",
  "email",
  "birthdate",
  "profileImage",
];

function sanitizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/[<>]/g, "").trim();
}

function sanitizeUser(user) {
  if (!user || typeof user !== "object") {
    return {};
  }

  return USER_TEXT_FIELDS.reduce((sanitizedUser, field) => {
    if (user[field] !== undefined && user[field] !== null) {
      return {
        ...sanitizedUser,
        [field]: sanitizeText(user[field]),
      };
    }

    return sanitizedUser;
  }, {});
}

function getStoredUser() {
  try {
    return sanitizeUser(JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || "{}"));
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return {};
  }
}

function persistUser(user) {
  const sanitizedUser = sanitizeUser(user);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sanitizedUser));
  return sanitizedUser;
}

export const UserProvider = ({ children }) => {
  const [users, updateUsers] = useState(getStoredUser);

  const setUsers = useCallback((user) => {
    const sanitizedUser = persistUser(user);
    updateUsers(sanitizedUser);
  }, []);

  const addUser = useCallback((user) => {
    setUsers(user);
  }, [setUsers]);

  const deleteUser = useCallback(() => {
    updateUsers({});
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  const getUserData = useCallback(() => {
    return users;
  }, [users]);

  const updateUserData = useCallback((newData) => {
    updateUsers((prevUserData) => {
      const updatedUser = newData.userName !== undefined
        ? { ...prevUserData, userName: newData.userName }
        : { ...prevUserData, ...newData };

      return persistUser(updatedUser);
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

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useUser = () => {
  return useContext(UserContext);
};
