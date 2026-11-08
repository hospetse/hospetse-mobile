import {
  DOCUMENT_LABELS,
  HostDocumentType,
  PetSpecies,
  ROOMS,
} from '../constants/hostRegistration';
import { PetSize } from '../constants/search';
import type { HostRegistrationData } from '../context/HostRegistrationContext';
import type { HostDraftInput, HostProfile, UploadFile } from '../services/host-registration';
import { formatZipCode, onlyDigits } from './formatZipCode';

const SPECIES: PetSpecies[] = ['dog', 'cat'];
const SIZES: PetSize[] = ['small', 'medium', 'large'];
const DOCUMENT_TYPES: HostDocumentType[] = ['identity', 'proof_of_address', 'cnpj_card'];

// Rascunho da etapa 1: só o espaço. O nome vem do cadastro da conta
export function buildSpaceDraft(data: HostRegistrationData, name: string): HostDraftInput {
  return {
    providerType: 'hotel',
    name,
    description: data.description.trim(),
    capacity: Number(data.capacity),
    acceptedSpecies: data.acceptedSpecies,
    acceptedSizes: data.acceptedSizes,
  };
}

// Rascunho completo, enviado antes das fotos e da submissão. Sem CPF ou CNPJ novo, o do servidor fica
export function buildFullDraft(data: HostRegistrationData, name: string): HostDraftInput {
  const cpfCnpj = onlyDigits(data.cpfCnpj);
  return {
    ...buildSpaceDraft(data, name),
    address: {
      zipCode: onlyDigits(data.zipCode),
      street: data.street.trim(),
      number: data.number.trim(),
      complement: data.complement.trim() === '' ? null : data.complement.trim(),
      neighborhood: data.neighborhood.trim(),
      city: data.city.trim(),
      state: data.state.trim().toUpperCase(),
    },
    ...(cpfCnpj === '' ? {} : { cpfCnpj }),
  };
}

// Um arquivo da fila de envio. A chave identifica o campo da tela
export type SubmitItem = {
  key: string;
  label: string;
  file: UploadFile;
  documentType?: HostDocumentType;
};

// Fila de envio, na ordem: a foto principal primeiro (o back-end usa a primeira como capa),
// depois os cômodos e os documentos
export function buildSubmitItems(data: HostRegistrationData): SubmitItem[] {
  const items: SubmitItem[] = [];

  // O tipo da foto é conferido pelo conteúdo no back-end; o nome e o tipo aqui só completam o formulário
  const photo = (key: string, label: string, uri: string): SubmitItem => ({
    key,
    label,
    file: { uri, name: `${key.replace(':', '-')}.jpg`, type: 'image/jpeg' },
  });

  if (data.coverPhoto) {
    items.push(photo('photo:cover', 'Foto principal', data.coverPhoto));
  }
  for (const room of ROOMS) {
    const uri = data.roomPhotos[room.key];
    if (uri) {
      items.push(photo(`photo:${room.key}`, `Foto: ${room.label}`, uri));
    }
  }
  for (const type of DOCUMENT_TYPES) {
    const file = data.documents[type];
    if (file) {
      items.push({
        key: `doc:${type}`,
        label: DOCUMENT_LABELS[type],
        documentType: type,
        file: { uri: file.uri, name: file.name, type: file.mimeType },
      });
    }
  }
  return items;
}

// Marca de "já enviado": o campo e o arquivo. Trocar o arquivo do campo exige enviar de novo
export function uploadedKey(item: SubmitItem): string {
  return `${item.key}|${item.file.uri}`;
}

// A etapa 1 está completa no servidor: dá para retomar direto na etapa 2
function isSpaceComplete(profile: HostProfile): boolean {
  return Boolean(
    profile.description &&
      profile.capacity &&
      profile.acceptedSpecies.length > 0 &&
      profile.acceptedSizes.length > 0,
  );
}

// Preenche o app com o que o back-end já tem do cadastro (retomar o rascunho)
export function profileToRegistration(profile: HostProfile): Partial<HostRegistrationData> {
  const address = profile.address;
  return {
    status: profile.validationStatus,
    description: profile.description ?? '',
    capacity: profile.capacity ? String(profile.capacity) : '',
    acceptedSpecies: profile.acceptedSpecies.filter((item): item is PetSpecies =>
      SPECIES.includes(item as PetSpecies),
    ),
    acceptedSizes: profile.acceptedSizes.filter((item): item is PetSize =>
      SIZES.includes(item as PetSize),
    ),
    savedCpfCnpj: profile.cpfCnpjMasked,
    serverPhotos: profile.photos,
    serverDocumentTypes: profile.documents
      .map((document) => document.type)
      .filter((type): type is HostDocumentType => DOCUMENT_TYPES.includes(type as HostDocumentType)),
    // Endereço salvo conta como CEP já buscado
    ...(address
      ? {
          zipCode: formatZipCode(address.zipCode),
          zipLookedUp: onlyDigits(address.zipCode),
          street: address.street,
          number: address.number,
          complement: address.complement ?? '',
          neighborhood: address.neighborhood,
          neighborhoodManual: false,
          city: address.city,
          state: address.state,
        }
      : {}),
  };
}

// Telas para abrir ao retomar. Rascunho com a etapa 1 pronta abre a 2, com a 1 por baixo para o voltar
export function resumeRoutes(profile: HostProfile): string[] {
  if (profile.validationStatus !== 'draft') {
    return ['/cadastro-host/analise'];
  }
  return isSpaceComplete(profile)
    ? ['/cadastro-host', '/cadastro-host/fotos']
    : ['/cadastro-host'];
}

// Só o CNPJ (14 dígitos) exige o cartão CNPJ
export function needsCnpjCard(cpfCnpj: string): boolean {
  return onlyDigits(cpfCnpj).length === 14;
}
