import React, { ReactNode } from 'react';
import { TWPressable as Pressable, TWScrollView as ScrollView, TWText as Text, TWView as View } from '../components/native';
import Brand from '../components/Brand';

type ModuleKey =
  | 'overview'
  | 'projects'
  | 'payments'
  | 'dashboard'
  | 'services'
  | 'pricing'
  | 'blog'
  | 'quotation'
  | 'all-projects'
  | 'inquiries'
  | 'change-management';

interface AdminLayoutProps {
  activeModule: ModuleKey;
  onNavigate: (module: ModuleKey) => void;
  children: ReactNode;
}

const primaryNavigation: { key: ModuleKey; label: string; icon: string }[] = [
  { key: 'overview', label: 'Overview', icon: '⌁' },
  { key: 'projects', label: 'My Projects', icon: '□' },
  { key: 'payments', label: 'Payments', icon: '▣' },
];

const adminNavigation: { key: ModuleKey; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '⌁' },
  { key: 'services', label: 'Services', icon: '⚙' },
  { key: 'pricing', label: 'Pricing', icon: '$' },
  { key: 'blog', label: 'Blog', icon: '▤' },
  { key: 'quotation', label: 'Quotation', icon: '▤' },
  { key: 'all-projects', label: 'All Projects', icon: '▤' },
  { key: 'inquiries', label: 'Inquiries', icon: '✉' },
  { key: 'change-management', label: 'Change Management', icon: '↻' },
];

function NavigationItem({
  item,
  active,
  onPress,
}: {
  item: { key: ModuleKey; label: string; icon: string };
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-1 flex-row items-center rounded-lg px-3 py-3 ${
        active ? 'bg-teal-500/15 border border-teal-500/30' : ''
      }`}
    >
      <Text className={`mr-3 w-5 text-center text-lg ${active ? 'text-teal-400' : 'text-gray-400'}`}>
        {item.icon}
      </Text>
      <Text className={`text-sm ${active ? 'font-semibold text-white' : 'text-gray-300'}`}>
        {item.label}
      </Text>
    </Pressable>
  );
}

export default function AdminLayout({ activeModule, onNavigate, children }: AdminLayoutProps) {
  return (
    <View className="min-h-screen flex-1 flex-row bg-gray-950">
      <View className="w-64 border-r border-gray-800 bg-gray-900 px-4 py-5">
        <View className="mb-10 px-2"><Brand /></View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text className="mb-3 px-2 text-xs font-bold uppercase tracking-widest text-gray-500">Main</Text>
          {primaryNavigation.map((item) => (
            <NavigationItem
              key={item.key}
              item={item}
              active={activeModule === item.key}
              onPress={() => onNavigate(item.key)}
            />
          ))}

          <Text className="mb-3 mt-8 px-2 text-xs font-bold uppercase tracking-widest text-gray-500">
            Admin
          </Text>
          {adminNavigation.map((item) => (
            <NavigationItem
              key={item.key}
              item={item}
              active={activeModule === item.key}
              onPress={() => onNavigate(item.key)}
            />
          ))}

          <Text className="mb-3 mt-8 px-2 text-xs font-bold uppercase tracking-widest text-gray-500">
            Account
          </Text>
          <NavigationItem
            item={{ key: 'overview', label: 'Logout', icon: '↪' }}
            active={false}
            onPress={() => onNavigate('overview')}
          />
        </ScrollView>
      </View>

      <View className="min-w-0 flex-1">
        <View className="h-16 flex-row items-center justify-between border-b border-gray-800 bg-gray-950 px-8">
          <Text className="text-lg font-semibold text-white">
            {activeModule === 'change-management' ? 'Change Management' : 'TECHNOVAN Admin'}
          </Text>
          <Pressable className="h-9 w-9 items-center justify-center rounded-full border border-gray-700">
            <Text className="text-gray-300">☼</Text>
          </Pressable>
        </View>
        <View className="flex-1">{children}</View>
      </View>
    </View>
  );
}

export type { ModuleKey };
