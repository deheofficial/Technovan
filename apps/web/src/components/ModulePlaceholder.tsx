import React from 'react';
import { TWScrollView as ScrollView, TWText as Text, TWView as View } from './native';

type ModulePlaceholderProps = {
  title: string;
  description: string;
};

export default function ModulePlaceholder({ title, description }: ModulePlaceholderProps) {
  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerStyle={{ padding: 32 }}>
      <Text className="text-3xl font-bold text-white">{title}</Text>
      <Text className="mt-2 text-gray-400">{description}</Text>
      <View className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-6">
        <Text className="text-lg font-semibold text-white">{title} workspace</Text>
        <Text className="mt-2 text-gray-400">
          This module is routed and ready for its existing API surface to be migrated here incrementally.
        </Text>
      </View>
    </ScrollView>
  );
}
