import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '../constants/theme';
import { Icon } from './Icon';

type AddOnItemProps = {
  description: string;
  onPress: () => void;
  price: string;
  selected: boolean;
  title: string;
};

// Serviço adicional da reserva: caixa de marcar, nome, descrição e preço por dia
export function AddOnItem({ description, onPress, price, selected, title }: AddOnItemProps) {
  return (
    <TouchableOpacity
      accessibilityLabel={`${title}, ${description}, ${price}`}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={styles.card}
    >
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected ? <Icon color={theme.colors.white} name="check" size={theme.icon.small} /> : null}
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Text style={styles.price}>{price}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.button,
    boxShadow: theme.shadow.soft,
    flexDirection: 'row',
    gap: theme.spacing.medium,
    padding: theme.spacing.medium,
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
  text: {
    flex: 1,
  },
  title: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.button,
  },
  description: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  price: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
    textAlign: 'right',
  },
});
