import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import type {
  Experience,
  HostDocumentType,
  LocalFile,
  PetSpecies,
  RoomKey,
  SpaceStructure,
} from '../constants/hostRegistration';
import type { PetSize } from '../constants/search';
import { useSession } from './SessionContext';

// Situação do cadastro no back-end (draft = ainda é rascunho)
export type HostValidationStatus = 'draft' | 'pending' | 'approved' | 'rejected';

// Tudo o que o Host preenche nas etapas do cadastro (#326)
export type HostRegistrationData = {
  // Etapa 1: o espaço
  structure: SpaceStructure;
  hasOtherPets: boolean;
  acceptedSizes: PetSize[];
  acceptedSpecies: PetSpecies[];
  // Texto digitado; vira número no envio
  capacity: string;
  experience: Experience | null;
  acceptsSenior: boolean;
  acceptsNeutered: boolean;
  description: string;
  // Etapa 2: fotos, localização e documentos
  coverPhoto: string | null;
  roomPhotos: Partial<Record<RoomKey, string>>;
  zipCode: string;
  // CEP (só dígitos) da última busca que deu certo. Mudar o CEP depois exige buscar de novo
  zipLookedUp: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  // O CEP não trouxe o bairro: o Host preenche
  neighborhoodManual: boolean;
  city: string;
  state: string;
  cpfCnpj: string;
  documents: Partial<Record<HostDocumentType, LocalFile>>;
  // O que o back-end já tem (rascunho retomado)
  status: HostValidationStatus | null;
  // CPF ou CNPJ mascarado (***4725): o valor inteiro nunca volta do servidor
  savedCpfCnpj: string | null;
  serverPhotos: { id: string; url: string }[];
  serverDocumentTypes: HostDocumentType[];
  // Arquivos já enviados nesta sessão: "campo|endereço do arquivo" -> id no servidor.
  // Em nova tentativa, o que já subiu não sobe de novo
  uploaded: Record<string, string>;
  // Erros do servidor por campo da tela. O campo some quando o Host o corrige
  serverErrors: Record<string, string>;
};

export const EMPTY_HOST_REGISTRATION: HostRegistrationData = {
  structure: 'house',
  hasOtherPets: false,
  acceptedSizes: [],
  acceptedSpecies: [],
  capacity: '',
  experience: null,
  acceptsSenior: true,
  acceptsNeutered: false,
  description: '',
  coverPhoto: null,
  roomPhotos: {},
  zipCode: '',
  zipLookedUp: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  neighborhoodManual: false,
  city: '',
  state: '',
  cpfCnpj: '',
  documents: {},
  status: null,
  savedCpfCnpj: null,
  serverPhotos: [],
  serverDocumentTypes: [],
  uploaded: {},
  serverErrors: {},
};

type HostRegistrationContextValue = {
  data: HostRegistrationData;
  update: (changes: Partial<HostRegistrationData>) => void;
  // Tira o erro do servidor de um campo, quando o Host o corrige
  clearServerError: (field: string) => void;
  reset: () => void;
};

const HostRegistrationContext = createContext<HostRegistrationContextValue | null>(null);

type HostRegistrationProviderProps = {
  children: ReactNode;
  // Usado nos testes para começar com um cadastro em andamento
  initialData?: HostRegistrationData;
};

// O cadastro em andamento fica só em memória, entre as telas das etapas. Some ao concluir,
// ao sair da conta e ao fechar o app. Fotos e documentos são só os endereços locais, nada vai para log
export function HostRegistrationProvider({
  children,
  initialData = EMPTY_HOST_REGISTRATION,
}: HostRegistrationProviderProps) {
  const { currentUser } = useSession();
  const [data, setData] = useState<HostRegistrationData>(initialData);

  const update = useCallback((changes: Partial<HostRegistrationData>) => {
    setData((current) => ({ ...current, ...changes }));
  }, []);
  const clearServerError = useCallback((field: string) => {
    setData((current) => {
      if (!current.serverErrors[field]) {
        return current;
      }
      const serverErrors = { ...current.serverErrors };
      delete serverErrors[field];
      return { ...current, serverErrors };
    });
  }, []);
  const reset = useCallback(() => setData(EMPTY_HOST_REGISTRATION), []);

  // Sem usuário (sair da conta ou sessão expirada), endereço, CPF e fotos não ficam para o próximo login
  useEffect(() => {
    if (!currentUser) {
      reset();
    }
  }, [currentUser, reset]);

  return (
    <HostRegistrationContext.Provider value={{ data, update, clearServerError, reset }}>
      {children}
    </HostRegistrationContext.Provider>
  );
}

export function useHostRegistration() {
  const context = useContext(HostRegistrationContext);
  if (!context) {
    throw new Error('useHostRegistration precisa estar dentro de HostRegistrationProvider');
  }
  return context;
}
