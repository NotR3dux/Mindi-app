import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Toast } from '@/components/Toast';
import { colors } from '@/constants/theme';
import { AppStoreProvider, useStore } from '@/store/AppStore';

function RootStack() {
  const { ready } = useStore();
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
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="booking/success" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen
          name="call/[id]"
          options={{ presentation: 'fullScreenModal', animation: 'fade', gestureEnabled: false }}
        />
        <Stack.Screen name="chat/[id]" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
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
