import type { AuthTokens } from './auth';

let tokens: AuthTokens | null = null;

// Na web os tokens ficam só na memória. Atualizar a página encerra a sessão.
export async function saveTokens(newTokens: AuthTokens): Promise<void> {
  tokens = newTokens;
}

export async function clearTokens(): Promise<void> {
  tokens = null;
}

export async function getAccessToken(): Promise<string | null> {
  return tokens?.accessToken ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  return tokens?.refreshToken ?? null;
}
