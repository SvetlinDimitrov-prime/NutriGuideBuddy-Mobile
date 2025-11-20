// authStorage.ts
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { AuthenticationResponse } from '@/api/types/auth';

const TOKEN_KEY = 'auth_tokens';
const isWeb = Platform.OS === 'web';

let inMemoryTokens: AuthenticationResponse | null = null;

// --- NEW: listeners for auth changes ---
type AuthListener = () => void;

const authListeners = new Set<AuthListener>();

export function subscribeToAuthChanges(listener: AuthListener) {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
}

function notifyAuthListeners() {
  authListeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.warn('[authStorage] auth listener error:', e);
    }
  });
}
// --- end new block ---

async function setItem(key: string, value: string) {
  if (isWeb && typeof window !== 'undefined') {
    window.localStorage.setItem(key, value);
    return;
  }

  try {
    await SecureStore.setItemAsync(key, value);
  } catch (e) {
    console.warn('SecureStore.setItemAsync failed, keeping in memory only:', e);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb && typeof window !== 'undefined') {
    return window.localStorage.getItem(key);
  }

  try {
    return await SecureStore.getItemAsync(key);
  } catch (e) {
    console.warn('SecureStore.getItemAsync failed, falling back to memory:', e);
    return null;
  }
}

async function deleteItem(key: string) {
  if (isWeb && typeof window !== 'undefined') {
    window.localStorage.removeItem(key);
    return;
  }

  try {
    await SecureStore.deleteItemAsync(key);
  } catch (e) {
    console.warn('SecureStore.deleteItemAsync failed:', e);
  }
}

/**
 * Save tokens to memory + persistent storage.
 */
export async function saveAuthTokens(tokens: AuthenticationResponse) {
  inMemoryTokens = tokens;
  await setItem(TOKEN_KEY, JSON.stringify(tokens));
  notifyAuthListeners(); // 👈 NEW
}

/**
 * Internal loader: read from memory if present, otherwise from storage.
 */
async function loadFromStorage(): Promise<AuthenticationResponse | null> {
  if (inMemoryTokens) return inMemoryTokens;

  const stored = await getItem(TOKEN_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as AuthenticationResponse;
    inMemoryTokens = parsed;
    return parsed;
  } catch {
    inMemoryTokens = null;
    await deleteItem(TOKEN_KEY);
    notifyAuthListeners(); // tokens effectively cleared
    return null;
  }
}

export async function getAuthTokens(): Promise<AuthenticationResponse | null> {
  return loadFromStorage();
}

export const loadAuthTokens = getAuthTokens;

export async function clearAuthTokens() {
  inMemoryTokens = null;
  await deleteItem(TOKEN_KEY);
  notifyAuthListeners(); // 👈 NEW
}

/**
 * Synchronous access to whatever is currently in memory.
 */
export function getCachedTokens(): AuthenticationResponse | null {
  return inMemoryTokens;
}
