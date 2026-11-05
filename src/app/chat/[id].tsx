// Layar chat SIMULASI (full screen) saat partner mengingatkan lewat chat.
// Pesan partner muncul bertahap (dengan indikator "sedang mengetik"); tidak ada chat sungguhan.
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { getPartner } from '@/data/partners';
import { getService } from '@/data/services';
import { useStore } from '@/store/AppStore';
import { formatTime } from '@/utils/format';

type Msg = { id: number; from: 'partner' | 'me' | 'system'; text: string; time: string };

const QUICK_REPLIES = ['Siap, aku mulai sekarang! 💪', 'Sudah aku kerjakan ✅', 'Ingatkan 5 menit lagi ya ⏰'];

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
  const [replied, setReplied] = useState(false);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const nextId = useRef(0);

  const push = useCallback((from: Msg['from'], text: string) => {
    setMessages((m) => [...m, { id: nextId.current++, from, text, time: nowLabel() }]);
  }, []);

  /** Partner "mengetik" lalu mengirim pesan-pesan secara berurutan */
  const partnerSays = useCallback(
    (texts: string[], startDelay = 400) => {
      let t = startDelay;
      texts.forEach((text) => {
        timers.current.push(setTimeout(() => setTyping(true), t));
        t += 1100 + Math.min(text.length * 12, 900);
        timers.current.push(
          setTimeout(() => {
            setTyping(false);
            push('partner', text);
          }, t)
        );
        t += 300;
      });
    },
    [push]
  );

  // Pesan pembuka dari partner
  useEffect(() => {
    if (!order) return;
    const partner = getPartner(order.partnerId);
    const service = getService(order.serviceId);
    push('system', `${service.name} · ${formatTime(order.time)} · percakapan simulasi`);
    const opening = [
      `Halo ${user.name}! 👋 Ini ${partner.name.split(' ')[0]} dari Mindi.`,
      `Sudah jam ${order.time.replace(':', '.')} nih. Saatnya: "${order.activity}" 🔔`,
    ];
    if (order.note) opening.push(`Sesuai catatanmu: "${order.note}" 😉`);
    opening.push('Balas pesan ini kalau kamu sudah siap ya!');
    partnerSays(opening, 600);
    const list = timers.current;
    return () => list.forEach(clearTimeout);
    // hanya sekali saat layar dibuka
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages, typing]);

  if (!order) {
    return (
      <SafeAreaView style={[styles.fill, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles.headerName}>Percakapan tidak ditemukan</Text>
      </SafeAreaView>
    );
  }

  const partner = getPartner(order.partnerId);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    push('me', t);
    setInput('');
    if (/5 menit|nanti|bentar|tunda/i.test(t)) {
      partnerSays(['Oke! Aku ingatkan lagi sebentar ya ⏰', '⏰ Sudah waktunya lagi nih! Yuk mulai sekarang, kamu pasti bisa 💜'], 300);
      return;
    }
    if (!replied) {
      setReplied(true);
      setStatus(order.id, 'Menunggu Konfirmasi');
      partnerSays(['Mantap! Semangat ya 🙌', 'Jangan lupa konfirmasi di aplikasi kalau aktivitasnya sudah selesai.'], 300);
    } else {
      partnerSays(['Siap 👍'], 300);
    }
  };

  const finish = () => {
    if (!replied) setStatus(order.id, 'Menunggu Konfirmasi');
    toast('Chat selesai (simulasi)');
    close();
  };

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
        <Pressable onPress={() => toast('Panggilan dari chat tidak tersedia di simulasi')} hitSlop={10}>
          <Ionicons name="call-outline" size={21} color={colors.white} />
        </Pressable>
      </View>

      {/* Label demo */}
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
        </ScrollView>

        {/* Balasan cepat */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quick} style={{ flexGrow: 0 }}>
          {QUICK_REPLIES.map((q) => (
            <Pressable key={q} style={styles.quickChip} onPress={() => send(q)}>
              <Text style={styles.quickText}>{q}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {replied && (
          <Pressable style={styles.finish} onPress={finish}>
            <Ionicons name="checkmark-circle" size={18} color={colors.white} />
            <Text style={styles.finishText}>Selesai chat & konfirmasi aktivitas</Text>
          </Pressable>
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Tulis pesan…"
            placeholderTextColor={colors.textLight}
            style={styles.input}
            onSubmitEditing={() => send(input)}
            returnKeyType="send"
          />
          <Pressable style={[styles.sendBtn, !input.trim() && { opacity: 0.5 }]} onPress={() => send(input)} accessibilityLabel="Kirim">
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
    marginBottom: spacing.sm,
  },
  bubble: { maxWidth: '80%', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6, borderRadius: 16 },
  them: { alignSelf: 'flex-start', backgroundColor: colors.white, borderTopLeftRadius: 4 },
  me: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderTopRightRadius: 4 },
  bubbleText: { fontFamily: fonts.regular, fontSize: 14, color: colors.deep, lineHeight: 20 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 3, alignSelf: 'flex-end', marginTop: 2 },
  time: { fontFamily: fonts.regular, fontSize: 10.5, color: colors.textLight },
  typing: { fontFamily: fonts.bold, fontSize: 14, color: colors.textLight, letterSpacing: 2 },
  quick: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  quickChip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lavenderMid,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  quickText: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary },
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
