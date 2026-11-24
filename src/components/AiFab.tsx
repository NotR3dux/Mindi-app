// Tombol AI Assistant yang melayang (floating) di atas navigasi bawah.
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, shadow } from '@/constants/theme';

export function AiFab({ bottom = 80 }: { bottom?: number }) {
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom }]}>
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.95 }] }]}
        onPress={() => router.push('/assistant')}
        accessibilityRole="button"
        accessibilityLabel="Tanya AI Assistant"
      >
        <Ionicons name="sparkles" size={20} color={colors.white} />
        <Text style={styles.label}>Tanya AI</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 16 },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.deep,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    ...shadow,
    shadowOpacity: 0.25,
    elevation: 6,
  },
  label: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.white },
});
