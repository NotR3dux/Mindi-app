// Reward: penjelasan poin, level & keuntungannya, voucher mingguan, tukar poin.
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, ScreenHeader, T } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { EARN_RULES, REDEEM_CATALOG, TIERS, WEEKLY_VOUCHER, isVoucherValid, nextTier, tierFor } from '@/data/rewards';
import { useStore } from '@/store/AppStore';
import { formatDateShort, toDateKey } from '@/utils/format';

export default function RewardsScreen() {
  const { points, vouchers, weeklyClaimed, claimWeeklyVoucher, redeemPoints, toast } = useStore();
  const tier = tierFor(points);
  const next = nextTier(points);
  const myVouchers = vouchers.filter(isVoucherValid);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScreenHeader title="Reward & Voucher" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Poin & level */}
        <View style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroLabel}>Poin kamu</Text>
            <Text style={styles.heroPoints}>{points}</Text>
            <View style={styles.tierPill}>
              <Ionicons name={tier.icon} size={13} color={tier.color} />
              <Text style={[styles.tierText, { color: tier.color }]}>Level {tier.name}</Text>
            </View>
          </View>
          <Ionicons name="trophy" size={64} color="#FFD873" />
        </View>
        {next && (
          <View style={{ marginTop: spacing.md }}>
            <View style={styles.bar}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.min(100, ((points - tier.minPoints) / (next.minPoints - tier.minPoints)) * 100)}%` },
                ]}
              />
            </View>
            <T variant="caption">
              {next.minPoints - points} poin lagi menuju {next.name}: {next.benefit}
            </T>
          </View>
        )}

        {/* Voucher mingguan */}
        <Card style={styles.weekly}>
          <View style={styles.row}>
            <Ionicons name="gift" size={28} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <T variant="h3">{WEEKLY_VOUCHER.title}</T>
              <T variant="small">{WEEKLY_VOUCHER.description}. Bisa diklaim 1x setiap minggu.</T>
            </View>
          </View>
          <Button
            title={weeklyClaimed ? 'Sudah diklaim minggu ini' : 'Klaim voucher minggu ini'}
            icon={weeklyClaimed ? 'checkmark' : 'gift-outline'}
            disabled={weeklyClaimed}
            small
            style={{ marginTop: spacing.md }}
            onPress={() => claimWeeklyVoucher() && toast('Voucher mingguan masuk ke dompet voucher!')}
          />
        </Card>

        {/* Dompet voucher */}
        <T variant="h3" style={styles.section}>
          Voucher Saya ({myVouchers.length})
        </T>
        {myVouchers.length === 0 ? (
          <T variant="small">Belum ada voucher. Klaim voucher mingguan atau tukar poin di bawah.</T>
        ) : (
          myVouchers.map((v) => (
            <View key={v.id} style={styles.voucher}>
              <View style={styles.voucherLeft}>
                <Text style={styles.voucherValue}>{v.type === 'percent' ? `${v.value}%` : `${v.value / 1000}rb`}</Text>
              </View>
              <View style={{ flex: 1, padding: spacing.md }}>
                <T variant="bodyBold">{v.title}</T>
                <T variant="caption">{v.description}</T>
                <T variant="caption">Berlaku s.d. {formatDateShort(toDateKey(new Date(v.expiresAt)))}</T>
              </View>
            </View>
          ))
        )}
        {myVouchers.length > 0 && (
          <T variant="caption" style={{ marginTop: 4 }}>
            Pakai voucher di halaman Konfirmasi Pesanan.
          </T>
        )}

        {/* Cara dapat poin */}
        <T variant="h3" style={styles.section}>
          Cara Dapat Poin
        </T>
        <Card style={{ paddingVertical: 6 }}>
          {EARN_RULES.map((r) => (
            <View key={r.label} style={styles.ruleRow}>
              <Ionicons name={r.icon} size={18} color={colors.primary} />
              <T variant="small" style={{ flex: 1 }}>
                {r.label}
              </T>
              <T variant="bodyBold" style={{ color: colors.mintText }}>
                {r.points}
              </T>
            </View>
          ))}
        </Card>

        {/* Tukar poin */}
        <T variant="h3" style={styles.section}>
          Tukar Poin
        </T>
        {REDEEM_CATALOG.map((r) => (
          <Card key={r.id} style={[styles.row, { marginBottom: spacing.sm }]}>
            <Ionicons name="pricetag" size={22} color={colors.orangeText} />
            <View style={{ flex: 1 }}>
              <T variant="bodyBold">{r.title}</T>
              <T variant="caption">{r.cost} poin</T>
            </View>
            <Button
              title="Tukar"
              small
              variant="soft"
              disabled={points < r.cost}
              onPress={() => (redeemPoints(r.id) ? toast(`Berhasil! ${r.title} masuk ke voucher`) : toast('Poin belum cukup'))}
            />
          </Card>
        ))}

        {/* Level */}
        <T variant="h3" style={styles.section}>
          Level & Keuntungan
        </T>
        <Card style={{ paddingVertical: 6 }}>
          {TIERS.map((t) => {
            const unlocked = points >= t.minPoints;
            return (
              <View key={t.name} style={[styles.ruleRow, !unlocked && { opacity: 0.5 }]}>
                <View style={[styles.tierIcon, { backgroundColor: t.color + '22' }]}>
                  <Ionicons name={unlocked ? t.icon : 'lock-closed'} size={18} color={t.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <T variant="bodyBold">
                    {t.name} <T variant="caption">· {t.minPoints}+ poin</T>
                  </T>
                  <T variant="caption">{t.benefit}</T>
                </View>
                {t.name === tier.name && <Ionicons name="checkmark-circle" size={18} color={colors.mintText} />}
              </View>
            );
          })}
        </Card>

        <Button title="Pesan Reminder & kumpulkan poin" variant="outline" style={{ marginTop: spacing.xl }} onPress={() => router.push('/booking/services')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  hero: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.xl },
  heroLabel: { fontFamily: fonts.medium, color: '#EDE6FF', fontSize: 13 },
  heroPoints: { fontFamily: fonts.bold, color: colors.white, fontSize: 34, lineHeight: 42 },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tierText: { fontFamily: fonts.semibold, fontSize: 12 },
  bar: { height: 8, borderRadius: 4, backgroundColor: colors.gray, overflow: 'hidden', marginBottom: 4 },
  barFill: { height: '100%', backgroundColor: colors.primary },
  weekly: { marginTop: spacing.lg, borderWidth: 1.5, borderColor: colors.lavenderMid },
  section: { marginTop: spacing.xl, marginBottom: spacing.md },
  voucher: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  voucherLeft: { width: 74, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center' },
  voucherValue: { fontFamily: fonts.bold, fontSize: 18, color: colors.orangeText },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 8 },
  tierIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
