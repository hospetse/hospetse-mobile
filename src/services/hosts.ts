import axios from 'axios';

import { AmenityFilter, PetSize, ServiceType } from '../constants/search';
import { backendApi } from './api';

// Detalhes públicos de um Host, no formato do GET /api/v1/hosts/{id} do back-end (#479).
// A API só manda cidade e bairro: rua, número e CEP nunca aparecem (LGPD).
export type HostDetails = {
  id: string;
  name: string;
  description: string | null;
  pictureUrl: string | null;
  location: {
    city: string | null;
    neighborhood: string | null;
  };
  photos: string[];
  accepts: {
    species: string[];
    sizes: string[];
    breeds: string[];
  };
  // Do mais barato para o mais caro
  services: { id: string; name: string; price: number }[];
  reputation: {
    rating: number | null;
    reviewCount: number;
  };
};

export type AmenityIcon = 'park' | 'photo_camera' | 'air' | 'waves';

export type RoutinePeriod = 'morning' | 'afternoon' | 'night';

// Uma etapa do dia no modal de rotina (#519)
export type RoutineStep = {
  period: RoutinePeriod;
  time: string;
  title: string;
  description: string;
};

// Seções do protótipo que a API ainda NÃO tem. Ficam separadas para mostrar o que é provisório
export type HostExtras = {
  amenities: { icon: AmenityIcon; label: string }[];
  requirements: string[];
  // Resumo mostrado no detalhe
  routine: string[];
  // Etapas completas, mostradas no modal de rotina
  routineSteps: RoutineStep[];
};

export type HostPage = {
  host: HostDetails;
  extras: HostExtras;
};

// Um item do GET /api/v1/hosts/search (#476): uma oferta (serviço) de um Host
export type HostSummary = {
  hostId: string;
  serviceId: string;
  name: string;
  serviceName: string;
  dailyPrice: number;
  pictureUrl: string | null;
  location: { city: string | null; neighborhood: string | null };
  reputation: { rating: number | null; reviewCount: number };
};

export type HostSearchResult = {
  items: HostSummary[];
  total: number;
};

// Filtros que a tela de resultados tem. Os que a API ainda não aceita ficam sem efeito
export type HostSearch = {
  city: string;
  checkIn: string | null;
  checkOut: string | null;
  petId: string | null;
  // Sem efeito até o back-end filtrar por serviço (hoje todo Host é hotel)
  services: ServiceType[];
  // A API aceita um porte só: vai para a busca quando houver exatamente um marcado
  sizes: PetSize[];
  maxPrice: number | null;
  // Sem efeito até o back-end ter esse filtro
  amenities: AmenityFilter[];
};

// A API responde 404 para Host inexistente ou que não pode aparecer
export class HostNotFoundError extends Error {
  constructor() {
    super('NOT_FOUND');
  }
}

// Mais resultados do que isso pede paginação na tela, que ainda não existe
const PAGE_SIZE = 50;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// "Maringá, PR" vira "Maringá": a API compara a cidade inteira, sem o estado
export function cityName(city: string): string {
  return city.split(',')[0].trim();
}

// Parâmetros do GET /api/v1/hosts/search, só com o que a API aceita e sem os campos vazios
export function toSearchQuery(search: HostSearch): Record<string, string | number> {
  const query: Record<string, string | number> = { page: 1, pageSize: PAGE_SIZE };
  const city = cityName(search.city);
  if (city) {
    query.city = city;
  }
  // A API exige as duas datas juntas
  if (search.checkIn && search.checkOut) {
    query.startDate = search.checkIn;
    query.endDate = search.checkOut;
  }
  if (search.maxPrice !== null) {
    query.maxPrice = search.maxPrice;
  }
  // Com pet, porte e raça vêm dele; os pets de exemplo não têm id real e ficam de fora
  if (search.petId && UUID.test(search.petId)) {
    query.petId = search.petId;
  } else if (search.sizes.length === 1) {
    query.size = search.sizes[0];
  }
  return query;
}

// Busca de Hosts no back-end (#476), do mais barato para o mais caro
export async function searchHosts(search: HostSearch): Promise<HostSearchResult> {
  const { data } = await backendApi.get<HostSearchResult & { page: number; pageSize: number }>(
    '/api/v1/hosts/search',
    { params: toSearchQuery(search) },
  );
  return { items: data.items, total: data.total };
}

// PROVISÓRIO: comodidades, requisitos e rotina não existem na API. Pedir ao back-end
const SAMPLE_EXTRAS: HostExtras = {
  amenities: [
    { icon: 'park', label: 'Ar livre' },
    { icon: 'photo_camera', label: 'Monitoramento' },
    { icon: 'air', label: 'Climatização' },
    { icon: 'waves', label: 'Piscina' },
  ],
  requirements: [
    'Carteira de vacinação atualizada',
    'Controle de pulgas e carrapatos',
    'Pets sociáveis para áreas coletivas',
  ],
  routine: ['Atividades diversas', 'Alimentação', 'Descanso', 'Recreação', 'Passeio no fim da tarde'],
  routineSteps: [
    {
      period: 'morning',
      time: '08:00',
      title: 'Café da manhã e passeio',
      description: 'Ração no mesmo horário de casa, água fresca e uma caminhada leve.',
    },
    {
      period: 'afternoon',
      time: '14:00',
      title: 'Recreação e descanso',
      description: 'Brincadeiras supervisionadas na área verde e soneca num lugar fresco.',
    },
    {
      period: 'night',
      time: '20:00',
      title: 'Jantar e hora de dormir',
      description: 'Última refeição, carinho e cama no espaço climatizado.',
    },
  ],
};

// Detalhe do Host no back-end (#479). O 404 vira HostNotFoundError
export async function getHostPage(id: string): Promise<HostPage> {
  try {
    const { data } = await backendApi.get<HostDetails>(`/api/v1/hosts/${encodeURIComponent(id)}`);
    return { host: data, extras: SAMPLE_EXTRAS };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new HostNotFoundError();
    }
    throw error;
  }
}

// Preço do serviço mais barato, ou null quando o Host não tem serviço ativo
export function lowestPrice(host: HostDetails): number | null {
  return host.services.length > 0 ? host.services[0].price : null;
}

// "Zona 7, Maringá": junta o que a API mandar, sem inventar o resto
export function formatHostLocation(host: Pick<HostDetails, 'location'>): string {
  return [host.location.neighborhood, host.location.city].filter(Boolean).join(', ');
}
