import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { PET_SIZE_LABEL, PET_SPECIES_LABEL } from '../constants/pets';
import type { Pet } from '../services/pets';
import { theme } from '../constants/theme';
import { Icon } from './Icon';

const formatBirthDate = (birthDate?: string | null): string | null => {
  if (!birthDate) return null;
  const [year, month, day] = birthDate.split('-');
  return `${day}/${month}/${year}`;
};

type TutorPetCardProps = {
  pet: Pet;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
};

export function TutorPetCard({ pet, onEdit, onDelete, deleting = false }: TutorPetCardProps) {
  const details = [PET_SPECIES_LABEL[pet.species], pet.breed, pet.size ? PET_SIZE_LABEL[pet.size] : null].filter(Boolean);
  const birthDate = formatBirthDate(pet.birthDate);

  return (
    <View style={styles.card}>
      <View style={styles.avatar}><Icon color={theme.colors.button} name="pets" size={theme.icon.large} /></View>
      <View style={styles.content}>
        <Text style={styles.name}>{pet.name}</Text>
        <Text style={styles.details}>{details.join(' · ')}</Text>
        {birthDate ? <Text style={styles.birthDate}>Nascimento: {birthDate}</Text> : null}
        <View style={styles.actions}>
          <TouchableOpacity accessibilityLabel={`Editar ${pet.name}`} accessibilityRole="button" disabled={deleting} onPress={onEdit} style={styles.actionButton}>
            <Icon color={theme.colors.button} name="edit" size={theme.icon.small} />
            <Text style={styles.editText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityLabel={`Excluir ${pet.name}`} accessibilityRole="button" disabled={deleting} onPress={onDelete} style={styles.actionButton}>
            <Icon color={theme.colors.error} name="delete" size={theme.icon.small} />
            <Text style={styles.deleteText}>{deleting ? 'Excluindo...' : 'Excluir'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', backgroundColor: theme.colors.white, borderRadius: theme.radius.card, boxShadow: theme.shadow.soft, flexDirection: 'row', gap: theme.spacing.medium, padding: theme.spacing.large },
  avatar: { alignItems: 'center', backgroundColor: theme.colors.selectedTint, borderRadius: theme.radius.round, height: theme.spacing.petAvatar, justifyContent: 'center', width: theme.spacing.petAvatar },
  content: { flex: 1, gap: theme.spacing.tiny },
  name: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.cardTitle },
  details: { color: theme.colors.text, fontFamily: theme.fonts.regular, fontSize: theme.typography.body },
  birthDate: { color: theme.colors.placeholder, fontFamily: theme.fonts.regular, fontSize: theme.typography.caption },
  actions: { flexDirection: 'row', gap: theme.spacing.medium, marginTop: theme.spacing.small },
  actionButton: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.tiny, paddingVertical: theme.spacing.tiny },
  editText: { color: theme.colors.button, fontFamily: theme.fonts.semiBold, fontSize: theme.typography.caption },
  deleteText: { color: theme.colors.error, fontFamily: theme.fonts.semiBold, fontSize: theme.typography.caption },
});
