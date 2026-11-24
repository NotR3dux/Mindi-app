// QR code sederhana (SVG) — dipakai untuk simulasi pembayaran QRIS.
import QR from 'qrcode';
import { useMemo } from 'react';
import Svg, { Rect } from 'react-native-svg';

export function QRCode({ value, size = 200, color = '#1B1430' }: { value: string; size?: number; color?: string }) {
  const { count, cells } = useMemo(() => {
    const qr = QR.create(value, { errorCorrectionLevel: 'M' });
    const n = qr.modules.size;
    const list: { x: number; y: number }[] = [];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.modules.get(x, y)) list.push({ x, y });
    return { count: n, cells: list };
  }, [value]);

  const quiet = 2; // margin putih
  const total = count + quiet * 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${total} ${total}`}>
      <Rect x={0} y={0} width={total} height={total} fill="#FFFFFF" />
      {cells.map((c) => (
        <Rect key={`${c.x}-${c.y}`} x={c.x + quiet} y={c.y + quiet} width={1.02} height={1.02} fill={color} />
      ))}
    </Svg>
  );
}
