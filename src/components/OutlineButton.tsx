import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { theme } from '../constants/theme';
import { Icon, IconName } from './Icon';

type OutlineButtonProps = {
  icon?: IconName;
  onPress: () => void;
  title: string;
};

// Botão secundário: borda laranja, fundo branco e ícone opcional à esquerda
export function OutlineButton({ icon, onPress, title }: OutlineButtonProps) {
  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.button}>
      {icon ? <Icon color={theme.colors.button} name={icon} size={theme.icon.medium} /> : null}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.button,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.small,
    justifyContent: 'center',
    marginTop: theme.spacing.large,
    minHeight: theme.spacing.footer,
    paddingHorizontal: theme.spacing.medium,
  },
  text: {
    color: theme.colors.button,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.button,
  },
});
