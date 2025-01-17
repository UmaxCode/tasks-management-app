import { tasksColumns, TaskType } from "@/components/reactive-table/columns";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { Endpoints } from "@/backend/endpoints";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useAdminContextData } from "@/contexts/AdminContext";
import { TableProvider } from "@/contexts/TableContext";
import { DataTable } from "@/components/reactive-table/data-table";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Task name must be at least 3 characters.",
  }),
  description: z.string().min(5, {
    message: "Task description must be at least 5 characters.",
  }),
  deadline: z.string().nonempty("Task deadline is required."),
  responsibility: z.string().email({ message: "Invalid email format." }),
});
export const TasksPage = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const { toast } = useToast();
  const [formSubmition, setFormSubmition] = useState({
    isSubmitted: false,
    isModalOpen: false,
  });

  const { idToken } = useAuth();

  const { registeredUsers } = useAdminContextData();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      deadline: "",
      responsibility: "",
    },
  });

  const fetchTasks = async () => {
    try {
      const response = await axios.get(Endpoints.TASKS, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + idToken,
        },
      });
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.data.data;
      setTasks(data);
    } catch (err) {
      const error: any = err;
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.response.data.message,
      });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setFormSubmition({ ...formSubmition, isSubmitted: true });
    try {
      const response = await axios.post(
        `${Endpoints.TASKS}`,
        {
          name: values.name,
          description: values.description,
          deadline: values.deadline,
          responsibility: values.responsibility,
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + idToken,
          },
        }
      );
      if (response.status !== 201) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.data;
      setTasks((prevTasks) => [...prevTasks, data.data]);
      const message = data.message;
      toast({
        title: "Task Creation",
        description: message,
      });
      setFormSubmition({ isModalOpen: false, isSubmitted: false });
    } catch (err) {
      const error: any = err;
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.response.data.message,
      });
    }
    setFormSubmition({ isModalOpen: false, isSubmitted: false });
  }

  const updateTasks = (data: TaskType) => {
    console.log(data);
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === data.id ? data : task))
    );
  };

  return (
    <div className="p-3">
      <div className="p-3">
        <Dialog open={formSubmition.isModalOpen}>
          <Button
            onClick={() =>
              setFormSubmition({ ...formSubmition, isModalOpen: true })
            }
          >
            Create And Assign Tasks
          </Button>
          <DialogContent className="sm:max-w-[425px]">
            <DialogPrimitive.Close
              onClick={() => {
                form.reset();
                setFormSubmition({ ...formSubmition, isModalOpen: false });
              }}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
              <DialogDescription>
                Create a task and assign to a user
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="responsibility"
                  render={({ field }) => (
                    <FormItem>
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
                            {registeredUsers ? (
                              registeredUsers.map((user) => {
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
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="deadline"
                          type="datetime-local"
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
          </DialogContent>
        </Dialog>
      </div>
      <div className="bg- rounded-t-sm pb-2">
        <TableProvider updateTaskTable={updateTasks}>
          <DataTable columns={tasksColumns} data={tasks} rowAction={() => {}} />
        </TableProvider>
      </div>
    </div>
  );
};
