// Panduan fitur / tutorial. Juga tampil otomatis saat aplikasi pertama kali dibuka.
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Mascot } from '@/components/Mascot';
import { Button, IconBubble, T } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import type { IconName } from '@/data/services';
import { useStore } from '@/store/AppStore';

type Slide = { icon: IconName; title: string; desc: string; points: string[] };

const SLIDES: Slide[] = [
  {
    icon: 'people',
    title: 'Diingatkan orang sungguhan',
    desc: 'Mindi bukan alarm biasa. Reminder partner menelepon / chat kamu sesuai jadwal.',
    points: ['Pilih layanan: Wake-up, Tugas, Deadline, dll.', 'Partner mengikuti SOP: menyapa, mengecek, menyemangati'],
  },
  {
    icon: 'calendar',
    title: 'Pesan & atur jadwal',
    desc: 'Isi aktivitas, tanggal, jam, dan metode kontak.',
    points: ['Jadwal berulang: setiap hari / hari kerja / pilih hari', 'Lihat semua jadwal di tab Kalender'],
  },
  {
    icon: 'pricetags',
    title: 'Bayar mudah & hemat',
    desc: 'Bayar satuan atau langganan paket.',
    points: ['Scan QRIS, e-wallet, transfer, atau kartu', 'Paket Pelajar & Pekerja jauh lebih hemat'],
  },
  {
    icon: 'chatbubbles',
    title: 'Ditelepon / di-chat',
    desc: 'Saat waktunya tiba, partner menghubungimu.',
    points: ['Jawab pertanyaan partner, minta snooze, atau minta semangat', 'Tekan “Ya, Sudah” setelah aktivitas selesai'],
  },
  {
    icon: 'trophy',
    title: 'Kumpulkan poin & voucher',
    desc: 'Setiap pengingat selesai = poin.',
    points: ['Klaim voucher mingguan 20%', 'Tukar poin jadi potongan harga'],
  },
];

export default function TutorialScreen() {
  const { first } = useLocalSearchParams<{ first?: string }>();
  const { setOnboarded } = useStore();
  const [i, setI] = useState(0);
  const slide = SLIDES[i];
  const last = i === SLIDES.length - 1;

  const done = () => {
    setOnboarded(true);
    if (first) router.replace('/');
    else if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.top}>
        <Text style={styles.counter}>
          {i + 1}/{SLIDES.length}
        </Text>
        <Pressable onPress={done} hitSlop={10}>
          <Text style={styles.skip}>{first ? 'Lewati' : 'Tutup'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {i === 0 ? <Mascot size={130} /> : <IconBubble name={slide.icon} size={110} />}
        <T variant="h1" style={{ textAlign: 'center', marginTop: spacing.xl }}>
          {slide.title}
        </T>
        <T variant="body" style={{ textAlign: 'center', marginTop: spacing.sm }}>
          {slide.desc}
        </T>
        <View style={styles.points}>
          {slide.points.map((p) => (
            <View key={p} style={styles.point}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <T variant="small" style={{ flex: 1 }}>
                {p}
              </T>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.dots}>
        {SLIDES.map((_, k) => (
          <Pressable key={k} onPress={() => setI(k)} style={[styles.dot, k === i && styles.dotActive]} />
        ))}
      </View>
      <View style={styles.actions}>
        {i > 0 && <Button title="Kembali" variant="soft" style={{ flex: 1 }} onPress={() => setI(i - 1)} />}
        <Button
          title={last ? 'Mulai pakai Mindi' : 'Lanjut'}
          iconRight={last ? undefined : 'arrow-forward'}
          style={{ flex: 2 }}
          onPress={() => (last ? done() : setI(i + 1))}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.offWhite },
  top: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  counter: { fontFamily: fonts.medium, color: colors.textLight, fontSize: 13 },
  skip: { fontFamily: fonts.semibold, color: colors.primary, fontSize: 14 },
  body: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  points: { alignSelf: 'stretch', backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.xl, gap: spacing.sm },
  point: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.lavenderMid },
  dotActive: { width: 22, backgroundColor: colors.primary },
  actions: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
});
