export type ForumCategory = 'semua' | 'review' | 'regulasi' | 'operasional' | 'sharing' | 'scam_alert' | 'tanya_jawab';

export interface ForumUser {
  name: string;
  avatar: string; // initials
  role: string;
  reputation: number;
  postCount: number;
  joinDate: string;
  badge?: string;
}

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  category: ForumCategory;
  author: ForumUser;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  replyCount: number;
  likeCount: number;
  isPinned?: boolean;
  isHot?: boolean;
  isSolved?: boolean;
  tags: string[];
  lastReply?: {
    user: string;
    time: string;
  };
}

export const forumCategories = [
  { id: 'semua', label: 'Semua', icon: '🏠', color: '#6B7280' },
  { id: 'review', label: 'Review', icon: '⭐', color: '#F59E0B' },
  { id: 'regulasi', label: 'Regulasi', icon: '📜', color: '#2563EB' },
  { id: 'operasional', label: 'Operasional', icon: '⚙️', color: '#059669' },
  { id: 'sharing', label: 'Sharing', icon: '💬', color: '#7C3AED' },
  { id: 'scam_alert', label: 'Scam Alert', icon: '🚨', color: '#DC2626' },
  { id: 'tanya_jawab', label: 'Tanya Jawab', icon: '❓', color: '#0891B2' },
];

export const forumStats = {
  totalThreads: 1247,
  totalMembers: 389,
  totalReplies: 8934,
  onlineNow: 42,
};

export const forumThreads: ForumThread[] = [
  // === PINNED ===
  {
    id: 'thr-1',
    title: '[MEGATHREAD] Update Regulasi Nusuk 2026 - Wajib Baca!',
    content: 'Thread ini berisi kumpulan update terbaru dari sistem Nusuk yang berlaku mulai Januari 2026. Semua PPIU wajib memperhatikan perubahan berikut...',
    category: 'regulasi',
    author: {
      name: 'Admin GEZMA',
      avatar: 'AG',
      role: 'Admin',
      reputation: 9999,
      postCount: 567,
      joinDate: 'Jan 2024',
      badge: 'Admin',
    },
    createdAt: '2026-01-15T08:00:00',
    updatedAt: '2026-02-02T14:30:00',
    viewCount: 4521,
    replyCount: 89,
    likeCount: 234,
    isPinned: true,
    tags: ['Nusuk', 'Regulasi 2026', 'Wajib Baca'],
    lastReply: { user: 'Haji Mahmud', time: '2 jam lalu' },
  },
  {
    id: 'thr-2',
    title: '[PENTING] Daftar Muassasah Resmi & Terpercaya 2026',
    content: 'Berikut daftar muassasah yang sudah terverifikasi dan terpercaya untuk pengurusan visa umrah tahun 2026...',
    category: 'operasional',
    author: {
      name: 'Admin GEZMA',
      avatar: 'AG',
      role: 'Admin',
      reputation: 9999,
      postCount: 567,
      joinDate: 'Jan 2024',
      badge: 'Admin',
    },
    createdAt: '2026-01-10T10:00:00',
    updatedAt: '2026-02-01T09:00:00',
    viewCount: 3876,
    replyCount: 45,
    likeCount: 189,
    isPinned: true,
    tags: ['Muassasah', 'Visa', 'Resmi'],
    lastReply: { user: 'Travel Amanah', time: '5 jam lalu' },
  },

  // === HOT THREADS ===
  {
    id: 'thr-3',
    title: 'Review Jujur: Pullman ZamZam vs Swissotel Makkah - Mana yang Worth It?',
    content: 'Baru balik dari trip Januari 2026. Kebetulan 2 grup saya split di Pullman dan Swissotel. Ini review lengkapnya dari sisi harga, service, kamar, lokasi...',
    category: 'review',
    author: {
      name: 'Rizky Pratama',
      avatar: 'RP',
      role: 'Verified PPIU',
      reputation: 856,
      postCount: 123,
      joinDate: 'Mar 2024',
      badge: 'Top Contributor',
    },
    createdAt: '2026-01-28T15:30:00',
    updatedAt: '2026-02-02T18:45:00',
    viewCount: 2341,
    replyCount: 67,
    likeCount: 156,
    isHot: true,
    tags: ['Review Hotel', 'Makkah', 'Pullman', 'Swissotel'],
    lastReply: { user: 'Aisyah Travel', time: '30 menit lalu' },
  },
  {
    id: 'thr-4',
    title: 'HATI-HATI! Vendor Hotel Bodong di Madinah - Sudah 3 Travel Kena Tipu',
    content: 'Saya ingin share pengalaman pahit. Ada vendor yang mengaku punya allotment di hotel dekat Masjid Nabawi, ternyata setelah transfer DP...',
    category: 'scam_alert',
    author: {
      name: 'Haji Mahmud',
      avatar: 'HM',
      role: 'Verified PPIU',
      reputation: 1245,
      postCount: 234,
      joinDate: 'Feb 2024',
      badge: 'Senior Member',
    },
    createdAt: '2026-01-30T09:00:00',
    updatedAt: '2026-02-02T20:15:00',
    viewCount: 5678,
    replyCount: 112,
    likeCount: 345,
    isHot: true,
    tags: ['Scam', 'Vendor Bodong', 'Madinah', 'Waspada'],
    lastReply: { user: 'Safar Tour', time: '15 menit lalu' },
  },
  {
    id: 'thr-5',
    title: 'Sharing HPP Paket Umrah Reguler 9 Hari - Februari 2026',
    content: 'Mau sharing breakdown HPP paket umrah reguler 9 hari untuk keberangkatan Februari 2026. Mungkin bisa jadi referensi teman-teman...',
    category: 'sharing',
    author: {
      name: 'Ahmad Fauzan',
      avatar: 'AF',
      role: 'Verified PPIU',
      reputation: 678,
      postCount: 89,
      joinDate: 'Jun 2024',
    },
    createdAt: '2026-01-25T11:00:00',
    updatedAt: '2026-02-01T16:30:00',
    viewCount: 1876,
    replyCount: 43,
    likeCount: 98,
    isHot: true,
    tags: ['HPP', 'Umrah Reguler', 'Sharing'],
    lastReply: { user: 'Barokah Travel', time: '1 jam lalu' },
  },

  // === REGULAR THREADS ===
  {
    id: 'thr-6',
    title: 'Tips Handling Jemaah Lansia di Pesawat - Pengalaman 5 Tahun',
    content: 'Setelah 5 tahun handle grup dengan jemaah lansia, saya mau share beberapa tips yang sudah terbukti efektif...',
    category: 'operasional',
    author: {
      name: 'Siti Nurhaliza',
      avatar: 'SN',
      role: 'Verified PPIU',
      reputation: 534,
      postCount: 76,
      joinDate: 'Aug 2024',
    },
    createdAt: '2026-01-27T14:00:00',
    updatedAt: '2026-01-31T10:00:00',
    viewCount: 987,
    replyCount: 28,
    likeCount: 67,
    tags: ['Tips', 'Handling', 'Lansia', 'Operasional'],
    lastReply: { user: 'Dian Travel', time: '3 jam lalu' },
  },
  {
    id: 'thr-7',
    title: 'Ada yang Pernah Pakai Bus Al Salam Transport? Review dong',
    content: 'Rencana mau pakai Al Salam Transport untuk trip Maret nanti. Ada yang sudah pernah pakai? Gimana kualitas bus dan handling-nya?',
    category: 'tanya_jawab',
    author: {
      name: 'Budi Setiawan',
      avatar: 'BS',
      role: 'Member',
      reputation: 123,
      postCount: 15,
      joinDate: 'Nov 2024',
    },
    createdAt: '2026-01-29T09:30:00',
    updatedAt: '2026-02-01T08:00:00',
    viewCount: 456,
    replyCount: 12,
    likeCount: 8,
    isSolved: true,
    tags: ['Bus', 'Al Salam', 'Review', 'Tanya'],
    lastReply: { user: 'Rizky Pratama', time: '1 hari lalu' },
  },
  {
    id: 'thr-8',
    title: 'Update: Saudi Buka Visa Umrah untuk 6 Negara Baru',
    content: 'Per 1 Februari 2026, Kementerian Haji dan Umrah Saudi Arabia resmi membuka visa umrah untuk 6 negara baru...',
    category: 'regulasi',
    author: {
      name: 'News GEZMA',
      avatar: 'NG',
      role: 'Moderator',
      reputation: 4567,
      postCount: 345,
      joinDate: 'Jan 2024',
      badge: 'Moderator',
    },
    createdAt: '2026-02-01T07:00:00',
    updatedAt: '2026-02-02T12:00:00',
    viewCount: 2134,
    replyCount: 34,
    likeCount: 87,
    tags: ['Saudi', 'Visa', 'Update', 'Regulasi'],
    lastReply: { user: 'Haji Mahmud', time: '4 jam lalu' },
  },
  {
    id: 'thr-9',
    title: 'Perbandingan Asuransi Umrah: Astra vs Allianz vs Takaful',
    content: 'Thread ini membahas perbandingan 3 asuransi umrah yang paling sering dipakai. Dari sisi coverage, harga, klaim, dan pengalaman...',
    category: 'review',
    author: {
      name: 'Dewi Kartika',
      avatar: 'DK',
      role: 'Verified PPIU',
      reputation: 432,
      postCount: 56,
      joinDate: 'Jul 2024',
    },
    createdAt: '2026-01-22T13:00:00',
    updatedAt: '2026-01-30T17:00:00',
    viewCount: 1543,
    replyCount: 38,
    likeCount: 76,
    tags: ['Asuransi', 'Review', 'Perbandingan'],
    lastReply: { user: 'Ahmad Fauzan', time: '2 hari lalu' },
  },
  {
    id: 'thr-10',
    title: 'Cara Nego Harga Hotel Makkah untuk Group Besar (40+ pax)',
    content: 'Saya mau share teknik nego yang biasa saya pakai ketika booking hotel Makkah untuk group besar di atas 40 pax...',
    category: 'sharing',
    author: {
      name: 'Umar Farouk',
      avatar: 'UF',
      role: 'Verified PPIU',
      reputation: 987,
      postCount: 156,
      joinDate: 'Apr 2024',
      badge: 'Top Contributor',
    },
    createdAt: '2026-01-20T10:00:00',
    updatedAt: '2026-01-28T14:00:00',
    viewCount: 2876,
    replyCount: 52,
    likeCount: 134,
    tags: ['Tips', 'Nego', 'Hotel', 'Makkah'],
    lastReply: { user: 'Siti Nurhaliza', time: '3 hari lalu' },
  },
  {
    id: 'thr-11',
    title: 'Mutawwif Bahasa Indonesia di Madinah - Rekomendasi?',
    content: 'Mau tanya, ada rekomendasi mutawwif bahasa Indonesia yang bagus di Madinah? Budget sekitar 4-5 juta per trip...',
    category: 'tanya_jawab',
    author: {
      name: 'Rina Susanti',
      avatar: 'RS',
      role: 'Member',
      reputation: 67,
      postCount: 8,
      joinDate: 'Dec 2024',
    },
    createdAt: '2026-01-31T16:00:00',
    updatedAt: '2026-02-02T09:00:00',
    viewCount: 345,
    replyCount: 15,
    likeCount: 12,
    tags: ['Mutawwif', 'Madinah', 'Rekomendasi'],
    lastReply: { user: 'Umar Farouk', time: '6 jam lalu' },
  },
  {
    id: 'thr-12',
    title: 'Waspada: Email Phishing Mengatasnamakan Nusuk',
    content: 'Mau warning teman-teman, ada email phishing yang mengatasnamakan Nusuk minta update data PPIU. Jangan diklik link-nya!',
    category: 'scam_alert',
    author: {
      name: 'Admin GEZMA',
      avatar: 'AG',
      role: 'Admin',
      reputation: 9999,
      postCount: 567,
      joinDate: 'Jan 2024',
      badge: 'Admin',
    },
    createdAt: '2026-02-02T08:00:00',
    updatedAt: '2026-02-02T22:00:00',
    viewCount: 1234,
    replyCount: 23,
    likeCount: 89,
    tags: ['Phishing', 'Nusuk', 'Waspada', 'Email'],
    lastReply: { user: 'Budi Setiawan', time: '45 menit lalu' },
  },
];
