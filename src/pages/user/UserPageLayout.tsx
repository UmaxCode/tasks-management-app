import { DataTable } from "@/components/reactive-table/data-table";
import { TableProvider } from "@/contexts/TableContext";
import {
  TaskType,
  userTasksColumns,
} from "@/components/reactive-table/columns";
import { useEffect, useState } from "react";
import axios from "axios";
import { Endpoints } from "@/backend/endpoints";
import { useAuth } from "@/contexts/AuthContext";

export const UserPageLayout = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);

  const { idToken, email } = useAuth();

  const fetchUserTasks = async () => {
    try {
      const response = await axios.get(`${Endpoints.TASKS}/users/${email}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.data.data;
      setTasks(data);
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    }
  };

  useEffect(() => {
    fetchUserTasks();
  }, []);

  const updateTasks = (data: TaskType) => {
    console.log(data);
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === data.id ? data : task))
    );
  };

  return (
    <div className="p-3">
      <header className="p-5 flex items-center justify-between">
        <span className="text-2xl text-gray-800 font-bold ">User Tasks</span>
        <span>{email}</span>
      </header>

      <div className="bg- rounded-t-sm pb-2">
        <TableProvider updateTaskTable={updateTasks}>
          <DataTable
            columns={userTasksColumns}
            data={tasks}
            rowAction={() => {}}
          />
        </TableProvider>
      </div>
    </div>
  );
};
