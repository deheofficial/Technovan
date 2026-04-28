import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, Pressable, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks';
import { login } from '../store/slices/authSlice';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await dispatch(login({ email, password })).unwrap();
      // Navigation will be handled by app router
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Please check your credentials');
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="px-6 py-20">
        <Text className="text-3xl font-bold text-white mb-2">Welcome Back</Text>
        <Text className="text-gray-400 mb-10">Sign in to your account</Text>

        {error && <Text className="text-red-500 mb-4">{error}</Text>}

        <TextInput
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          className="bg-gray-800 text-white px-4 py-3 rounded-lg mb-4 border border-gray-700"
          editable={!loading}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="bg-gray-800 text-white px-4 py-3 rounded-lg mb-6 border border-gray-700"
          editable={!loading}
        />

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          className="bg-teal-500 px-6 py-4 rounded-lg mb-4"
        >
          <Text className="text-white font-semibold text-center">
            {loading ? 'Signing in...' : 'Sign In'}
          </Text>
        </Pressable>

        <View className="flex-row justify-center">
          <Text className="text-gray-400">Don't have an account? </Text>
          <Pressable>
            <Text className="text-teal-400 font-semibold">Sign up</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
