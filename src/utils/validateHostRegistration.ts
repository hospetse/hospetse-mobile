import {
  CAPACITY_MAX,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  HostDocumentType,
  PetSpecies,
} from '../constants/hostRegistration';
import type { PetSize } from '../constants/search';
import { isValidCnpj, isValidCpf } from './cpfCnpj';
import { onlyDigits } from './formatZipCode';

// Cada campo com problema recebe a sua mensagem. Campo sem erro fica de fora.
// Espelha as regras do back-end (#325), mas não substitui: o servidor valida de novo

export type HostSpaceValues = {
  acceptedSizes: PetSize[];
  acceptedSpecies: PetSpecies[];
  capacity: string;
  description: string;
};

export type HostSpaceErrors = {
  acceptedSizes?: string;
  acceptedSpecies?: string;
  capacity?: string;
  description?: string;
};

export function validateHostSpace(values: HostSpaceValues): HostSpaceErrors {
  const errors: HostSpaceErrors = {};

  if (values.acceptedSpecies.length === 0) {
    errors.acceptedSpecies = 'Escolha ao menos uma espécie.';
  }

  if (values.acceptedSizes.length === 0) {
    errors.acceptedSizes = 'Escolha ao menos um porte aceito.';
  }

  const capacity = values.capacity.trim();
  if (capacity === '') {
    errors.capacity = 'Informe quantos pets você recebe ao mesmo tempo.';
  } else if (!/^\d+$/.test(capacity) || Number(capacity) < 1 || Number(capacity) > CAPACITY_MAX) {
    errors.capacity = `Informe um número de 1 a ${CAPACITY_MAX}.`;
  }

  const length = values.description.trim().length;
  if (length === 0) {
    errors.description = 'Escreva a apresentação do cuidador.';
  } else if (length < DESCRIPTION_MIN) {
    errors.description = `Escreva pelo menos ${DESCRIPTION_MIN} caracteres (faltam ${DESCRIPTION_MIN - length}).`;
  } else if (length > DESCRIPTION_MAX) {
    errors.description = `A apresentação pode ter no máximo ${DESCRIPTION_MAX} caracteres.`;
  }

  return errors;
}

export type HostLocationValues = {
  coverPhoto: string | null;
  // O servidor já tem fotos deste cadastro (rascunho retomado)
  hasServerPhotos: boolean;
  zipCode: string;
  zipLookedUp: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
};

export type HostLocationErrors = {
  coverPhoto?: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
};

export function validateHostLocation(values: HostLocationValues): HostLocationErrors {
  const errors: HostLocationErrors = {};

  if (!values.coverPhoto && !values.hasServerPhotos) {
    errors.coverPhoto = 'Envie a foto principal do seu espaço.';
  }

  const zipDigits = onlyDigits(values.zipCode);
  if (zipDigits.length !== 8) {
    errors.zipCode = 'Informe um CEP com 8 dígitos.';
  } else if (zipDigits !== values.zipLookedUp) {
    errors.zipCode = 'Toque em Buscar para preencher o endereço.';
  }

  const street = values.street.trim();
  if (street === '') {
    errors.street = 'Informe a rua ou o logradouro.';
  } else if (street.length > 255) {
    errors.street = 'A rua pode ter no máximo 255 caracteres.';
  }

  const number = values.number.trim();
  if (number === '') {
    errors.number = 'Informe o número.';
  } else if (number.length > 20) {
    errors.number = 'O número pode ter no máximo 20 caracteres.';
  }

  if (values.complement.trim().length > 100) {
    errors.complement = 'O complemento pode ter no máximo 100 caracteres.';
  }

  const neighborhood = values.neighborhood.trim();
  if (neighborhood === '') {
    errors.neighborhood = 'Informe o bairro.';
  } else if (neighborhood.length > 100) {
    errors.neighborhood = 'O bairro pode ter no máximo 100 caracteres.';
  }

  return errors;
}

export type HostDocumentsValues = {
  cpfCnpj: string;
  // O servidor já guarda um CPF ou CNPJ deste cadastro
  hasSavedCpfCnpj: boolean;
  // Tipos de documento que já existem (escolhidos agora ou enviados antes)
  hasDocument: Record<HostDocumentType, boolean>;
};

export type HostDocumentsErrors = {
  cpfCnpj?: string;
  identity?: string;
  proof_of_address?: string;
  cnpj_card?: string;
};

export function validateHostDocuments(values: HostDocumentsValues): HostDocumentsErrors {
  const errors: HostDocumentsErrors = {};

  const digits = onlyDigits(values.cpfCnpj);
  if (digits === '') {
    if (!values.hasSavedCpfCnpj) {
      errors.cpfCnpj = 'Informe seu CPF ou CNPJ.';
    }
  } else if (digits.length === 11) {
    if (!isValidCpf(digits)) {
      errors.cpfCnpj = 'CPF inválido.';
    }
  } else if (digits.length === 14) {
    if (!isValidCnpj(digits)) {
      errors.cpfCnpj = 'CNPJ inválido.';
    }
  } else {
    errors.cpfCnpj = 'Informe um CPF (11 dígitos) ou um CNPJ (14 dígitos).';
  }

  if (!values.hasDocument.identity) {
    errors.identity = 'Envie o documento de identidade.';
  }
  if (!values.hasDocument.proof_of_address) {
    errors.proof_of_address = 'Envie o comprovante de endereço.';
  }
  if (digits.length === 14 && !values.hasDocument.cnpj_card) {
    errors.cnpj_card = 'Envie o cartão CNPJ.';
  }

  return errors;
}

export function hasHostErrors(errors: object): boolean {
  return Object.keys(errors).length > 0;
}
