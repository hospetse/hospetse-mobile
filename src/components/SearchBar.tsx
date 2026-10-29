import { StyleSheet, TextInput, View } from 'react-native';

import { theme } from '../constants/theme';
import { Icon } from './Icon';

type SearchBarProps = {
  onChangeText: (text: string) => void;
  placeholder: string;
  value: string;
};

// Campo de busca reutilizavel com icone de lupa a esquerda
export function SearchBar({ onChangeText, placeholder, value }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Icon color={theme.colors.title} name="search" size={theme.icon.medium} />
      <TextInput
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.placeholder}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.input,
    flexDirection: 'row',
    gap: theme.spacing.medium,
    minHeight: 48,
    paddingHorizontal: theme.spacing.input,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.shadow.opacity,
    shadowRadius: theme.shadow.radius,
    elevation: theme.shadow.elevation,
  },
  input: {
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
  },
});
