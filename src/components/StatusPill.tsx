import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import { Icon, IconName } from './Icon';

type StatusPillProps = {
  backgroundColor: string;
  color: string;
  label: string;
  icon?: IconName;
};

// Selo arredondado com texto curto e ícone opcional (ex.: "1 ativa", "Saudáveis")
export function StatusPill({ backgroundColor, color, label, icon }: StatusPillProps) {
  return (
    <View style={[styles.pill, { backgroundColor }]}>
      {icon ? <Icon color={color} name={icon} size={theme.icon.small} /> : null}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: theme.radius.round,
    flexDirection: 'row',
    gap: theme.spacing.tiny,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.tiny,
  },
  label: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.caption,
  },
});
