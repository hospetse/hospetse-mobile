import type { ServiceType } from '../constants/search';
import { addMockReservation, TutorReservation } from './tutorReservations';

// Contrato provisório da solicitação de visita e passeio (#565).
// A API HSP-PBI-043-TSK-01 ainda não está disponível, então a tela grava no
// mesmo modelo simulado usado por Minhas contratações.
export type ServiceRequestInput = {
  providerId: string;
  providerName: string;
  providerLocation: string;
  providerPicture: string | null;
  serviceType: Exclude<ServiceType, 'Pet Hotel'>;
  petId: string;
  petName: string;
  date: string;
  time: string;
  address: string;
  accessInstructions: string | null;
  medication: string | null;
  price: number;
};

export type ServiceRequest = TutorReservation & {
  serviceType: Exclude<ServiceType, 'Pet Hotel'>;
  scheduledTime: string;
  address: string;
  accessInstructions: string | null;
  medication: string | null;
};

const requests = new Map<string, ServiceRequest>();
let sequence = 0;

// A mesma chave representa a mesma intenção de contratação, inclusive após uma nova tentativa.
export function newServiceRequestKey(): string {
  return `service-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Simula o POST que será integrado quando o backend publicar o contrato.
export async function createServiceRequest(
  input: ServiceRequestInput,
  idempotencyKey: string,
): Promise<ServiceRequest> {
  const previous = requests.get(idempotencyKey);
  if (previous) {
    return previous;
  }

  const request: ServiceRequest = {
    id: `service-request-${++sequence}`,
    status: 'requested',
    hostId: input.providerId,
    serviceId: `${input.serviceType.toLowerCase().replace(' ', '-')}-mock`,
    petId: input.petId,
    startDate: input.date,
    endDate: input.date,
    dailyPrice: input.price,
    totalValue: input.price,
    notes: input.accessInstructions ?? input.medication,
    createdAt: new Date().toISOString(),
    serviceType: input.serviceType,
    scheduledTime: input.time,
    address: input.address,
    accessInstructions: input.accessInstructions,
    medication: input.medication,
    hostName: input.providerName,
    hostLocation: input.providerLocation,
    hostPicture: input.providerPicture,
    petName: input.petName,
  };

  requests.set(idempotencyKey, request);
  addMockReservation(request);
  return request;
}

export function clearMockServiceRequests(): void {
  requests.clear();
  sequence = 0;
}
