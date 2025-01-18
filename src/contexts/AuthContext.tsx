import { jwtDecode, JwtPayload } from "jwt-decode";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

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

  // Logout when the token expires or id_token is missing
  useEffect(() => {
    const checkTokenValidity = () => {
      const token = localStorage.getItem("id_token");

      if (isTokenExpired(token)) {
        clearAuthData();
      }
    };

    // Set an interval to check token validity periodically
    const interval = setInterval(checkTokenValidity, 1000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

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

// Function to check if a JWT is expired
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    if (!exp) return true; // If no expiry, consider it invalid
    return Date.now() >= exp * 1000; // Compare current time with expiry time
  } catch (e) {
    return true; // If there's an error decoding, consider it expired
  }
};
