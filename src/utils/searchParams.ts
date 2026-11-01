import type { SearchFilters } from '../components/SearchModal';
import { SERVICES, ServiceType } from '../constants/search';
import { toIsoDate } from './calendar';

// Parâmetros da rota /resultados. Só valores leves (texto, data e id), como pede o steering
export type SearchRouteParams = {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  service?: string;
  petId?: string;
};

// Converte a busca do modal em parâmetros da rota, sem os campos vazios
export function toSearchParams(filters: SearchFilters): SearchRouteParams {
  const params: SearchRouteParams = {};
  if (filters.city.trim()) {
    params.city = filters.city.trim();
  }
  if (filters.checkIn) {
    params.checkIn = toIsoDate(filters.checkIn);
  }
  if (filters.checkOut) {
    params.checkOut = toIsoDate(filters.checkOut);
  }
  if (filters.service) {
    params.service = filters.service;
  }
  if (filters.petId) {
    params.petId = filters.petId;
  }
  return params;
}

// Serviço que veio na rota, ou null se não for um dos conhecidos
export function serviceFromParam(value: string | undefined): ServiceType | null {
  return SERVICES.find((service) => service === value) ?? null;
}
