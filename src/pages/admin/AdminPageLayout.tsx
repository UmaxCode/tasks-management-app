import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const AdminPageLayout = () => {
  const { idToken, clearAuthData } = useAuth();

  if (!idToken) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full p-3 h-full">
          <div className="flex justify-between sticky top-0 py-2">
            <SidebarTrigger />
            <button
              onClick={() => {
                clearAuthData();
              }}
              className="px-2 py-2 text-[0.5em] text-white bg-primary rounded-md hover:bg-primary/70"
            >
              Logout
            </button>
          </div>
          <Outlet />
        </main>
      </SidebarProvider>
    </>
  );
};
