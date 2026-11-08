import type { PetSize } from './search';

// Valores do cadastro de Host (#326), usados pelas telas, pelo estado e pela validação

// Apresentação do cuidador: mínimo e máximo do protótipo
export const DESCRIPTION_MIN = 80;
export const DESCRIPTION_MAX = 500;

// Mesmo limite do back-end para cada foto (5 MB)
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export type SpaceStructure = 'house' | 'apartment' | 'house_with_yard';

export const SPACE_STRUCTURES: { value: SpaceStructure; label: string }[] = [
  { value: 'house', label: 'Casa' },
  { value: 'apartment', label: 'Apartamento' },
  { value: 'house_with_yard', label: 'Casa com quintal' },
];

export type Experience = 'under_2' | '2_to_5' | 'over_5';

export const EXPERIENCES: { value: Experience; label: string }[] = [
  { value: 'under_2', label: '< 2 anos' },
  { value: '2_to_5', label: '2 a 5 anos' },
  { value: 'over_5', label: '+ 5 anos' },
];

// Faixa de peso de cada porte, como no protótipo. Os valores de porte são os mesmos do back-end
export const SIZE_HINTS: Record<PetSize, string> = {
  small: 'Até 10kg',
  medium: '10 a 20kg',
  large: '+20kg',
};

export type RoomKey = 'living_room' | 'pantry' | 'yard';

export const ROOMS: { key: RoomKey; label: string }[] = [
  { key: 'living_room', label: 'Sala' },
  { key: 'pantry', label: 'Copa' },
  { key: 'yard', label: 'Quintal' },
];

// Espécies aceitas: mesmos valores do back-end (acceptedSpecies)
export type PetSpecies = 'dog' | 'cat';

export const PET_SPECIES_OPTIONS: { value: PetSpecies; label: string }[] = [
  { value: 'dog', label: 'Cães' },
  { value: 'cat', label: 'Gatos' },
];

// Quantos pets o Host recebe ao mesmo tempo (limite do back-end)
export const CAPACITY_MAX = 1000;

// Documentos do cadastro: mesmos tipos do back-end (provider_documents.type)
export type HostDocumentType = 'identity' | 'proof_of_address' | 'cnpj_card';

export const DOCUMENT_LABELS: Record<HostDocumentType, string> = {
  identity: 'Documento de identidade (RG ou CNH)',
  proof_of_address: 'Comprovante de endereço',
  cnpj_card: 'Cartão CNPJ',
};

// PDF, JPEG ou PNG, até 10 MB (limite do back-end)
export const DOCUMENT_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;

// Arquivo escolhido no aparelho, ainda não enviado
export type LocalFile = {
  uri: string;
  name: string;
  mimeType: string;
};
