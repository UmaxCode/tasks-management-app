import { jwtDecode } from "jwt-decode";
export const decodeJwt = (idToken: string) => {
  try {
    // Decode the token without verifying the signature
    const decoded = jwtDecode(idToken) as { [key: string]: any };

    const email = decoded.email;
    const role = decoded["custom:role"]; // Access custom attributes using bracket notation

    console.log("Email:", email);
    console.log("Role:", role);

    return { email, role };
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};
