import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, ScreenHeader, T } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { useStore } from '@/store/AppStore';

const FAQ = [
  {
    q: 'Apa itu Mindi?',
    a: 'Mindi adalah platform jasa pengingat. Kamu memesan reminder partner (orang sungguhan) untuk menghubungimu lewat telepon atau chat sesuai jadwal.',
  },
  {
    q: 'Kapan partner akan menghubungi saya?',
    a: 'Hanya pada tanggal, jam, dan metode yang kamu pilih saat memesan. Partner tidak boleh menghubungi di luar pesanan.',
  },
  {
    q: 'Bagaimana jika saya tidak menjawab?',
    a: 'Partner akan mencoba beberapa kali sesuai batas percobaan. Jika tetap tidak ada respons, pesanan menunggu konfirmasimu.',
  },
  {
    q: 'Bisakah saya membatalkan pesanan?',
    a: 'Bisa, selama partner belum mulai menghubungi. Buka detail pesanan lalu tekan "Batalkan".',
  },
  {
    q: 'Apakah Mindi memberi saran medis untuk pengingat obat?',
    a: 'Tidak. Mindi hanya menyampaikan jadwal yang kamu masukkan dan tidak memberi saran medis.',
  },
];

const PRIVACY = [
  'Identitas setiap reminder partner diverifikasi sebelum menerima pesanan.',
  'Nomor telepon pribadi tidak ditampilkan; komunikasi dilakukan di dalam aplikasi.',
  'Jadwal dan catatan pribadimu hanya terlihat oleh partner yang kamu pilih.',
  'Mindi membantu mengingatkan, tetapi tidak menjamin atau memaksa aktivitas dilakukan.',
];

export default function HelpScreen() {
  const { toast } = useStore();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScreenHeader title="Pusat Bantuan" />
      <ScrollView contentContainerStyle={styles.container}>
        <T variant="h3" style={{ marginBottom: spacing.md }}>
          Pertanyaan Umum
        </T>
        {FAQ.map((f, i) => (
          <Card key={f.q} style={{ marginBottom: spacing.sm, paddingVertical: 12 }} onPress={() => setOpen(open === i ? null : i)}>
            <View style={styles.row}>
              <T variant="bodyBold" style={{ flex: 1 }}>
                {f.q}
              </T>
              <Ionicons name={open === i ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primary} />
            </View>
            {open === i && (
              <T variant="small" style={{ marginTop: 6 }}>
                {f.a}
              </T>
            )}
          </Card>
        ))}

        <T variant="h3" style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
          Keamanan & Privasi
        </T>
        <Card>
          {PRIVACY.map((p) => (
            <View key={p} style={[styles.row, { alignItems: 'flex-start', marginBottom: 8 }]}>
              <Ionicons name="shield-checkmark" size={16} color={colors.mintText} style={{ marginTop: 2 }} />
              <T variant="small" style={{ flex: 1 }}>
                {p}
              </T>
            </View>
          ))}
        </Card>

        <View style={{ gap: spacing.sm, marginTop: spacing.xl }}>
          <Button title="Laporkan Masalah" icon="flag-outline" variant="outline" onPress={() => toast('Simulasi: laporan terkirim ke tim Mindi')} />
          <Button title="Hubungi CS" icon="chatbubbles-outline" variant="soft" onPress={() => toast('Simulasi: membuka chat CS (demo)')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
