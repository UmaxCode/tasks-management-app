import axios from "axios";
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Endpoints } from "../../backend/endpoints";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { decodeJwt } from "@/utils/jwtUtils";

export const LoginCallBack = () => {
  const params = new URLSearchParams(window.location.search);
  const { setAuthData } = useAuth();
  const navigate = useNavigate();

  if (!params.get("code")) {
    return <Navigate to={"/"} />;
  }

  useEffect(() => {
    const fetchAccessToken = async () => {
      const code = params.get("code");

      if (code) {
        console.log("Authorization Code:", code);
        await fetchToken(code);
      }
    };

    fetchAccessToken();
  }, []);

  const fetchToken = async (code: string) => {
    try {
      const clientId = import.meta.env.VITE_client_id;
      const clientSecret = import.meta.env.VITE_client_secret;
      const encodedCredentials = btoa(`${clientId}:${clientSecret}`);

      const response = await axios.post(
        Endpoints.AUTH.TOKEN,
        {
          grant_type: "authorization_code",
          code: code,
          redirect_uri: Endpoints.AUTH.CALLBACK,
          client_id: clientId,
          client_secret: clientSecret,
        },
        {
          headers: {
            Authorization: `Basic ${encodedCredentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (response.status === 200) {
        const accessToken = response.data.access_token;
        const idToken = response.data.id_token;
        const { email, role }: any = decodeJwt(idToken);

        setAuthData(accessToken, idToken, role, email);

        if (role === "ADMIN") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      }
    } catch (err) {
      console.log(err);
      const error: any = err;

      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.response.data.error,
      });

      navigate("/");
    }
  };

  return <div>Processing Login...</div>;
};
