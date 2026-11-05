import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, radius } from '@/constants/theme';
import { useStore } from '@/store/AppStore';

/** Notifikasi singkat di atas layar (dipanggil lewat toast('pesan')) */
export function Toast() {
  const { toastMessage } = useStore();
  const insets = useSafeAreaInsets();
  if (!toastMessage) return null;
  return (
    <View pointerEvents="none" style={[styles.wrap, { top: insets.top + 10 }]}>
      <View style={styles.toast}>
        <Ionicons name="information-circle" size={18} color={colors.white} />
        <Text style={styles.text}>{toastMessage}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center', zIndex: 999 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.deep,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.md,
    maxWidth: 420,
  },
  text: { color: colors.white, fontFamily: fonts.medium, fontSize: 13, flexShrink: 1 },
});
