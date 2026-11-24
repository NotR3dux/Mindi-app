import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Chip, IconBubble, ScreenHeader, Steps, T } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { INCLUDED_PER_REMINDER, PRICE_NOTE, getPlan } from '@/data/plans';
import { SERVICES, SERVICE_FILTERS } from '@/data/services';
import { useStore } from '@/store/AppStore';
import { formatRupiah } from '@/utils/format';

export default function ServicesScreen() {
  const { draft, updateDraft, subscription } = useStore();
  const [filter, setFilter] = useState<(typeof SERVICE_FILTERS)[number]>('Semua');
  const [open, setOpen] = useState<string | null>(null);
  const plan = subscription ? getPlan(subscription.planId) : null;
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

        {/* Info harga & paket */}
        <Pressable style={styles.planInfo} onPress={() => router.push('/plans')}>
          <Ionicons name={plan ? 'ribbon' : 'pricetags-outline'} size={20} color={colors.primary} />
          <T variant="small" style={{ flex: 1 }}>
            {plan
              ? `${plan.name} aktif — sisa ${subscription!.quota - subscription!.used} pengingat gratis untuk layanan bertanda.`
              : PRICE_NOTE}
          </T>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </Pressable>

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
            {plan?.services.includes(s.id) && (
              <View style={styles.inPlan}>
                <Ionicons name="ribbon" size={12} color={colors.mintText} />
                <Text style={styles.inPlanText}>Termasuk {plan.name}</Text>
              </View>
            )}
            {/* Yang kamu dapat */}
            <Pressable style={styles.getRow} onPress={() => setOpen(open === s.id ? null : s.id)}>
              <Ionicons name="gift-outline" size={15} color={colors.primary} />
              <Text style={styles.getText}>Yang kamu dapat per pengingat</Text>
              <Ionicons name={open === s.id ? 'chevron-up' : 'chevron-down'} size={15} color={colors.primary} />
            </Pressable>
            {open === s.id && (
              <View style={styles.getList}>
                {[s.extra, ...INCLUDED_PER_REMINDER].map((k, i) => (
                  <View key={k} style={styles.getItem}>
                    <Ionicons name={i === 0 ? 'star' : 'checkmark'} size={14} color={i === 0 ? colors.star : colors.mintText} />
                    <T variant="small" style={{ flex: 1 }}>
                      {k}
                    </T>
                  </View>
                ))}
              </View>
            )}
            <View style={[styles.row, styles.footer]}>
              <T variant="small">
                mulai <T variant="bodyBold" style={{ color: colors.primary }}>{formatRupiah(s.startPrice)}</T>/pengingat
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
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.lavender,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  inPlan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.mint,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: spacing.sm,
  },
  inPlanText: { fontFamily: fonts.semibold, fontSize: 11, color: colors.mintText },
  getRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md },
  getText: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.primary, flex: 1 },
  getList: { backgroundColor: colors.offWhite, borderRadius: radius.sm, padding: spacing.md, marginTop: spacing.sm, gap: 4 },
  getItem: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
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
