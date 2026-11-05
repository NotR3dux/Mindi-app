// Maskot Mindi: lonceng lavender yang ramah (SVG, bisa diubah warna & ekspresinya).
import { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';

type Props = { size?: number; mood?: 'wink' | 'happy' };

export function Mascot({ size = 120, mood = 'wink' }: Props) {
  // ID gradien harus unik per maskot; ID yang sama dipakai beberapa SVG bisa bentrok di web
  const gradId = 'bell' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#B7A2F0" />
          <Stop offset="1" stopColor="#7656C8" />
        </LinearGradient>
      </Defs>
      {/* garis "berdering" */}
      <Path d="M94 22 L102 14" stroke="#7656C8" strokeWidth={4} strokeLinecap="round" />
      <Path d="M99 32 L110 29" stroke="#7656C8" strokeWidth={4} strokeLinecap="round" />
      {/* gagang */}
      <Path d="M58 22 C56 12 62 6 68 8" stroke="#9479DD" strokeWidth={7} strokeLinecap="round" fill="none" />
      {/* badan lonceng */}
      <Path
        d="M60 20 C36 20 28 42 28 62 L28 78 C28 84 20 86 20 94 C20 99 25 101 30 101 L90 101 C95 101 100 99 100 94 C100 86 92 84 92 78 L92 62 C92 42 84 20 60 20 Z"
        fill={`url(#${gradId})`}
      />
      {/* kilau */}
      <Ellipse cx="44" cy="44" rx="6" ry="11" fill="#FFFFFF" opacity={0.35} />
      {/* bandul */}
      <Circle cx="60" cy="106" r="7" fill="#9479DD" />
      {/* mata */}
      <Circle cx="48" cy="62" r="5.5" fill="#2A1A4A" />
      <Circle cx="49.8" cy="60" r="1.8" fill="#FFFFFF" />
      {mood === 'wink' ? (
        <Path d="M66 63 Q72 57 78 63" stroke="#2A1A4A" strokeWidth={3.5} strokeLinecap="round" fill="none" />
      ) : (
        <>
          <Circle cx="72" cy="62" r="5.5" fill="#2A1A4A" />
          <Circle cx="73.8" cy="60" r="1.8" fill="#FFFFFF" />
        </>
      )}
      {/* pipi */}
      <Ellipse cx="40" cy="72" rx="5" ry="3" fill="#F49AC1" opacity={0.6} />
      <Ellipse cx="80" cy="72" rx="5" ry="3" fill="#F49AC1" opacity={0.6} />
      {/* senyum */}
      <Path d="M52 74 Q60 84 68 74" stroke="#2A1A4A" strokeWidth={3.5} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** Logo kecil untuk header */
export function LogoMark({ size = 30 }: { size?: number }) {
  return <Mascot size={size} mood="happy" />;
}
