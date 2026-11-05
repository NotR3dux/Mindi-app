import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button, T } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';

/** Dialog konfirmasi yang bekerja di Android & web (pengganti Alert) */
export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Ya',
  cancelLabel = 'Batal',
  danger,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.box} onPress={() => {}}>
          <T variant="h3">{title}</T>
          <T variant="body" style={{ marginTop: 6 }}>
            {message}
          </T>
          <View style={styles.actions}>
            <Button title={cancelLabel} variant="soft" onPress={onCancel} style={{ flex: 1 }} small />
            <Button
              title={confirmLabel}
              variant={danger ? 'danger' : 'primary'}
              onPress={onConfirm}
              style={{ flex: 1 }}
              small
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30,18,55,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  box: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.xl, width: '100%', maxWidth: 380 },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
});
