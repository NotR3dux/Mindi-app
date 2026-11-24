// Paket langganan: Level 01 Starter, Level 02 Consistent, Level 03 Achiever — pembayaran simulasi.
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmModal } from '@/components/ConfirmModal';
import { PaymentPicker, QrisModal } from '@/components/Payment';
import { Button, Card, DemoBadge, IconBubble, ScreenHeader, T } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import type { PaymentMethod } from '@/data/orders';
import { INCLUDED_PER_REMINDER, PLANS, SINGLE_PRICE, getPlan, perReminder, savePercent } from '@/data/plans';
import { useStore } from '@/store/AppStore';
import { formatDateLong, formatRupiah, toDateKey } from '@/utils/format';

export default function PlansScreen() {
  const params = useLocalSearchParams<{ plan?: string }>();
  const { subscription, subscribe, cancelSubscription, toast } = useStore();
  const [chosen, setChosen] = useState<string | null>(params.plan ?? null);
  const [payment, setPayment] = useState<PaymentMethod>('QRIS');
  const [qris, setQris] = useState(false);
  const [paying, setPaying] = useState(false);
  const [confirmStop, setConfirmStop] = useState(false);

  const plan = chosen ? getPlan(chosen) : null;

  const finish = () => {
    if (!plan) return;
    subscribe(plan.id, payment);
    setQris(false);
    setPaying(false);
    setChosen(null);
    toast(`Paket ${plan.name} aktif. +20 poin (simulasi)`);
  };

  const pay = () => {
    if (payment === 'QRIS') return setQris(true);
    setPaying(true);
    setTimeout(finish, 1200);
  };

  const active = subscription ? getPlan(subscription.planId) : null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScreenHeader title="Paket Langganan" />
      <ScrollView contentContainerStyle={styles.container}>
        {active && subscription && (
          <Card style={{ borderWidth: 1.5, borderColor: colors.mintText, marginBottom: spacing.lg }}>
            <View style={styles.row}>
              <IconBubble name={active.icon} bg={colors.mint} color={colors.mintText} />
              <View style={{ flex: 1 }}>
                <T variant="caption">Paket aktif · {active.level}</T>
                <T variant="h3">{active.name}</T>
                <T variant="small">Berlaku s.d. {formatDateLong(toDateKey(new Date(subscription.endsAt)))}</T>
              </View>
            </View>
            <View style={styles.quotaBar}>
              <View style={[styles.quotaFill, { width: `${(subscription.used / subscription.quota) * 100}%` }]} />
            </View>
            <T variant="small">
              Terpakai {subscription.used} dari {subscription.quota} pengingat · sisa{' '}
              <T variant="bodyBold">{subscription.quota - subscription.used}</T>
            </T>
            <T variant="caption" style={{ marginTop: 4 }}>
              Setiap pesanan otomatis memakai kuota paket (Rp0).
            </T>
            <Button title="Berhenti langganan" variant="danger" small style={{ marginTop: spacing.md }} onPress={() => setConfirmStop(true)} />
          </Card>
        )}

        <T variant="body">
          Tanpa paket {formatRupiah(SINGLE_PRICE)} per pengingat. Pilih level yang sesuai kebutuhanmu.
        </T>

        {PLANS.map((p) => {
          const selected = chosen === p.id;
          const save = savePercent(p);
          return (
            <Card key={p.id} style={[styles.planCard, selected && styles.planSelected]} onPress={() => setChosen(p.id)}>
              <View style={styles.topRow}>
                <Text style={styles.level}>{p.level}</Text>
                {p.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{p.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.name}>{p.name}</Text>
              <T variant="small">{p.tagline}</T>

              {p.compareAt ? <Text style={styles.compare}>{formatRupiah(p.compareAt)}</Text> : null}
              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatRupiah(p.price)}</Text>
                <Text style={styles.period}>/{p.periodLabel}</Text>
              </View>
              {save > 0 && (
                <View style={styles.save}>
                  <Text style={styles.saveText}>Hemat {save}%</Text>
                </View>
              )}

              <Text style={styles.quota}>{p.quota} pengingat</Text>
              {[...p.perks, `Harga hanya sekitar ${formatRupiah(perReminder(p))}/pengingat`].map((k) => (
                <View key={k} style={styles.perk}>
                  <View style={styles.bullet} />
                  <T variant="small" style={{ flex: 1 }}>
                    {k}
                  </T>
                </View>
              ))}

              {p.compareNote && (
                <>
                  <View style={styles.divider} />
                  <T variant="small">{p.compareNote}</T>
                </>
              )}

              <Button
                title={selected ? 'Dipilih' : active?.id === p.id ? 'Perpanjang paket ini' : `Pilih ${p.name}`}
                variant={selected ? 'primary' : 'outline'}
                icon={selected ? 'checkmark' : undefined}
                small
                style={{ marginTop: spacing.md }}
                onPress={() => setChosen(p.id)}
              />
            </Card>
          );
        })}

        {/* Isi tiap pengingat */}
        <Card style={{ marginTop: spacing.sm }}>
          <T variant="h3" style={{ marginBottom: 6 }}>
            Setiap 1 pengingat sudah termasuk
          </T>
          {INCLUDED_PER_REMINDER.map((k) => (
            <View key={k} style={styles.perk}>
              <Ionicons name="checkmark" size={15} color={colors.primary} />
              <T variant="small" style={{ flex: 1 }}>
                {k}
              </T>
            </View>
          ))}
        </Card>

        {/* Checkout */}
        {plan && (
          <View style={{ marginTop: spacing.xl }}>
            <View style={styles.payHeader}>
              <T variant="h3">Pembayaran</T>
              <DemoBadge />
            </View>
            <PaymentPicker value={payment} onChange={setPayment} />
            <Button title={`Langganan ${plan.name} · ${formatRupiah(plan.price)}`} loading={paying} onPress={pay} style={{ marginTop: spacing.sm }} />
            <T variant="caption" style={{ textAlign: 'center', marginTop: spacing.sm }}>
              Prototype: tidak ada tagihan sungguhan. Paket tidak diperpanjang otomatis.
            </T>
          </View>
        )}
      </ScrollView>

      <QrisModal visible={qris} amount={plan?.price ?? 0} reference={`SUB-${plan?.id ?? ''}`} onPaid={finish} onClose={() => setQris(false)} />
      <ConfirmModal
        visible={confirmStop}
        title="Berhenti langganan?"
        message="Sisa kuota akan hangus (simulasi)."
        confirmLabel="Berhenti"
        danger
        onCancel={() => setConfirmStop(false)}
        onConfirm={() => {
          cancelSubscription();
          setConfirmStop(false);
          toast('Langganan dihentikan');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  planCard: { marginTop: spacing.lg, borderWidth: 1.5, borderColor: 'transparent' },
  planSelected: { borderColor: colors.primary },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  level: { fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 0.5, color: colors.primary },
  name: { fontFamily: fonts.bold, fontSize: 20, color: colors.deep, marginTop: 2 },
  badge: { backgroundColor: colors.mint, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.mintText },
  compare: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textLight,
    textDecorationLine: 'line-through',
    marginTop: spacing.md,
  },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: 2 },
  price: { fontFamily: fonts.bold, fontSize: 28, color: colors.primary, lineHeight: 36 },
  period: { fontFamily: fonts.medium, fontSize: 15, color: colors.text, marginBottom: 5 },
  save: { alignSelf: 'flex-start', backgroundColor: colors.mint, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, marginTop: 6 },
  saveText: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.mintText },
  quota: { fontFamily: fonts.semibold, fontSize: 15, color: colors.deep, marginTop: spacing.md, marginBottom: 4 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  bullet: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.deep, marginLeft: 4 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  quotaBar: { height: 8, borderRadius: 4, backgroundColor: colors.gray, marginTop: spacing.md, marginBottom: 6, overflow: 'hidden' },
  quotaFill: { height: '100%', backgroundColor: colors.mintText },
  payHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
});
