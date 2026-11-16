import * as DocumentPicker from 'expo-document-picker';

import {
  DOCUMENT_MAX_BYTES,
  DOCUMENT_MIME_TYPES,
  LocalFile,
} from '../constants/hostRegistration';

// O documento passa do limite de tamanho do back-end
export class DocumentTooLargeError extends Error {
  constructor() {
    super('DOCUMENT_TOO_LARGE');
  }
}

// Abre o seletor de arquivos do aparelho (PDF, JPEG ou PNG). Devolve null se o usuário cancelar
export async function pickDocument(): Promise<LocalFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: DOCUMENT_MIME_TYPES,
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];
  if (asset.size && asset.size > DOCUMENT_MAX_BYTES) {
    throw new DocumentTooLargeError();
  }
  return {
    uri: asset.uri,
    name: asset.name,
    mimeType: asset.mimeType ?? 'application/octet-stream',
  };
}
