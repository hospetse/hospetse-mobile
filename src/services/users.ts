import { backendApi } from './api';

export type CurrentUser = {
  user: {
    id: string;
    authUserId: string;
    email: string;
    name: string;
  };
  profile: {
    status: 'incomplete' | 'complete';
    missingFields: string[];
  };
  permissions: {
    canSearch: boolean;
    canContract: boolean;
  };
};

// O perfil e as permissões vêm do back-end, nunca do conteúdo do JWT.
function isCurrentUser(data: unknown): data is CurrentUser {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const { user, profile, permissions } = data as Partial<CurrentUser>;
  return (
    Boolean(user) &&
    typeof user?.name === 'string' &&
    Boolean(profile) &&
    Array.isArray(profile?.missingFields) &&
    Boolean(permissions) &&
    typeof permissions?.canSearch === 'boolean' &&
    typeof permissions?.canContract === 'boolean'
  );
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const { data } = await backendApi.get<unknown>('/api/v1/me');
  if (!isCurrentUser(data)) {
    throw new Error('Resposta de perfil inválida');
  }
  return data;
}
