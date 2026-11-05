import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Button, Card, Chip, DemoBadge, IconBubble, ScreenHeader, T } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { PARTNERS } from '@/data/partners';
import { getService, type Service } from '@/data/services';
import { useStore } from '@/store/AppStore';

// =====================================================
// AI Assistant (KONSEP). Untuk prototype, "AI" di sini hanyalah
// pencocokan kata kunci sederhana. AI tidak menggantikan partner.
// =====================================================
const RULES: { keywords: string[]; serviceId: string; time: string }[] = [
  { keywords: ['bangun', 'tidur', 'pagi', 'kesiangan', 'alarm', 'subuh'], serviceId: 'wakeup', time: '05:00' },
  { keywords: ['deadline', 'tenggat', 'kumpul', 'submit', 'batas'], serviceId: 'deadline', time: '21:00' },
  { keywords: ['tugas', 'pr', 'laporan', 'skripsi', 'makalah', 'belajar'], serviceId: 'task', time: '19:00' },
  { keywords: ['janji', 'dokter', 'konsultasi', 'meeting', 'rapat', 'dosen', 'acara', 'interview'], serviceId: 'appointment', time: '09:00' },
  { keywords: ['olahraga', 'gym', 'lari', 'minum', 'obat', 'rutin', 'harian', 'makan'], serviceId: 'daily', time: '07:00' },
];

const EXAMPLES = ['Aku sering kesiangan kuliah pagi', 'Deadline makalah besok malam', 'Mau rutin olahraga', 'Konsultasi dengan dosen'];

type Result = { service: Service; time: string; reason: string };

function recommend(text: string): Result {
  const t = text.toLowerCase();
  for (const r of RULES) {
    const hit = r.keywords.find((k) => t.includes(k));
    if (hit) {
      return { service: getService(r.serviceId), time: r.time, reason: `Kami menemukan kata "${hit}" pada kebutuhanmu.` };
    }
  }
  return { service: getService('daily'), time: '08:00', reason: 'Belum yakin, jadi kami sarankan layanan umum.' };
}

export default function AssistantScreen() {
  const { resetDraft } = useStore();
  const [text, setText] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const partner = [...PARTNERS].filter((p) => p.available).sort((a, b) => b.rating - a.rating)[0];

  const ask = (value = text) => {
    if (!value.trim()) return;
    setText(value);
    setResult(recommend(value));
  };

  const book = () => {
    if (!result) return;
    resetDraft({ serviceId: result.service.id, activity: text.trim(), time: result.time });
    router.replace('/booking/details');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScreenHeader title="AI Assistant" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.bot}>
          <IconBubble name="sparkles" bg={colors.white} size={44} />
          <View style={{ flex: 1 }}>
            <T variant="bodyBold">Hai! Ceritakan apa yang sering kamu lupakan.</T>
            <T variant="small">Aku akan sarankan layanan & jam yang cocok.</T>
          </View>
        </View>
        <DemoBadge text="Fitur konsep · rekomendasi sederhana" />

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Contoh: aku sering lupa minum obat jam 8 malam"
          placeholderTextColor={colors.textLight}
          multiline
          style={styles.input}
        />
        <View style={styles.examples}>
          {EXAMPLES.map((e) => (
            <Chip key={e} label={e} onPress={() => ask(e)} />
          ))}
        </View>
        <Button title="Minta Rekomendasi" icon="sparkles-outline" onPress={() => ask()} disabled={!text.trim()} style={{ marginTop: spacing.lg }} />

        {result && (
          <Card style={{ marginTop: spacing.xl, borderWidth: 1.5, borderColor: colors.lavenderMid }}>
            <T variant="caption">Rekomendasi untukmu</T>
            <View style={styles.row}>
              <IconBubble name={result.service.icon} bg={result.service.color} color={result.service.iconColor} size={48} />
              <View style={{ flex: 1 }}>
                <T variant="h3">{result.service.name}</T>
                <T variant="small">{result.service.description}</T>
              </View>
            </View>
            <View style={styles.recRow}>
              <Ionicons name="time-outline" size={16} color={colors.primary} />
              <Text style={styles.recText}>Saran jam: {result.time.replace(':', '.')} WIB</Text>
            </View>
            <View style={styles.recRow}>
              <Avatar initials={partner.initials} color={partner.avatarColor} size={22} />
              <Text style={styles.recText}>
                Partner cocok: {partner.name} (★ {partner.rating.toFixed(1).replace('.', ',')})
              </Text>
            </View>
            <T variant="caption" style={{ marginTop: spacing.sm }}>
              {result.reason} Pengingat tetap dilakukan oleh partner manusia.
            </T>
            <Button title="Pesan dengan rekomendasi ini" iconRight="arrow-forward" small style={{ marginTop: spacing.md }} onPress={book} />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40, gap: spacing.sm },
  bot: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.lavender,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  input: {
    marginTop: spacing.md,
    minHeight: 90,
    textAlignVertical: 'top',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.deep,
  },
  examples: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  recRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.md },
  recText: { fontFamily: fonts.medium, fontSize: 13, color: colors.deep },
});
