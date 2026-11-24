// Layar chat INTERAKTIF (simulasi) — partner mengikuti SOP Mindi:
// verifikasi → sampaikan pengingat → cek kesiapan (snooze / semangat) → pertanyaan sesuai layanan
// → tawarkan follow-up → penutup. Tidak ada chat sungguhan.
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { getPartner } from '@/data/partners';
import { getService } from '@/data/services';
import { SERVICE_QUESTIONS } from '@/data/sop';
import { useStore } from '@/store/AppStore';
import { formatTime } from '@/utils/format';

type Msg = { id: number; from: 'partner' | 'me' | 'system'; text: string; time: string };

// Tahap percakapan (mengikuti 6 langkah SOP)
type Stage = 'verify' | 'ready' | 'service' | 'followup' | 'checkin' | 'closing' | 'done';
const STAGE_STEP: Record<Stage, number> = { verify: 1, ready: 3, service: 4, followup: 5, checkin: 5, closing: 6, done: 6 };
const STAGE_LABEL: Record<Stage, string> = {
  verify: 'Pembukaan',
  ready: 'Cek kesiapan',
  service: 'Pertanyaan layanan',
  followup: 'Follow-up',
  checkin: 'Check-in lanjutan',
  closing: 'Penutup',
  done: 'Selesai',
};

const READY_OPTIONS = ['Siap, mulai! 💪', '5 menit lagi ⏰', 'Butuh semangat dulu 🥺'];
const MOTIVATION = [
  'Ingat alasan kamu pesan pengingat ini — kamu mau lebih disiplin, dan kamu bisa! 💜',
  'Nggak harus sempurna, yang penting mulai. 5 menit pertama paling berat, habis itu lancar 🚀',
];
const MAX_SNOOZE = 2;

const nowLabel = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, user, setStatus, toast } = useStore();
  const order = orders.find((o) => o.id === id);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const [stage, setStage] = useState<Stage>('verify');
  const [options, setOptions] = useState<string[]>([]);
  const [snoozes, setSnoozes] = useState(0);
  const [motivated, setMotivated] = useState(0);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const nextId = useRef(0);

  const push = useCallback((from: Msg['from'], text: string) => {
    setMessages((m) => [...m, { id: nextId.current++, from, text, time: nowLabel() }]);
  }, []);

  /** Partner "mengetik" lalu mengirim pesan berurutan; pilihan jawaban muncul setelahnya */
  const partnerSays = useCallback(
    (texts: string[], nextOptions: string[] = [], startDelay = 400, after?: () => void) => {
      setOptions([]);
      let t = startDelay;
      texts.forEach((text) => {
        if (text.startsWith('⏱')) {
          // pesan sistem (lompatan waktu untuk demo)
          t += 600;
          timers.current.push(setTimeout(() => push('system', text), t));
          t += 1600;
          return;
        }
        timers.current.push(setTimeout(() => setTyping(true), t));
        t += 900 + Math.min(text.length * 10, 800);
        timers.current.push(
          setTimeout(() => {
            setTyping(false);
            push('partner', text);
          }, t)
        );
        t += 250;
      });
      timers.current.push(
        setTimeout(() => {
          setOptions(nextOptions);
          after?.();
        }, t)
      );
    },
    [push]
  );

  // Langkah 1 & 2 SOP: pembukaan + verifikasi
  useEffect(() => {
    if (!order) return;
    const partner = getPartner(order.partnerId);
    const service = getService(order.serviceId);
    push('system', `${service.name} · ${formatTime(order.time)} · percakapan simulasi`);
    partnerSays(
      [`Halo! 👋 Saya ${partner.name.split(' ')[0]}, reminder partner dari Mindi.`, `Benar ini dengan Kak ${user.name}?`],
      ['Iya, ini aku 👋', 'Bukan, salah orang'],
      600
    );
    const list = timers.current;
    return () => list.forEach(clearTimeout);
    // hanya sekali saat layar dibuka
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages, typing, options]);

  if (!order) {
    return (
      <SafeAreaView style={[styles.fill, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles.headerName}>Percakapan tidak ditemukan</Text>
      </SafeAreaView>
    );
  }

  const partner = getPartner(order.partnerId);
  const q = SERVICE_QUESTIONS[order.serviceId] ?? SERVICE_QUESTIONS.daily;
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const readyOptions = (extraSnooze = snoozes < MAX_SNOOZE) =>
    READY_OPTIONS.filter((o) => (o.startsWith('5 menit') ? extraSnooze : true));

  const goClosing = () => {
    setStage('closing');
    setStatus(order.id, 'Menunggu Konfirmasi');
    partnerSays(
      ['Mantap, terima kasih sudah responsif! 🙌', 'Kalau aktivitasnya sudah beres, tekan “Ya, Sudah” di aplikasi ya. Semangat! 💜'],
      [],
      400,
      () => setStage('done')
    );
  };

  /** Logika balasan partner berdasarkan tahap SOP */
  const handle = (text: string, fromOption: boolean) => {
    push('me', text);
    setInput('');
    setOptions([]);

    if (stage === 'verify') {
      if (text.startsWith('Bukan')) {
        partnerSays(['Maaf atas ketidaknyamanannya 🙏 Saya akan cek ulang data pesanan.'], [], 400, () =>
          toast('Simulasi: partner melapor ke tim Mindi')
        );
        return;
      }
      setStage('ready');
      const lines = [`Sesuai jadwal, sekarang waktunya: “${order.activity}” 🔔`];
      if (order.note) lines.push(`Catatan darimu: “${order.note}” — sudah aku ingat 😉`);
      lines.push('Sudah siap mulai?');
      partnerSays(lines, readyOptions());
      return;
    }

    if (stage === 'ready') {
      if (text.startsWith('5 menit')) {
        const n = snoozes + 1;
        setSnoozes(n);
        partnerSays(
          ['Oke, aku tunggu 5 menit ya ⏰', '⏱ 5 menit kemudian… (dipercepat untuk demo)', `Sudah 5 menit nih 😄 ${n >= MAX_SNOOZE ? 'Ini snooze terakhir ya, yuk mulai sekarang!' : 'Yuk mulai sekarang?'}`],
          readyOptions(n < MAX_SNOOZE)
        );
        return;
      }
      if (text.startsWith('Butuh semangat')) {
        setMotivated(motivated + 1);
        partnerSays([MOTIVATION[motivated % MOTIVATION.length], 'Gimana, sudah siap?'], ['Oke, siap! 💪', ...readyOptions().slice(1, 2)]);
        return;
      }
      if (!fromOption) {
        partnerSays([`Noted: “${text}” 📝`, 'Jadi, sudah siap mulai sekarang?'], readyOptions());
        return;
      }
      // Siap → langkah 4: pertanyaan khusus layanan
      setStage('service');
      partnerSays(['Yeay! 🎉', q.question], q.options);
      return;
    }

    if (stage === 'service') {
      const reply = q.responses[text] ?? `Oke, “${text}” — rencana yang bagus! 👍`;
      setStage('followup');
      partnerSays([reply, 'Mau aku cek lagi 30 menit lagi buat pastiin kamu tetap on track?'], ['Ya, cek lagi ya 🙏', 'Nggak usah, aman 👍']);
      return;
    }

    if (stage === 'followup') {
      if (text.startsWith('Ya')) {
        setStage('checkin');
        partnerSays(
          ['Siap, aku chat lagi nanti ⏰', '⏱ 30 menit kemudian… (dipercepat untuk demo)', 'Halo lagi! Gimana progresnya sekarang? 👀'],
          ['Lancar 👍', 'Sudah selesai ✅', 'Masih stuck 😵']
        );
      } else {
        goClosing();
      }
      return;
    }

    if (stage === 'checkin') {
      const responses: Record<string, string> = {
        'Lancar 👍': 'Keren! Pertahankan ritmenya ya 🔥',
        'Sudah selesai ✅': 'Wah cepat banget! Bangga sama kamu 🥳',
        'Masih stuck 😵': 'Wajar kok. Coba pecah jadi langkah kecil & kerjakan yang paling gampang dulu 💡',
      };
      partnerSays([responses[text] ?? 'Siap, makasih update-nya! 👍'], [], 400, goClosing);
      return;
    }

    // closing / done
    partnerSays(['Siap 👍 Semangat terus ya!']);
  };

  const finish = () => {
    if (stage !== 'done') setStatus(order.id, 'Menunggu Konfirmasi');
    toast('Chat selesai (simulasi)');
    close();
  };

  const step = STAGE_STEP[stage];

  return (
    <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
      {/* Header chat */}
      <View style={styles.header}>
        <Pressable onPress={close} hitSlop={10} accessibilityLabel="Kembali">
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </Pressable>
        <Avatar initials={partner.initials} color={partner.avatarColor} size={40} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerName}>{partner.name}</Text>
          <Text style={styles.headerSub}>{typing ? 'sedang mengetik…' : 'online · Mindi Reminder Partner'}</Text>
        </View>
        <Pressable onPress={() => router.push('/sop')} hitSlop={10} accessibilityLabel="Lihat SOP">
          <Ionicons name="document-text-outline" size={21} color={colors.white} />
        </Pressable>
      </View>

      {/* Progres SOP */}
      <View style={styles.sop}>
        <Text style={styles.sopText}>
          SOP langkah {step}/6 · {STAGE_LABEL[stage]}
        </Text>
        <View style={styles.sopBar}>
          <View style={[styles.sopFill, { width: `${(step / 6) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.demo}>
        <Ionicons name="flask-outline" size={12} color={colors.orangeText} />
        <Text style={styles.demoText}>Simulasi demo · bukan chat sungguhan</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.list}>
          {messages.map((m) =>
            m.from === 'system' ? (
              <Text key={m.id} style={styles.system}>
                {m.text}
              </Text>
            ) : (
              <View key={m.id} style={[styles.bubble, m.from === 'me' ? styles.me : styles.them]}>
                <Text style={[styles.bubbleText, m.from === 'me' && { color: colors.white }]}>{m.text}</Text>
                <View style={styles.meta}>
                  <Text style={[styles.time, m.from === 'me' && { color: '#E2D8FF' }]}>{m.time}</Text>
                  {m.from === 'me' && <Ionicons name="checkmark-done" size={14} color="#BFE8FF" />}
                </View>
              </View>
            )
          )}
          {typing && (
            <View style={[styles.bubble, styles.them, { paddingVertical: 12 }]}>
              <Text style={styles.typing}>• • •</Text>
            </View>
          )}
          {/* Pilihan jawaban interaktif */}
          {options.length > 0 && (
            <View style={styles.options}>
              {options.map((o) => (
                <Pressable key={o} style={styles.option} onPress={() => handle(o, true)}>
                  <Text style={styles.optionText}>{o}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>

        {(stage === 'closing' || stage === 'done') && (
          <Pressable style={styles.finish} onPress={finish}>
            <Ionicons name="checkmark-circle" size={18} color={colors.white} />
            <Text style={styles.finishText}>Selesai chat & konfirmasi aktivitas</Text>
          </Pressable>
        )}

        {/* Input bebas */}
        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Tulis pesan…"
            placeholderTextColor={colors.textLight}
            style={styles.input}
            onSubmitEditing={() => input.trim() && handle(input.trim(), false)}
            returnKeyType="send"
          />
          <Pressable
            style={[styles.sendBtn, !input.trim() && { opacity: 0.5 }]}
            onPress={() => input.trim() && handle(input.trim(), false)}
            accessibilityLabel="Kirim"
          >
            <Ionicons name="send" size={18} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#F3EFFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerName: { fontFamily: fonts.semibold, fontSize: 16, color: colors.white },
  headerSub: { fontFamily: fonts.regular, fontSize: 12, color: '#E2D8FF' },
  sop: { backgroundColor: colors.white, paddingHorizontal: spacing.lg, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  sopText: { fontFamily: fonts.medium, fontSize: 11.5, color: colors.primary },
  sopBar: { height: 4, borderRadius: 2, backgroundColor: colors.lavender, marginTop: 4, overflow: 'hidden' },
  sopFill: { height: '100%', backgroundColor: colors.primary },
  demo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'center',
    marginTop: spacing.sm,
    backgroundColor: colors.orange,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  demoText: { fontFamily: fonts.medium, fontSize: 11, color: colors.orangeText },
  list: { padding: spacing.lg, gap: spacing.sm },
  system: {
    alignSelf: 'center',
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.text,
    backgroundColor: 'rgba(118,86,200,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginVertical: 4,
  },
  bubble: { maxWidth: '80%', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6, borderRadius: 16 },
  them: { alignSelf: 'flex-start', backgroundColor: colors.white, borderTopLeftRadius: 4 },
  me: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderTopRightRadius: 4 },
  bubbleText: { fontFamily: fonts.regular, fontSize: 14, color: colors.deep, lineHeight: 20 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 3, alignSelf: 'flex-end', marginTop: 2 },
  time: { fontFamily: fonts.regular, fontSize: 10.5, color: colors.textLight },
  typing: { fontFamily: fonts.bold, fontSize: 14, color: colors.textLight, letterSpacing: 2 },
  options: { alignSelf: 'flex-end', alignItems: 'flex-end', gap: 6, marginTop: 4, maxWidth: '85%' },
  option: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  optionText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.primary },
  finish: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#3CC59A',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: 11,
  },
  finishText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.white },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.offWhite,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.deep,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
