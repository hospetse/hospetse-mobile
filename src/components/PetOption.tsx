import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '../constants/theme';
import { Icon } from './Icon';

type PetOptionProps = {
  // Sem foto (os pets da API ainda não têm), mostra a patinha
  imageUri: string | null;
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
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[styles.photo, selected ? styles.photoSelected : styles.photoIdle]}
        />
      ) : (
        <View
          style={[
            styles.photo,
            styles.placeholder,
            selected ? styles.photoSelected : styles.photoIdle,
          ]}
        >
          <Icon
            color={selected ? theme.colors.button : theme.colors.placeholder}
            name="pets"
            size={theme.icon.large}
          />
        </View>
      )}
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
  placeholder: {
    alignItems: 'center',
    backgroundColor: theme.colors.selectedTint,
    justifyContent: 'center',
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
