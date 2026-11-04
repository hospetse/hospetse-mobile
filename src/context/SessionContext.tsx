import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

import { clearTokens } from '../services/token-storage';
import type { CurrentUser } from '../services/users';

type SessionContextValue = {
  currentUser: CurrentUser | null;
  saveCurrentUser: (user: CurrentUser) => void;
  clearCurrentUser: () => void;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

type SessionProviderProps = {
  children: ReactNode;
};

// O perfil atual fica somente em memória. Ele é carregado do /me após o cadastro.
export function SessionProvider({ children }: SessionProviderProps) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const saveCurrentUser = useCallback((user: CurrentUser) => setCurrentUser(user), []);
  const clearCurrentUser = useCallback(() => setCurrentUser(null), []);
  // Logout só local: o Auth não tem rota de logout (#297 removida). Nunca lança, para o app sempre voltar ao login
  const logout = useCallback(async () => {
    try {
      await clearTokens();
    } catch {
      // shortcut: se o armazenamento falhar, os tokens ficam no aparelho até o próximo login sobrescrever, revisar se o Auth ganhar revogação
    } finally {
      setCurrentUser(null);
    }
  }, []);

  return (
    <SessionContext.Provider
      value={{
        currentUser,
        saveCurrentUser,
        clearCurrentUser,
        logout,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession precisa estar dentro de SessionProvider');
  }
  return context;
}
