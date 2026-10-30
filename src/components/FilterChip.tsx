import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { theme } from '../constants/theme';

type FilterChipProps = {
  active: boolean;
  label: string;
  onPress: () => void;
};

// Chip de filtro de categoria (Pet-Hotel, Pet-Sitter, Pet-Walker)
export function FilterChip({ active, label, onPress }: FilterChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
    >
      <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    borderRadius: theme.radius.chip,
    flex: 1,
    justifyContent: 'center',
    minHeight: theme.spacing.chip,
  },
  chipActive: {
    backgroundColor: theme.colors.button,
    boxShadow: theme.shadow.active,
  },
  chipInactive: {
    backgroundColor: theme.colors.white,
    boxShadow: theme.shadow.soft,
  },
  label: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
  },
  labelActive: {
    color: theme.colors.white,
  },
  labelInactive: {
    color: theme.colors.text,
  },
});
