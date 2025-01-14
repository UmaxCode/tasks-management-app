import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Outlet } from "react-router-dom";

export const AdminPageLayout = () => {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full p-3 h-full">
          <SidebarTrigger />
          <Outlet />
        </main>
      </SidebarProvider>
    </>
  );
};
