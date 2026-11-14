import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { ErrorModal } from '../components/ErrorModal';
import { Icon } from '../components/Icon';
import { Skeleton } from '../components/Skeleton';
import { TutorPetCard } from '../components/TutorPetCard';
import { theme } from '../constants/theme';
import { usePets } from '../context/PetsContext';

function listErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 403) {
    return 'Complete seu perfil de Tutor antes de cadastrar seus pets.';
  }
  if (!axios.isAxiosError(error) || !error.response) {
    return 'Não foi possível conectar. Verifique sua internet e tente novamente.';
  }
  return 'Não foi possível carregar seus pets. Tente novamente.';
}

export default function PetsScreen() {
  const { pets, loading, error, refresh, removePet } = usePets();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<unknown | null>(null);

  function confirmDelete(petId: string, petName: string) {
    Alert.alert('Excluir pet?', `O cadastro de ${petName} será removido da sua lista.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(petId);
          try {
            await removePet(petId);
          } catch (error) {
            setDeleteError(error);
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  }


  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityLabel="Voltar"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Icon color={theme.colors.title} name="arrow_back" size={theme.icon.large} />
          </TouchableOpacity>
          <Text accessibilityRole="header" style={styles.title}>
            Meus pets
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.subtitle}>Cadastre os pets que vão acompanhar suas reservas.</Text>

        {loading ? (
          <View style={styles.list} accessibilityLabel="Carregando pets">
            <Skeleton height={96} radius={theme.radius.card} width="100%" />
            <Skeleton height={96} radius={theme.radius.card} width="100%" />
          </View>
        ) : pets.length > 0 ? (
          <View style={styles.list}>
            {pets.map((pet) => (
              <TutorPetCard
                key={pet.id}
                onDelete={() => confirmDelete(pet.id, pet.name)}
                onEdit={() => router.push({ pathname: '/pets/cadastro', params: { id: pet.id } })}
                pet={pet}
                deleting={deletingId === pet.id}
              />
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Icon color={theme.colors.button} name="pets" size={theme.icon.huge} />
            </View>
            <Text style={styles.emptyTitle}>Você ainda não tem pets cadastrados</Text>
            <Text style={styles.emptyText}>
              Cadastre um pet para encontrá-lo rapidamente ao solicitar uma reserva.
            </Text>
          </View>
        )}

        <Button onPress={() => router.push('/pets/cadastro')} title="Cadastrar pet" />
      </ScrollView>

      <ErrorModal
        buttonTitle="Tentar novamente"
        message={error ? listErrorMessage(error) : ''}
        onClose={() => void refresh().catch(() => {})}
        title="Não foi possível carregar"
        visible={Boolean(error) && !loading}
      />
      <ErrorModal
        message={deleteError ? listErrorMessage(deleteError) : ''}
        onClose={() => setDeleteError(null)}
        title="Não foi possível excluir"
        visible={deleteError !== null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    padding: theme.spacing.page,
    paddingBottom: theme.spacing.page * 2,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    alignItems: 'center',
    height: theme.spacing.bell,
    justifyContent: 'center',
    width: theme.spacing.bell,
  },
  headerSpacer: {
    height: theme.spacing.bell,
    width: theme.spacing.bell,
  },
  title: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.sectionTitle,
  },
  subtitle: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.small,
    textAlign: 'center',
  },
  list: {
    gap: theme.spacing.medium,
    marginTop: theme.spacing.page,
  },
  empty: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    boxShadow: theme.shadow.soft,
    marginTop: theme.spacing.page,
    padding: theme.spacing.page,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.selectedTint,
    borderRadius: theme.radius.round,
    height: theme.spacing.successCircle,
    justifyContent: 'center',
    width: theme.spacing.successCircle,
  },
  emptyTitle: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.modalTitle,
    marginTop: theme.spacing.large,
    textAlign: 'center',
  },
  emptyText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.small,
    textAlign: 'center',
  },
});
