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
type SignupProviderProps = {
  children: ReactNode;
  // Usado nos testes para começar com um cadastro em andamento
  initialSignup?: SignupData | null;
};

export function SignupProvider({ children, initialSignup = null }: SignupProviderProps) {
  const [signup, setSignup] = useState<SignupData | null>(initialSignup);

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
