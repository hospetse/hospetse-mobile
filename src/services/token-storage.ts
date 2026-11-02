import * as SecureStore from 'expo-secure-store';

import type { AuthTokens } from './auth';

const ACCESS_TOKEN_KEY = 'hospetse.accessToken';
const REFRESH_TOKEN_KEY = 'hospetse.refreshToken';

// Tokens no Keychain (iOS) / Keystore (Android), nunca em AsyncStorage (ADR-005)
export async function saveTokens(tokens: AuthTokens): Promise<void> {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
  } catch (error) {
    await clearTokens();
    throw error;
  }
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

// Lê um token guardado. Sem token, devolve null.
async function readToken(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export function getAccessToken(): Promise<string | null> {
  return readToken(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): Promise<string | null> {
  return readToken(REFRESH_TOKEN_KEY);
}
