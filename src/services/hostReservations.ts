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
