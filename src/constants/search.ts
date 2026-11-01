// Valores da busca e dos filtros, usados pelas telas e pelos dados de exemplo

export type ServiceType = 'Pet Hotel' | 'Pet Walker' | 'Pet Sitter';

export const SERVICES: ServiceType[] = ['Pet Hotel', 'Pet Walker', 'Pet Sitter'];

// Nome no plural para o título dos resultados (mesma escrita dos chips da Home)
export const SERVICE_PLURAL: Record<ServiceType, string> = {
  'Pet Hotel': 'Pet-Hotéis',
  'Pet Walker': 'Pet-Walkers',
  'Pet Sitter': 'Pet-Sitters',
};

export const SERVICE_SINGULAR: Record<ServiceType, string> = {
  'Pet Hotel': 'Pet-Hotel',
  'Pet Walker': 'Pet-Walker',
  'Pet Sitter': 'Pet-Sitter',
};

// Mesmos valores de porte do back-end (accepts.sizes)
export type PetSize = 'small' | 'medium' | 'large';

export const PET_SIZES: { value: PetSize; label: string }[] = [
  { value: 'small', label: 'Pequeno' },
  { value: 'medium', label: 'Médio' },
  { value: 'large', label: 'Grande' },
];

export type AmenityFilter = 'green-area' | 'neutered-only' | 'oral-medication';

// Faixa de preço por diária ou passeio, em reais
export const PRICE_MIN = 50;
export const PRICE_MAX = 400;
export const PRICE_STEP = 10;
