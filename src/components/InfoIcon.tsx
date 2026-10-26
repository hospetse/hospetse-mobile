import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';

export function InfoIcon() {
  return (
    <View style={styles.circle}>
      <Text style={styles.text}>i</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    borderColor: theme.colors.button,
    borderRadius: theme.radius.checkbox,
    borderWidth: 1,
    height: theme.spacing.checkbox,
    justifyContent: 'center',
    marginRight: theme.spacing.small,
    width: theme.spacing.checkbox,
  },
  text: {
    color: theme.colors.button,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.label,
  },
});
