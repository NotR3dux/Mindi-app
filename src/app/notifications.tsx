import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, IconBubble, ScreenHeader, T } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { STATUS_INFO } from '@/data/orders';
import { getService } from '@/data/services';
import { useStore } from '@/store/AppStore';

// Notifikasi dibuat dari riwayat perubahan status pesanan (simulasi)
export default function NotificationsScreen() {
  const { orders } = useStore();
  const items = orders
    .flatMap((o) => o.history.map((h) => ({ order: o, ...h })))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 30);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScreenHeader title="Notifikasi" />
      <ScrollView contentContainerStyle={styles.container}>
        {items.length === 0 ? (
          <EmptyState title="Belum ada notifikasi" message="Update status pesanan akan muncul di sini." />
        ) : (
          items.map((n, i) => {
            const s = getService(n.order.serviceId);
            return (
              <Card key={i} style={styles.card} onPress={() => router.push(`/order/${n.order.id}`)}>
                <IconBubble name={s.icon} bg={s.color} color={s.iconColor} size={42} />
                <View style={{ flex: 1, gap: 2 }}>
                  <T variant="bodyBold">{s.name}</T>
                  <T variant="small">{STATUS_INFO[n.status]}</T>
                  <StatusBadge status={n.status} />
                  <T variant="caption">
                    {new Date(n.at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </T>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  card: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
});
