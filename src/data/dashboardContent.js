import { colors } from '../constants/theme';

export const adminDashboardContent = {
  greeting: 'Welcome back',
  subtitle: 'Stadium Administration Panel',
  avatar: '👤',
  metrics: [
    { icon: '🎯', value: '12', label: 'Active Matches', accentColor: colors.primaryLight },
    { icon: '💰', value: '₹2.5L', label: 'Revenue', accentColor: '#00D9FF' },
    { icon: '👥', value: '342', label: 'Total Users', accentColor: '#FF6B6B' },
  ],
  sectionTitle: 'Admin Controls',
  actions: [
    {
      icon: '🏟️',
      title: 'Manage Matches',
      subtitle: 'Create and edit cricket events',
      color: colors.primaryLight,
      onPressRoute: 'AdminMatchList',
    },
    {
      icon: '📊',
      title: 'Statistics',
      subtitle: 'View revenue and booking stats',
      color: '#00D9FF',
      onPressRoute: 'Statistics',
    },
    {
      icon: '👥',
      title: 'Users',
      subtitle: 'Manage staff and fan accounts',
      color: '#FF6B6B',
      onPressRoute: 'UserManagement',
    },
    {
      icon: '⚙️',
      title: 'Settings',
      subtitle: 'System configuration',
      color: '#A78BFA',
      onPressRoute: 'AdminSettings',
    },
  ],
};

export const staffDashboardContent = {
  greeting: 'Hi',
  subtitle: 'Stadium Operations',
  avatar: '👷',
  metrics: [
    { icon: '🎟️', value: '247', label: 'Entries Today', accentColor: colors.primaryLight },
    { icon: '⏰', value: '8:00 - 6:00', label: 'Current Shift', accentColor: '#00D9FF' },
    { icon: '✓', value: '99.8%', label: 'Accuracy Rate', accentColor: '#FFC107' },
  ],
  primaryAction: {
    icon: '📱',
    title: 'Start Scanning Tickets',
    subtitle: 'Tap to scan entry QR codes',
    onPressRoute: 'GateScanner',
  },
  sectionTitle: 'Quick Actions',
  actions: [
    {
      icon: '📱',
      title: 'Gate Scanner',
      subtitle: 'Scan QR codes to validate entry',
      color: colors.primaryLight,
      badge: 'NEW',
      onPressRoute: 'GateScanner',
    },
    {
      icon: '📋',
      title: 'My Shifts',
      subtitle: 'View scheduled work shifts',
      color: '#00D9FF',
      onPressRoute: 'MyShifts',
    },
    {
      icon: '📊',
      title: "Today's Report",
      subtitle: 'Check entries and statistics',
      color: '#FFC107',
      onPressRoute: 'DailyReport',
    },
    {
      icon: '🎫',
      title: 'Ticket Verification',
      subtitle: 'Verify and validate tickets',
      color: '#4CAF50',
      onPressRoute: 'TicketVerify',
    },
  ],
};

export const fanDashboardContent = {
  greeting: 'Welcome',
  subtitle: 'Smart Stadium Ticketing',
  avatar: '🎟️',
  metrics: [
    { icon: '🎫', value: '3', label: 'My Tickets', accentColor: colors.primaryLight },
    { icon: '💰', value: '₹4,500', label: 'Total Spent', accentColor: '#FF6B6B' },
    { icon: '⭐', value: '5', label: 'Wishlist Items', accentColor: '#FF1744' },
  ],
  primaryAction: {
    icon: '🎯',
    title: 'Explore Matches',
    subtitle: 'Find and book your next event',
    onPressRoute: 'MatchList',
  },
  feature: {
    badge: '🔥 Trending',
    title: 'Featured Match',
    lines: [
      'IPL Final - Mumbai vs Delhi',
      '📅 June 20, 2025 • 8:00 PM',
      '📍 Wankhede Stadium, Mumbai',
    ],
    cta: 'View Details',
    onPressRoute: 'MatchList',
  },
  sectionTitle: 'Quick Actions',
  actions: [
    {
      icon: '🎯',
      title: 'Browse Matches',
      subtitle: 'Explore upcoming cricket matches',
      color: colors.primaryLight,
      onPressRoute: 'MatchList',
    },
    {
      icon: '🎫',
      title: 'My Tickets',
      subtitle: 'View your purchased tickets',
      color: '#FF6B6B',
      onPressRoute: 'MyTickets',
    },
    {
      icon: '❤️',
      title: 'Wishlist',
      subtitle: 'Saved matches and events',
      color: '#FF1744',
      onPressRoute: 'Wishlist',
    },
    {
      icon: '👤',
      title: 'My Profile',
      subtitle: 'Manage account and preferences',
      color: '#9C27B0',
      onPressRoute: 'FanProfile',
    },
  ],
};

function bindActions(actions, navigation) {
  return actions.map((action) => ({
    ...action,
    onPress: () => navigation.navigate(action.onPressRoute),
  }));
}

export function bindDashboardContent(content, navigation) {
  return {
    greeting: content.greeting,
    subtitle: content.subtitle,
    avatar: content.avatar,
    metrics: content.metrics,
    primaryAction: content.primaryAction
      ? {
          ...content.primaryAction,
          onPress: () => navigation.navigate(content.primaryAction.onPressRoute),
        }
      : null,
    feature: content.feature
      ? {
          ...content.feature,
          onPress: () => navigation.navigate(content.feature.onPressRoute),
        }
      : null,
    sectionTitle: content.sectionTitle,
    actions: bindActions(content.actions, navigation),
  };
}
