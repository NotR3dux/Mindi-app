import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius } from '@/constants/theme';
import type { OrderStatus } from '@/data/orders';
import type { IconName } from '@/data/services';

// Hijau = selesai, oranye = menunggu/perhatian, ungu = sedang berjalan, abu = tidak aktif.
// Selalu ada ikon + teks agar status tidak hanya bergantung pada warna.
const STYLE: Record<OrderStatus, { bg: string; fg: string; icon: IconName }> = {
  'Menunggu Partner': { bg: colors.orange, fg: colors.orangeText, icon: 'time-outline' },
  'Partner Ditugaskan': { bg: colors.lavender, fg: colors.primary, icon: 'person-outline' },
  'Menunggu Waktu Pengingat': { bg: colors.orange, fg: colors.orangeText, icon: 'hourglass-outline' },
  'Sedang Menghubungi': { bg: colors.lavender, fg: colors.primary, icon: 'call-outline' },
  'Menunggu Konfirmasi': { bg: colors.orange, fg: colors.orangeText, icon: 'help-circle-outline' },
  Selesai: { bg: colors.mint, fg: colors.mintText, icon: 'checkmark-circle-outline' },
  Dibatalkan: { bg: colors.gray, fg: colors.grayText, icon: 'close-circle-outline' },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STYLE[status];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Ionicons name={s.icon} size={13} color={s.fg} />
      <Text style={[styles.text, { color: s.fg }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  text: { fontFamily: fonts.semibold, fontSize: 11.5 },
});
