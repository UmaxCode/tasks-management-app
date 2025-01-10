import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextProps {
  accessToken: string | null;
  idToken: string | null;
  role: string | null;
  email: string | null;
  setAuthData: (
    accessToken: string,
    idToken: string,
    role: string,
    email: string
  ) => void;
  clearAuthData: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("access_token")
  );
  const [idToken, setIdToken] = useState<string | null>(
    localStorage.getItem("id_token")
  );
  const [role, setRole] = useState<string | null>(localStorage.getItem("role"));
  const [email, setEmail] = useState<string | null>(
    localStorage.getItem("email")
  );

  const setAuthData = (
    accessToken: string,
    idToken: string,
    role: string,
    email: string
  ) => {
    setAccessToken(accessToken);
    setIdToken(idToken);
    setRole(role);
    setEmail(email);
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("id_token", idToken);
    localStorage.setItem("role", role);
    localStorage.setItem("email", email);
  };

  const clearAuthData = () => {
    setAccessToken(null);
    setIdToken(null);
    setRole(null);
    setEmail(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
  };

  return (
    <AuthContext.Provider
      value={{ accessToken, idToken, role, email, setAuthData, clearAuthData }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
