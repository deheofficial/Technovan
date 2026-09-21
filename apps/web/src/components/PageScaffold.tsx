import React from 'react';
import { TWScrollView as ScrollView, TWText as Text, TWView as View } from './native';

type PageScaffoldProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export default function PageScaffold({ title, description, children }: PageScaffoldProps) {
  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerStyle={{ padding: 32 }}>
      <Text className="text-3xl font-bold text-white">{title}</Text>
      <Text className="mt-2 text-gray-400">{description}</Text>
      <View className="mt-8">{children || <View className="rounded-xl border border-gray-800 bg-gray-900 p-6"><Text className="text-lg font-semibold text-white">{title} workspace</Text><Text className="mt-2 text-gray-400">This page is ready for its existing API surface to be migrated incrementally.</Text></View>}</View>
    </ScrollView>
  );
}
