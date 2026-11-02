import axios from 'axios';

import { backendApi, SessionExpiredError } from './api';

export type ReservationInput = {
  serviceId: string;
  petId: string;
  // 2026-06-25
  startDate: string;
  endDate: string;
};

// Resposta do POST /api/v1/reservations (#494)
export type Reservation = {
  id: string;
  status: string;
  hostId: string;
  serviceId: string;
  petId: string;
  startDate: string;
  endDate: string;
  dailyPrice: number;
  totalValue: number;
  notes: string | null;
  createdAt: string;
};

// Cria a solicitação de hospedagem. A mesma chave em todas as tentativas da mesma intenção faz o
// back-end devolver a solicitação já criada em vez de criar outra (toque duplo, rede que caiu)
export async function createReservation(
  input: ReservationInput,
  idempotencyKey: string,
): Promise<Reservation> {
  const { data } = await backendApi.post<Reservation>('/api/v1/reservations', input, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return data;
}

// Chave nova para cada intenção de solicitar. O back-end aceita até 100 letras, números, - ou _
export function newIdempotencyKey(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export type ReservationField = 'pet' | 'dates';

// O que a tela faz com cada erro: um modal do design ou mensagens embaixo dos campos
export type ReservationError =
  | { kind: 'unavailable' }
  | { kind: 'profile-incomplete' }
  | { kind: 'session-expired' }
  | { kind: 'fields'; fields: Partial<Record<ReservationField, string>> }
  | { kind: 'generic' };

// Campos do back-end que aparecem na tela
const FIELD_OF: Record<string, ReservationField> = {
  petId: 'pet',
  startDate: 'dates',
  endDate: 'dates',
};

const FIELD_MESSAGE: Record<ReservationField, string> = {
  pet: 'Esse pet não pode ser hospedado aqui. Escolha outro.',
  dates: 'Confira as datas da estadia.',
};

type ApiErrorBody = {
  code?: string;
  details?: { field: string; message: string }[];
};

// Traduz o envelope de erro do back-end ({ code, message, details }) para a tela
export function toReservationError(error: unknown): ReservationError {
  if (error instanceof SessionExpiredError) {
    // O cliente da API já levou ao login
    return { kind: 'session-expired' };
  }
  if (!axios.isAxiosError(error) || !error.response) {
    return { kind: 'generic' };
  }
  const body = (error.response.data ?? {}) as ApiErrorBody;

  switch (body.code) {
    case 'PERIOD_UNAVAILABLE':
    case 'NO_CAPACITY':
      return { kind: 'unavailable' };
    case 'PROFILE_INCOMPLETE':
      return { kind: 'profile-incomplete' };
    case 'PET_ALREADY_BOOKED':
      return { kind: 'fields', fields: { pet: 'Esse pet já tem hospedagem nesse período.' } };
    case 'VALIDATION_ERROR': {
      const fields: Partial<Record<ReservationField, string>> = {};
      for (const detail of body.details ?? []) {
        const field = FIELD_OF[detail.field];
        if (field) {
          fields[field] = FIELD_MESSAGE[field];
        }
      }
      // Erro num campo que a tela não mostra (serviço, chave): não há o que o Tutor corrigir
      return Object.keys(fields).length > 0 ? { kind: 'fields', fields } : { kind: 'generic' };
    }
    default:
      return { kind: 'generic' };
  }
}
