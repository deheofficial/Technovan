import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface ButtonProps {
  text: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  text,
  onPress,
  variant = 'primary',
  disabled = false,
}) => {
  const bgColor = {
    primary: '#0D9488',
    secondary: '#9333EA',
    danger: '#DC2626',
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? '#9CA3AF' : bgColor,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
      }}
    >
      <Text style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>
        {text}
      </Text>
    </Pressable>
  );
};

interface CardProps {
  children: React.ReactNode;
  style?: any;
}

export const Card: React.FC<CardProps> = ({ children, style }) => (
  <View
    style={{
      backgroundColor: '#1f2937',
      borderRadius: 8,
      padding: 16,
      borderWidth: 1,
      borderColor: '#374151',
      ...style,
    }}
  >
    {children}
  </View>
);

interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  style?: any;
}

export const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  style,
}) => (
  <View
    style={{
      backgroundColor: '#374151',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: '#4B5563',
      marginBottom: 12,
      ...style,
    }}
  >
    {/* TextInput replacement for native compatibility */}
    <Text style={{ color: '#d1d5db', fontSize: 16 }}>{placeholder}</Text>
  </View>
);

export default {
  Button,
  Card,
  Input,
};
