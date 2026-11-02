import { createContext, ReactNode, useContext, useState } from 'react';

import type { CurrentUser } from '../services/users';

type SessionContextValue = {
  currentUser: CurrentUser | null;
  saveCurrentUser: (user: CurrentUser) => void;
  clearCurrentUser: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

type SessionProviderProps = {
  children: ReactNode;
};

// O perfil atual fica somente em memória. Ele é carregado do /me após o cadastro.
export function SessionProvider({ children }: SessionProviderProps) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  return (
    <SessionContext.Provider
      value={{
        currentUser,
        saveCurrentUser: setCurrentUser,
        clearCurrentUser: () => setCurrentUser(null),
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
