import axios, { InternalAxiosRequestConfig } from 'axios';
import { router } from 'expo-router';

import type { AuthTokens } from './auth';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from './token-storage';

// URL do Auth Server definida no .env (EXPO_PUBLIC_AUTH_URL)
// Timeout acima dos ~10 s que o register pode levar com as retentativas do Auth ao back-end
export const authApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_AUTH_URL,
  timeout: 15000,
});

// URL do back-end principal definida no .env (EXPO_PUBLIC_API_URL). Toda chamada leva o token do usuário
export const backendApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
});

// A sessão acabou: não há refresh token, ou o Auth recusou o que havia
export class SessionExpiredError extends Error {
  constructor() {
    super('SESSION_EXPIRED');
  }
}

// Renovação em andamento. Enquanto existir, as outras chamadas esperam por ela em vez de renovar de novo:
// o refresh token vale uma vez só, e usar o mesmo duas vezes derruba todas as sessões da conta (Wiki do back-end)
let refreshing: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (!refreshing) {
    refreshing = renewTokens().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

async function renewTokens(): Promise<string> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    throw new SessionExpiredError();
  }
  try {
    const { data } = await authApi.post<AuthTokens>('/api/v1/auth/refresh', { refreshToken });
    await saveTokens(data);
    return data.accessToken;
  } catch (error) {
    // 400 e 401: o Auth não aceita mais esse refresh token. Outros erros (rede, 500) não encerram a sessão
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    if (status === 400 || status === 401) {
      throw new SessionExpiredError();
    }
    throw error;
  }
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

backendApi.interceptors.request.use(async (config: RetriableConfig) => {
  // Na repetição depois do refresh, o cabeçalho já leva o token novo
  if (config._retried) {
    return config;
  }
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 do back-end = access token vencido (15 min). Renova uma vez e repete a mesma chamada
backendApi.interceptors.response.use(undefined, async (error: unknown) => {
  if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) {
    throw error;
  }
  const original = error.config as RetriableConfig;
  if (original._retried) {
    throw error;
  }
  original._retried = true;

  try {
    const token = await refreshAccessToken();
    original.headers.Authorization = `Bearer ${token}`;
    return backendApi(original);
  } catch (refreshError) {
    if (refreshError instanceof SessionExpiredError) {
      await clearTokens();
      router.replace({ pathname: '/', params: { aviso: 'sessao-expirada' } });
    }
    throw refreshError;
  }
});
