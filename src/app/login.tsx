// Masuk dengan email / no HP + password (akun disimpan lokal — simulasi).
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthInput } from '@/components/AuthInput';
import { Mascot } from '@/components/Mascot';
import { Button, ScreenHeader, T } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useStore } from '@/store/AppStore';
import { DEMO_EMAIL, DEMO_PASSWORD } from '@/utils/auth';

export default function LoginScreen() {
  const { login, loginDemo, toast } = useStore();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ id?: string; pw?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e: typeof errors = {};
    if (!identifier.trim()) e.id = 'Isi email atau no. HP.';
    if (!password) e.pw = 'Isi password.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    const res = await login(identifier, password);
    setLoading(false);
    if (!res.ok) setErrors({ form: res.error });
    else toast('Selamat datang kembali! 👋');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScreenHeader title="Masuk" onBack={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center' }}>
          <Mascot size={90} mood="happy" />
        </View>
        <T variant="h1" style={{ textAlign: 'center', marginTop: spacing.sm }}>
          Masuk ke Mindi
        </T>
        <T variant="body" style={{ textAlign: 'center' }}>
          Lanjutkan pengingatmu yang tertunda.
        </T>

        <AuthInput
          label="Email atau No. HP"
          icon="person-outline"
          value={identifier}
          onChangeText={(t) => {
            setIdentifier(t);
            setErrors({});
          }}
          placeholder="nama@email.com / 08xxxxxxxxxx"
          keyboardType="email-address"
          error={errors.id}
        />
        <AuthInput
          label="Password"
          icon="lock-closed-outline"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            setErrors({});
          }}
          placeholder="Password"
          secure
          error={errors.pw}
          onSubmitEditing={submit}
        />
        <Pressable style={{ alignSelf: 'flex-end', marginTop: spacing.sm }} onPress={() => toast('Simulasi: link reset password dikirim ke email')}>
          <Text style={styles.link}>Lupa password?</Text>
        </Pressable>

        {!!errors.form && (
          <View style={styles.formError}>
            <Text style={styles.formErrorText}>{errors.form}</Text>
          </View>
        )}

        <Button title="Masuk" onPress={submit} loading={loading} style={{ marginTop: spacing.xl }} />

        <View style={styles.divider}>
          <View style={styles.line} />
          <T variant="caption">atau</T>
          <View style={styles.line} />
        </View>
        <Button title="Masuk akun demo (Sabrina)" variant="soft" icon="flask-outline" onPress={() => loginDemo()} />
        <T variant="caption" style={{ textAlign: 'center', marginTop: 6 }}>
          Akun demo: {DEMO_EMAIL} · {DEMO_PASSWORD}
        </T>

        <View style={styles.footer}>
          <T variant="small">Belum punya akun?</T>
          <Pressable onPress={() => router.replace('/register')}>
            <Text style={styles.link}>Daftar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  link: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.primary },
  formError: { backgroundColor: colors.red, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.lg },
  formErrorText: { fontFamily: fonts.medium, fontSize: 13, color: colors.redText },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.xl },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.xl },
});
