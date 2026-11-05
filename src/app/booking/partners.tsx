import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Button, Card, Chip, ScreenHeader, Steps, T } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { PARTNERS, type Partner } from '@/data/partners';
import { getService } from '@/data/services';
import { useStore } from '@/store/AppStore';
import { formatRupiah, formatTime, relativeDayLabel } from '@/utils/format';

type Sort = 'rating' | 'harga';

export default function PartnersScreen() {
  const { draft, updateDraft } = useStore();
  const [sort, setSort] = useState<Sort>('rating');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const service = getService(draft.serviceId ?? 'wakeup');

  const list = [...PARTNERS]
    .filter((p) => !onlyAvailable || p.available)
    .sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      return sort === 'rating' ? b.rating - a.rating || b.completed - a.completed : a.rate - b.rate;
    });

  // "Rekomendasi": partner tersedia dengan rating & pengalaman tertinggi
  const recommendedId = [...PARTNERS]
    .filter((p) => p.available)
    .sort((a, b) => b.rating - a.rating || b.completed - a.completed)[0]?.id;

  const choose = (p: Partner) => {
    updateDraft({ partnerId: p.id });
    router.push('/booking/summary');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScreenHeader title="Pilih Reminder Partner" />
      <Steps current={3} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.summary}>
          <Ionicons name="calendar-outline" size={16} color={colors.primary} />
          <T variant="small" style={{ flex: 1 }}>
            {service.name} · {draft.date ? relativeDayLabel(draft.date) : '-'} · {draft.time ? formatTime(draft.time) : '-'}
          </T>
        </View>

        <View style={styles.filters}>
          <Chip label="Rating" icon="star-outline" selected={sort === 'rating'} onPress={() => setSort('rating')} />
          <Chip label="Harga" icon="pricetag-outline" selected={sort === 'harga'} onPress={() => setSort('harga')} />
          <Chip
            label="Tersedia"
            icon="checkmark-circle-outline"
            selected={onlyAvailable}
            onPress={() => setOnlyAvailable((v) => !v)}
          />
        </View>

        {list.map((p) => (
          <Card key={p.id} style={[styles.card, !p.available && { opacity: 0.6 }]}>
            {p.id === recommendedId && (
              <View style={styles.recommended}>
                <Ionicons name="sparkles" size={11} color={colors.white} />
                <Text style={styles.recommendedText}>Rekomendasi</Text>
              </View>
            )}
            <View style={styles.row}>
              <Avatar initials={p.initials} color={p.avatarColor} size={56} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <T variant="h3">{p.name}</T>
                  {p.verified && <Ionicons name="checkmark-circle" size={15} color={colors.primary} />}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Ionicons name="star" size={13} color={colors.star} />
                  <T variant="small">
                    <Text style={{ fontFamily: fonts.semibold, color: colors.deep }}>{p.rating.toFixed(1).replace('.', ',')}</Text> ({p.completed} pesanan)
                  </T>
                </View>
                <T variant="bodyBold" style={{ color: colors.primary }}>
                  {formatRupiah(p.rate)}
                </T>
              </View>
              <Button title="Pilih" small disabled={!p.available} onPress={() => choose(p)} />
            </View>
            <T variant="small" style={{ marginTop: spacing.sm }}>
              {p.bio}
            </T>
            <View style={styles.meta}>
              <View style={[styles.availability, { backgroundColor: p.available ? colors.mint : colors.gray }]}>
                <View style={[styles.availDot, { backgroundColor: p.available ? colors.mintText : colors.grayText }]} />
                <Text style={[styles.availText, { color: p.available ? colors.mintText : colors.grayText }]}>
                  {p.available ? 'Tersedia' : 'Tidak tersedia'}
                </Text>
              </View>
              <Ionicons name="language-outline" size={13} color={colors.textLight} />
              <T variant="caption" style={{ flex: 1 }} numberOfLines={1}>
                {p.languages}
              </T>
            </View>
          </Card>
        ))}

        <View style={styles.note}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.mintText} />
          <T variant="caption" style={{ flex: 1 }}>
            Semua partner telah diverifikasi identitasnya. Data pribadi partner tidak ditampilkan.
          </T>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.lavender,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  filters: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.lg },
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  recommended: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderTopRightRadius: radius.lg,
    borderBottomLeftRadius: radius.md,
  },
  recommendedText: { fontFamily: fonts.semibold, fontSize: 10.5, color: colors.white },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginRight: 4,
  },
  availDot: { width: 6, height: 6, borderRadius: 3 },
  availText: { fontFamily: fonts.semibold, fontSize: 11 },
  note: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: spacing.sm },
});
