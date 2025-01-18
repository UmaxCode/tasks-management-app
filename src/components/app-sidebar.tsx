import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

import { User, Book } from "lucide-react";
import { NavLink } from "react-router-dom";

// Menu items.
const items = [
  {
    title: "Users",
    url: ".",
    icon: User,
    end: true,
  },
  {
    title: "Tasks",
    url: "./tasks",
    icon: Book,
    end: false,
  },
];

export function AppSidebar() {
  const { email } = useAuth();
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xl mb-3 text-primary">
            Admin Dashboard
          </SidebarGroupLabel>
          <h1 className="pl-2 pb-4">{email}</h1>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-4 py-2 rounded ${
                        isActive
                          ? "text-white bg-primary"
                          : "text-gray-700 hover:bg-primary/50 hover:text-white"
                      } `
                    }
                    to={item.url}
                    end={item.end}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
