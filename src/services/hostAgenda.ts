import axios from 'axios';

import { backendApi } from './api';

export type AgendaStatus = 'free' | 'blocked' | 'occupied';

export type AgendaDay = {
  date: string;
  status: AgendaStatus;
  occupied: number;
  block?: { id: string; reason: string | null };
};

export type HostAgenda = {
  startDate: string;
  endDate: string;
  capacity: number;
  days: AgendaDay[];
};

export type AgendaBlockInput = {
  startDate: string;
  endDate: string;
  reason?: string;
};

export type AgendaBlock = { id: string; date: string; reason: string | null };

export async function getHostAgenda(startDate: string, endDate: string): Promise<HostAgenda> {
  const { data } = await backendApi.get<HostAgenda>('/api/v1/me/host/agenda', {
    params: { startDate, endDate },
  });
  return data;
}

export async function blockHostAgenda(input: AgendaBlockInput): Promise<AgendaBlock[]> {
  const { data } = await backendApi.post<{ items: AgendaBlock[] }>(
    '/api/v1/me/host/agenda/blocks',
    { ...input, reason: input.reason?.trim() || undefined },
  );
  return data.items;
}

export async function unblockHostAgendaDay(id: string): Promise<void> {
  await backendApi.delete(`/api/v1/me/host/agenda/blocks/${encodeURIComponent(id)}`);
}

export function hostAgendaErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 403) {
    return 'Esta área está disponível apenas para prestadores de serviço.';
  }
  if (axios.isAxiosError(error) && !error.response) {
    return 'Não foi possível conectar. Verifique sua internet e tente de novo.';
  }
  const code = axios.isAxiosError(error)
    ? (error.response?.data as { code?: string } | undefined)?.code
    : undefined;
  if (code === 'PERIOD_OCCUPIED') {
    return 'Há hospedagem no período; nenhum dia foi bloqueado.';
  }
  if (code === 'NOT_FOUND') {
    return 'O bloqueio não foi encontrado. Atualize a agenda e tente de novo.';
  }
  return 'Não foi possível atualizar a agenda. Tente de novo.';
}
