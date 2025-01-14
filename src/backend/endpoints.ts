// Define the base URL for the API
const AUTH_BASE_URL = import.meta.env.VITE_auth_endpoint;
const APP_BASE_URL = import.meta.env.VITE_api_gateway_endpoint;
const clientId = import.meta.env.VITE_client_id;
const callbackUrl = import.meta.env.VITE_callback_endpoint;

// Exported endpoints
export const Endpoints = {
  AUTH: {
    LOGIN: `${AUTH_BASE_URL}/login?client_id=${clientId}&response_type=code&redirect_uri=${callbackUrl}`,
    TOKEN: `${AUTH_BASE_URL}/oauth2/token`,
    CALLBACK: callbackUrl,
  },
  USERS: `${APP_BASE_URL}/users`,
  TASKS: `${APP_BASE_URL}/tasks`,
};
