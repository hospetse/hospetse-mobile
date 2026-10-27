import { createContext, ReactNode, useContext, useState } from 'react';

export type SignupData = {
  name: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
  challengeId: string;
  pinRequestedAt: number;
};

type SignupContextValue = {
  signup: SignupData | null;
  saveSignup: (data: SignupData) => void;
  clearSignup: () => void;
};

const SignupContext = createContext<SignupContextValue | null>(null);

// Dados do cadastro só em memória, entre a tela de cadastro e a do código.
// Nada aqui vai para AsyncStorage ou log: some ao concluir, cancelar ou fechar o app
export function SignupProvider({ children }: { children: ReactNode }) {
  const [signup, setSignup] = useState<SignupData | null>(null);

  return (
    <SignupContext.Provider
      value={{
        signup,
        saveSignup: setSignup,
        clearSignup: () => setSignup(null),
      }}
    >
      {children}
    </SignupContext.Provider>
  );
}

export function useSignup() {
  const context = useContext(SignupContext);
  if (!context) {
    throw new Error('useSignup precisa estar dentro de SignupProvider');
  }
  return context;
}
