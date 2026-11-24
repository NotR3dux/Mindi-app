// Layar pertama untuk pengguna yang belum login.
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Mascot } from '@/components/Mascot';
import { Button, T } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import type { IconName } from '@/data/services';
import { useStore } from '@/store/AppStore';

const POINTS: { icon: IconName; text: string }[] = [
  { icon: 'people-outline', text: 'Diingatkan orang sungguhan, bukan alarm biasa' },
  { icon: 'call-outline', text: 'Lewat telepon atau chat, sesuai jadwalmu' },
  { icon: 'pricetags-outline', text: 'Mulai Rp5.000 — lebih hemat dengan paket' },
];

export default function WelcomeScreen() {
  const { loginDemo } = useStore();
  const [loading, setLoading] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Mascot size={150} />
          <Text style={styles.brand}>Mindi</Text>
          <Text style={styles.tagline}>More than a reminder.</Text>
        </View>

        <View style={styles.points}>
          {POINTS.map((p) => (
            <View key={p.text} style={styles.point}>
              <View style={styles.pointIcon}>
                <Ionicons name={p.icon} size={18} color={colors.primary} />
              </View>
              <T variant="small" style={{ flex: 1 }}>
                {p.text}
              </T>
            </View>
          ))}
        </View>

        <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>
          <Button title="Daftar Akun Baru" onPress={() => router.push('/register')} />
          <Button title="Saya sudah punya akun" variant="outline" onPress={() => router.push('/login')} />
          <Button
            title="Coba akun demo"
            variant="ghost"
            icon="flask-outline"
            loading={loading}
            onPress={async () => {
              setLoading(true);
              await loginDemo();
            }}
          />
        </View>
        <T variant="caption" style={{ textAlign: 'center', marginTop: spacing.sm }}>
          Dengan mendaftar, kamu menyetujui Syarat Layanan & Kebijakan Privasi Mindi.
        </T>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.xl, justifyContent: 'center' },
  hero: { alignItems: 'center' },
  brand: { fontFamily: fonts.bold, fontSize: 38, color: colors.deep, marginTop: spacing.sm },
  tagline: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  points: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.xxl, gap: spacing.md },
  point: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pointIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center' },
});
