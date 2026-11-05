import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LogoMark, Mascot } from '@/components/Mascot';
import { OrderCard } from '@/components/OrderCard';
import { Avatar, Button, Card, IconBubble, SectionTitle, T } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { isActive } from '@/data/orders';
import { SERVICES } from '@/data/services';
import { useStore } from '@/store/AppStore';
import { scheduleDate } from '@/utils/format';

export default function HomeScreen() {
  const { orders, user, points, resetDraft } = useStore();

  const active = orders
    .filter((o) => isActive(o.status))
    .sort((a, b) => scheduleDate(a.date, a.time).getTime() - scheduleDate(b.date, b.time).getTime());

  const startBooking = (serviceId?: string) => {
    resetDraft(serviceId ? { serviceId } : undefined);
    router.push(serviceId ? '/booking/details' : '/booking/services');
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <LogoMark size={34} />
            <Text style={styles.brandText}>Mindi</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable style={styles.iconBtn} onPress={() => router.push('/notifications')} accessibilityLabel="Notifikasi">
              <Ionicons name="notifications-outline" size={21} color={colors.deep} />
              {active.length > 0 && <View style={styles.dot} />}
            </Pressable>
            <Pressable onPress={() => router.push('/profile')} accessibilityLabel="Profil">
              <Avatar initials={user.name.slice(0, 1).toUpperCase()} color={colors.lavenderMid} size={38} />
            </Pressable>
          </View>
        </View>

        {/* Sapaan */}
        <T variant="h1" style={{ marginTop: spacing.lg }}>
          Halo, {user.name}! 👋
        </T>
        <T variant="body">Apa yang ingin kamu ingat hari ini?</T>

        {/* Kartu pengingat aktif */}
        <LinearGradient
          colors={['#8E70DE', '#6A4BC0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activeCard}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.activeLabel}>Pengingat Aktif</Text>
            <Text style={styles.activeCount}>{active.length} pesanan</Text>
            <Pressable
              style={styles.trackBtn}
              onPress={() => (active[0] ? router.push(`/order/${active[0].id}`) : router.push('/orders'))}
            >
              <Text style={styles.trackText}>Lacak</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primary} />
            </Pressable>
          </View>
          <Mascot size={92} />
        </LinearGradient>

        <Button title="Pesan Reminder" iconRight="add-circle-outline" onPress={() => startBooking()} style={{ marginTop: spacing.lg }} />

        {/* Kategori layanan */}
        <SectionTitle title="Kategori Layanan" action="Lihat semua" onAction={() => startBooking()} />
        <View style={styles.grid}>
          {SERVICES.map((s) => (
            <Pressable key={s.id} style={styles.gridItem} onPress={() => startBooking(s.id)}>
              <IconBubble name={s.icon} bg={s.color} color={s.iconColor} size={50} />
              <Text style={styles.gridText} numberOfLines={2}>
                {s.shortName}
              </Text>
            </Pressable>
          ))}
          <Pressable style={styles.gridItem} onPress={() => router.push('/assistant')}>
            <IconBubble name="sparkles-outline" bg={colors.lavender} color={colors.primary} size={50} />
            <Text style={styles.gridText}>Tanya AI</Text>
          </Pressable>
        </View>

        {/* Jadwal terdekat */}
        <SectionTitle
          title="Pengingat Terdekat"
          action={active.length > 0 ? 'Semua' : undefined}
          onAction={() => router.push('/orders')}
        />
        {active.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="calendar-clear-outline" size={26} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <T variant="bodyBold">Belum ada pengingat</T>
              <T variant="small">Pesan reminder pertamamu, partner kami siap membantu.</T>
            </View>
          </Card>
        ) : (
          active.slice(0, 2).map((o) => <OrderCard key={o.id} order={o} />)
        )}

        {/* Banner AI assistant */}
        <Pressable onPress={() => router.push('/assistant')}>
          <View style={styles.aiBanner}>
            <IconBubble name="sparkles" bg={colors.white} color={colors.primary} size={42} />
            <View style={{ flex: 1 }}>
              <T variant="bodyBold">Butuh bantuan memilih?</T>
              <T variant="small">Tanya AI Assistant untuk rekomendasi layanan.</T>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </View>
        </Pressable>

        {/* Reward */}
        <Pressable onPress={() => router.push('/profile')}>
          <View style={styles.reward}>
            <View style={styles.rewardIcon}>
              <Ionicons name="trophy" size={22} color="#E5A50A" />
            </View>
            <View style={{ flex: 1 }}>
              <T variant="bodyBold">Sistem Reward</T>
              <T variant="small">Selesaikan pengingat, kumpulkan poin & badge!</T>
            </View>
            <View style={styles.pointPill}>
              <Ionicons name="star" size={13} color={colors.white} />
              <Text style={styles.pointText}>{points}</Text>
            </View>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandText: { fontFamily: fonts.bold, fontSize: 22, color: colors.deep },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  activeCard: {
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  activeLabel: { fontFamily: fonts.medium, color: '#EDE6FF', fontSize: 13 },
  activeCount: { fontFamily: fonts.bold, color: colors.white, fontSize: 22, marginTop: 2 },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    marginTop: spacing.md,
  },
  trackText: { fontFamily: fonts.semibold, color: colors.primary, fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.lg },
  gridItem: { width: '33.33%', alignItems: 'center', gap: 6 },
  gridText: { fontFamily: fonts.medium, fontSize: 12, color: colors.deep, textAlign: 'center' },
  emptyCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.lavender,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#FFF7E8',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  rewardIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  pointText: { fontFamily: fonts.bold, color: colors.white, fontSize: 13 },
});
