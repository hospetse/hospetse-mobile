import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SERVICES, ServiceType } from '../constants/search';
import { theme } from '../constants/theme';
import { formatDate } from '../utils/calendar';
import { Button } from './Button';
import { Calendar } from './Calendar';
import { FilterSection } from './FilterSection';
import { Icon } from './Icon';
import { PetOption } from './PetOption';

export type { ServiceType } from '../constants/search';

export type SearchFilters = {
  city: string;
  checkIn: Date | null;
  checkOut: Date | null;
  service: ServiceType | null;
  petId: string | null;
};

export const EMPTY_FILTERS: SearchFilters = {
  city: '',
  checkIn: null,
  checkOut: null,
  service: null,
  petId: null,
};

export type PetSummary = {
  id: string;
  imageUri: string | null;
  name: string;
};

type SectionKey = 'where' | 'when' | 'service' | 'who';

const SECTIONS: { key: SectionKey; title: string }[] = [
  { key: 'where', title: 'Onde?' },
  { key: 'when', title: 'Para quando?' },
  { key: 'service', title: 'Qual serviço?' },
  { key: 'who', title: 'Para quem?' },
];

// Sugestoes fixas ate existir a busca de cidades na API
const CITY_SUGGESTIONS = ['Maringá, PR', 'Londrina, PR', 'Sarandi, PR'];

type SearchModalProps = {
  onAddPet?: () => void;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
  pets: PetSummary[];
  petsLoading?: boolean;
  visible: boolean;
};

// Modal de busca: uma secao aberta por vez (onde, quando, servico e pet)
export function SearchModal({
  onAddPet,
  onClose,
  onSearch,
  pets,
  petsLoading = false,
  visible,
}: SearchModalProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      {/* O formulario so existe com o modal aberto: cada abertura comeca vazia */}
      {visible ? (
        <SearchForm
          onAddPet={onAddPet}
          onClose={onClose}
          onSearch={onSearch}
          pets={pets}
          petsLoading={petsLoading}
        />
      ) : null}
    </Modal>
  );
}

type SearchFormProps = Omit<SearchModalProps, 'visible'>;

function SearchForm({ onAddPet, onClose, onSearch, pets, petsLoading }: SearchFormProps) {
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [openSection, setOpenSection] = useState<SectionKey>('where');

  const openIndex = SECTIONS.findIndex((section) => section.key === openSection);

  // Sem texto mostra todas; com texto, as que contem o que foi digitado
  const typed = filters.city.trim().toLowerCase();
  const cities = CITY_SUGGESTIONS.filter((city) => city.toLowerCase().includes(typed));

  function update(changes: Partial<SearchFilters>) {
    setFilters({ ...filters, ...changes });
  }

  function handleSearch() {
    onSearch(filters);
    onClose();
  }

  function renderContent(key: SectionKey) {
    switch (key) {
      case 'where':
        return (
          <View>
            <View style={styles.cityField}>
              <Icon color={theme.colors.title} name="search" size={theme.icon.medium} />
              <TextInput
                accessibilityLabel="Cidade"
                onChangeText={(city) => update({ city })}
                placeholder="Endereço, cidade ou proximidade"
                placeholderTextColor={theme.colors.placeholder}
                style={styles.cityInput}
                value={filters.city}
              />
            </View>
            {cities.map((city) => (
              <TouchableOpacity
                key={city}
                accessibilityRole="button"
                onPress={() => update({ city })}
                style={styles.cityOption}
              >
                <Icon color={theme.colors.button} name="location_on" size={theme.icon.medium} />
                <Text style={styles.cityName}>{city}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'when':
        return (
          <View>
            <View style={styles.dateFields}>
              <View style={styles.dateField}>
                <Text style={filters.checkIn ? styles.dateValue : styles.datePlaceholder}>
                  {filters.checkIn ? formatDate(filters.checkIn) : 'Check-in'}
                </Text>
              </View>
              <View style={styles.dateField}>
                <Text style={filters.checkOut ? styles.dateValue : styles.datePlaceholder}>
                  {filters.checkOut ? formatDate(filters.checkOut) : 'Check-out'}
                </Text>
              </View>
            </View>
            <Calendar
              onChange={(range) => update(range)}
              range={{ checkIn: filters.checkIn, checkOut: filters.checkOut }}
            />
          </View>
        );

      case 'service':
        return (
          <View style={styles.services}>
            {SERVICES.map((service) => {
              const selected = filters.service === service;
              return (
                <TouchableOpacity
                  key={service}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => update({ service })}
                  style={[styles.service, selected && styles.serviceSelected]}
                >
                  <Text style={[styles.serviceText, selected && styles.serviceTextSelected]}>
                    {service}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case 'who':
        if (petsLoading) {
          return (
            <View style={styles.petsLoading}>
              <ActivityIndicator color={theme.colors.button} />
              <Text style={styles.noPets}>Carregando seus pets...</Text>
            </View>
          );
        }
        if (pets.length === 0) {
          return (
            <View style={styles.noPetsContainer}>
              <Text style={styles.noPets}>Você ainda não tem pets cadastrados.</Text>
              {onAddPet ? <Button onPress={onAddPet} title="Cadastrar pet" /> : null}
            </View>
          );
        }
        return (
          <View style={styles.pets}>
            {pets.map((pet) => (
              <PetOption
                key={pet.id}
                imageUri={pet.imageUri}
                name={pet.name}
                // Tocar de novo no pet escolhido desmarca: o pet não é obrigatório
                onPress={() => update({ petId: filters.petId === pet.id ? null : pet.id })}
                selected={filters.petId === pet.id}
              />
            ))}
          </View>
        );
    }
  }

  return (
    <View style={styles.backdrop}>
      {/* Tocar fora do cartão fecha a busca */}
      <Pressable accessibilityLabel="Fechar busca" onPress={onClose} style={StyleSheet.absoluteFill} />

      <View style={styles.card}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.sections}
        >
          {SECTIONS.map((section, index) => (
            <FilterSection
              key={section.key}
              isLast={index === SECTIONS.length - 1}
              onPress={() => setOpenSection(section.key)}
              open={section.key === openSection}
              // Como no protótipo, só as seções abaixo da aberta mostram a seta
              showChevron={index > openIndex}
              title={section.title}
            >
              {renderContent(section.key)}
            </FilterSection>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Button onPress={handleSearch} title="Buscar" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: theme.colors.backdrop,
    flex: 1,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.page * 3,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    boxShadow: theme.shadow.card,
    justifyContent: 'space-between',
    maxHeight: '100%',
    minHeight: '70%',
    overflow: 'hidden',
  },
  sections: {
    flexGrow: 0,
    flexShrink: 1,
  },
  footer: {
    padding: theme.spacing.large,
    paddingTop: 0,
  },
  cityField: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.chip,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.small,
    height: theme.spacing.field,
    paddingHorizontal: theme.spacing.medium,
  },
  cityInput: {
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
  },
  cityOption: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.medium,
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.medium,
  },
  cityName: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
  },
  dateFields: {
    flexDirection: 'row',
    gap: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
  },
  dateField: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.chip,
    borderWidth: 1,
    flex: 1,
    height: theme.spacing.field - theme.spacing.small,
    justifyContent: 'center',
  },
  datePlaceholder: {
    color: theme.colors.placeholder,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
  },
  dateValue: {
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
    fontSize: theme.typography.body,
  },
  services: {
    gap: theme.spacing.small,
  },
  service: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.chip,
    borderWidth: 1,
    height: theme.spacing.field,
    justifyContent: 'center',
  },
  serviceSelected: {
    backgroundColor: theme.colors.button,
    borderColor: theme.colors.button,
  },
  serviceText: {
    color: theme.colors.placeholder,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
  },
  serviceTextSelected: {
    color: theme.colors.white,
    fontFamily: theme.fonts.semiBold,
  },
  pets: {
    flexDirection: 'row',
    gap: theme.spacing.large,
  },
  petsLoading: {
    alignItems: 'center',
    gap: theme.spacing.small,
    paddingVertical: theme.spacing.medium,
  },
  noPetsContainer: {
    gap: theme.spacing.small,
  },
  noPets: {
    color: theme.colors.placeholder,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
  },
});
