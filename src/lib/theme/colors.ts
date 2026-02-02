// Theme colors for light and dark mode
export const colors = {
  light: {
    // Backgrounds
    pageBg: '#F9FAFB',
    cardBg: '#FFFFFF',
    cardBgHover: '#FAFAFA',
    inputBg: '#F9FAFB',

    // Borders
    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    // Text
    textPrimary: '#111827',
    textSecondary: '#374151',
    textMuted: '#6B7280',
    textLight: '#9CA3AF',

    // Brand
    primary: '#DC2626',
    primaryLight: '#FEF2F2',
    primaryHover: '#B91C1C',

    // Status
    success: '#16A34A',
    successLight: '#F0FDF4',
    warning: '#D97706',
    warningLight: '#FFFBEB',
    error: '#DC2626',
    errorLight: '#FEF2F2',
    info: '#2563EB',
    infoLight: '#EFF6FF',

    // Sidebar
    sidebarBg: '#FFFFFF',
    sidebarBorder: '#E5E7EB',
    sidebarActiveItem: '#FEF2F2',

    // Header
    headerBg: 'rgba(255, 255, 255, 0.95)',
  },
  dark: {
    // Backgrounds
    pageBg: '#0F172A',
    cardBg: '#1E293B',
    cardBgHover: '#334155',
    inputBg: '#1E293B',

    // Borders
    border: '#334155',
    borderLight: '#1E293B',

    // Text
    textPrimary: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    textLight: '#64748B',

    // Brand
    primary: '#EF4444',
    primaryLight: '#7F1D1D',
    primaryHover: '#DC2626',

    // Status
    success: '#22C55E',
    successLight: '#14532D',
    warning: '#F59E0B',
    warningLight: '#78350F',
    error: '#EF4444',
    errorLight: '#7F1D1D',
    info: '#3B82F6',
    infoLight: '#1E3A8A',

    // Sidebar
    sidebarBg: '#1E293B',
    sidebarBorder: '#334155',
    sidebarActiveItem: '#7F1D1D',

    // Header
    headerBg: 'rgba(30, 41, 59, 0.95)',
  },
};

export type ThemeColors = typeof colors.light;
