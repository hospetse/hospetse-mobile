import * as SecureStore from 'expo-secure-store';

import type { AuthTokens } from './auth';

const ACCESS_TOKEN_KEY = 'hospetse.accessToken';
const REFRESH_TOKEN_KEY = 'hospetse.refreshToken';

// Tokens no Keychain (iOS) / Keystore (Android), nunca em AsyncStorage (ADR-005)
export async function saveTokens(tokens: AuthTokens): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
