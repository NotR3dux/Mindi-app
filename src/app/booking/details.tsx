import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Chip, IconBubble, ScreenHeader, Steps, T } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import type { ContactMethod, Repeat } from '@/data/orders';
import { getService } from '@/data/services';
import { useStore } from '@/store/AppStore';
import { addDays, dayShort, monthShort, scheduleDate, toDateKey } from '@/utils/format';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
const REPEATS: Repeat[] = ['Sekali', 'Setiap hari', 'Hari kerja'];
const METHODS: { value: ContactMethod; icon: 'call-outline' | 'chatbubble-ellipses-outline'; desc: string }[] = [
  { value: 'Telepon', icon: 'call-outline', desc: 'Partner menelepon kamu' },
  { value: 'Chat', icon: 'chatbubble-ellipses-outline', desc: 'Partner mengirim pesan' },
];

type Errors = Partial<Record<'activity' | 'date' | 'time', string>>;

export default function DetailsScreen() {
  const { draft, updateDraft } = useStore();
  const service = getService(draft.serviceId ?? 'wakeup');
  const [errors, setErrors] = useState<Errors>({});

  const [hour, minute] = draft.time ? draft.time.split(':') : [undefined, undefined];
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(new Date(), i)), []);

  const setTime = (h?: string, m?: string) => {
    const hh = h ?? hour ?? '07';
    const mm = m ?? minute ?? '00';
    updateDraft({ time: `${hh}:${mm}` });
    setErrors((e) => ({ ...e, time: undefined }));
  };

  const validate = () => {
    const e: Errors = {};
    if (!draft.activity.trim()) e.activity = 'Nama aktivitas wajib diisi.';
    if (!draft.date) e.date = 'Pilih tanggal pengingat.';
    if (!draft.time) e.time = 'Pilih jam pengingat.';
    if (draft.date && draft.time && scheduleDate(draft.date, draft.time).getTime() < Date.now() + 5 * 60 * 1000) {
      e.time = 'Waktu sudah lewat. Pilih minimal 5 menit dari sekarang.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validate()) router.push('/booking/partners');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScreenHeader title="Detail Pengingat" />
      <Steps current={2} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Layanan terpilih */}
        <Pressable style={styles.serviceBox} onPress={() => router.dismissTo('/booking/services')}>
          <IconBubble name={service.icon} bg={service.color} color={service.iconColor} size={44} />
          <View style={{ flex: 1 }}>
            <T variant="caption">Layanan</T>
            <T variant="bodyBold">{service.name}</T>
          </View>
          <Text style={styles.change}>Ganti</Text>
        </Pressable>

        {/* Aktivitas */}
        <Label text="Nama aktivitas / tujuan" required />
        <TextInput
          value={draft.activity}
          onChangeText={(t) => {
            updateDraft({ activity: t });
            if (t.trim()) setErrors((e) => ({ ...e, activity: undefined }));
          }}
          placeholder={`Contoh: ${service.example}`}
          placeholderTextColor={colors.textLight}
          style={[styles.input, errors.activity && styles.inputError]}
          maxLength={80}
        />
        <ErrorText text={errors.activity} />

        {/* Tanggal */}
        <Label text="Tanggal" required />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          {days.map((d, i) => {
            const key = toDateKey(d);
            const selected = draft.date === key;
            return (
              <Pressable
                key={key}
                onPress={() => {
                  updateDraft({ date: key });
                  setErrors((e) => ({ ...e, date: undefined }));
                }}
                style={[styles.dateChip, selected && styles.dateChipSelected]}
              >
                <Text style={[styles.dateDay, selected && { color: '#E9E2FF' }]}>
                  {i === 0 ? 'Hari ini' : i === 1 ? 'Besok' : dayShort(d)}
                </Text>
                <Text style={[styles.dateNum, selected && { color: colors.white }]}>{d.getDate()}</Text>
                <Text style={[styles.dateDay, selected && { color: '#E9E2FF' }]}>{monthShort(d)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <ErrorText text={errors.date} />

        {/* Jam */}
        <Label text="Jam (WIB)" required />
        <View style={styles.timeBox}>
          <View style={styles.timeDisplay}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={styles.timeText}>{draft.time ? draft.time.replace(':', '.') : '--.--'}</Text>
          </View>
          <T variant="caption" style={{ marginTop: spacing.sm }}>
            Jam
          </T>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {HOURS.map((h) => (
              <Pressable key={h} onPress={() => setTime(h)} style={[styles.timeChip, hour === h && styles.timeChipSelected]}>
                <Text style={[styles.timeChipText, hour === h && { color: colors.white }]}>{h}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <T variant="caption" style={{ marginTop: spacing.sm }}>
            Menit
          </T>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {MINUTES.map((m) => (
              <Pressable key={m} onPress={() => setTime(undefined, m)} style={[styles.timeChip, minute === m && styles.timeChipSelected]}>
                <Text style={[styles.timeChipText, minute === m && { color: colors.white }]}>{m}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        <ErrorText text={errors.time} />

        {/* Metode */}
        <Label text="Metode kontak" required />
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          {METHODS.map((m) => {
            const selected = draft.method === m.value;
            return (
              <Pressable
                key={m.value}
                onPress={() => updateDraft({ method: m.value })}
                style={[styles.method, selected && styles.methodSelected]}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
              >
                <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={18} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name={m.icon} size={15} color={colors.deep} />
                    <T variant="bodyBold">{m.value}</T>
                  </View>
                  <T variant="caption">{m.desc}</T>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Pengulangan */}
        <Label text="Pengulangan" />
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {REPEATS.map((r) => (
            <Chip key={r} label={r} selected={draft.repeat === r} onPress={() => updateDraft({ repeat: r })} />
          ))}
        </View>

        {/* Catatan */}
        <Label text="Catatan untuk partner (opsional)" />
        <TextInput
          value={draft.note}
          onChangeText={(t) => updateDraft({ note: t })}
          placeholder="Contoh: tolong telepon dua kali jika belum dijawab"
          placeholderTextColor={colors.textLight}
          style={[styles.input, { minHeight: 84, textAlignVertical: 'top' }]}
          multiline
          maxLength={200}
        />

        <View style={styles.privacy}>
          <Ionicons name="lock-closed-outline" size={14} color={colors.text} />
          <T variant="caption" style={{ flex: 1 }}>
            Partner hanya menghubungimu pada waktu & metode yang kamu setujui.
          </T>
        </View>

        <Button title="Lanjut Pilih Partner" iconRight="arrow-forward" onPress={next} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <Text style={styles.label}>
      {text}
      {required && <Text style={{ color: colors.redText }}> *</Text>}
    </Text>
  );
}

function ErrorText({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <View style={styles.errorRow}>
      <Ionicons name="alert-circle" size={14} color={colors.redText} />
      <Text style={styles.error}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  serviceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.lavender,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  change: { fontFamily: fonts.semibold, color: colors.primary, fontSize: 13 },
  label: { fontFamily: fonts.semibold, fontSize: 14, color: colors.deep, marginTop: spacing.xl, marginBottom: spacing.sm },
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
  inputError: { borderColor: colors.redText },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  error: { fontFamily: fonts.medium, fontSize: 12, color: colors.redText },
  dateChip: {
    width: 66,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  dateChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  dateDay: { fontFamily: fonts.medium, fontSize: 11, color: colors.textLight },
  dateNum: { fontFamily: fonts.bold, fontSize: 19, color: colors.deep },
  timeBox: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  timeDisplay: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeText: { fontFamily: fonts.bold, fontSize: 22, color: colors.deep },
  timeChip: {
    minWidth: 42,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.offWhite,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  timeChipText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.deep },
  method: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  methodSelected: { borderColor: colors.primary, backgroundColor: colors.lavender },
  privacy: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.lg },
});
