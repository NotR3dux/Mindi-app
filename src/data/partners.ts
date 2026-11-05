// Data partner FIKTIF untuk demo. Jangan gunakan data pribadi orang sungguhan.
export type Partner = {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  rating: number;
  completed: number;
  rate: number;
  available: boolean;
  languages: string;
  bio: string;
  verified: boolean;
};

export const PARTNERS: Partner[] = [
  {
    id: 'rani',
    name: 'Rani S.',
    initials: 'RS',
    avatarColor: '#F7C6D9',
    rating: 4.9,
    completed: 120,
    rate: 7000,
    available: true,
    languages: 'Bahasa Indonesia, English',
    bio: 'Ramah & tepat waktu. Spesialis wake-up call pagi.',
    verified: true,
  },
  {
    id: 'dika',
    name: 'Dika P.',
    initials: 'DP',
    avatarColor: '#BFE3F7',
    rating: 4.8,
    completed: 85,
    rate: 6000,
    available: true,
    languages: 'Bahasa Indonesia, Jawa',
    bio: 'Sabar dan komunikatif, cocok untuk reminder tugas.',
    verified: true,
  },
  {
    id: 'salsa',
    name: 'Salsa M.',
    initials: 'SM',
    avatarColor: '#D7CCF5',
    rating: 4.8,
    completed: 70,
    rate: 7000,
    available: true,
    languages: 'Bahasa Indonesia',
    bio: 'Suka menyemangati! Biasa membantu reminder deadline.',
    verified: true,
  },
  {
    id: 'fauzan',
    name: 'Fauzan K.',
    initials: 'FK',
    avatarColor: '#C9EBD9',
    rating: 4.7,
    completed: 45,
    rate: 5000,
    available: false,
    languages: 'Bahasa Indonesia, Sunda',
    bio: 'Tegas tapi santai. Aktif di jam malam.',
    verified: true,
  },
];

export const getPartner = (id: string) => PARTNERS.find((p) => p.id === id) ?? PARTNERS[0];
