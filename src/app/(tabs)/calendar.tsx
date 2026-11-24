// Kalender: lihat kapan saja jasa pengingat sudah dipesan (termasuk jadwal berulang).
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OrderCard } from '@/components/OrderCard';
import { Button, Card, T } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { isActive, orderDates } from '@/data/orders';
import { getService } from '@/data/services';
import { useStore } from '@/store/AppStore';
import { formatDateLong, toDateKey } from '@/utils/format';

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DOW = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function CalendarScreen() {
  const { orders, resetDraft } = useStore();
  const today = toDateKey(new Date());
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState(today);

  // Peta tanggal -> pesanan (yang dibatalkan tidak ditampilkan)
  const byDate = useMemo(() => {
    const map: Record<string, typeof orders> = {};
    orders
      .filter((o) => o.status !== 'Dibatalkan')
      .forEach((o) => orderDates(o).forEach((d) => (map[d] = [...(map[d] ?? []), o])));
    return map;
  }, [orders]);

  const cells = useMemo(() => {
    const first = cursor.getDay();
    const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const list: (Date | null)[] = Array.from({ length: first }, () => null);
    for (let i = 1; i <= days; i++) list.push(new Date(cursor.getFullYear(), cursor.getMonth(), i));
    while (list.length % 7) list.push(null);
    return list;
  }, [cursor]);

  const moveMonth = (n: number) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + n, 1));
  const selectedOrders = byDate[selected] ?? [];
  const monthCount = Object.keys(byDate).filter((k) => k.startsWith(toDateKey(cursor).slice(0, 7))).length;

  const book = () => {
    resetDraft(selected >= today ? { date: selected } : undefined);
    router.push('/booking/services');
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <T variant="h1">Kalender</T>
        <T variant="body">Lihat jadwal pengingat yang sudah kamu pesan.</T>

        <Card style={{ marginTop: spacing.lg }}>
          <View style={styles.monthRow}>
            <Pressable onPress={() => moveMonth(-1)} hitSlop={10} accessibilityLabel="Bulan sebelumnya">
              <Ionicons name="chevron-back" size={22} color={colors.primary} />
            </Pressable>
            <View style={{ alignItems: 'center' }}>
              <T variant="h3">
                {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
              </T>
              <T variant="caption">{monthCount} hari ada pengingat</T>
            </View>
            <Pressable onPress={() => moveMonth(1)} hitSlop={10} accessibilityLabel="Bulan berikutnya">
              <Ionicons name="chevron-forward" size={22} color={colors.primary} />
            </Pressable>
          </View>

          <View style={styles.grid}>
            {DOW.map((d) => (
              <Text key={d} style={styles.dow}>
                {d}
              </Text>
            ))}
            {cells.map((d, i) => {
              if (!d) return <View key={`e${i}`} style={styles.cell} />;
              const key = toDateKey(d);
              const list = byDate[key] ?? [];
              const isSel = key === selected;
              const isToday = key === today;
              return (
                <Pressable key={key} style={styles.cell} onPress={() => setSelected(key)}>
                  <View style={[styles.day, isToday && styles.today, isSel && styles.daySel]}>
                    <Text style={[styles.dayText, isSel && { color: colors.white }, key < today && !isSel && { color: colors.textLight }]}>
                      {d.getDate()}
                    </Text>
                  </View>
                  <View style={styles.dots}>
                    {list.slice(0, 3).map((o, j) => (
                      <View
                        key={j}
                        style={[styles.dot, { backgroundColor: isActive(o.status) ? getService(o.serviceId).iconColor : colors.mintText }]}
                      />
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.legend}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <T variant="caption">Terjadwal (warna = jenis layanan)</T>
            <View style={[styles.dot, { backgroundColor: colors.mintText, marginLeft: 8 }]} />
            <T variant="caption">Selesai</T>
          </View>
        </Card>

        <T variant="h3" style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
          {formatDateLong(selected)}
        </T>
        {selectedOrders.length === 0 ? (
          <Card style={styles.empty}>
            <Ionicons name="calendar-clear-outline" size={24} color={colors.primary} />
            <T variant="small" style={{ flex: 1 }}>
              Belum ada pengingat di tanggal ini.
            </T>
          </Card>
        ) : (
          selectedOrders.map((o) => <OrderCard key={o.id} order={o} />)
        )}
        {selected >= today && (
          <Button title="Pesan untuk tanggal ini" icon="add" variant="outline" onPress={book} style={{ marginTop: spacing.sm }} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 120 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dow: { width: '14.28%', textAlign: 'center', fontFamily: fonts.medium, fontSize: 11, color: colors.textLight, marginBottom: 6 },
  cell: { width: '14.28%', alignItems: 'center', paddingVertical: 3, minHeight: 46 },
  day: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 1.5, borderColor: colors.primary },
  daySel: { backgroundColor: colors.primary },
  dayText: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.deep },
  dots: { flexDirection: 'row', gap: 2, height: 6, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.sm, flexWrap: 'wrap' },
  empty: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
