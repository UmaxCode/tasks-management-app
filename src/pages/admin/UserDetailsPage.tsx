import { Endpoints } from "@/backend/endpoints";
import { DataTable } from "@/components/reactive-table/data-table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { useAdminContextData } from "@/contexts/AdminContext";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { tasksColumns, TaskType } from "@/components/reactive-table/columns";
import { TableProvider } from "@/contexts/TableContext";

const UserDetailsPage = () => {
  const { email } = useParams();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const { idToken } = useAuth();
  const { selectedUser } = useAdminContextData();

  const fetchUserTasks = async () => {
    try {
      const response = await axios.get(
        `${Endpoints.TASKS}/users/${selectedUser}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
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
    console.log("DFDFDFDDDDFD");
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === data.id ? data : task))
    );
  };

  return (
    <>
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="../">Users</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>{email}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="p-3">
          <h1 className="mb-4">User's Tasks</h1>
          <div className="bg- rounded-t-sm pb-2">
            <TableProvider updateTaskTable={updateTasks}>
              <DataTable
                columns={tasksColumns}
                data={tasks}
                rowAction={() => {}}
              />
            </TableProvider>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetailsPage;
