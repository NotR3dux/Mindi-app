// SOP Reminder Partner: apa yang ditanyakan & disampaikan partner.
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, IconBubble, ScreenHeader, T } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { SERVICES } from '@/data/services';
import { SERVICE_QUESTIONS, SOP_RULES, SOP_STEPS } from '@/data/sop';

export default function SopScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScreenHeader title="SOP Reminder Partner" />
      <ScrollView contentContainerStyle={styles.container}>
        <T variant="body">Semua partner Mindi wajib mengikuti alur ini supaya pengingat terasa personal & konsisten.</T>

        <T variant="h3" style={styles.section}>
          Alur Percakapan
        </T>
        {SOP_STEPS.map((s) => (
          <Card key={s.title} style={styles.step}>
            <IconBubble name={s.icon} size={40} />
            <View style={{ flex: 1 }}>
              <T variant="bodyBold">{s.title}</T>
              <T variant="caption">{s.tip}</T>
              <View style={styles.say}>
                <Text style={styles.sayText}>{s.say}</Text>
              </View>
            </View>
          </Card>
        ))}

        <T variant="h3" style={styles.section}>
          Pertanyaan per Layanan
        </T>
        {SERVICES.map((sv) => {
          const q = SERVICE_QUESTIONS[sv.id];
          return (
            <Card key={sv.id} style={{ marginBottom: spacing.sm }}>
              <View style={styles.row}>
                <IconBubble name={sv.icon} bg={sv.color} color={sv.iconColor} size={34} />
                <T variant="bodyBold">{sv.name}</T>
              </View>
              <T variant="small" style={{ marginTop: 6 }}>
                “{q.question}”
              </T>
              <T variant="caption" style={{ marginTop: 2 }}>
                Pilihan jawaban: {q.options.join(' · ')}
              </T>
            </Card>
          );
        })}

        <T variant="h3" style={styles.section}>
          Aturan Wajib
        </T>
        <Card>
          {SOP_RULES.map((r) => (
            <View key={r} style={styles.rule}>
              <Ionicons name="shield-checkmark" size={16} color={colors.mintText} style={{ marginTop: 2 }} />
              <T variant="small" style={{ flex: 1 }}>
                {r}
              </T>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  section: { marginTop: spacing.xl, marginBottom: spacing.md },
  step: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  say: { backgroundColor: colors.lavender, borderRadius: radius.md, padding: spacing.sm, marginTop: 6 },
  sayText: { fontFamily: fonts.regular, fontStyle: 'italic', fontSize: 12.5, color: colors.deep },
  rule: { flexDirection: 'row', gap: 8, marginBottom: 8 },
});
