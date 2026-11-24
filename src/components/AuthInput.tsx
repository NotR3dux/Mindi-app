// Input form untuk halaman Masuk & Daftar (label, ikon, error, tombol lihat password).
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, fonts, radius, spacing } from '@/constants/theme';
import type { IconName } from '@/data/services';

type Props = TextInputProps & { label: string; icon: IconName; error?: string; secure?: boolean };

export function AuthInput({ label, icon, error, secure, style, ...rest }: Props) {
  const [hidden, setHidden] = useState(true);
  return (
    <View style={{ marginTop: spacing.lg }}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, !!error && { borderColor: colors.redText }]}>
        <Ionicons name={icon} size={18} color={colors.textLight} />
        <TextInput
          {...rest}
          secureTextEntry={secure && hidden}
          placeholderTextColor={colors.textLight}
          autoCapitalize={rest.autoCapitalize ?? 'none'}
          style={[styles.input, style]}
        />
        {secure && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} accessibilityLabel={hidden ? 'Lihat password' : 'Sembunyikan password'}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={19} color={colors.textLight} />
          </Pressable>
        )}
      </View>
      {!!error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={colors.redText} />
          <Text style={styles.error}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.deep, marginBottom: 6 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  input: { flex: 1, paddingVertical: 12, fontFamily: fonts.regular, fontSize: 14, color: colors.deep },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  error: { fontFamily: fonts.medium, fontSize: 12, color: colors.redText, flex: 1 },
});
