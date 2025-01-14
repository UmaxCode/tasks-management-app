import { Endpoints } from "@/backend/endpoints";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminContextData } from "@/contexts/AdminContext";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type TaskType = {
  id: string;
  name: string;
  description: string;
  deadline: string;
  status: string;
};
const UserDetailsPage = () => {
  const { email } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const { idToken } = useAuth();
  const { selectedUser } = useAdminContextData();

  const fetchUserTasks = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTasks();
  }, []);

  return (
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
        <h1 className="mb-2">User's Tasks</h1>
        <div className="bg- rounded-t-sm pb-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="">Task Id</TableHead>
                <TableHead>Task Name</TableHead>
                <TableHead>Task Description</TableHead>
                <TableHead className="">Task Deadline</TableHead>
                <TableHead className="">Task Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Show skeletons for the table rows only
                <>
                  {[...Array(10)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell className="">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : (
                // Actual table content
                <>
                  {tasks?.map((task) => (
                    <TableRow
                      key={task.id}
                      onClick={() => {}}
                      className=" cursor-pointer"
                    >
                      <TableCell>{task.id}</TableCell>
                      <TableCell>{task.name}</TableCell>
                      <TableCell>{task.description}</TableCell>
                      <TableCell>{task.deadline}</TableCell>
                      <TableCell
                        className={`px-4 py-2 ${getStatusClass(task.status)}`}
                      >
                        {task.status}
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800"; // Light green background
    case "open":
      return "bg-yellow-100 text-yellow-800"; // Light yellow background
    case "expired":
      return "bg-red-100 text-red-800"; // Light red background
    default:
      return "bg-gray-100 text-gray-800"; // Default styling
  }
};

export default UserDetailsPage;
