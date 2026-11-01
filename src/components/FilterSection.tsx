import { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '../constants/theme';
import { Icon } from './Icon';

type FilterSectionProps = {
  children: ReactNode;
  isLast?: boolean;
  onPress: () => void;
  open: boolean;
  showChevron: boolean;
  title: string;
};

// Secao do filtro de busca: aberta mostra o conteudo, fechada so o titulo
export function FilterSection({
  children,
  isLast = false,
  onPress,
  open,
  showChevron,
  title,
}: FilterSectionProps) {
  return (
    <View style={[styles.section, !isLast && styles.divider]}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        disabled={open}
        onPress={onPress}
        style={styles.header}
      >
        <Text style={styles.title}>{title}</Text>
        {!open && showChevron ? (
          <Icon color={theme.colors.button} name="expand_more" size={theme.icon.medium} />
        ) : null}
      </TouchableOpacity>

      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.large,
  },
  divider: {
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.filterTitle,
  },
  body: {
    marginTop: theme.spacing.medium,
  },
});
