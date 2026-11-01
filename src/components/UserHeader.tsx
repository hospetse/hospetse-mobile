import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '../constants/theme';
import { Icon } from './Icon';

type UserHeaderProps = {
  avatarUri: string;
  city: string;
  name: string;
};

// Cabeçalho com a foto, o nome e a cidade do Tutor, e o sino de notificações
export function UserHeader({ avatarUri, city, name }: UserHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.userRow}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
        <View>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.userCity}>{city}</Text>
        </View>
      </View>
      <TouchableOpacity accessibilityLabel="Notificações" style={styles.bell}>
        <Icon color={theme.colors.title} name="notifications" size={theme.icon.medium} />
      </TouchableOpacity>
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
