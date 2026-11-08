import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { theme } from '../constants/theme';

type OptionCardProps = {
  label: string;
  onPress: () => void;
  selected: boolean;
  hint?: string;
  // radio: escolha única. checkbox: pode marcar mais de uma
  role?: 'radio' | 'checkbox';
};

// Opção em cartão: vira laranja quando escolhida. Várias ficam lado a lado, cada uma com a mesma largura
export function OptionCard({ label, onPress, selected, hint, role = 'radio' }: OptionCardProps) {
  return (
    <TouchableOpacity
      accessibilityRole={role}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.card, selected ? styles.cardSelected : null]}
    >
      <Text style={[styles.label, selected ? styles.textSelected : null]}>{label}</Text>
      {hint ? <Text style={[styles.hint, selected ? styles.textSelected : null]}>{hint}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.input,
    boxShadow: theme.shadow.soft,
    flex: 1,
    justifyContent: 'center',
    minHeight: theme.spacing.footer,
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.medium,
  },
  cardSelected: {
    backgroundColor: theme.colors.button,
    boxShadow: theme.shadow.active,
  },
  label: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.body,
    textAlign: 'center',
  },
  hint: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
    marginTop: theme.spacing.tiny / 2,
    textAlign: 'center',
  },
  textSelected: {
    color: theme.colors.white,
  },
});
