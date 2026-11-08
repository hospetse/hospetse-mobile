import axios from 'axios';

import { backendApi } from './api';

export type HostPendingReservation = {
  id: string;
  status: 'requested';
  serviceId: string;
  startDate: string;
  endDate: string | null;
  dailyPrice: number | null;
  totalValue: number;
  notes: string | null;
  createdAt: string;
  tutor: { name: string };
  pet: {
    name: string;
    species: string;
    size: string | null;
    breed: string | null;
    medicalNotes: string | null;
    behavioralNotes: string | null;
  };
};

export type HostPendingReservationsPage = {
  items: HostPendingReservation[];
  page: number;
  pageSize: number;
  total: number;
};

export type HostDecision = {
  id: string;
  status: 'awaiting_payment' | 'rejected';
  decidedAt: string;
  rejectionReason: string | null;
};

// Solicitações recebidas pelo Host. O Host vem do token, nunca de um id enviado pelo app.
export async function listPendingHostReservations(
  page = 1,
  pageSize = 20,
): Promise<HostPendingReservationsPage> {
  const { data } = await backendApi.get<HostPendingReservationsPage>('/api/v1/me/host/reservations', {
    params: { status: 'requested', page, pageSize },
  });
  return data;
}

export async function acceptHostReservation(id: string): Promise<HostDecision> {
  const { data } = await backendApi.post<HostDecision>(`/api/v1/me/host/reservations/${encodeURIComponent(id)}/accept`);
  return data;
}

export async function rejectHostReservation(id: string, reason: string): Promise<HostDecision> {
  const { data } = await backendApi.post<HostDecision>(
    `/api/v1/me/host/reservations/${encodeURIComponent(id)}/reject`,
    { reason: reason.trim() },
  );
  return data;
}

export function hostDecisionErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error) || !error.response) {
    return 'Não foi possível conectar. Verifique sua internet e tente de novo.';
  }
  const code = (error.response.data as { code?: string } | undefined)?.code;
  switch (code) {
    case 'RESERVATION_ALREADY_DECIDED':
      return 'A solicitação já foi decidida por outro processo. Atualize a fila para conferir.';
    case 'NO_CAPACITY':
      return 'Não há vaga disponível para todo o período dessa solicitação.';
    case 'PET_ALREADY_BOOKED':
      return 'Esse pet já foi aceito em outra hospedagem no mesmo período.';
    case 'PERIOD_UNAVAILABLE':
      return 'O período foi bloqueado na agenda do Host e não está mais disponível.';
    case 'NOT_FOUND':
      return 'Solicitação não encontrada.';
    default:
      return 'Não foi possível atualizar a solicitação. Tente de novo.';
  }
}
