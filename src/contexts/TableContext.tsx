import { TaskType } from "@/components/reactive-table/columns";
import { createContext, useContext, ReactNode } from "react";

// Define the shape of the context value
interface TableContextProps {
  updateTaskTable: (data: TaskType) => void;
}

// Create the context with a default value (could be an empty function)
const TableContext = createContext<TableContextProps>({
  updateTaskTable: () => {
    console.warn("handleAction is not provided!");
  },
});

// Create a provider component
export const TableProvider = ({
  children,
  updateTaskTable,
}: {
  children: ReactNode;
  updateTaskTable: (data: TaskType) => void;
}) => {
  return (
    <TableContext.Provider value={{ updateTaskTable }}>
      {children}
    </TableContext.Provider>
  );
};

// Custom hook for using the TableContext
export const useTableContext = () => {
  return useContext(TableContext);
};

export default TableContext;
