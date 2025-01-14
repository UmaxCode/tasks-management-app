import {
  createBrowserRouter,
  createRoutesFromChildren,
  Route,
  RouterProvider,
} from "react-router-dom";
import AuthPage from "./pages/auth/AuthPage";
import { LoginCallBack } from "./pages/auth/LoginCallBack";
import { AdminPageLayout } from "./pages/admin/AdminPageLayout";
import { UserPageLayout } from "./pages/user/UserPageLayout";
import { ErrorPage } from "./pages/error/ErrorPage";
import { UsersPage } from "./pages/admin/UsersPage";
import { TasksPage } from "./pages/admin/TasksPage";
import UserDetailsPage from "./pages/admin/UserDetailsPage";

const router = createBrowserRouter(
  createRoutesFromChildren(
    <Route>
      <Route path="/" />
      <Route index element={<AuthPage />} />
      <Route path="/auth/callback" element={<LoginCallBack />} />
      <Route path="/admin/dashboard" element={<AdminPageLayout />}>
        <Route index element={<UsersPage />} />
        <Route path="users/:email" element={<UserDetailsPage />} />
        <Route path="tasks" element={<TasksPage />} />
      </Route>
      <Route path="/user/dashboard" element={<UserPageLayout />}></Route>
      <Route path="*" element={<ErrorPage />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
