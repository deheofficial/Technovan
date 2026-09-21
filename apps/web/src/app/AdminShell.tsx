import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { TWPressable as Pressable, TWScrollView as ScrollView, TWText as Text, TWView as View } from '../components/native';
import { adminNavigation, primaryNavigation } from '../config/navigation';
import type { ModuleDefinition } from '../types/navigation';
import Brand from '../components/Brand';

function NavigationItem({ item, active }: { item: ModuleDefinition; active: boolean }) {
  return (
    <Link to={item.path} style={{ textDecoration: 'none' }}>
      <Pressable className={`mb-1 flex-row items-center rounded-lg px-3 py-3 ${active ? 'border border-teal-500/30 bg-teal-500/15' : ''}`}>
        <Text className={`mr-3 w-5 text-center text-lg ${active ? 'text-teal-400' : 'text-gray-400'}`}>{item.icon}</Text>
        <Text className={`text-sm ${active ? 'font-semibold text-white' : 'text-gray-300'}`}>{item.label}</Text>
      </Pressable>
    </Link>
  );
}

export default function AdminShell() {
  const location = useLocation();
  const isActive = (item: ModuleDefinition) => item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
  const current = [...primaryNavigation, ...adminNavigation].find(isActive);

  return (
    <View className="min-h-screen flex-1 flex-row bg-gray-950">
      <View className="w-64 border-r border-gray-800 bg-gray-900 px-4 py-5">
        <View className="mb-10 px-2"><Brand /></View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text className="mb-3 px-2 text-xs font-bold uppercase tracking-widest text-gray-500">Main</Text>
          {primaryNavigation.map((item) => <NavigationItem key={item.key} item={item} active={isActive(item)} />)}
          <Text className="mb-3 mt-8 px-2 text-xs font-bold uppercase tracking-widest text-gray-500">Admin</Text>
          {adminNavigation.map((item) => <NavigationItem key={item.key} item={item} active={isActive(item)} />)}
          <Text className="mb-3 mt-8 px-2 text-xs font-bold uppercase tracking-widest text-gray-500">Account</Text>
          <NavigationItem item={{ key: 'overview', label: 'Logout', icon: '↪', path: '/' }} active={false} />
        </ScrollView>
      </View>
      <View className="min-w-0 flex-1">
        <View className="h-16 flex-row items-center justify-between border-b border-gray-800 bg-gray-950 px-8"><Text className="text-lg font-semibold text-white">{current?.label || 'TECHNOVAN Admin'}</Text><Pressable className="h-9 w-9 items-center justify-center rounded-full border border-gray-700"><Text className="text-gray-300">☼</Text></Pressable></View>
        <View className="flex-1"><Outlet /></View>
      </View>
    </View>
  );
}
