import { TutorReservation } from './tutorReservations';

export type TrackingStepStatus = 'completed' | 'current' | 'upcoming';

export type TrackingStep = {
  id: string;
  title: string;
  description: string;
  date: string | null;
  status: TrackingStepStatus;
};

export type TutorTracking = {
  reservation: TutorReservation;
  steps: TrackingStep[];
};

// Contrato provisório da futura API de acompanhamento (#543).
// A TSK-01 do backend ainda não está disponível.
const MOCK_STEPS: TrackingStep[] = [
  {
    id: 'requested',
    title: 'Solicitação enviada',
    description: 'O Host recebeu sua solicitação de hospedagem.',
    date: '18/11/2026',
    status: 'completed',
  },
  {
    id: 'accepted',
    title: 'Solicitação aceita',
    description: 'O Host confirmou que pode receber seu pet.',
    date: '19/11/2026',
    status: 'completed',
  },
  {
    id: 'check-in',
    title: 'Hospedagem em andamento',
    description: 'Seu pet está sob os cuidados do Host.',
    date: '20/11/2026',
    status: 'current',
  },
  {
    id: 'check-out',
    title: 'Check-out',
    description: 'A hospedagem será encerrada na data combinada.',
    date: '23/11/2026',
    status: 'upcoming',
  },
];

// TODO(#543): substituir pela chamada HTTP quando o backend publicar a TSK-01.
export async function getTutorTracking(id: string): Promise<TutorTracking> {
  const reservation: TutorReservation = {
    id,
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
  };
  return { reservation, steps: MOCK_STEPS };
}
