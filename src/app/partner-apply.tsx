// Daftar jadi Mitra (Reminder Partner) — formulir simulasi.
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Mascot } from '@/components/Mascot';
import { Button, Card, Chip, DemoBadge, ScreenHeader, T } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { SERVICES } from '@/data/services';
import { useStore } from '@/store/AppStore';
import { formatDateLong, toDateKey } from '@/utils/format';

const BENEFITS = [
  { icon: 'cash-outline' as const, title: 'Penghasilan tambahan', desc: 'Rp3.750 per pengingat (75% dari tarif Rp5.000)' },
  { icon: 'time-outline' as const, title: 'Jadwal fleksibel', desc: 'Pilih sendiri jam & layanan yang kamu ambil' },
  { icon: 'school-outline' as const, title: 'Pelatihan SOP', desc: 'Dibekali panduan percakapan & etika' },
  { icon: 'star-outline' as const, title: 'Naik level', desc: 'Rating tinggi = tarif & pesanan lebih banyak' },
];
const REQUIREMENTS = ['Usia min. 18 tahun', 'Verifikasi KTP & foto selfie', 'HP + internet stabil', 'Bersedia ikut pelatihan SOP (± 1 jam)'];
const SLOTS = ['Pagi 04–09', 'Siang 09–15', 'Sore 15–19', 'Malam 19–24'];

export default function PartnerApplyScreen() {
  const { partnerApplication, submitPartnerApplication, toast } = useStore();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const submit = () => {
    if (!name.trim() || !city.trim()) return setError('Nama & domisili wajib diisi.');
    if (slots.length === 0) return setError('Pilih minimal 1 jam tersedia.');
    if (services.length === 0) return setError('Pilih minimal 1 layanan.');
    if (!agree) return setError('Centang persetujuan SOP & verifikasi.');
    setError('');
    submitPartnerApplication({ name: name.trim(), city: city.trim(), slots, services, reason: reason.trim() });
    toast('Pendaftaran terkirim (simulasi)');
  };

  if (partnerApplication) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScreenHeader title="Jadi Mitra" />
        <ScrollView contentContainerStyle={[styles.container, { alignItems: 'center' }]}>
          <Mascot size={110} mood="happy" />
          <T variant="h2" style={{ textAlign: 'center', marginTop: spacing.md }}>
            Pendaftaran terkirim!
          </T>
          <T variant="body" style={{ textAlign: 'center' }}>
            Halo {partnerApplication.name}, tim Mindi akan memverifikasi datamu.
          </T>
          <Card style={{ alignSelf: 'stretch', marginTop: spacing.xl }}>
            {[
              ['Status', partnerApplication.status],
              ['Dikirim', formatDateLong(toDateKey(new Date(partnerApplication.submittedAt)))],
              ['Domisili', partnerApplication.city],
              ['Jam tersedia', partnerApplication.slots.join(', ')],
              ['Layanan', partnerApplication.services.map((id) => SERVICES.find((s) => s.id === id)?.shortName).join(', ')],
            ].map(([k, v]) => (
              <View key={k} style={styles.kv}>
                <T variant="small">{k}</T>
                <T variant="bodyBold" style={{ flex: 1, textAlign: 'right' }}>
                  {v}
                </T>
              </View>
            ))}
          </Card>
          <T variant="h3" style={{ alignSelf: 'flex-start', marginTop: spacing.xl }}>
            Langkah berikutnya
          </T>
          {['Verifikasi KTP & selfie (1–2 hari)', 'Pelatihan SOP online (± 1 jam)', 'Mulai terima pesanan'].map((s, i) => (
            <View key={s} style={[styles.nextStep, { alignSelf: 'stretch' }]}>
              <Text style={styles.stepNum}>{i + 1}</Text>
              <T variant="small">{s}</T>
            </View>
          ))}
          <Button title="Baca SOP Partner" variant="outline" icon="book-outline" style={{ alignSelf: 'stretch', marginTop: spacing.lg }} onPress={() => router.push('/sop')} />
          <DemoBadge text="Simulasi · data tidak dikirim ke mana pun" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScreenHeader title="Jadi Mitra" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Jadi Reminder Partner</Text>
            <Text style={styles.heroSub}>Bantu orang lebih disiplin sambil dapat penghasilan tambahan.</Text>
          </View>
          <Mascot size={80} />
        </View>

        <T variant="h3" style={styles.section}>
          Keuntungan
        </T>
        <View style={styles.grid}>
          {BENEFITS.map((b) => (
            <Card key={b.title} style={styles.benefit}>
              <Ionicons name={b.icon} size={22} color={colors.primary} />
              <T variant="bodyBold">{b.title}</T>
              <T variant="caption">{b.desc}</T>
            </Card>
          ))}
        </View>

        <T variant="h3" style={styles.section}>
          Syarat
        </T>
        {REQUIREMENTS.map((r) => (
          <View key={r} style={styles.req}>
            <Ionicons name="checkmark-circle" size={16} color={colors.mintText} />
            <T variant="small">{r}</T>
          </View>
        ))}

        <View style={styles.formHeader}>
          <T variant="h3">Formulir Pendaftaran</T>
          <DemoBadge />
        </View>
        <Text style={styles.label}>Nama lengkap *</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Nama sesuai KTP" placeholderTextColor={colors.textLight} style={styles.input} />
        <Text style={styles.label}>Domisili *</Text>
        <TextInput value={city} onChangeText={setCity} placeholder="Contoh: Bandung" placeholderTextColor={colors.textLight} style={styles.input} />
        <Text style={styles.label}>Jam tersedia *</Text>
        <View style={styles.chips}>
          {SLOTS.map((s) => (
            <Chip key={s} label={s} selected={slots.includes(s)} onPress={() => toggle(slots, setSlots, s)} />
          ))}
        </View>
        <Text style={styles.label}>Layanan yang bisa kamu ambil *</Text>
        <View style={styles.chips}>
          {SERVICES.map((s) => (
            <Chip key={s.id} label={s.shortName} selected={services.includes(s.id)} onPress={() => toggle(services, setServices, s.id)} />
          ))}
        </View>
        <Text style={styles.label}>Kenapa ingin jadi mitra? (opsional)</Text>
        <TextInput
          value={reason}
          onChangeText={setReason}
          placeholder="Ceritakan singkat"
          placeholderTextColor={colors.textLight}
          multiline
          style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
        />
        <Pressable style={styles.agree} onPress={() => setAgree((v) => !v)} accessibilityRole="checkbox" accessibilityState={{ checked: agree }}>
          <Ionicons name={agree ? 'checkbox' : 'square-outline'} size={22} color={colors.primary} />
          <T variant="small" style={{ flex: 1 }}>
            Saya bersedia verifikasi identitas & mengikuti SOP Mindi.
          </T>
        </Pressable>
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Button title="Kirim Pendaftaran" icon="send" onPress={submit} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  hero: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lavender, borderRadius: radius.lg, padding: spacing.lg },
  heroTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.deep },
  heroSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.text, marginTop: 4 },
  section: { marginTop: spacing.xl, marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  benefit: { width: '48.5%', gap: 4, padding: spacing.md },
  req: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl },
  label: { fontFamily: fonts.semibold, fontSize: 14, color: colors.deep, marginTop: spacing.lg, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.deep,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  agree: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, alignItems: 'flex-start' },
  error: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.redText, marginTop: spacing.sm },
  kv: { flexDirection: 'row', gap: spacing.md, paddingVertical: 6 },
  nextStep: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
});
