// Layar panggilan SIMULASI (full screen) — tidak ada telepon sungguhan.
// Fase 1: panggilan masuk (Terima / Tolak). Fase 2: sedang menelepon (timer + kontrol).
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, radius, spacing } from '@/constants/theme';
import { getPartner } from '@/data/partners';
import type { IconName } from '@/data/services';
import { getService } from '@/data/services';
import { useStore } from '@/store/AppStore';
import { formatTime } from '@/utils/format';

const useNative = Platform.OS !== 'web';

/** Lingkaran berdenyut di belakang avatar saat berdering */
function PulseRing({ delay }: { delay: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: 1800, easing: Easing.out(Easing.ease), useNativeDriver: useNative }),
        Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: useNative }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [v, delay]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ring,
        {
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }],
        },
      ]}
    />
  );
}

function ControlButton({
  icon,
  activeIcon,
  label,
  active,
  onPress,
}: {
  icon: IconName;
  activeIcon?: IconName;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.control} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <View style={[styles.controlCircle, active && { backgroundColor: colors.white }]}>
        <Ionicons name={active && activeIcon ? activeIcon : icon} size={26} color={active ? colors.deep : colors.white} />
      </View>
      <Text style={styles.controlLabel}>{label}</Text>
    </Pressable>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function CallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, user, setStatus, toast } = useStore();
  const order = orders.find((o) => o.id === id);
  const [phase, setPhase] = useState<'incoming' | 'active'>('incoming');
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  useEffect(() => {
    if (phase !== 'active') return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!order) {
    return (
      <View style={[styles.fill, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#1B1430' }]}>
        <Text style={styles.name}>Panggilan berakhir</Text>
        <Pressable onPress={close}>
          <Text style={[styles.sub, { marginTop: 12 }]}>Kembali</Text>
        </Pressable>
      </View>
    );
  }

  const partner = getPartner(order.partnerId);
  const service = getService(order.serviceId);

  const decline = () => {
    toast(`Panggilan ditolak. ${partner.name} akan mencoba lagi (simulasi)`);
    close();
  };
  const endCall = () => {
    setStatus(order.id, 'Menunggu Konfirmasi');
    toast(`Panggilan selesai · ${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)} (simulasi)`);
    close();
  };

  return (
    <LinearGradient colors={['#2A1D4E', '#1B1430', '#0F0B1E']} style={styles.fill}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.fill}>
        {/* Label demo */}
        <View style={styles.demo}>
          <Ionicons name="flask-outline" size={12} color="#FFD9A8" />
          <Text style={styles.demoText}>Simulasi demo · bukan panggilan sungguhan</Text>
        </View>

        {/* Info penelepon */}
        <View style={styles.top}>
          <View style={styles.avatarWrap}>
            {phase === 'incoming' && (
              <>
                <PulseRing delay={0} />
                <PulseRing delay={900} />
              </>
            )}
            <View style={[styles.avatar, { backgroundColor: partner.avatarColor }]}>
              <Text style={styles.avatarText}>{partner.initials}</Text>
            </View>
          </View>
          <Text style={styles.name}>{partner.name}</Text>
          <View style={styles.tag}>
            <Ionicons name="shield-checkmark" size={12} color="#C9B8FF" />
            <Text style={styles.tagText}>Mindi Reminder Partner</Text>
          </View>
          <Text style={styles.sub}>
            {phase === 'incoming' ? 'Panggilan masuk…' : `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`}
          </Text>
        </View>

        {/* Isi tengah */}
        <View style={styles.middle}>
          {phase === 'incoming' ? (
            <View style={styles.reminderCard}>
              <Ionicons name={service.icon} size={18} color="#C9B8FF" />
              <View style={{ flex: 1 }}>
                <Text style={styles.reminderTitle}>
                  {service.name} · {formatTime(order.time)}
                </Text>
                <Text style={styles.reminderSub} numberOfLines={2}>
                  {order.activity}
                </Text>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.bubble}>
                <Text style={styles.bubbleText}>
                  “Halo {user.name}! Ini {partner.name.split(' ')[0]} dari Mindi. Sudah waktunya:{' '}
                  <Text style={{ fontFamily: fonts.semibold }}>{order.activity}</Text>. Yuk, jangan ditunda ya!”
                </Text>
              </View>
              <View style={styles.grid}>
                <ControlButton icon="mic-outline" activeIcon="mic-off" label={muted ? 'Bisu' : 'Bisukan'} active={muted} onPress={() => setMuted((m) => !m)} />
                <ControlButton icon="keypad-outline" label="Keypad" onPress={() => toast('Keypad tidak aktif di simulasi')} />
                <ControlButton icon="volume-medium-outline" activeIcon="volume-high" label="Speaker" active={speaker} onPress={() => setSpeaker((s) => !s)} />
                <ControlButton icon="add" label="Tambah" onPress={() => toast('Tidak tersedia di simulasi')} />
                <ControlButton icon="videocam-outline" label="Video" onPress={() => toast('Tidak tersedia di simulasi')} />
                <ControlButton icon="person-outline" label="Kontak" onPress={() => toast('Nomor partner disembunyikan demi privasi')} />
              </View>
            </>
          )}
        </View>

        {/* Tombol bawah */}
        {phase === 'incoming' ? (
          <View style={styles.actions}>
            <View style={styles.actionCol}>
              <Pressable style={[styles.roundBtn, { backgroundColor: '#F0453A' }]} onPress={decline} accessibilityLabel="Tolak">
                <Ionicons name="call" size={32} color={colors.white} style={{ transform: [{ rotate: '135deg' }] }} />
              </Pressable>
              <Text style={styles.actionLabel}>Tolak</Text>
            </View>
            <View style={styles.actionCol}>
              <Pressable style={[styles.roundBtn, { backgroundColor: '#34C76F' }]} onPress={() => setPhase('active')} accessibilityLabel="Terima">
                <Ionicons name="call" size={32} color={colors.white} />
              </Pressable>
              <Text style={styles.actionLabel}>Terima</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.actions, { justifyContent: 'center' }]}>
            <View style={styles.actionCol}>
              <Pressable style={[styles.roundBtn, { backgroundColor: '#F0453A' }]} onPress={endCall} accessibilityLabel="Akhiri panggilan">
                <Ionicons name="call" size={32} color={colors.white} style={{ transform: [{ rotate: '135deg' }] }} />
              </Pressable>
              <Text style={styles.actionLabel}>Akhiri</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const AVATAR = 120;

const styles = StyleSheet.create({
  fill: { flex: 1 },
  demo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'center',
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,240,222,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  demoText: { fontFamily: fonts.medium, fontSize: 11, color: '#FFD9A8' },
  top: { alignItems: 'center', marginTop: 48 },
  avatarWrap: { width: AVATAR, height: AVATAR, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: '#8E70DE',
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  avatarText: { fontFamily: fonts.bold, fontSize: 40, color: colors.deep },
  name: { fontFamily: fonts.semibold, fontSize: 28, color: colors.white, marginTop: spacing.xl },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  tagText: { fontFamily: fonts.medium, fontSize: 12.5, color: '#C9B8FF' },
  sub: { fontFamily: fonts.regular, fontSize: 15, color: '#D8D2EA', marginTop: spacing.sm },
  middle: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xxl },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  reminderTitle: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.white },
  reminderSub: { fontFamily: fonts.regular, fontSize: 12.5, color: '#D8D2EA' },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  bubbleText: { fontFamily: fonts.regular, fontSize: 13.5, color: '#EDE8FA', lineHeight: 20, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.xl },
  control: { width: '33.33%', alignItems: 'center', gap: 6 },
  controlCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlLabel: { fontFamily: fonts.medium, fontSize: 12, color: '#D8D2EA' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xxl,
    paddingBottom: 48,
  },
  actionCol: { alignItems: 'center', gap: 8 },
  roundBtn: { width: 74, height: 74, borderRadius: 37, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.white },
});
