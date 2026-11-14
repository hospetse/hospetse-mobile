import type { PetSize } from './search';

export type PetSpecies = 'dog' | 'cat';

export const PET_SPECIES: { value: PetSpecies; label: string }[] = [
  { value: 'dog', label: 'Cão' },
  { value: 'cat', label: 'Gato' },
];

export const PET_SIZE_OPTIONS: { value: PetSize; label: string }[] = [
  { value: 'small', label: 'Pequeno' },
  { value: 'medium', label: 'Médio' },
  { value: 'large', label: 'Grande' },
];

export const PET_SPECIES_LABEL: Record<PetSpecies, string> = {
  dog: 'Cão',
  cat: 'Gato',
};

export const PET_SIZE_LABEL: Record<PetSize, string> = {
  small: 'Pequeno',
  medium: 'Médio',
  large: 'Grande',
};
