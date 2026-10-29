import { useState } from 'react';
import {
  Image,
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
import { Icon } from '../components/Icon';
import { PetCard } from '../components/PetCard';
import { SearchBar } from '../components/SearchBar';
import { theme } from '../constants/theme';

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

const USER = {
  avatar: 'https://i.pravatar.cc/150?img=12',
  city: 'Em Maringá',
  name: 'Murilo Barbosa',
};

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
  const { width } = useWindowDimensions();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Pet-Hotel');
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  // Largura dos cards proporcional a tela, como na referencia
  const nearbyCardWidth = width * 0.68;
  const popularCardWidth = width * 0.36;

  const nearbyTitle = FILTERS.find((filter) => filter.label === activeFilter)?.title;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.userRow}>
            <Image source={{ uri: USER.avatar }} style={styles.avatar} />
            <View>
              <Text style={styles.userName}>{USER.name}</Text>
              <Text style={styles.userCity}>{USER.city}</Text>
            </View>
          </View>
          <TouchableOpacity accessibilityLabel="Notificações" style={styles.bell}>
            <Icon color={theme.colors.title} name="notifications" size={theme.icon.medium} />
          </TouchableOpacity>
        </View>

        <SearchBar
          onChangeText={setSearch}
          placeholder="Endereço, cidade ou proximidade"
          value={search}
        />

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
              onPress={() => {}}
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
              onPress={() => {}}
              price={hotel.price}
              rating={hotel.rating}
              size="small"
              width={popularCardWidth}
            />
          ))}
        </ScrollView>
      </ScrollView>

      <View style={styles.tabBarWrapper}>
        <BottomTabBar activeTab={activeTab} onChangeTab={setActiveTab} />
      </View>
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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.section,
  },
  userRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.medium,
  },
  avatar: {
    borderRadius: theme.radius.pill,
    height: theme.spacing.avatar,
    width: theme.spacing.avatar,
  },
  userName: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.userName,
  },
  userCity: {
    color: theme.colors.placeholder,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  bell: {
    alignItems: 'center',
    backgroundColor: theme.colors.iconButton,
    borderRadius: theme.radius.pill,
    boxShadow: theme.shadow.soft,
    height: theme.spacing.bell,
    justifyContent: 'center',
    width: theme.spacing.bell,
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
