import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { theme } from '../constants/theme';

type ButtonProps = {
  onPress: () => void;
  title: string;
};

export function Button({ onPress, title }: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.button,
    borderRadius: theme.radius.button,
    justifyContent: 'center',
    marginTop: theme.spacing.large,
    minHeight: 48,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.shadow.opacity,
    shadowRadius: theme.shadow.radius,
    elevation: theme.shadow.elevation,
  },
  text: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.button,
  },
});
