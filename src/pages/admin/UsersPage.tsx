import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useAdminContextData } from "@/contexts/AdminContext";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({ message: "Invalid email format." }),
});

export const UsersPage = () => {
  const { toast } = useToast();
  const [isloading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    console.log(idToken);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
      const message = await response.data.message;
      toast({
        title: "User Creation",
        description: message,
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
              onClick={() =>
                setFormSubmition({ ...formSubmition, isModalOpen: false })
              }
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
      <div className="bg- rounded-t-sm pb-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="">UserId</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isloading ? (
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
                  </TableRow>
                ))}
              </>
            ) : (
              // Actual table content
              <>
                {registeredUsers?.map((registeredUser) => (
                  <TableRow
                    key={registeredUser.userId}
                    onClick={() => {
                      storeSelectedUser(registeredUser.email);
                      navigate(`users/${registeredUser.userId}`);
                    }}
                    className=" cursor-pointer"
                  >
                    <TableCell>{registeredUser.userId}</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>{registeredUser.email}</TableCell>
                    <TableCell>Role</TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
