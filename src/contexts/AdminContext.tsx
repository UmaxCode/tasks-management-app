import { UserType } from "@/components/reactive-table/columns";
import { createContext, useContext, useState, ReactNode } from "react";

interface AdminContextProps {
  selectedUser: string | null;
  registeredUsers: UserType[] | null;
  storeSelectedUser: (email: string) => void;
  storeRegisteredUsers: (users: UserType[]) => void;
  clearAdminContextData: () => void;
}

const AdminContext = createContext<AdminContextProps | undefined>(undefined);

export const AdminContextProvider = ({ children }: { children: ReactNode }) => {
  const [selectedUser, setSelectedUser] = useState<string | null>("");

  const [registeredUsers, setRegisteredUsers] = useState<UserType[] | null>([]);

  const storeSelectedUser = (email: string) => {
    setSelectedUser(email);
  };

  const storeRegisteredUsers = (users: UserType[]) => {
    const filteredUsersWithoutAdmin = users.filter(
      (user) => user.role !== "ADMIN"
    );
    setRegisteredUsers([...filteredUsersWithoutAdmin]);
  };

  const clearAdminContextData = () => {
    setSelectedUser("");
    setRegisteredUsers([]);
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
