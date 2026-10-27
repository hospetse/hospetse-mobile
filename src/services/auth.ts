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

// Status HTTP do erro, ou null quando não houve resposta (sem rede, timeout)
export function getErrorStatus(error: unknown): number | null {
  if (axios.isAxiosError(error) && error.response) {
    return error.response.status;
  }
  return null;
}
