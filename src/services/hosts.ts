import { AmenityFilter, PetSize, ServiceType } from '../constants/search';

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

// Seções do protótipo que a API ainda NÃO tem. Ficam separadas para mostrar o que é provisório
export type HostExtras = {
  amenities: { icon: AmenityIcon; label: string }[];
  requirements: string[];
  routine: string[];
};

export type HostPage = {
  host: HostDetails;
  extras: HostExtras;
};

// Card da lista de resultados (foto, nome, cidade e preço, como pede a #480)
export type HostSummary = {
  id: string;
  name: string;
  city: string;
  neighborhood: string;
  imageUri: string;
  price: number;
  rating: number | null;
  reviewCount: number;
  services: ServiceType[];
  sizes: PetSize[];
  amenities: AmenityFilter[];
};

// Filtros que a lista de resultados aplica
export type HostSearch = {
  city: string;
  services: ServiceType[];
  sizes: PetSize[];
  maxPrice: number | null;
  amenities: AmenityFilter[];
};

// Mesmo código que a API devolve para Host inexistente ou que não pode aparecer
export class HostNotFoundError extends Error {
  constructor() {
    super('NOT_FOUND');
  }
}

const IMAGE = 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=900';

const PHOTOS = [
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=300',
  'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=300',
  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=300',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=300',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300',
];

// PROVISÓRIO: dados de exemplo até existir a rota de busca (#476)
const SAMPLE_HOSTS: HostSummary[] = [
  {
    id: 'host-1',
    name: 'Recanto Pata Mansa',
    city: 'Maringá',
    neighborhood: 'Zona 7',
    imageUri: IMAGE,
    price: 250,
    rating: 4.9,
    reviewCount: 1092,
    services: ['Pet Hotel'],
    sizes: ['small', 'medium'],
    amenities: ['green-area', 'oral-medication'],
  },
  {
    id: 'host-2',
    name: 'Hotelzinho da Ana',
    city: 'Maringá',
    neighborhood: 'Zona 2',
    imageUri: IMAGE,
    price: 180,
    rating: 4.6,
    reviewCount: 320,
    services: ['Pet Hotel', 'Pet Sitter'],
    sizes: ['small', 'medium', 'large'],
    amenities: ['neutered-only'],
  },
  {
    id: 'host-3',
    name: 'Passeio Feliz',
    city: 'Maringá',
    neighborhood: 'Centro',
    imageUri: IMAGE,
    price: 60,
    rating: 4.8,
    reviewCount: 210,
    services: ['Pet Walker'],
    sizes: ['small', 'medium', 'large'],
    amenities: ['green-area'],
  },
  {
    id: 'host-4',
    name: 'Cantinho do Bicho',
    city: 'Londrina',
    neighborhood: 'Gleba Palhano',
    imageUri: IMAGE,
    price: 120,
    rating: 4.7,
    reviewCount: 98,
    services: ['Pet Sitter'],
    sizes: ['small'],
    amenities: ['oral-medication'],
  },
  {
    id: 'host-5',
    name: 'Sítio Quatro Patas',
    city: 'Londrina',
    neighborhood: 'Jardim Bandeirantes',
    imageUri: IMAGE,
    price: 380,
    rating: 4.5,
    reviewCount: 54,
    services: ['Pet Hotel'],
    sizes: ['medium', 'large'],
    amenities: ['green-area', 'neutered-only'],
  },
  {
    id: 'host-6',
    name: 'Pata na Rua',
    city: 'Sarandi',
    neighborhood: 'Centro',
    imageUri: IMAGE,
    price: 50,
    rating: null,
    reviewCount: 0,
    services: ['Pet Walker'],
    sizes: ['small', 'medium'],
    amenities: [],
  },
];

// Os cards de exemplo da Home abrem o primeiro Host
const HOME_CARD_IDS = ['nearby-1', 'nearby-2', 'popular-1', 'popular-2', 'popular-3'];

const SAMPLE_DESCRIPTION =
  'Fuja para o Recanto Pata Mansa, um oásis tranquilo inspirado pelas exuberantes paisagens costeiras. Experimente a serenidade no coração da natureza vibrante do Brasil, com amplos espaços dedicados para o bem-estar e diversão do seu animal de estimação.';

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
};

// Sem acento e em minúsculas, para "maringa" achar "Maringá"
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// "Maringá, PR" vira "maringa": a cidade vem antes da vírgula
function cityQuery(city: string): string {
  return normalize(city.split(',')[0]);
}

// Um Host aparece quando atende a todos os filtros preenchidos
export function matchesSearch(host: HostSummary, search: HostSearch): boolean {
  const query = cityQuery(search.city);
  if (query && !normalize(host.city).includes(query)) {
    return false;
  }
  if (search.services.length > 0 && !search.services.some((service) => host.services.includes(service))) {
    return false;
  }
  if (search.sizes.length > 0 && !search.sizes.every((size) => host.sizes.includes(size))) {
    return false;
  }
  if (search.maxPrice !== null && host.price > search.maxPrice) {
    return false;
  }
  return search.amenities.every((amenity) => host.amenities.includes(amenity));
}

// PROVISÓRIO: filtra os dados de exemplo, do mais barato para o mais caro (mesma ordem da #476).
// Para integrar, trocar o corpo pela rota de busca de Hosts da #476
export async function searchHosts(search: HostSearch): Promise<HostSummary[]> {
  return SAMPLE_HOSTS.filter((host) => matchesSearch(host, search)).sort((a, b) => a.price - b.price);
}

// PROVISÓRIO: monta o detalhe a partir dos dados de exemplo. Para integrar, trocar o corpo por
// GET /api/v1/hosts/{id} com o token do usuário e transformar o 404 em HostNotFoundError
export async function getHostPage(id: string): Promise<HostPage> {
  const summary = SAMPLE_HOSTS.find((host) => host.id === (HOME_CARD_IDS.includes(id) ? 'host-1' : id));
  if (!summary) {
    throw new HostNotFoundError();
  }

  const serviceName = summary.services.includes('Pet Walker') ? 'Passeio' : 'Diária';
  const host: HostDetails = {
    id,
    name: summary.name,
    description: SAMPLE_DESCRIPTION,
    pictureUrl: null,
    location: { city: summary.city, neighborhood: summary.neighborhood },
    photos: PHOTOS,
    accepts: { species: ['dog', 'cat'], sizes: summary.sizes, breeds: [] },
    services: [{ id: `${summary.id}-service`, name: serviceName, price: summary.price }],
    reputation: { rating: summary.rating, reviewCount: summary.reviewCount },
  };
  return { host, extras: SAMPLE_EXTRAS };
}

// Preço do serviço mais barato, ou null quando o Host não tem serviço ativo
export function lowestPrice(host: HostDetails): number | null {
  return host.services.length > 0 ? host.services[0].price : null;
}

// "Zona 7, Maringá": junta o que a API mandar, sem inventar o resto
export function formatHostLocation(host: HostDetails): string {
  return [host.location.neighborhood, host.location.city].filter(Boolean).join(', ');
}
