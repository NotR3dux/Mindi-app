import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Toast } from '@/components/Toast';
import { colors } from '@/constants/theme';
import { AppStoreProvider, useStore } from '@/store/AppStore';

// Semua layar yang hanya boleh dibuka setelah login
const PRIVATE_SCREENS = [
  'booking/services',
  'booking/details',
  'booking/partners',
  'booking/summary',
  'order/[id]',
  'order/rate/[id]',
  'notifications',
  'assistant',
  'help',
  'plans',
  'rewards',
  'sop',
  'partner-apply',
];

function RootStack() {
  const { ready, account, onboarded } = useStore();
  const loggedIn = !!account;

  // Akun baru: tampilkan panduan fitur dulu (sekali per akun)
  useEffect(() => {
    if (ready && loggedIn && !onboarded) {
      const t = setTimeout(() => router.push({ pathname: '/tutorial', params: { first: '1' } }), 80);
      return () => clearTimeout(t);
    }
    // jalan saat akun berganti (login / daftar)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, account?.id]);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.offWhite },
          animation: 'slide_from_right',
        }}
      >
        {/* Belum login: Welcome, Masuk, Daftar */}
        <Stack.Protected guard={!loggedIn} redirectTo="/">
          <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
        </Stack.Protected>

        {/* Sudah login: semua fitur aplikasi */}
        <Stack.Protected guard={loggedIn} redirectTo="/welcome">
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          {PRIVATE_SCREENS.map((name) => (
            <Stack.Screen key={name} name={name} />
          ))}
          <Stack.Screen name="booking/success" options={{ animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="tutorial" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
          <Stack.Screen name="call/[id]" options={{ presentation: 'fullScreenModal', animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="chat/[id]" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
        </Stack.Protected>
      </Stack>
      <Toast />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppStoreProvider>
        <StatusBar style="dark" />
        {/* Di web, tampilan dibatasi selebar HP agar mirip aplikasi mobile */}
        <View style={styles.webOuter}>
          <View style={styles.webInner}>
            <RootStack />
          </View>
        </View>
      </AppStoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.offWhite },
  webOuter: { flex: 1, backgroundColor: Platform.OS === 'web' ? '#E9E3F7' : colors.offWhite, alignItems: 'center' },
  webInner: { flex: 1, width: '100%', maxWidth: Platform.OS === 'web' ? 440 : undefined, backgroundColor: colors.offWhite },
});
