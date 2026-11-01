import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AmenityFilter,
  PET_SIZES,
  PetSize,
  PRICE_MAX,
  SERVICES,
  ServiceType,
} from '../constants/search';
import { theme } from '../constants/theme';
import { Button } from './Button';
import { Icon, IconName } from './Icon';
import { PriceSlider } from './PriceSlider';

// Filtros escolhidos nesta tela. A cidade vem da busca e não muda aqui
export type ResultFilters = {
  services: ServiceType[];
  sizes: PetSize[];
  // null = sem limite de preço
  maxPrice: number | null;
  amenities: AmenityFilter[];
};

export const EMPTY_RESULT_FILTERS: ResultFilters = {
  services: [],
  sizes: [],
  maxPrice: null,
  amenities: [],
};

const SERVICE_INFO: Record<ServiceType, { icon: IconName; description: string }> = {
  'Pet Hotel': { icon: 'apartment', description: 'Hospedagem segura, quintal & cuidado integral' },
  'Pet Walker': { icon: 'directions_walk', description: 'Passeios revigorantes com rotas seguras' },
  'Pet Sitter': { icon: 'home', description: 'Visitas & rotina no seu lar' },
};

const AMENITIES: { value: AmenityFilter; icon: IconName; label: string }[] = [
  { value: 'green-area', icon: 'park', label: 'Área verde / Quintal amplo' },
  { value: 'neutered-only', icon: 'check_circle', label: 'Apenas pets castrados' },
  { value: 'oral-medication', icon: 'medication', label: 'Aceita medicação oral' },
];

// Coloca o valor na lista, ou tira se já estiver lá
function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

type FiltersModalProps = {
  filters: ResultFilters;
  onApply: (filters: ResultFilters) => void;
  onClose: () => void;
  visible: boolean;
};

// Tela de filtros dos resultados: serviço, porte, faixa de preço e comodidades
export function FiltersModal({ filters, onApply, onClose, visible }: FiltersModalProps) {
  return (
    <Modal animationType="slide" onRequestClose={onClose} visible={visible}>
      {/* Montado só aberto: cada abertura começa dos filtros aplicados */}
      {visible ? <FiltersForm filters={filters} onApply={onApply} onClose={onClose} /> : null}
    </Modal>
  );
}

function FiltersForm({ filters, onApply, onClose }: Omit<FiltersModalProps, 'visible'>) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<ResultFilters>(filters);

  function update(changes: Partial<ResultFilters>) {
    setDraft({ ...draft, ...changes });
  }

  function handleApply() {
    onApply(draft);
    onClose();
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Fechar filtros"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.close}
        >
          <Icon color={theme.colors.title} name="close" size={theme.icon.medium} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text accessibilityRole="header" style={styles.title}>
            Filtros
          </Text>
          <Text style={styles.subtitle}>Personalize sua busca</Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => setDraft(EMPTY_RESULT_FILTERS)}
          style={styles.clear}
        >
          <Text style={styles.clearText}>LIMPAR FILTROS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tipo de Serviço</Text>
          <Text style={styles.sectionHint}>Selecione 1 ou mais</Text>
        </View>
        <View style={styles.list}>
          {SERVICES.map((service) => {
            const selected = draft.services.includes(service);
            const info = SERVICE_INFO[service];
            return (
              <TouchableOpacity
                key={service}
                accessibilityLabel={service}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                onPress={() => update({ services: toggle(draft.services, service) })}
                style={[styles.serviceRow, selected && styles.rowSelected]}
              >
                <View style={[styles.serviceIcon, selected && styles.serviceIconSelected]}>
                  <Icon
                    color={selected ? theme.colors.white : theme.colors.button}
                    name={info.icon}
                    size={theme.icon.medium}
                  />
                </View>
                <View style={styles.serviceText}>
                  <Text style={styles.serviceName}>{service}</Text>
                  <Text style={styles.serviceDescription}>{info.description}</Text>
                </View>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected ? (
                    <Icon color={theme.colors.white} name="check" size={theme.icon.small} />
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Porte do Pet</Text>
          <Text style={styles.sectionHint}>Tamanho do animal</Text>
        </View>
        <View style={styles.sizes}>
          {PET_SIZES.map((size) => {
            const selected = draft.sizes.includes(size.value);
            const color = selected ? theme.colors.white : theme.colors.title;
            return (
              <TouchableOpacity
                key={size.value}
                accessibilityLabel={size.label}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                onPress={() => update({ sizes: toggle(draft.sizes, size.value) })}
                style={[styles.size, selected && styles.sizeSelected]}
              >
                <Icon color={color} name="pets" size={theme.icon.medium} />
                <Text style={[styles.sizeText, { color }]}>{size.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.priceTitle}>Faixa de Preço</Text>
          <Text style={styles.priceHint}>Valor por diária ou passeio</Text>
          <PriceSlider
            onChange={(value) => update({ maxPrice: value >= PRICE_MAX ? null : value })}
            value={draft.maxPrice ?? PRICE_MAX}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Estrutura & Comodidades</Text>
          <Text style={styles.sectionHint}>Exigências</Text>
        </View>
        <View style={styles.list}>
          {AMENITIES.map((amenity) => {
            const selected = draft.amenities.includes(amenity.value);
            return (
              <TouchableOpacity
                key={amenity.value}
                accessibilityLabel={amenity.label}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                onPress={() => update({ amenities: toggle(draft.amenities, amenity.value) })}
                style={[styles.amenityRow, selected && styles.rowSelected]}
              >
                <Icon color={theme.colors.button} name={amenity.icon} size={theme.icon.medium} />
                <Text style={styles.amenityText}>{amenity.label}</Text>
                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                  {selected ? (
                    <Icon color={theme.colors.white} name="check" size={theme.icon.small} />
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.medium }]}>
        <Button onPress={handleApply} title="Aplicar Filtros" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.medium,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
  },
  close: {
    padding: theme.spacing.tiny,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.sectionTitle,
  },
  subtitle: {
    color: theme.colors.button,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  clear: {
    borderColor: theme.colors.rangeFill,
    borderRadius: theme.radius.chip,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
  },
  clearText: {
    color: theme.colors.button,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.caption,
  },
  content: {
    padding: theme.spacing.large,
    paddingBottom: theme.spacing.page,
  },
  sectionHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.medium,
    marginTop: theme.spacing.large,
  },
  sectionTitle: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.filterTitle,
  },
  sectionHint: {
    color: theme.colors.button,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  list: {
    gap: theme.spacing.small,
  },
  rowSelected: {
    backgroundColor: theme.colors.selectedTint,
    borderColor: theme.colors.button,
  },
  serviceRow: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.divider,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.medium,
    padding: theme.spacing.medium,
  },
  serviceIcon: {
    alignItems: 'center',
    borderColor: theme.colors.button,
    borderRadius: theme.radius.badge,
    borderWidth: 1,
    height: theme.spacing.serviceIcon,
    justifyContent: 'center',
    width: theme.spacing.serviceIcon,
  },
  serviceIconSelected: {
    backgroundColor: theme.colors.button,
  },
  serviceText: {
    flex: 1,
  },
  serviceName: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.button,
  },
  serviceDescription: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  radio: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.round,
    borderWidth: 1,
    height: theme.spacing.checkbox,
    justifyContent: 'center',
    width: theme.spacing.checkbox,
  },
  radioSelected: {
    backgroundColor: theme.colors.button,
    borderColor: theme.colors.button,
  },
  sizes: {
    flexDirection: 'row',
    gap: theme.spacing.small,
  },
  size: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.divider,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    flex: 1,
    gap: theme.spacing.tiny,
    paddingVertical: theme.spacing.medium,
  },
  sizeSelected: {
    backgroundColor: theme.colors.button,
    borderColor: theme.colors.button,
  },
  sizeText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.body,
  },
  priceCard: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.divider,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    marginTop: theme.spacing.large,
    padding: theme.spacing.medium,
  },
  priceTitle: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.button,
  },
  priceHint: {
    color: theme.colors.placeholder,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
    marginBottom: theme.spacing.small,
  },
  amenityRow: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.divider,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.medium,
    padding: theme.spacing.medium,
  },
  amenityText: {
    color: theme.colors.title,
    flex: 1,
    fontFamily: theme.fonts.medium,
    fontSize: theme.typography.body,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.calendarMark,
    borderWidth: 1,
    height: theme.spacing.checkbox,
    justifyContent: 'center',
    width: theme.spacing.checkbox,
  },
  checkboxSelected: {
    backgroundColor: theme.colors.button,
    borderColor: theme.colors.button,
  },
  footer: {
    backgroundColor: theme.colors.white,
    boxShadow: theme.shadow.bar,
    paddingHorizontal: theme.spacing.large,
  },
});
