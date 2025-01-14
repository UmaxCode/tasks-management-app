import { createContext, useContext, useState, ReactNode } from "react";

type UserType = {
  userId: string;
  name: string;
  email: string;
  role: string;
};

interface AdminContextProps {
  selectedUser: string | null;
  registeredUsers: UserType[] | null;
  storeSelectedUser: (email: string) => void;
  storeRegisteredUsers: (users: UserType[]) => void;
  clearAdminContextData: () => void;
}

const AdminContext = createContext<AdminContextProps | undefined>(undefined);

export const AdminContextProvider = ({ children }: { children: ReactNode }) => {
  const [selectedUser, setSelectedUser] = useState<string | null>(
    localStorage.getItem("selectedUser")
  );

  const [registeredUsers, setRegisteredUsers] = useState<UserType[] | null>(
    JSON.parse(localStorage.getItem("registeredUsers") || "null")
  );

  const storeSelectedUser = (email: string) => {
    setSelectedUser(email);
    localStorage.setItem("selectedUser", email);
  };

  const storeRegisteredUsers = (users: UserType[]) => {
    setRegisteredUsers(users);
    localStorage.setItem("registeredUsers", JSON.stringify(users));
  };

  const clearAdminContextData = () => {
    setSelectedUser(null);
    setRegisteredUsers(null);
    localStorage.removeItem("selectedUser");
    localStorage.removeItem("registeredUsers");
  };

  return (
    <AdminContext.Provider
      value={{
        selectedUser,
        registeredUsers,
        storeRegisteredUsers,
        storeSelectedUser,
        clearAdminContextData,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContextData = (): AdminContextProps => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error(
      "useAdminContextData must be used within an AdminContextProvider"
    );
  }
  return context;
};
