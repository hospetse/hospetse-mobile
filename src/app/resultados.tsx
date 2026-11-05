import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar, TabKey } from '../components/BottomTabBar';
import { Button } from '../components/Button';
import { EMPTY_RESULT_FILTERS, FiltersModal, ResultFilters } from '../components/FiltersModal';
import { Icon } from '../components/Icon';
import { PetCard } from '../components/PetCard';
import { SearchBar } from '../components/SearchBar';
import { SearchFilters, SearchModal } from '../components/SearchModal';
import { Skeleton } from '../components/Skeleton';
import { UserHeader } from '../components/UserHeader';
import { SAMPLE_PETS, SAMPLE_USER } from '../constants/sampleData';
import { SERVICE_PLURAL, SERVICE_SINGULAR, ServiceType } from '../constants/search';
import { theme } from '../constants/theme';
import { useSession } from '../context/SessionContext';
import { getErrorStatus, isRequestError } from '../services/auth';
import { formatHostLocation, HostSearchResult, HostSummary, searchHosts } from '../services/hosts';
import { formatDate, fromIsoDate } from '../utils/calendar';
import { SearchRouteParams, serviceFromParam, toSearchParams } from '../utils/searchParams';

// "3 Pet-Sitters encontrados". Com nenhum ou vários serviços, "3 resultados encontrados"
export function resultsTitle(count: number, services: ServiceType[]): string {
  const one = count === 1;
  const label =
    services.length === 1
      ? (one ? SERVICE_SINGULAR : SERVICE_PLURAL)[services[0]]
      : one
        ? 'resultado'
        : 'resultados';
  return `${count} ${label} ${one ? 'encontrado' : 'encontrados'}`;
}

// Quantos filtros estão ligados, para o número no botão de filtros
function countFilters(filters: ResultFilters): number {
  return (
    filters.services.length +
    filters.sizes.length +
    filters.amenities.length +
    (filters.maxPrice !== null ? 1 : 0)
  );
}

// Mensagem para cada falha da busca. 400 = filtro recusado pela API (ex.: data no passado)
export function searchErrorMessage(error: unknown): string {
  if (!isRequestError(error)) {
    return 'Não foi possível carregar os resultados. Tente de novo.';
  }
  const status = getErrorStatus(error);
  if (status === null) {
    return 'Não foi possível conectar. Verifique sua internet e tente de novo.';
  }
  if (status === 400) {
    return 'Algum filtro da busca não é válido. Confira as datas e tente de novo.';
  }
  return 'Não foi possível carregar os resultados. Tente de novo.';
}

export default function ResultsScreen() {
  const { currentUser, logout } = useSession();
  const params = useLocalSearchParams<SearchRouteParams>();
  const { width } = useWindowDimensions();
  const initialService = serviceFromParam(params.service);

  const [filters, setFilters] = useState<ResultFilters>({
    ...EMPTY_RESULT_FILTERS,
    services: initialService ? [initialService] : [],
  });
  const [results, setResults] = useState<HostSearchResult | null>(null);
  const [error, setError] = useState('');
  // Aumentar este número refaz a busca (botão "Tentar de novo")
  const [attempt, setAttempt] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Uma busca nova (outro serviço na rota) recomeça os filtros a partir dele.
  // Na abertura da tela os filtros já começam assim: sem isso, a busca rodaria duas vezes
  const lastService = useRef(initialService);
  useEffect(() => {
    if (lastService.current === initialService) {
      return;
    }
    lastService.current = initialService;
    setFilters({ ...EMPTY_RESULT_FILTERS, services: initialService ? [initialService] : [] });
  }, [initialService]);

  const city = params.city ?? '';
  const checkInParam = params.checkIn ?? null;
  const checkOutParam = params.checkOut ?? null;
  const petId = params.petId ?? null;

  useEffect(() => {
    let active = true;
    setResults(null);
    setError('');
    searchHosts({ city, checkIn: checkInParam, checkOut: checkOutParam, petId, ...filters })
      .then((found) => {
        if (active) {
          setResults(found);
        }
      })
      .catch((searchError) => {
        if (active) {
          setError(searchErrorMessage(searchError));
        }
      });
    return () => {
      active = false;
    };
  }, [city, checkInParam, checkOutParam, petId, filters, attempt]);

  const checkIn = fromIsoDate(params.checkIn);
  const checkOut = fromIsoDate(params.checkOut);
  const summary = [
    city ? `Em ${city}` : 'Em todas as cidades',
    checkIn && checkOut ? `${formatDate(checkIn)} a ${formatDate(checkOut)}` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  const activeFilters = countFilters(filters);
  const cardWidth = width - theme.spacing.page * 2;
  const userName = currentUser?.user?.name || SAMPLE_USER.name;

  // Nova busca feita daqui: troca os parâmetros desta mesma tela
  function handleSearch(search: SearchFilters) {
    router.setParams({
      city: undefined,
      checkIn: undefined,
      checkOut: undefined,
      service: undefined,
      petId: undefined,
      ...toSearchParams(search),
    });
  }

  function handleChangeTab(key: TabKey) {
    if (key === 'buscar') {
      setSearchOpen(true);
    } else if (key === 'home') {
      router.back();
    }
  }

  function openHost(host: HostSummary) {
    // As datas da busca seguem para o detalhe, para a seção "Disponibilidade".
    // O pet segue também, para o chat (#520)
    router.push({
      pathname: '/host/[id]',
      params: {
        id: host.hostId,
        ...(params.checkIn ? { checkIn: params.checkIn } : {}),
        ...(params.checkOut ? { checkOut: params.checkOut } : {}),
        ...(params.petId ? { petId: params.petId } : {}),
      },
    });
  }

  async function handleLogout() {
    await logout();
    router.replace('/');
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <UserHeader
          avatarUri={SAMPLE_USER.avatar}
          city={SAMPLE_USER.city}
          name={userName}
          onLogout={handleLogout}
        />

        <View>
          <TouchableOpacity
            accessibilityLabel="Nova busca"
            accessibilityRole="button"
            onPress={() => setSearchOpen(true)}
          >
            <View style={styles.searchPreview}>
              <SearchBar
                onChangeText={() => {}}
                placeholder="Endereço, cidade ou proximidade"
                value={city}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel={activeFilters > 0 ? `Filtros, ${activeFilters} ativos` : 'Filtros'}
            accessibilityRole="button"
            onPress={() => setFiltersOpen(true)}
            style={styles.filtersButton}
          >
            <Icon color={theme.colors.title} name="tune" size={theme.icon.medium} />
            {activeFilters > 0 ? (
              <View style={styles.filtersBadge}>
                <Text style={styles.filtersBadgeText}>{activeFilters}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.empty}>
            <Text accessibilityRole="header" style={styles.emptyTitle}>
              Algo deu errado
            </Text>
            <Text style={styles.emptyText}>{error}</Text>
            <Button onPress={() => setAttempt(attempt + 1)} title="Tentar de novo" />
          </View>
        ) : results === null ? (
          <View accessibilityLabel="Carregando resultados" style={styles.list}>
            <Skeleton height={24} width={220} />
            <Skeleton height={260} radius={theme.radius.card} width="100%" />
            <Skeleton height={260} radius={theme.radius.card} width="100%" />
          </View>
        ) : (
          <>
            <Text accessibilityRole="header" style={styles.title}>
              {resultsTitle(results.total, filters.services)}
            </Text>
            <Text style={styles.summary}>{summary}</Text>

            {results.items.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Nenhuma hospedagem encontrada</Text>
                <Text style={styles.emptyText}>
                  Tente outra cidade ou ajuste os filtros para ver mais opções.
                </Text>
                <Button onPress={() => setFiltersOpen(true)} title="Ajustar filtros" />
              </View>
            ) : (
              <View style={styles.list}>
                {results.items.map((host) => (
                  <PetCard
                    key={host.serviceId}
                    imageUri={host.pictureUrl}
                    location={formatHostLocation(host)}
                    name={host.name}
                    onPress={() => openHost(host)}
                    price={`R$${host.dailyPrice}`}
                    rating={
                      host.reputation.rating !== null ? host.reputation.rating.toFixed(1) : 'Novo'
                    }
                    size="large"
                    width={cardWidth}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.tabBarWrapper}>
        <BottomTabBar activeTab="home" onChangeTab={handleChangeTab} />
      </View>

      <FiltersModal
        filters={filters}
        onApply={setFilters}
        onClose={() => setFiltersOpen(false)}
        visible={filtersOpen}
      />

      <SearchModal
        onClose={() => setSearchOpen(false)}
        onSearch={handleSearch}
        pets={SAMPLE_PETS}
        visible={searchOpen}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    paddingBottom: theme.spacing.tabBar + theme.spacing.page * 2,
    paddingHorizontal: theme.spacing.page,
    paddingTop: theme.spacing.large,
  },
  // O campo é só uma prévia: o toque abre a busca
  searchPreview: {
    pointerEvents: 'none',
  },
  filtersButton: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.input,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  filtersBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.button,
    borderRadius: theme.radius.round,
    height: theme.spacing.large,
    justifyContent: 'center',
    position: 'absolute',
    right: theme.spacing.tiny,
    top: theme.spacing.tiny,
    width: theme.spacing.large,
  },
  filtersBadgeText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.captionSmall,
  },
  title: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.sectionTitle,
    marginTop: theme.spacing.page,
  },
  summary: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
    marginTop: theme.spacing.tiny,
  },
  list: {
    gap: theme.spacing.large,
    marginTop: theme.spacing.large,
  },
  empty: {
    alignItems: 'stretch',
    marginTop: theme.spacing.page,
  },
  emptyTitle: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.filterTitle,
    textAlign: 'center',
  },
  emptyText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.small,
    textAlign: 'center',
  },
  tabBarWrapper: {
    bottom: theme.spacing.large,
    left: theme.spacing.page,
    position: 'absolute',
    right: theme.spacing.page,
  },
});
