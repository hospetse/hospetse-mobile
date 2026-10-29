import axios from 'axios';

// URL do Auth Server definida no .env (EXPO_PUBLIC_AUTH_URL)
// Timeout acima dos ~10 s que o register pode levar com as retentativas do Auth ao back-end
export const authApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_AUTH_URL,
  timeout: 15000,
});
