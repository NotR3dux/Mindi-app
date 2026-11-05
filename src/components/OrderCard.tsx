import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { StatusBadge } from '@/components/StatusBadge';
import { Card, IconBubble, T } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import type { Order } from '@/data/orders';
import { getPartner } from '@/data/partners';
import { getService } from '@/data/services';
import { formatRupiah, formatTime, relativeDayLabel } from '@/utils/format';

export function OrderCard({ order, showPrice, footer }: { order: Order; showPrice?: boolean; footer?: ReactNode }) {
  const service = getService(order.serviceId);
  const partner = getPartner(order.partnerId);
  return (
    <Card style={styles.card} onPress={() => router.push(`/order/${order.id}`)}>
      <View style={styles.row}>
        <IconBubble name={service.icon} bg={service.color} color={service.iconColor} size={48} />
        <View style={{ flex: 1 }}>
          <T variant="bodyBold" numberOfLines={1}>
            {service.name}
          </T>
          <T variant="small" numberOfLines={1}>
            {relativeDayLabel(order.date)} · {formatTime(order.time)}
          </T>
          <T variant="caption" numberOfLines={1}>
            oleh {partner.name} · {order.method}
          </T>
        </View>
        {showPrice ? (
          <T variant="bodyBold">{formatRupiah(order.price)}</T>
        ) : (
          <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
        )}
      </View>
      <View style={[styles.row, { marginTop: spacing.sm, justifyContent: 'space-between' }]}>
        <StatusBadge status={order.status} />
        <T variant="caption">#{order.id}</T>
      </View>
      {footer}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
