import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Mascot } from '@/components/Mascot';
import { Button, T } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { getPartner } from '@/data/partners';
import { useStore } from '@/store/AppStore';
import { formatDateLong, formatTime } from '@/utils/format';
import { resetTo, resetToHome } from '@/utils/nav';

const CONFETTI = ['#7656C8', '#F5A623', '#4FC3A1', '#FF8A80', '#64B5F6', '#B7A2F0'];

export default function SuccessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, resetDraft } = useStore();
  const order = orders.find((o) => o.id === id);
  const partner = order ? getPartner(order.partnerId) : undefined;

  const goOrder = () => {
    resetDraft();
    if (order) resetTo(`/order/${order.id}`);
    else resetToHome();
  };
  const goHome = () => {
    resetDraft();
    resetToHome();
  };

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.center}>
        {/* konfeti sederhana */}
        <View style={styles.confetti}>
          {CONFETTI.concat(CONFETTI).map((c, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                width: 8,
                height: 14,
                borderRadius: 3,
                backgroundColor: c,
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 100}%`,
                transform: [{ rotate: `${i * 40}deg` }],
              }}
            />
          ))}
          <View style={styles.check}>
            <Ionicons name="checkmark" size={56} color={colors.white} />
          </View>
        </View>

        <T variant="h1" style={{ textAlign: 'center', marginTop: spacing.lg }}>
          Pesanan Berhasil!
        </T>
        {order && partner ? (
          <T variant="body" style={{ textAlign: 'center', marginTop: spacing.sm }}>
            {partner.name} akan menghubungi kamu via {order.method.toLowerCase()} pada{'\n'}
            <T variant="bodyBold">
              {formatDateLong(order.date)}, {formatTime(order.time)}
            </T>
          </T>
        ) : (
          <T variant="body" style={{ textAlign: 'center' }}>
            Pesananmu sudah tercatat.
          </T>
        )}
        <T variant="caption" style={{ textAlign: 'center', marginTop: spacing.sm }}>
          No. pesanan #{id} · Pembayaran simulasi berhasil
        </T>

        <Mascot size={120} mood="happy" />
      </View>

      <View style={{ gap: spacing.md }}>
        <Button title="Lihat Pesanan Saya" onPress={goOrder} />
        <Button title="Kembali ke Beranda" variant="outline" onPress={goHome} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.xl, justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  confetti: { width: 200, height: 150, alignItems: 'center', justifyContent: 'center' },
  check: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3CC59A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: colors.mint,
  },
});
