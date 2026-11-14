import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { PetsProvider } from '../context/PetsContext';
import { SessionProvider } from '../context/SessionContext';
import { SignupProvider } from '../context/SignupContext';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SessionProvider>
      <PetsProvider>
        <SignupProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
        </SignupProvider>
      </PetsProvider>
    </SessionProvider>
  );
}
