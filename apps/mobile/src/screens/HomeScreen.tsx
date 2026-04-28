import React from 'react';
import { View, ScrollView, Text, Pressable, SafeAreaView } from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks';

export default function HomeScreen() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#111827' }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Hero Section */}
        <View style={{ padding: 16, paddingTop: 24, paddingBottom: 24, backgroundColor: '#0f3d3a' }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 8 }}>
            TECHNOVAN
          </Text>
          <Text style={{ fontSize: 16, color: '#d1d5db', marginBottom: 16 }}>
            Software Development & IT Solutions
          </Text>
          <Pressable style={{ backgroundColor: '#0D9488', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}>
            <Text style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>Get Started</Text>
          </Pressable>
        </View>

        {/* Services */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 16 }}>
            Our Services
          </Text>
          <ServiceCard
            title="Web Development"
            description="Modern web applications"
          />
          <ServiceCard
            title="Mobile Apps"
            description="iOS & Android apps"
          />
          <ServiceCard
            title="Custom Software"
            description="Tailored solutions"
          />
        </View>

        {/* Pricing */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 24, backgroundColor: '#1f2937' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 16 }}>
            Pricing
          </Text>
          <PricingCard name="Basic" price="RM 299" />
          <PricingCard name="Business" price="RM 599" />
          <PricingCard name="E-Commerce" price="RM 999" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ServiceCard({ title, description }: any) {
  return (
    <View
      style={{
        backgroundColor: '#1f2937',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#0D9488',
        marginBottom: 12,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '600', color: 'white', marginBottom: 4 }}>
        {title}
      </Text>
      <Text style={{ color: '#9ca3af' }}>{description}</Text>
    </View>
  );
}

function PricingCard({ name, price }: any) {
  return (
    <View
      style={{
        backgroundColor: '#374151',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#A855F7',
        marginBottom: 12,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 4 }}>
        {name}
      </Text>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#14B8A6', marginBottom: 8 }}>
        {price}
      </Text>
      <Pressable style={{ backgroundColor: '#9333EA', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 }}>
        <Text style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>Choose</Text>
      </Pressable>
    </View>
  );
}
