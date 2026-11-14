// Contrato provisório da futura lista de contratações do Tutor (#534).
// A API HSP-PBI-046-TSK-01 ainda não está disponível; os dados abaixo permitem validar a tela.
export type TutorReservationStatus =
  | 'awaiting_payment'
  | 'requested'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type TutorReservation = {
  id: string;
  status: TutorReservationStatus;
  hostId: string;
  hostName: string;
  hostLocation: string;
  hostPicture: string | null;
  petId: string;
  petName: string;
  startDate: string;
  endDate: string;
  dailyPrice: number;
  totalValue: number;
};

const MOCK_RESERVATIONS: TutorReservation[] = [
  {
    id: 'reservation-awaiting-payment',
    status: 'awaiting_payment',
    hostId: 'host-demo-1',
    hostName: 'Recanto Pata Mansa',
    hostLocation: 'Maringá, Paraná',
    hostPicture: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600',
    petId: 'pet-demo-1',
    petName: 'Paçoca',
    startDate: '2026-12-18',
    endDate: '2026-12-21',
    dailyPrice: 250,
    totalValue: 750,
  },
  {
    id: 'reservation-in-progress',
    status: 'in_progress',
    hostId: 'host-demo-2',
    hostName: 'Casa do Aconchego',
    hostLocation: 'Londrina, Paraná',
    hostPicture: null,
    petId: 'pet-demo-2',
    petName: 'Luna',
    startDate: '2026-11-20',
    endDate: '2026-11-23',
    dailyPrice: 180,
    totalValue: 540,
  },
];

export type TutorReservationsPage = {
  items: TutorReservation[];
  total: number;
};

// TODO(#534): substituir pelo GET da TSK-01 quando o backend publicar o contrato.
export async function listMyReservations(): Promise<TutorReservationsPage> {
  return { items: MOCK_RESERVATIONS, total: MOCK_RESERVATIONS.length };
}
