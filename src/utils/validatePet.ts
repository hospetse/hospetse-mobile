import type { PetSize } from '../constants/search';
import type { PetSpecies } from '../constants/pets';

export type PetFormValues = {
  name: string;
  species: PetSpecies | null;
  breed: string;
  size: PetSize | null;
  birthDate: string;
  medicalNotes: string;
  behavioralNotes: string;
};

export type PetFormErrors = Partial<Record<keyof PetFormValues, string>>;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value: string): boolean {
  if (!DATE.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validatePet(values: PetFormValues, today = new Date()): PetFormErrors {
  const errors: PetFormErrors = {};
  const name = values.name.trim();
  const breed = values.breed.trim();
  const birthDate = values.birthDate.trim();
  const medicalNotes = values.medicalNotes.trim();
  const behavioralNotes = values.behavioralNotes.trim();

  if (!name) {
    errors.name = 'Informe o nome do pet.';
  } else if (name.length > 255) {
    errors.name = 'O nome pode ter no máximo 255 caracteres.';
  }

  if (!values.species) {
    errors.species = 'Escolha a espécie do pet.';
  }

  if (breed.length > 100) {
    errors.breed = 'A raça pode ter no máximo 100 caracteres.';
  }

  if (birthDate) {
    if (!isRealDate(birthDate)) {
      errors.birthDate = 'Use uma data válida no formato AAAA-MM-DD.';
    } else {
      const currentDate = new Date(today);
      const todayIso = currentDate.toISOString().slice(0, 10);
      if (birthDate > todayIso) {
        errors.birthDate = 'A data de nascimento não pode estar no futuro.';
      }
    }
  }

  if (medicalNotes.length > 2000) {
    errors.medicalNotes = 'As observações podem ter no máximo 2.000 caracteres.';
  }

  if (behavioralNotes.length > 2000) {
    errors.behavioralNotes = 'As observações podem ter no máximo 2.000 caracteres.';
  }

  return errors;
}

export function hasPetErrors(errors: PetFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
