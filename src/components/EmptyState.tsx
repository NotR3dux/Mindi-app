import { StyleSheet, View } from 'react-native';

import { Mascot } from '@/components/Mascot';
import { Button, T } from '@/components/ui';
import { spacing } from '@/constants/theme';

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <Mascot size={110} mood="happy" />
      <T variant="h3" style={{ marginTop: spacing.md, textAlign: 'center' }}>
        {title}
      </T>
      <T variant="small" style={{ textAlign: 'center', marginTop: 4, maxWidth: 260 }}>
        {message}
      </T>
      {actionLabel && (
        <Button title={actionLabel} icon="add" onPress={onAction} style={{ marginTop: spacing.lg, alignSelf: 'stretch' }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
});
