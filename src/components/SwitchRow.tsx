import { StyleSheet, Switch, Text, View } from 'react-native';

import { theme } from '../constants/theme';

type SwitchRowProps = {
  description: string;
  onValueChange: (value: boolean) => void;
  title: string;
  value: boolean;
};

// Pergunta com explicação curta e um interruptor de sim ou não
export function SwitchRow({ description, onValueChange, title, value }: SwitchRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Switch
        accessibilityLabel={title}
        onValueChange={onValueChange}
        thumbColor={theme.colors.white}
        trackColor={{ false: theme.colors.text, true: theme.colors.button }}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.medium,
    justifyContent: 'space-between',
  },
  texts: {
    flex: 1,
  },
  title: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.body,
  },
  description: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
    marginTop: theme.spacing.tiny / 2,
  },
});
