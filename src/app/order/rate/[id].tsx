import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { Avatar, Button, Chip, T } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { getPartner } from '@/data/partners';
import { useStore } from '@/store/AppStore';
import { resetToHome } from '@/utils/nav';

const QUICK_TAGS = ['Tepat waktu', 'Ramah', 'Komunikatif', 'Sabar', 'Bikin semangat'];
const LABELS = ['', 'Kurang', 'Cukup', 'Baik', 'Sangat baik', 'Luar biasa!'];

export default function RateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, submitReview, toast } = useStore();
  const order = orders.find((o) => o.id === id);
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(false);

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <EmptyState title="Pesanan tidak ditemukan" message="" actionLabel="Ke Beranda" onAction={resetToHome} />
      </SafeAreaView>
    );
  }
  const partner = getPartner(order.partnerId);

  const toggleTag = (t: string) => setTags((list) => (list.includes(t) ? list.filter((x) => x !== t) : [...list, t]));

  const send = () => {
    if (rating === 0) {
      setError(true);
      return;
    }
    submitReview(order.id, { rating, tags, comment: comment.trim() });
    toast('Terima kasih! Ulasan terkirim · +5 poin');
    resetToHome();
    router.navigate('/history');
  };

  const goHome = resetToHome;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.check}>
          <Ionicons name="checkmark" size={46} color={colors.white} />
        </View>
        <T variant="h1" style={{ textAlign: 'center', marginTop: spacing.lg }}>
          Pengingat Selesai!
        </T>
        <T variant="body" style={{ textAlign: 'center' }}>
          Kerja bagus! Kamu mendapat <T variant="bodyBold" style={{ color: colors.primary }}>+10 poin</T>.
        </T>

        <View style={styles.box}>
          <Avatar initials={partner.initials} color={partner.avatarColor} size={60} />
          <T variant="h3" style={{ textAlign: 'center', marginTop: spacing.sm }}>
            Bagaimana pengalamanmu dengan {partner.name.split(' ')[0]}?
          </T>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                onPress={() => {
                  setRating(n);
                  setError(false);
                }}
                hitSlop={6}
                accessibilityLabel={`${n} bintang`}
              >
                <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={38} color={n <= rating ? colors.star : '#CFCAD9'} />
              </Pressable>
            ))}
          </View>
          <Text style={styles.ratingLabel}>{rating ? LABELS[rating] : 'Ketuk bintang untuk menilai'}</Text>
          {error && <Text style={styles.error}>Pilih rating bintang terlebih dahulu.</Text>}

          <View style={styles.tags}>
            {QUICK_TAGS.map((t) => (
              <Chip key={t} label={t} selected={tags.includes(t)} onPress={() => toggleTag(t)} />
            ))}
          </View>

          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Tulis ulasan (opsional)"
            placeholderTextColor={colors.textLight}
            multiline
            maxLength={250}
            style={styles.input}
          />
        </View>

        <Button title="Kirim Ulasan" icon="send" onPress={send} style={{ marginTop: spacing.lg }} />
        <Button title="Kembali ke Beranda" variant="ghost" onPress={goHome} style={{ marginTop: spacing.sm }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 40, alignItems: 'stretch' },
  check: {
    alignSelf: 'center',
    marginTop: spacing.lg,
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#3CC59A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 7,
    borderColor: colors.mint,
  },
  box: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  stars: { flexDirection: 'row', gap: 6, marginTop: spacing.md },
  ratingLabel: { fontFamily: fonts.medium, color: colors.text, fontSize: 13, marginTop: 6 },
  error: { fontFamily: fonts.medium, fontSize: 12, color: colors.redText, marginTop: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center', marginTop: spacing.lg },
  input: {
    alignSelf: 'stretch',
    minHeight: 84,
    textAlignVertical: 'top',
    marginTop: spacing.lg,
    backgroundColor: colors.offWhite,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.deep,
  },
});
