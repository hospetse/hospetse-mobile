import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import { Icon, IconName } from './Icon';

type AmenityItemProps = {
  icon: IconName;
  label: string;
};

// Comodidade do Host: ícone num círculo branco e o nome embaixo
export function AmenityItem({ icon, label }: AmenityItemProps) {
  return (
    <View accessible accessibilityLabel={label} style={styles.item}>
      <View style={styles.circle}>
        <Icon color={theme.colors.title} name={icon} size={theme.icon.large} />
      </View>
      <Text numberOfLines={1} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.tiny,
  },
  circle: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.round,
    boxShadow: theme.shadow.soft,
    height: theme.spacing.amenityCircle,
    justifyContent: 'center',
    width: theme.spacing.amenityCircle,
  },
  label: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
});
