// Paket bundling & langganan (Student / Employee) — pembayaran simulasi.
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmModal } from '@/components/ConfirmModal';
import { PaymentPicker, QrisModal } from '@/components/Payment';
import { Button, Card, DemoBadge, IconBubble, ScreenHeader, T } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import type { PaymentMethod } from '@/data/orders';
import { INCLUDED_PER_REMINDER, PERIOD_LABEL, PLANS, getPlan, perReminder, type PlanPeriod } from '@/data/plans';
import { getService } from '@/data/services';
import { useStore } from '@/store/AppStore';
import { formatDateLong, formatRupiah, toDateKey } from '@/utils/format';

const SINGLE_PRICE = 6000; // harga rata-rata 1x pengingat (untuk hitung hemat)

export default function PlansScreen() {
  const params = useLocalSearchParams<{ plan?: string }>();
  const { subscription, subscribe, cancelSubscription, toast } = useStore();
  const [period, setPeriod] = useState<PlanPeriod>('weekly');
  const [chosen, setChosen] = useState<string | null>(params.plan ?? null);
  const [payment, setPayment] = useState<PaymentMethod>('QRIS');
  const [qris, setQris] = useState(false);
  const [paying, setPaying] = useState(false);
  const [confirmStop, setConfirmStop] = useState(false);

  const plan = chosen ? getPlan(chosen) : null;
  const price = plan ? plan.prices[period].price : 0;

  const finish = () => {
    if (!plan) return;
    subscribe(plan.id, period, payment);
    setQris(false);
    setPaying(false);
    setChosen(null);
    toast(`${plan.name} aktif! +20 poin (simulasi)`);
  };

  const pay = () => {
    if (payment === 'QRIS') return setQris(true);
    setPaying(true);
    setTimeout(finish, 1200);
  };

  const active = subscription ? getPlan(subscription.planId) : null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScreenHeader title="Paket & Langganan" />
      <ScrollView contentContainerStyle={styles.container}>
        {active && subscription && (
          <Card style={{ borderWidth: 1.5, borderColor: colors.mintText, marginBottom: spacing.lg }}>
            <View style={styles.row}>
              <IconBubble name={active.icon} bg={colors.mint} color={colors.mintText} />
              <View style={{ flex: 1 }}>
                <T variant="h3">{active.name} aktif</T>
                <T variant="small">
                  {PERIOD_LABEL[subscription.period]} · berlaku s.d. {formatDateLong(toDateKey(new Date(subscription.endsAt)))}
                </T>
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
              Pesan layanan yang termasuk paket → otomatis Rp0 (pakai kuota).
            </T>
            <Button title="Berhenti langganan" variant="danger" small style={{ marginTop: spacing.md }} onPress={() => setConfirmStop(true)} />
          </Card>
        )}

        <T variant="body">Lebih hemat dari pesan satuan. Pilih paket sesuai kebutuhanmu.</T>

        {/* Toggle periode */}
        <View style={styles.toggle}>
          {(['weekly', 'monthly'] as PlanPeriod[]).map((p) => (
            <Pressable key={p} style={[styles.toggleItem, period === p && styles.toggleActive]} onPress={() => setPeriod(p)}>
              <Text style={[styles.toggleText, period === p && { color: colors.white }]}>{PERIOD_LABEL[p]}</Text>
            </Pressable>
          ))}
        </View>

        {PLANS.map((p) => {
          const { price: pr, quota } = p.prices[period];
          const per = perReminder(p, period);
          const save = Math.round((1 - per / SINGLE_PRICE) * 100);
          const selected = chosen === p.id;
          return (
            <Card key={p.id} style={[styles.planCard, selected && { borderColor: colors.primary }]} onPress={() => setChosen(p.id)}>
              <View style={styles.row}>
                <IconBubble name={p.icon} bg={p.color} color={colors.deep} />
                <View style={{ flex: 1 }}>
                  <T variant="h3">{p.name}</T>
                  <T variant="caption">{p.audience}</T>
                </View>
                <View style={styles.save}>
                  <Text style={styles.saveText}>Hemat {save}%</Text>
                </View>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatRupiah(pr)}</Text>
                <T variant="small">/{period === 'weekly' ? 'minggu' : 'bulan'}</T>
              </View>
              <T variant="small">
                {quota} pengingat · ≈ {formatRupiah(per)}/pengingat (satuan {formatRupiah(SINGLE_PRICE)})
              </T>
              <View style={styles.services}>
                {p.services.map((id) => {
                  const s = getService(id);
                  return (
                    <View key={id} style={[styles.serviceChip, { backgroundColor: s.color }]}>
                      <Ionicons name={s.icon} size={13} color={s.iconColor} />
                      <Text style={styles.serviceText}>{s.name}</Text>
                    </View>
                  );
                })}
              </View>
              {p.perks.map((k) => (
                <View key={k} style={styles.perk}>
                  <Ionicons name="checkmark-circle" size={15} color={colors.mintText} />
                  <T variant="small" style={{ flex: 1 }}>
                    {k}
                  </T>
                </View>
              ))}
              <Button
                title={selected ? 'Dipilih' : active?.id === p.id ? 'Perpanjang paket ini' : 'Pilih paket'}
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
            <Button
              title={`Langganan ${plan.name} · ${formatRupiah(price)}`}
              loading={paying}
              onPress={pay}
              style={{ marginTop: spacing.sm }}
            />
            <T variant="caption" style={{ textAlign: 'center', marginTop: spacing.sm }}>
              Prototype: tidak ada tagihan sungguhan. Paket tidak diperpanjang otomatis.
            </T>
          </View>
        )}
      </ScrollView>

      <QrisModal visible={qris} amount={price} reference={`SUB-${plan?.id ?? ''}`} onPaid={finish} onClose={() => setQris(false)} />
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
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.lavender,
    borderRadius: radius.pill,
    padding: 4,
    marginVertical: spacing.lg,
  },
  toggleItem: { flex: 1, paddingVertical: 9, borderRadius: radius.pill, alignItems: 'center' },
  toggleActive: { backgroundColor: colors.primary },
  toggleText: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.primary },
  planCard: { marginBottom: spacing.md, borderWidth: 1.5, borderColor: 'transparent' },
  save: { backgroundColor: colors.mint, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 },
  saveText: { fontFamily: fonts.semibold, fontSize: 11, color: colors.mintText },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, marginTop: spacing.md },
  price: { fontFamily: fonts.bold, fontSize: 26, color: colors.primary, lineHeight: 32 },
  services: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: spacing.sm },
  serviceChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 4 },
  serviceText: { fontFamily: fonts.medium, fontSize: 11.5, color: colors.deep },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  quotaBar: { height: 8, borderRadius: 4, backgroundColor: colors.gray, marginTop: spacing.md, marginBottom: 6, overflow: 'hidden' },
  quotaFill: { height: '100%', backgroundColor: colors.mintText },
  payHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
});
