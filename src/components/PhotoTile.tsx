import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '../constants/theme';
import { Icon } from './Icon';

type PhotoTileProps = {
  label: string;
  onPick: () => void;
  onRemove: () => void;
  uri?: string;
};

// Quadrado de um cômodo: sem foto mostra o "+" para escolher; com foto mostra a imagem, o nome e a lixeira
export function PhotoTile({ label, onPick, onRemove, uri }: PhotoTileProps) {
  if (!uri) {
    return (
      <TouchableOpacity
        accessibilityLabel={`Adicionar foto: ${label}`}
        accessibilityRole="button"
        onPress={onPick}
        style={[styles.tile, styles.empty]}
      >
        <Icon color={theme.colors.button} name="add" size={theme.icon.large} />
        <Text style={styles.emptyLabel}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.tile}>
      <Image accessibilityLabel={`Foto: ${label}`} source={{ uri }} style={styles.image} />
      <View style={styles.labelBadge}>
        <Text style={styles.photoLabel}>{label}</Text>
      </View>
      <TouchableOpacity
        accessibilityLabel={`Remover foto: ${label}`}
        accessibilityRole="button"
        hitSlop={theme.spacing.small}
        onPress={onRemove}
        style={styles.remove}
      >
        <Icon color={theme.colors.error} name="delete" size={theme.icon.medium} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    aspectRatio: 1,
    borderRadius: theme.radius.card,
    flex: 1,
    overflow: 'hidden',
  },
  empty: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    boxShadow: theme.shadow.soft,
    justifyContent: 'center',
  },
  emptyLabel: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.tiny,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  labelBadge: {
    alignSelf: 'center',
    backgroundColor: theme.colors.badge,
    borderRadius: theme.radius.badge,
    bottom: theme.spacing.small,
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.tiny / 2,
    position: 'absolute',
  },
  photoLabel: {
    color: theme.colors.white,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.body,
  },
  remove: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.round,
    height: theme.spacing.bell - theme.spacing.small,
    justifyContent: 'center',
    position: 'absolute',
    right: theme.spacing.small,
    top: theme.spacing.small,
    width: theme.spacing.bell - theme.spacing.small,
  },
});
