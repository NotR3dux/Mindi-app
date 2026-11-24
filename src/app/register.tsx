// Daftar akun: 1) data diri & password  2) verifikasi kode OTP (SIMULASI — kode ditampilkan di layar).
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthInput } from '@/components/AuthInput';
import { Button, DemoBadge, ScreenHeader, T } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useStore } from '@/store/AppStore';
import { isValidEmail, isValidPhone, normalizePhone, passwordStrength } from '@/utils/auth';

type Errors = Partial<Record<'name' | 'email' | 'phone' | 'password' | 'confirm' | 'agree' | 'form', string>>;
const STRENGTH = ['Lemah', 'Cukup', 'Bagus', 'Kuat'];
const STRENGTH_COLOR = [colors.redText, colors.orangeText, '#2D7FD3', colors.mintText];

const makeCode = () => String(Math.floor(1000 + Math.random() * 9000));

export default function RegisterScreen() {
  const { register, accountExists, toast } = useStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [code, setCode] = useState(makeCode);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const [loading, setLoading] = useState(false);
  const otpRef = useRef<ComponentRef<typeof TextInput>>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const strength = passwordStrength(password);

  const next = () => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = 'Nama minimal 2 huruf.';
    if (!isValidEmail(email)) e.email = 'Format email tidak valid.';
    if (!isValidPhone(phone)) e.phone = 'No. HP tidak valid (contoh: 081234567890).';
    if (password.length < 8) e.password = 'Password minimal 8 karakter.';
    if (confirm !== password) e.confirm = 'Konfirmasi password tidak sama.';
    if (!agree) e.agree = 'Setujui Syarat Layanan & Kebijakan Privasi.';
    if (!e.email && !e.phone) {
      const exists = accountExists(email, phone);
      if (exists) e.form = exists;
    }
    setErrors(e);
    if (Object.keys(e).length) return;
    setCode(makeCode());
    setOtp('');
    setOtpError('');
    setResendIn(30);
    setStep(2);
    setTimeout(() => otpRef.current?.focus(), 300);
  };

  const verify = async () => {
    if (otp !== code) {
      setOtpError('Kode salah. Cek lagi kode di atas.');
      return;
    }
    setLoading(true);
    const res = await register({ name, email, phone, password });
    setLoading(false);
    if (!res.ok) {
      setStep(1);
      setErrors({ form: res.error });
      return;
    }
    toast(`Akun berhasil dibuat. Selamat datang, ${name.trim().split(' ')[0]}! 🎉`);
  };

  if (step === 2) {
    const masked = normalizePhone(phone).replace(/^(\d{4})\d+(\d{3})$/, '$1••••$2');
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScreenHeader title="Verifikasi No. HP" onBack={() => setStep(1)} />
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.otpIcon}>
            <Ionicons name="chatbox-ellipses-outline" size={40} color={colors.primary} />
          </View>
          <T variant="h2" style={{ textAlign: 'center', marginTop: spacing.lg }}>
            Masukkan kode verifikasi
          </T>
          <T variant="body" style={{ textAlign: 'center' }}>
            Kode 4 digit dikirim via SMS ke {masked}
          </T>

          {/* Simulasi: kode ditampilkan karena tidak ada SMS sungguhan */}
          <View style={styles.demoCode}>
            <DemoBadge text="Simulasi SMS" />
            <T variant="small" style={{ marginTop: 6 }}>
              Kode kamu: <Text style={styles.demoCodeText}>{code}</Text>
            </T>
          </View>

          <Pressable style={styles.otpRow} onPress={() => otpRef.current?.focus()}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.otpBox, otp.length === i && styles.otpBoxActive, !!otpError && { borderColor: colors.redText }]}>
                <Text style={styles.otpDigit}>{otp[i] ?? ''}</Text>
              </View>
            ))}
          </Pressable>
          <TextInput
            ref={otpRef}
            value={otp}
            onChangeText={(t) => {
              setOtp(t.replace(/\D/g, '').slice(0, 4));
              setOtpError('');
            }}
            keyboardType="number-pad"
            maxLength={4}
            style={styles.hiddenInput}
            accessibilityLabel="Kode verifikasi"
            onSubmitEditing={verify}
          />
          {!!otpError && <Text style={[styles.error, { textAlign: 'center' }]}>{otpError}</Text>}

          <Button title="Verifikasi & Buat Akun" onPress={verify} loading={loading} disabled={otp.length < 4} style={{ marginTop: spacing.xl }} />
          <View style={styles.footer}>
            <T variant="small">Tidak dapat kode?</T>
            {resendIn > 0 ? (
              <T variant="small">Kirim ulang dalam {resendIn} dtk</T>
            ) : (
              <Pressable
                onPress={() => {
                  setCode(makeCode());
                  setOtp('');
                  setResendIn(30);
                  toast('Kode baru dikirim (simulasi)');
                }}
              >
                <Text style={styles.link}>Kirim ulang</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScreenHeader title="Daftar Akun" onBack={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.stepper}>
          <View style={[styles.stepDot, styles.stepOn]}>
            <Text style={styles.stepNum}>1</Text>
          </View>
          <Text style={[styles.stepLabel, { color: colors.primary }]}>Data diri</Text>
          <View style={styles.stepLine} />
          <View style={styles.stepDot}>
            <Text style={[styles.stepNum, { color: colors.textLight }]}>2</Text>
          </View>
          <Text style={styles.stepLabel}>Verifikasi</Text>
        </View>

        <T variant="h1">Buat akun Mindi</T>
        <T variant="body">Cuma butuh 1 menit. Data kamu aman & hanya dipakai untuk pengingat.</T>

        <AuthInput label="Nama lengkap" icon="person-outline" value={name} onChangeText={setName} placeholder="Nama kamu" autoCapitalize="words" error={errors.name} />
        <AuthInput label="Email" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="nama@email.com" keyboardType="email-address" error={errors.email} />
        <AuthInput label="No. HP (untuk ditelepon partner)" icon="call-outline" value={phone} onChangeText={setPhone} placeholder="081234567890" keyboardType="phone-pad" error={errors.phone} />
        <AuthInput label="Password" icon="lock-closed-outline" value={password} onChangeText={setPassword} placeholder="Minimal 8 karakter" secure error={errors.password} />
        {password.length > 0 && (
          <View style={styles.strength}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.strengthBar, i < Math.max(strength, 1) && { backgroundColor: STRENGTH_COLOR[strength] }]} />
            ))}
            <Text style={[styles.strengthText, { color: STRENGTH_COLOR[strength] }]}>{STRENGTH[strength]}</Text>
          </View>
        )}
        <AuthInput label="Konfirmasi password" icon="lock-closed-outline" value={confirm} onChangeText={setConfirm} placeholder="Ulangi password" secure error={errors.confirm} />

        <Pressable style={styles.agree} onPress={() => setAgree((v) => !v)} accessibilityRole="checkbox" accessibilityState={{ checked: agree }}>
          <Ionicons name={agree ? 'checkbox' : 'square-outline'} size={22} color={errors.agree ? colors.redText : colors.primary} />
          <T variant="small" style={{ flex: 1 }}>
            Saya setuju dengan <Text style={styles.link}>Syarat Layanan</Text> & <Text style={styles.link}>Kebijakan Privasi</Text>, termasuk partner menghubungi saya sesuai pesanan.
          </T>
        </Pressable>
        {!!errors.agree && <Text style={styles.error}>{errors.agree}</Text>}
        {!!errors.form && (
          <View style={styles.formError}>
            <Text style={styles.formErrorText}>{errors.form}</Text>
          </View>
        )}

        <Button title="Lanjut Verifikasi" iconRight="arrow-forward" onPress={next} style={{ marginTop: spacing.xl }} />
        <View style={styles.footer}>
          <T variant="small">Sudah punya akun?</T>
          <Pressable onPress={() => router.replace('/login')}>
            <Text style={styles.link}>Masuk</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.lg },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.lavenderMid,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  stepOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepNum: { fontFamily: fonts.bold, fontSize: 12, color: colors.white },
  stepLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.textLight },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.lavenderMid, marginHorizontal: 4 },
  strength: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.gray },
  strengthText: { fontFamily: fonts.semibold, fontSize: 11.5, marginLeft: 6 },
  agree: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl, alignItems: 'flex-start' },
  link: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.primary },
  error: { fontFamily: fonts.medium, fontSize: 12, color: colors.redText, marginTop: 5 },
  formError: { backgroundColor: colors.red, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.lg },
  formErrorText: { fontFamily: fonts.medium, fontSize: 13, color: colors.redText },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.xl },
  otpIcon: {
    alignSelf: 'center',
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  demoCode: { backgroundColor: '#FFFBF5', borderWidth: 1, borderStyle: 'dashed', borderColor: '#F0C48F', borderRadius: radius.md, padding: spacing.md, marginTop: spacing.xl },
  demoCodeText: { fontFamily: fonts.bold, fontSize: 16, color: colors.deep, letterSpacing: 3 },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md, marginTop: spacing.xl },
  otpBox: {
    width: 56,
    height: 62,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxActive: { borderColor: colors.primary },
  otpDigit: { fontFamily: fonts.bold, fontSize: 24, color: colors.deep },
  hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },
});
