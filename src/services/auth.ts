import axios from 'axios';

import { authApi } from './api';

type RequestPinResponse = {
  challengeId: string;
};

// Pede o PIN por e-mail. O Auth aceita só o e-mail aqui; o nome vai no register
export async function requestPin(email: string): Promise<string> {
  const { data } = await authApi.post<RequestPinResponse>('/api/v1/auth/request-pin', {
    email: email.trim().toLowerCase(),
  });
  return data.challengeId;
}

type RegisterInput = {
  challengeId: string;
  pin: string;
  name: string;
  password: string;
  acceptedTerms: boolean;
  termsVersion: string;
};

export type AuthTokens = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
};

// Valida o PIN e cria a conta. O e-mail não vai: o Auth usa o do challengeId
export async function register(input: RegisterInput): Promise<AuthTokens> {
  const { data } = await authApi.post<AuthTokens>('/api/v1/auth/register', input);
  return data;
}

// Entra com e-mail e senha. O Auth responde 401 com a mesma mensagem para e-mail sem conta e senha errada
export async function login(email: string, password: string): Promise<AuthTokens> {
  const { data } = await authApi.post<AuthTokens>('/api/v1/auth/login', {
    email: email.trim().toLowerCase(),
    password,
  });
  return data;
}

// Status HTTP do erro, ou null quando não houve resposta (sem rede, timeout)
export function getErrorStatus(error: unknown): number | null {
  if (axios.isAxiosError(error) && error.response) {
    return error.response.status;
  }
  return null;
}
