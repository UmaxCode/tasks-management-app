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
import { useNavigate } from "react-router-dom";
import { useAdminContextData } from "@/contexts/AdminContext";
import { DataTable } from "@/components/reactive-table/data-table";
import { userColumns, UserType } from "@/components/reactive-table/columns";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({ message: "Invalid email format." }),
});

export const UsersPage = () => {
  const { toast } = useToast();
  const [formSubmition, setFormSubmition] = useState({
    isSubmitted: false,
    isModalOpen: false,
  });

  const { idToken } = useAuth();
  const { registeredUsers, storeRegisteredUsers, storeSelectedUser } =
    useAdminContextData();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  const fetchUsers = async () => {
    try {
      const response = await axios.get(Endpoints.USERS, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.data.data;
      storeRegisteredUsers(data);
    } catch (err) {
      console.log(err);
      const error: any = err;

      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.response.data.message,
      });
    }
  };

  useEffect(() => {
    fetchUsers();
    storeSelectedUser("");
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setFormSubmition({ ...formSubmition, isSubmitted: true });
    try {
      const response = await axios.post(
        `${Endpoints.USERS}/signup`,
        {
          username: values.username,
          email: values.email,
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
      const responseData = await response.data;
      const data = responseData.data;
      console.log(data);
      registeredUsers?.push(data);
      storeRegisteredUsers(registeredUsers ? registeredUsers : []);
      toast({
        title: "User Creation",
        description: responseData.message,
      });
      setFormSubmition({ isModalOpen: false, isSubmitted: false });
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    }
  }

  return (
    <div className="p-3">
      <div className="p-3">
        <Dialog open={formSubmition.isModalOpen}>
          <Button
            onClick={() =>
              setFormSubmition({ ...formSubmition, isModalOpen: true })
            }
          >
            Unboard User
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
              <DialogTitle>Create User</DialogTitle>
              <DialogDescription>
                Add user details and click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email" {...field} />
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
      <div className="container mx-auto py-10">
        <DataTable
          columns={userColumns}
          data={registeredUsers ? registeredUsers : []}
          rowAction={(row: UserType) => {
            storeSelectedUser(row.email);
            navigate(`users/${row.userId}`);
          }}
        />
      </div>
    </div>
  );
};
