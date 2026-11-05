import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '../constants/theme';
import { Icon } from './Icon';

type UserHeaderProps = {
  avatarUri: string;
  city: string;
  name: string;
  onLogout?: () => void;
};

// Cabeçalho com a foto, o nome e a cidade do Tutor, e o sino de notificações
export function UserHeader({ avatarUri, city, name, onLogout }: UserHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.userRow}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
        <View>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.userCity}>{city}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        {onLogout ? (
          <TouchableOpacity accessibilityLabel="Sair" accessibilityRole="button" onPress={onLogout} style={styles.logout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity accessibilityLabel="Notificações" style={styles.bell}>
          <Icon color={theme.colors.title} name="notifications" size={theme.icon.medium} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.section,
  },
  userRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.medium,
  },
  avatar: {
    borderRadius: theme.radius.round,
    height: theme.spacing.avatar,
    width: theme.spacing.avatar,
  },
  userName: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.userName,
  },
  userCity: {
    color: theme.colors.placeholder,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.small,
  },
  logout: {
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.tiny,
  },
  logoutText: {
    color: theme.colors.button,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.label,
  },
  bell: {
    alignItems: 'center',
    backgroundColor: theme.colors.iconButton,
    borderRadius: theme.radius.round,
    boxShadow: theme.shadow.soft,
    height: theme.spacing.bell,
    justifyContent: 'center',
    width: theme.spacing.bell,
  },
});
