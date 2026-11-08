import axios from 'axios';
import { Platform } from 'react-native';

import type { HostDocumentType, PetSpecies } from '../constants/hostRegistration';
import type { PetSize } from '../constants/search';
import type { HostValidationStatus } from '../context/HostRegistrationContext';
import { backendApi, SessionExpiredError } from './api';

// Cadastro do Host no back-end (#325). Contrato: docs/openapi.yaml do back-end

export type HostAddressPayload = {
  zipCode: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
};

// Corpo do PUT /api/v1/me/host. Campo omitido fica como está no servidor
export type HostDraftInput = {
  providerType: 'hotel';
  name: string;
  description?: string;
  cpfCnpj?: string;
  address?: HostAddressPayload;
  capacity?: number;
  acceptedSpecies?: PetSpecies[];
  acceptedSizes?: PetSize[];
};

export type HostProfile = {
  id: string;
  validationStatus: HostValidationStatus;
  providerType: string;
  name: string;
  description: string | null;
  // Só os 4 últimos dígitos: o CPF ou CNPJ inteiro nunca volta
  cpfCnpjMasked: string | null;
  address: HostAddressPayload | null;
  capacity: number | null;
  acceptedSpecies: string[];
  acceptedSizes: string[];
  acceptedBreeds: string[];
  documents: { id: string; type: string }[];
  photos: { id: string; url: string }[];
};

// Arquivo pronto para subir: endereço local, nome e tipo
export type UploadFile = {
  uri: string;
  name: string;
  type: string;
};

type ApiErrorBody = {
  code?: string;
  message?: string;
  details?: { field: string; message: string }[];
};

// Tempo maior que o padrão do cliente: foto de 5 MB em rede lenta passa dos 15 s
const UPLOAD_TIMEOUT_MS = 60000;

// Lê o cadastro do usuário para retomar o rascunho. Devolve null quando ele ainda não começou
export async function getHostProfile(): Promise<HostProfile | null> {
  try {
    const { data } = await backendApi.get<HostProfile>('/api/v1/me/host');
    return data;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 404 &&
      (error.response.data as ApiErrorBody | undefined)?.code === 'NOT_FOUND'
    ) {
      return null;
    }
    throw error;
  }
}

// Cria o rascunho na primeira chamada e atualiza nas seguintes
export async function saveHostDraft(input: HostDraftInput): Promise<HostProfile> {
  const { data } = await backendApi.put<HostProfile>('/api/v1/me/host', input);
  return data;
}

// Envia o rascunho para validação. O perfil fica pendente até o Administrador decidir
export async function submitHostProfile(): Promise<HostProfile> {
  const { data } = await backendApi.post<HostProfile>('/api/v1/me/host/submit');
  return data;
}

async function buildForm(file: UploadFile, fields: Record<string, string> = {}): Promise<FormData> {
  const form = new FormData();
  // O back-end lê um campo de texto (type) e um arquivo (file), nessa ordem
  for (const [name, value] of Object.entries(fields)) {
    form.append(name, value);
  }
  if (Platform.OS === 'web') {
    const blob = await (await fetch(file.uri)).blob();
    form.append('file', blob, file.name);
  } else {
    form.append('file', { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
  }
  return form;
}

function progressReporter(onProgress?: (percent: number) => void) {
  return (event: { loaded: number; total?: number }) => {
    if (onProgress && event.total) {
      onProgress(Math.min(100, Math.round((event.loaded * 100) / event.total)));
    }
  };
}

// Um arquivo por requisição, para mostrar o progresso e repetir só o que falhou
export async function uploadHostPhoto(
  file: UploadFile,
  onProgress?: (percent: number) => void,
): Promise<{ id: string }> {
  const { data } = await backendApi.post<{ id: string }>(
    '/api/v1/me/host/photos',
    await buildForm(file),
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: UPLOAD_TIMEOUT_MS,
      onUploadProgress: progressReporter(onProgress),
    },
  );
  return data;
}

export async function uploadHostDocument(
  type: HostDocumentType,
  file: UploadFile,
  onProgress?: (percent: number) => void,
): Promise<{ id: string }> {
  const { data } = await backendApi.post<{ id: string }>(
    '/api/v1/me/host/documents',
    await buildForm(file, { type }),
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: UPLOAD_TIMEOUT_MS,
      onUploadProgress: progressReporter(onProgress),
    },
  );
  return data;
}

// O que a tela faz com cada erro do cadastro
export type HostError =
  | { kind: 'session-expired' }
  // O cadastro já foi enviado e não edita mais
  | { kind: 'already-submitted' }
  // Campos que o Host pode corrigir (VALIDATION_ERROR com details)
  | { kind: 'fields'; details: { field: string; message: string }[] }
  // Limite de arquivos atingido: repetir não adianta
  | { kind: 'limit'; message: string }
  // Armazenamento de arquivos fora do ar, ou dois envios ao mesmo tempo: pode repetir
  | { kind: 'retry' }
  // Sem rede ou timeout: pode repetir
  | { kind: 'network' }
  | { kind: 'generic' };

// Traduz o envelope de erro do back-end ({ code, message, details }) para a tela
export function toHostError(error: unknown): HostError {
  if (error instanceof SessionExpiredError) {
    // O cliente da API já levou ao login
    return { kind: 'session-expired' };
  }
  if (!axios.isAxiosError(error)) {
    return { kind: 'generic' };
  }
  if (!error.response) {
    return { kind: 'network' };
  }

  const body = (error.response.data ?? {}) as ApiErrorBody;
  switch (body.code) {
    case 'HOST_ALREADY_SUBMITTED':
      return { kind: 'already-submitted' };
    case 'VALIDATION_ERROR':
      return body.details && body.details.length > 0
        ? { kind: 'fields', details: body.details }
        : { kind: 'generic' };
    case 'FILE_LIMIT_REACHED':
      return { kind: 'limit', message: body.message ?? 'Limite de arquivos atingido.' };
    case 'STORAGE_UNAVAILABLE':
    case 'HOST_DRAFT_CONFLICT':
      return { kind: 'retry' };
    default:
      return { kind: 'generic' };
  }
}
