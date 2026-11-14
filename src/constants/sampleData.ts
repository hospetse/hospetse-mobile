import type { PetSummary } from '../components/SearchModal';

// PROVISÓRIO: Tutor de exemplo até a Home usar o GET /api/v1/me
export const SAMPLE_USER = {
  avatar: 'https://i.pravatar.cc/150?img=12',
  city: 'Em Maringá',
  name: 'Murilo Barbosa',
};

// Fallback apenas para a prévia de desenvolvimento do chat; a busca usa PetsContext.
export const SAMPLE_PETS: PetSummary[] = [
  {
    id: 'pet-1',
    name: 'Paçoca',
    imageUri: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300',
  },
  {
    id: 'pet-2',
    name: 'Luna',
    imageUri: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300',
  },
];
