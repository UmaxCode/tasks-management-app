import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState } from "react";
import { Endpoints } from "@/backend/endpoints";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useAdminContextData } from "@/contexts/AdminContext";
import { useTableContext } from "@/contexts/TableContext";
import { Textarea } from "../ui/textarea";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type UserType = {
  userId: string;
  username: string;
  email: string;
  role: "ADMIN" | "USER";
};

export type TaskType = {
  id: string;
  name: string;
  description: string;
  responsibility: string;
  deadline: string;
  comment: string;
  status: "open" | "complete" | "expired";
};

export const userColumns: ColumnDef<UserType>[] = [
  {
    accessorKey: "userId",
    header: "UserId",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
];

const formSchemaDeadline = z.object({
  deadline: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

const formSchemaResponsibility = z.object({
  responsibility: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

const formSchemaTaskDetails = z.object({
  name: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

export const tasksColumns: ColumnDef<TaskType>[] = [
  {
    accessorKey: "id",
    header: "Task Id",
  },
  {
    accessorKey: "name",
    header: "Task Name",
  },
  {
    accessorKey: "description",
    header: "Task Description",
  },
  {
    accessorKey: "deadline",
    header: "Task Deadline",
  },
  {
    accessorKey: "responsibility",
    header: "Assigned To",
  },
  {
    accessorKey: "status",
    header: "Task status",
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const task = row.original;
      const [formSubmition, setFormSubmition] = useState({
        isSubmitted: false,
        isModalOpen: false,
        editType: "taskDetails",
      });
      const { updateTaskTable } = useTableContext();

      const formDeadline = useForm<z.infer<typeof formSchemaDeadline>>({
        resolver: zodResolver(formSchemaDeadline),
        defaultValues: {
          deadline: "",
        },
      });

      const formResponsibility = useForm<
        z.infer<typeof formSchemaResponsibility>
      >({
        resolver: zodResolver(formSchemaResponsibility),
        defaultValues: {
          responsibility: "",
        },
      });

      const formTaskDetails = useForm<z.infer<typeof formSchemaTaskDetails>>({
        resolver: zodResolver(formSchemaTaskDetails),
        defaultValues: {
          name: "",
          description: "",
        },
      });

      console.log(formSubmition.editType);

      const { idToken } = useAuth();

      const { registeredUsers, selectedUser } = useAdminContextData();

      const eligibleTaskAssignableUser = registeredUsers?.filter(
        (user) => user.role !== "ADMIN" && user.email != selectedUser
      );

      const reOpendTask = async (
        values: z.infer<typeof formSchemaDeadline>
      ) => {
        setFormSubmition({ ...formSubmition, isSubmitted: true });
        try {
          const response = await axios.patch(
            `${Endpoints.TASKS}/${row.original.id}/reopen`,
            {
              deadline: values.deadline,
            },
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
          const data = await response.data;
          updateTaskTable(data.data);
          toast({
            title: "Task Update",
            description: data.message,
          });
        } catch (err) {
          const error: any = err;
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error.response.data.message,
          });
        } finally {
          setFormSubmition({
            ...formSubmition,
            isModalOpen: false,
            isSubmitted: false,
          });
          formDeadline.reset();
        }
      };

      const editTaskDetails = async (
        values: z.infer<typeof formSchemaTaskDetails>
      ) => {
        setFormSubmition({ ...formSubmition, isSubmitted: true });
        try {
          const response = await axios.patch(
            `${Endpoints.TASKS}/${row.original.id}`,
            {
              name: values.name,
              description: values.description,
            },
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
          const data = await response.data;
          updateTaskTable(data.data);
          toast({
            title: "Task Update",
            description: data.message,
          });
        } catch (err) {
          const error: any = err;
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error.response.data.message,
          });
        } finally {
          setFormSubmition({
            ...formSubmition,
            isModalOpen: false,
            isSubmitted: false,
          });
          formTaskDetails.reset();
        }
      };

      const reAssignTask = async (
        values: z.infer<typeof formSchemaResponsibility>
      ) => {
        setFormSubmition({ ...formSubmition, isSubmitted: true });
        try {
          const response = await axios.patch(
            `${Endpoints.TASKS}/${row.original.id}/reassign`,
            {
              userEmail: values.responsibility,
            },
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
          const data = await response.data;
          updateTaskTable(data.data);
          toast({
            title: "Task Update",
            description: data.message,
          });
        } catch (err) {
          const error: any = err;
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error.response.data.message,
          });
        } finally {
          setFormSubmition({
            ...formSubmition,
            isModalOpen: false,
            isSubmitted: false,
          });
          formResponsibility.reset();
        }
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  setFormSubmition({
                    ...formSubmition,
                    isModalOpen: true,
                    editType: "taskDetails",
                  })
                }
              >
                Edit Task Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {task.status === "open" && (
                <DropdownMenuItem
                  onClick={() =>
                    setFormSubmition({
                      ...formSubmition,
                      isModalOpen: true,
                      editType: "resign",
                    })
                  }
                >
                  Re-Assign Task
                </DropdownMenuItem>
              )}
              {task.status === "expired" && (
                <DropdownMenuItem
                  onClick={() =>
                    setFormSubmition({
                      ...formSubmition,
                      isModalOpen: true,
                      editType: "reopen",
                    })
                  }
                >
                  Re-Open Task
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={formSubmition.isModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogPrimitive.Close
                onClick={() => {
                  formTaskDetails.reset();
                  formDeadline.reset();
                  formResponsibility.reset();
                  setFormSubmition({ ...formSubmition, isModalOpen: false });
                }}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
              <DialogHeader>
                <DialogTitle>Edit tasks</DialogTitle>
                <DialogDescription>
                  Make changes to user's task here. Click submit when you're
                  done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {formSubmition.editType === "taskDetails" ? (
                  <Form {...formTaskDetails}>
                    <form
                      onSubmit={formTaskDetails.handleSubmit(editTaskDetails)}
                      className="space-y-8"
                    >
                      <FormField
                        control={formTaskDetails.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Task Name</FormLabel>
                            <FormControl>
                              <Input placeholder="task name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formTaskDetails.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Task Description</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="task description"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">
                        {formSubmition.isSubmitted ? (
                          <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        ) : (
                          "Submit"
                        )}
                      </Button>
                    </form>
                  </Form>
                ) : formSubmition.editType === "resign" ? (
                  <Form {...formResponsibility}>
                    <form
                      onSubmit={formResponsibility.handleSubmit(reAssignTask)}
                      className="space-y-8"
                    >
                      <FormField
                        control={formResponsibility.control}
                        name="responsibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a verified email to display" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {eligibleTaskAssignableUser ? (
                                  eligibleTaskAssignableUser.map((user) => {
                                    return (
                                      <SelectItem
                                        key={user.email}
                                        value={user.email}
                                      >
                                        {user.email}
                                      </SelectItem>
                                    );
                                  })
                                ) : (
                                  <></>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">
                        {formSubmition.isSubmitted ? (
                          <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        ) : (
                          "Submit"
                        )}
                      </Button>
                    </form>
                  </Form>
                ) : formSubmition.editType === "reopen" ? (
                  <Form {...formDeadline}>
                    <form
                      onSubmit={formDeadline.handleSubmit(reOpendTask)}
                      className="space-y-8"
                    >
                      <FormField
                        control={formDeadline.control}
                        name="deadline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Task Deadline</FormLabel>
                            <FormControl>
                              <Input placeholder="deadline" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">
                        {formSubmition.isSubmitted ? (
                          <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        ) : (
                          "Submit"
                        )}
                      </Button>
                    </form>
                  </Form>
                ) : null}
              </div>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];

const formSchemaTaskComment = z.object({
  comment: z.string().min(5, {
    message: "comment must be at least 5 characters.",
  }),
});

export const userTasksColumns: ColumnDef<TaskType>[] = [
  {
    accessorKey: "id",
    header: "Task Id",
  },
  {
    accessorKey: "name",
    header: "Task Name",
  },
  {
    accessorKey: "deadline",
    header: "Task Deadline",
  },
  {
    accessorKey: "status",
    header: "Task status",
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const task = row.original;
      const [formSubmition, setFormSubmition] = useState({
        isSubmitted: false,
        isModalOpen: false,
        editType: "taskDetails",
      });
      const { updateTaskTable } = useTableContext();

      const formTaskComment = useForm<z.infer<typeof formSchemaTaskComment>>({
        resolver: zodResolver(formSchemaTaskComment),
        defaultValues: {
          comment: "",
        },
      });

      const { idToken } = useAuth();

      const markTaskAsCompleted = async () => {
        try {
          const response = await axios.patch(
            `${Endpoints.TASKS}/${row.original.id}/completed`,
            {},
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );
          if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.data;
          updateTaskTable(data.data);
          toast({
            title: "Task Update",
            description: data.message,
          });
        } catch (err) {
          const error: any = err;
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error.response.data.message,
          });
        }
      };

      const addCommentToTask = async (
        values: z.infer<typeof formSchemaTaskComment>
      ) => {
        setFormSubmition({ ...formSubmition, isSubmitted: true });
        try {
          const response = await axios.patch(
            `${Endpoints.TASKS}/${row.original.id}/comment`,
            {
              comment: values.comment,
            },
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
          const data = await response.data;
          updateTaskTable(data.data);
          toast({
            title: "Task Update",
            description: data.message,
          });
        } catch (err) {
          const error: any = err;
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error.response.data.message,
          });
        } finally {
          setFormSubmition({
            ...formSubmition,
            isModalOpen: false,
            isSubmitted: false,
          });
          formTaskComment.reset();
        }
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setFormSubmition({
                    ...formSubmition,
                    isModalOpen: true,
                    editType: "viewTaskDetails",
                  });
                }}
              >
                View Task Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setFormSubmition({
                    ...formSubmition,
                    isModalOpen: true,
                    editType: "addComment",
                  })
                }
              >
                Add Comment
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {task.status === "open" && (
                <DropdownMenuItem onClick={markTaskAsCompleted}>
                  Mark as completed
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={formSubmition.isModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogPrimitive.Close
                onClick={() => {
                  formTaskComment.reset();
                  setFormSubmition({ ...formSubmition, isModalOpen: false });
                }}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>

              <div className="grid gap-4 py-4">
                {formSubmition.editType === "addComment" ? (
                  <>
                    <DialogHeader>
                      <DialogTitle>Edit tasks</DialogTitle>
                      <DialogDescription>
                        Make changes to user's task here. Click submit when
                        you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...formTaskComment}>
                      <form
                        onSubmit={formTaskComment.handleSubmit(
                          addCommentToTask
                        )}
                        className="space-y-8"
                      >
                        <FormField
                          control={formTaskComment.control}
                          name="comment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Task Comment</FormLabel>
                              <FormControl>
                                <Textarea placeholder="comment..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit">
                          {formSubmition.isSubmitted ? (
                            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                          ) : (
                            "Submit"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </>
                ) : (
                  <div className="">
                    <h1 className="py-2">Task Details</h1>
                    <div className="mb-4">
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Task Name
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={row.original.name}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter the title"
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Task Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={row.original.description}
                        rows={4}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter the description"
                      ></textarea>
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Task Comment
                      </label>
                      <textarea
                        id="comment"
                        name="comment"
                        value={row.original.comment}
                        rows={4}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter the description"
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];
