import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
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
import { FilterChip } from '../components/FilterChip';
import { PetCard } from '../components/PetCard';
import { SearchBar } from '../components/SearchBar';
import { SearchFilters, SearchModal } from '../components/SearchModal';
import { UserHeader } from '../components/UserHeader';
import { SAMPLE_PETS, SAMPLE_USER } from '../constants/sampleData';
import { theme } from '../constants/theme';
import { useSession } from '../context/SessionContext';
import { toSearchParams } from '../utils/searchParams';

type Hotel = {
  id: string;
  imageUri: string;
  location: string;
  name: string;
  price: string;
  rating: string;
};

// Cada filtro tem o seu titulo para a secao de "proximos de voce"
const FILTERS = [
  { label: 'Pet-Hotel', title: 'Pet-Hotéis próximos de você' },
  { label: 'Pet-Sitter', title: 'Pet-Sitters próximos de você' },
  { label: 'Pet-Walker', title: 'Pet-Walkers próximos de você' },
];

const HOTEL_IMAGE =
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600';

const NEARBY_HOTELS: Hotel[] = [
  {
    id: 'nearby-1',
    name: 'Recanto Pata Mansa',
    location: 'Maringá, Paraná',
    price: 'R$250',
    rating: '4.8',
    imageUri: HOTEL_IMAGE,
  },
  {
    id: 'nearby-2',
    name: 'Recanto Pata Mansa',
    location: 'Maringá, Paraná',
    price: 'R$250',
    rating: '4.8',
    imageUri: HOTEL_IMAGE,
  },
];

const POPULAR_HOTELS: Hotel[] = [
  {
    id: 'popular-1',
    name: 'Recanto Pata Mansa',
    location: 'Maringá, Paraná',
    price: 'R$250',
    rating: '4.8',
    imageUri: HOTEL_IMAGE,
  },
  {
    id: 'popular-2',
    name: 'Recanto Pata Mansa',
    location: 'Maringá, Paraná',
    price: 'R$250',
    rating: '4.8',
    imageUri: HOTEL_IMAGE,
  },
  {
    id: 'popular-3',
    name: 'Recanto Pata Mansa',
    location: 'Maringá, Paraná',
    price: 'R$250',
    rating: '4.8',
    imageUri: HOTEL_IMAGE,
  },
];

export default function HomeScreen() {
  const { currentUser, logout } = useSession();
  // O perfil vem do /me após o cadastro. O parâmetro continua como fallback dos fluxos antigos.
  const { nome } = useLocalSearchParams<{ nome?: string }>();
  const userName = currentUser?.user?.name?.split(' ')[0] || nome || SAMPLE_USER.name;
  const { width } = useWindowDimensions();
  const [activeFilter, setActiveFilter] = useState('Pet-Hotel');
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [searchOpen, setSearchOpen] = useState(false);

  // "Buscar" leva aos resultados com os filtros escolhidos no modal
  function handleSearch(filters: SearchFilters) {
    router.push({ pathname: '/resultados', params: toSearchParams(filters) });
  }

  // A aba Buscar abre a busca por cima da Home, sem trocar a aba ativa
  function handleChangeTab(key: TabKey) {
    if (key === 'buscar') {
      setSearchOpen(true);
      return;
    }
    // O Perfil é outra rota: a Home continua com a aba Home ativa para quando o usuário voltar
    if (key === 'perfil') {
      router.push('/perfil');
      return;
    }
    setActiveTab(key);
  }

  // Largura dos cards proporcional a tela, como na referencia
  async function handleLogout() {
    await logout();
    router.replace('/');
  }

  const nearbyCardWidth = width * 0.68;
  const popularCardWidth = width * 0.36;

  const nearbyTitle = FILTERS.find((filter) => filter.label === activeFilter)?.title;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <UserHeader
          avatarUri={SAMPLE_USER.avatar}
          city={SAMPLE_USER.city}
          name={userName}
          onLogout={handleLogout}
        />

        {currentUser && !currentUser.permissions.canContract ? (
          <View accessibilityLiveRegion="polite" style={styles.profileNotice}>
            <Text style={styles.profileNoticeTitle}>Perfil incompleto</Text>
            <Text style={styles.profileNoticeText}>
              Complete seu perfil para contratar um serviço.
            </Text>
          </View>
        ) : null}

        {/* Na Home a busca só abre o modal; a digitação acontece dentro dele */}
        <TouchableOpacity
          accessibilityLabel="Abrir busca"
          accessibilityRole="button"
          onPress={() => setSearchOpen(true)}
        >
          <View style={styles.searchPreview}>
            <SearchBar
              onChangeText={() => {}}
              placeholder="Endereço, cidade ou proximidade"
              value=""
            />
          </View>
        </TouchableOpacity>

        <View style={styles.filters}>
          {FILTERS.map((filter) => (
            <FilterChip
              key={filter.label}
              active={filter.label === activeFilter}
              label={filter.label}
              onPress={() => setActiveFilter(filter.label)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{nearbyTitle}</Text>
        <ScrollView
          contentContainerStyle={styles.rowContent}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.row}
        >
          {NEARBY_HOTELS.map((hotel) => (
            <PetCard
              key={hotel.id}
              imageUri={hotel.imageUri}
              location={hotel.location}
              name={hotel.name}
              onPress={() => router.push(`/host/${hotel.id}`)}
              price={hotel.price}
              rating={hotel.rating}
              size="large"
              width={nearbyCardWidth}
            />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Mais populares</Text>
          <TouchableOpacity>
            <Text style={styles.seeMore}>ver mais</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.rowContent}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.row}
        >
          {POPULAR_HOTELS.map((hotel) => (
            <PetCard
              key={hotel.id}
              imageUri={hotel.imageUri}
              location={hotel.location}
              name={hotel.name}
              onPress={() => router.push(`/host/${hotel.id}`)}
              price={hotel.price}
              rating={hotel.rating}
              size="small"
              width={popularCardWidth}
            />
          ))}
        </ScrollView>
      </ScrollView>

      <View style={styles.tabBarWrapper}>
        <BottomTabBar activeTab={activeTab} onChangeTab={handleChangeTab} />
      </View>

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
  profileNotice: {
    backgroundColor: theme.colors.selectedTint,
    borderRadius: theme.radius.card,
    marginTop: theme.spacing.section,
    padding: theme.spacing.medium,
  },
  profileNoticeTitle: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.body,
  },
  profileNoticeText: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
    marginTop: theme.spacing.tiny,
  },
  // O campo é só uma prévia: o toque vai para o botão em volta
  searchPreview: {
    pointerEvents: 'none',
  },
  filters: {
    flexDirection: 'row',
    gap: theme.spacing.medium,
    marginTop: theme.spacing.section,
  },
  sectionTitle: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.sectionTitle,
    marginTop: theme.spacing.page,
  },
  // Vem logo depois de uma lista, que ja tem espaco embaixo para a sombra
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.small,
  },
  sectionHeaderTitle: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.sectionTitle,
  },
  seeMore: {
    color: theme.colors.button,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.body,
  },
  // A lista horizontal ocupa a largura toda da tela, como no print.
  // O padding interno deixa espaco para a sombra dos cards nao ser cortada.
  row: {
    marginHorizontal: -theme.spacing.page,
  },
  rowContent: {
    gap: theme.spacing.medium,
    paddingBottom: theme.spacing.section,
    paddingHorizontal: theme.spacing.page,
    paddingTop: theme.spacing.medium,
  },
  tabBarWrapper: {
    bottom: theme.spacing.large,
    left: theme.spacing.page,
    position: 'absolute',
    right: theme.spacing.page,
  },
});
