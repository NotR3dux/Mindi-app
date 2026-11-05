// Komponen UI dasar Mindi: teks, tombol, kartu, chip, header halaman, dll.
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { colors, fonts, radius, shadow, spacing } from '@/constants/theme';
import type { IconName } from '@/data/services';

/* ---------- Teks ---------- */
type Variant = 'h1' | 'h2' | 'h3' | 'body' | 'bodyBold' | 'small' | 'caption';
const variantStyle: Record<Variant, TextStyle> = {
  h1: { fontFamily: fonts.bold, fontSize: 24, color: colors.deep, lineHeight: 32 },
  h2: { fontFamily: fonts.bold, fontSize: 19, color: colors.deep, lineHeight: 26 },
  h3: { fontFamily: fonts.semibold, fontSize: 16, color: colors.deep, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 14, color: colors.text, lineHeight: 21 },
  bodyBold: { fontFamily: fonts.semibold, fontSize: 14, color: colors.deep, lineHeight: 21 },
  small: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.text, lineHeight: 18 },
  caption: { fontFamily: fonts.medium, fontSize: 11, color: colors.textLight, lineHeight: 15 },
};

export function T({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  return <Text {...rest} style={[variantStyle[variant], style]} />;
}

/* ---------- Tombol ---------- */
type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'soft' | 'danger';
  icon?: IconName;
  iconRight?: IconName;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, onPress, variant = 'primary', icon, iconRight, disabled, loading, small, style }: ButtonProps) {
  const palette = {
    primary: { bg: colors.primary, fg: colors.white, border: colors.primary },
    outline: { bg: colors.white, fg: colors.primary, border: colors.primary },
    ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
    soft: { bg: colors.lavender, fg: colors.primary, border: colors.lavender },
    danger: { bg: colors.white, fg: colors.redText, border: '#F3C1BC' },
  }[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSmall,
        { backgroundColor: palette.bg, borderColor: palette.border },
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={small ? 16 : 19} color={palette.fg} />}
          <Text style={[styles.btnText, small && { fontSize: 13 }, { color: palette.fg }]}>{title}</Text>
          {iconRight && <Ionicons name={iconRight} size={small ? 16 : 19} color={palette.fg} />}
        </>
      )}
    </Pressable>
  );
}

/* ---------- Kartu ---------- */
export function Card({
  children,
  style,
  onPress,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

/* ---------- Chip / Pill ---------- */
export function Chip({
  label,
  selected,
  onPress,
  icon,
  style,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipSelected, style]}
    >
      {icon && <Ionicons name={icon} size={15} color={selected ? colors.white : colors.primary} />}
      <Text style={[styles.chipText, selected && { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

/* ---------- Ikon bulat ---------- */
export function IconBubble({
  name,
  bg = colors.lavender,
  color = colors.primary,
  size = 44,
}: {
  name: IconName;
  bg?: string;
  color?: string;
  size?: number;
}) {
  return (
    <View style={[styles.bubble, { width: size, height: size, borderRadius: size * 0.32, backgroundColor: bg }]}>
      <Ionicons name={name} size={size * 0.5} color={color} />
    </View>
  );
}

/* ---------- Avatar inisial (tanpa foto asli demi privasi) ---------- */
export function Avatar({ initials, color, size = 52 }: { initials: string; color: string; size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.34 }]}>{initials}</Text>
    </View>
  );
}

/* ---------- Header halaman dengan tombol kembali ---------- */
export function ScreenHeader({ title, right, onBack }: { title: string; right?: ReactNode; onBack?: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
        hitSlop={12}
        style={styles.backBtn}
        accessibilityLabel="Kembali"
      >
        <Ionicons name="chevron-back" size={22} color={colors.deep} />
      </Pressable>
      <T variant="h3" style={{ flex: 1, textAlign: 'center' }} numberOfLines={1}>
        {title}
      </T>
      <View style={{ width: 38, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

/* ---------- Indikator langkah booking ---------- */
export function Steps({ current }: { current: 1 | 2 | 3 | 4 }) {
  const labels = ['Layanan', 'Detail', 'Partner', 'Bayar'];
  return (
    <View style={styles.steps}>
      {labels.map((l, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <View key={l} style={{ flex: 1, alignItems: 'center' }}>
            <View style={[styles.stepBar, (done || active) && { backgroundColor: colors.primary }]} />
            <Text style={[styles.stepText, (done || active) && { color: colors.primary }]}>{l}</Text>
          </View>
        );
      })}
    </View>
  );
}

/* ---------- Baris info (ikon + label + nilai) ---------- */
export function InfoRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={colors.primary} style={{ width: 26 }} />
      <T variant="small" style={{ flex: 1 }}>
        {label}
      </T>
      <T variant="bodyBold" style={{ flex: 1.4, textAlign: 'right' }}>
        {value}
      </T>
    </View>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionTitle}>
      <T variant="h3">{title}</T>
      {action && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

/** Label kecil "Mode Demo" agar jelas bahwa fitur masih simulasi */
export function DemoBadge({ text = 'Simulasi demo' }: { text?: string }) {
  return (
    <View style={styles.demo}>
      <Ionicons name="flask-outline" size={12} color={colors.orangeText} />
      <Text style={styles.demoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnSmall: { minHeight: 38, paddingHorizontal: 14, borderRadius: radius.sm },
  btnText: { fontFamily: fonts.semibold, fontSize: 15 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lavenderMid,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary },
  bubble: { alignItems: 'center', justifyContent: 'center' },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.bold, color: colors.deep },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  steps: { flexDirection: 'row', gap: 6, paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  stepBar: { height: 4, borderRadius: 2, backgroundColor: colors.lavenderMid, alignSelf: 'stretch' },
  stepText: { fontFamily: fonts.medium, fontSize: 11, color: colors.textLight, marginTop: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  sectionTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionAction: { fontFamily: fonts.semibold, fontSize: 13, color: colors.primary },
  demo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.orange,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  demoText: { fontFamily: fonts.medium, fontSize: 11, color: colors.orangeText },
});
