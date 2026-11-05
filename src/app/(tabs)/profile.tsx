import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmModal } from '@/components/ConfirmModal';
import { Avatar, Card, DemoBadge, IconBubble, T } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import type { IconName } from '@/data/services';
import { useStore } from '@/store/AppStore';

const BADGES: { name: string; icon: IconName; color: string; minPoints: number }[] = [
  { name: 'Pemula', icon: 'star', color: '#E5A50A', minPoints: 0 },
  { name: 'Disiplin', icon: 'ribbon', color: '#7656C8', minPoints: 150 },
  { name: 'Juara', icon: 'trophy', color: '#E58A1F', minPoints: 300 },
  { name: 'Legenda', icon: 'shield-checkmark', color: '#2D7FD3', minPoints: 500 },
];

function MenuItem({ icon, label, value, onPress }: { icon: IconName; label: string; value?: string; onPress?: () => void }) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <IconBubble name={icon} size={36} />
      <T variant="bodyBold" style={{ flex: 1 }}>
        {label}
      </T>
      {value && <T variant="small">{value}</T>}
      <Ionicons name="chevron-forward" size={17} color={colors.textLight} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, updateUser, points, orders, toast, loadSampleData, clearAllData } = useStore();
  const [dialog, setDialog] = useState<null | 'clear' | 'logout'>(null);
  const done = orders.filter((o) => o.status === 'Selesai').length;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <T variant="h1">Profil</T>

        {/* Kartu profil */}
        <Card style={styles.profileCard}>
          <Avatar initials={user.name.slice(0, 2).toUpperCase()} color={colors.lavenderMid} size={64} />
          <View style={{ flex: 1 }}>
            <T variant="h2">{user.name}</T>
            <T variant="small">{user.email}</T>
            <T variant="small">{user.phone}</T>
          </View>
          <Pressable onPress={() => toast('Edit profil belum tersedia di prototype')} hitSlop={10}>
            <Ionicons name="create-outline" size={22} color={colors.primary} />
          </Pressable>
        </Card>

        {/* Statistik & reward */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{points}</Text>
            <T variant="caption">Poin</T>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{done}</Text>
            <T variant="caption">Selesai</T>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{orders.length}</Text>
            <T variant="caption">Total Pesanan</T>
          </View>
        </View>

        <T variant="h3" style={styles.section}>
          Badge Kamu
        </T>
        <View style={styles.badges}>
          {BADGES.map((b) => {
            const unlocked = points >= b.minPoints;
            return (
              <View key={b.name} style={[styles.badge, !unlocked && { opacity: 0.35 }]}>
                <View style={[styles.badgeIcon, { backgroundColor: b.color + '22' }]}>
                  <Ionicons name={unlocked ? b.icon : 'lock-closed'} size={24} color={b.color} />
                </View>
                <T variant="caption" style={{ color: colors.deep }}>
                  {b.name}
                </T>
                <T variant="caption">{b.minPoints} poin</T>
              </View>
            );
          })}
        </View>

        {/* Pengaturan */}
        <T variant="h3" style={styles.section}>
          Preferensi Notifikasi
        </T>
        <Card style={{ paddingVertical: 4 }}>
          <View style={styles.switchRow}>
            <T variant="bodyBold" style={{ flex: 1 }}>
              Status pesanan & pengingat
            </T>
            <Switch
              value={user.notifReminder}
              onValueChange={(v) => updateUser({ notifReminder: v })}
              trackColor={{ true: colors.primary, false: colors.gray }}
              thumbColor={colors.white}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <T variant="bodyBold" style={{ flex: 1 }}>
              Promo & info poin
            </T>
            <Switch
              value={user.notifPromo}
              onValueChange={(v) => updateUser({ notifPromo: v })}
              trackColor={{ true: colors.primary, false: colors.gray }}
              thumbColor={colors.white}
            />
          </View>
        </Card>

        <T variant="h3" style={styles.section}>
          Akun
        </T>
        <Card style={{ paddingVertical: 4 }}>
          <MenuItem icon="wallet-outline" label="Metode Pembayaran" value="E-Wallet" onPress={() => toast('Simulasi: metode pembayaran tersimpan (demo)')} />
          <MenuItem icon="help-buoy-outline" label="Pusat Bantuan" onPress={() => router.push('/help')} />
          <MenuItem icon="shield-checkmark-outline" label="Kebijakan Privasi & Keamanan" onPress={() => router.push('/help')} />
          <MenuItem icon="log-out-outline" label="Keluar Akun" onPress={() => setDialog('logout')} />
        </Card>

        {/* Alat demo untuk presentasi */}
        <View style={styles.demoBox}>
          <DemoBadge text="Alat demo prototype" />
          <T variant="small" style={{ marginTop: 6 }}>
            Gunakan untuk menampilkan kondisi kosong atau mengembalikan data contoh saat presentasi.
          </T>
          <View style={styles.demoActions}>
            <Pressable
              style={styles.demoBtn}
              onPress={() => {
                loadSampleData();
                toast('Data contoh dimuat ulang');
              }}
            >
              <Text style={styles.demoBtnText}>Muat data contoh</Text>
            </Pressable>
            <Pressable style={styles.demoBtn} onPress={() => setDialog('clear')}>
              <Text style={[styles.demoBtnText, { color: colors.redText }]}>Kosongkan data</Text>
            </Pressable>
          </View>
        </View>

        <T variant="caption" style={{ textAlign: 'center', marginTop: spacing.xl }}>
          Mindi v1.0.0 · More than a reminder.
        </T>
      </ScrollView>

      <ConfirmModal
        visible={dialog === 'clear'}
        title="Kosongkan semua data?"
        message="Semua pesanan dan poin akan dihapus dari perangkat ini (untuk menampilkan empty state)."
        confirmLabel="Kosongkan"
        danger
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          clearAllData();
          setDialog(null);
          toast('Data dikosongkan');
        }}
      />
      <ConfirmModal
        visible={dialog === 'logout'}
        title="Keluar akun?"
        message="Pada prototype ini fitur login belum tersedia, jadi kamu akan tetap berada di aplikasi."
        confirmLabel="Oke"
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          setDialog(null);
          toast('Simulasi: keluar akun (demo)');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 40 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.lg },
  stats: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  stat: {
    flex: 1,
    backgroundColor: colors.lavender,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  statNum: { fontFamily: fonts.bold, fontSize: 20, color: colors.primary },
  section: { marginTop: spacing.xl, marginBottom: spacing.md },
  badges: { flexDirection: 'row', justifyContent: 'space-between' },
  badge: { alignItems: 'center', gap: 4, width: '24%' },
  badgeIcon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  divider: { height: 1, backgroundColor: colors.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 10 },
  demoBox: {
    marginTop: spacing.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#F0C48F',
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: '#FFFBF5',
  },
  demoActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  demoBtn: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  demoBtnText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.primary },
});
