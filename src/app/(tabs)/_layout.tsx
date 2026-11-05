import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { isActive } from '@/data/orders';
import type { IconName } from '@/data/services';
import { useStore } from '@/store/AppStore';

const icon =
  (active: IconName, inactive: IconName) =>
  ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} size={23} color={color as string} />
  );

export default function TabLayout() {
  const { orders } = useStore();
  const activeCount = orders.filter((o) => isActive(o.status)).length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#A9A4B6',
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          height: 64,
          paddingTop: 6,
        },
        sceneStyle: { backgroundColor: colors.offWhite },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Beranda', tabBarIcon: icon('home', 'home-outline') }} />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Pesanan',
          tabBarIcon: icon('receipt', 'receipt-outline'),
          tabBarBadge: activeCount > 0 ? activeCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary, fontSize: 10 },
        }}
      />
      <Tabs.Screen name="history" options={{ title: 'Riwayat', tabBarIcon: icon('time', 'time-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: icon('person', 'person-outline') }} />
    </Tabs>
  );
}
