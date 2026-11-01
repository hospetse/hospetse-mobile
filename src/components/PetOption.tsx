import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { theme } from '../constants/theme';

type PetOptionProps = {
  imageUri: string;
  name: string;
  onPress: () => void;
  selected: boolean;
};

// Foto redonda e nome do pet; o escolhido fica com borda e nome laranja
export function PetOption({ imageUri, name, onPress, selected }: PetOptionProps) {
  return (
    <TouchableOpacity
      accessibilityLabel={name}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.option}
    >
      <Image
        source={{ uri: imageUri }}
        style={[styles.photo, selected ? styles.photoSelected : styles.photoIdle]}
      />
      <Text style={[styles.name, selected && styles.nameSelected]}>{name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  option: {
    alignItems: 'center',
    gap: theme.spacing.tiny,
  },
  photo: {
    borderRadius: theme.radius.round,
    borderWidth: 2,
    height: theme.spacing.petAvatar,
    width: theme.spacing.petAvatar,
  },
  photoSelected: {
    borderColor: theme.colors.button,
  },
  photoIdle: {
    borderColor: theme.colors.divider,
  },
  name: {
    color: theme.colors.placeholder,
    fontFamily: theme.fonts.medium,
    fontSize: theme.typography.button,
  },
  nameSelected: {
    color: theme.colors.button,
    fontFamily: theme.fonts.semiBold,
  },
});
