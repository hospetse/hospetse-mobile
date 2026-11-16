import axios from 'axios';

import { onlyDigits } from '../utils/formatZipCode';

// Consulta de CEP no ViaCEP (serviço público, sem login). Só os 8 dígitos do CEP saem do aparelho
const zipCodeApi = axios.create({
  baseURL: 'https://viacep.com.br/ws',
  timeout: 10000,
});

export type ZipCodeAddress = {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};

// O CEP tem formato válido, mas não existe
export class ZipCodeNotFoundError extends Error {
  constructor() {
    super('ZIP_CODE_NOT_FOUND');
  }
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

// Rua e bairro podem vir vazios (CEP geral de cidade pequena). Cidade e UF sempre vêm
export async function lookupZipCode(zipCode: string): Promise<ZipCodeAddress> {
  const digits = onlyDigits(zipCode);
  if (digits.length !== 8) {
    throw new ZipCodeNotFoundError();
  }

  const { data } = await zipCodeApi.get<unknown>(`/${digits}/json/`);
  if (!data || typeof data !== 'object') {
    throw new Error('Resposta de CEP inválida');
  }

  const found = data as Record<string, unknown>;
  // O ViaCEP responde 200 com { erro: true } quando o CEP não existe
  if (found.erro) {
    throw new ZipCodeNotFoundError();
  }

  const city = text(found.localidade);
  const state = text(found.uf).toUpperCase();
  if (city === '' || state.length !== 2) {
    throw new Error('Resposta de CEP inválida');
  }

  return {
    street: text(found.logradouro),
    neighborhood: text(found.bairro),
    city,
    state,
  };
}
