import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '../constants/theme';
import { Icon, IconName } from './Icon';
import { StatusPill } from './StatusPill';

type ProfileMenuItemProps = {
  icon: IconName;
  iconBackground: string;
  iconColor: string;
  subtitle: string;
  title: string;
  badge?: string;
  onPress?: () => void;
};

export function ProfileMenuItem({
  icon,
  iconBackground,
  iconColor,
  subtitle,
  title,
  badge,
  onPress,
}: ProfileMenuItemProps) {
  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: iconBackground }]}>
        <Icon color={iconColor} name={icon} size={theme.icon.medium} />
      </View>
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {badge ? (
        <StatusPill backgroundColor={theme.colors.selectedTint} color={theme.colors.subtitle} label={badge} />
      ) : null}
      <Icon color={theme.colors.placeholder} name="chevron_right" size={theme.icon.large} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.medium,
    padding: theme.spacing.large,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: theme.radius.input,
    height: theme.spacing.menuIcon,
    justifyContent: 'center',
    width: theme.spacing.menuIcon,
  },
  texts: { flex: 1 },
  title: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.cardTitle,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
    marginTop: theme.spacing.tiny / 2,
  },
});
