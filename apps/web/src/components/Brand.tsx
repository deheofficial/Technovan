import React from 'react';
import { Text, View } from 'react-native';

export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <View className="flex-row items-center">
      <Text className={compact ? 'mr-2 text-base' : 'mr-2 text-xl'}>🌍</Text>
      <Text className={compact ? 'text-lg font-bold' : 'text-xl font-bold'}>
        <Text className="text-[#c8f04e]">TECHNO</Text>
        <Text className="text-white">VAN</Text>
      </Text>
    </View>
  );
}
