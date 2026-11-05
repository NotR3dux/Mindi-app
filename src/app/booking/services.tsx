import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Chip, IconBubble, ScreenHeader, Steps, T } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { SERVICES, SERVICE_FILTERS } from '@/data/services';
import { useStore } from '@/store/AppStore';
import { formatRupiah } from '@/utils/format';

export default function ServicesScreen() {
  const { draft, updateDraft } = useStore();
  const [filter, setFilter] = useState<(typeof SERVICE_FILTERS)[number]>('Semua');
  const list = SERVICES.filter((s) => filter === 'Semua' || s.category === filter);

  const choose = (id: string) => {
    updateDraft({ serviceId: id, partnerId: undefined });
    router.push('/booking/details');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScreenHeader title="Pilih Layanan" />
      <Steps current={1} />
      <ScrollView contentContainerStyle={styles.container}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {SERVICE_FILTERS.map((f) => (
            <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />
          ))}
        </ScrollView>

        {list.map((s) => (
          <Card key={s.id} style={[styles.card, draft.serviceId === s.id && styles.cardSelected]} onPress={() => choose(s.id)}>
            <View style={styles.row}>
              <IconBubble name={s.icon} bg={s.color} color={s.iconColor} size={54} />
              <View style={{ flex: 1 }}>
                <T variant="h3">{s.name}</T>
                <T variant="small">{s.description}</T>
                <T variant="caption" style={{ marginTop: 2 }}>
                  Contoh: {s.example}
                </T>
              </View>
            </View>
            <View style={[styles.row, styles.footer]}>
              <T variant="small">
                mulai <T variant="bodyBold" style={{ color: colors.primary }}>{formatRupiah(s.startPrice)}</T>
              </T>
              <Button title="Pilih Layanan" small onPress={() => choose(s.id)} />
            </View>
          </Card>
        ))}

        <Pressable onPress={() => router.push('/assistant')} style={styles.ai}>
          <IconBubble name="sparkles" bg={colors.white} size={40} />
          <View style={{ flex: 1 }}>
            <T variant="bodyBold">Butuh bantuan memilih?</T>
            <T variant="small">Tanya AI Assistant kami!</T>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  filters: { gap: spacing.sm, paddingBottom: spacing.lg },
  card: { marginBottom: spacing.md, borderWidth: 1.5, borderColor: 'transparent' },
  cardSelected: { borderColor: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  footer: {
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ai: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.lavender,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
});
