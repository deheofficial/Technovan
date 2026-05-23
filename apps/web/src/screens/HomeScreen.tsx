import React from 'react';
import { View, ScrollView, Text, Pressable } from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <ScrollView className="flex-1 bg-gray-900">
      {/* Hero Section */}
      <View className="px-4 py-20 bg-gradient-to-br from-teal-900 via-gray-900 to-gray-900">
        <Text className="text-4xl font-bold text-white mb-4">TECHNOVAN</Text>
        <Text className="text-xl text-gray-300 mb-8">
          Software Development & IT Solutions Platform
        </Text>
        <Pressable className="bg-teal-500 px-8 py-4 rounded-lg">
          <Text className="text-white font-semibold text-center">Get Started</Text>
        </Pressable>
      </View>

      {/* Services Section */}
      <View className="px-4 py-12">
        <Text className="text-3xl font-bold text-white mb-8">Our Services</Text>
        <View className="space-y-4">
          <ServiceCard
            title="Web Development"
            description="Modern, responsive web applications"
          />
          <ServiceCard
            title="Mobile App Development"
            description="iOS & Android applications"
          />
          <ServiceCard title="Custom Software" description="Tailored solutions for your needs" />
        </View>
      </View>

      {/* Pricing Section */}
      <View className="px-4 py-12 bg-gray-800">
        <Text className="text-3xl font-bold text-white mb-8">Pricing Plans</Text>
        <View className="space-y-4">
          <PricingCard name="Basic Landing" price="RM 299" features={3} />
          <PricingCard name="Business Website" price="RM 599" features={5} />
          <PricingCard name="E-Commerce" price="RM 999" features={7} />
        </View>
      </View>
    </ScrollView>
  );
}

function ServiceCard({ title, description }: any) {
  return (
    <View className="bg-gray-800 p-6 rounded-lg border border-teal-500">
      <Text className="text-lg font-semibold text-white mb-2">{title}</Text>
      <Text className="text-gray-400">{description}</Text>
    </View>
  );
}

function PricingCard({ name, price, features }: any) {
  return (
    <View className="bg-gray-700 p-6 rounded-lg border border-purple-500">
      <Text className="text-xl font-bold text-white mb-2">{name}</Text>
      <Text className="text-3xl font-bold text-teal-400 mb-4">{price}</Text>
      <Text className="text-gray-300 mb-4">{features} features included</Text>
      <Pressable className="bg-purple-600 px-6 py-3 rounded">
        <Text className="text-white font-semibold text-center">Choose Plan</Text>
      </Pressable>
    </View>
  );
}
