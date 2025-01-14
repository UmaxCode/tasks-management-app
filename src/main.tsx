import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "./components/ui/toaster.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { AdminContextProvider } from "./contexts/AdminContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <AdminContextProvider>
        <App />
        <Toaster />
      </AdminContextProvider>
    </AuthProvider>
  </StrictMode>
);
