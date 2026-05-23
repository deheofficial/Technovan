import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const initializeDefaultData = async () => {
  try {
    // Check if data already exists
    const servicesCount = await prisma.service.count();
    if (servicesCount > 0) {
      console.log('Default data already initialized');
      return;
    }

    // Create default services
    const services = [
      {
        title: 'Web Development',
        description: 'Modern, responsive web applications built with latest technologies',
        icon: 'globe',
        order: 1,
        isActive: true,
      },
      {
        title: 'Mobile App Development',
        description: 'Native and cross-platform mobile applications for iOS and Android',
        icon: 'smartphone',
        order: 2,
        isActive: true,
      },
      {
        title: 'Custom Software Development',
        description: 'Tailored software solutions for your specific business needs',
        icon: 'code',
        order: 3,
        isActive: true,
      },
      {
        title: 'UI/UX Design',
        description: 'Beautiful and intuitive user interfaces and experiences',
        icon: 'palette',
        order: 4,
        isActive: true,
      },
      {
        title: 'System Integration',
        description: 'Integration of various systems and platforms seamlessly',
        icon: 'link',
        order: 5,
        isActive: true,
      },
      {
        title: 'API Development',
        description: 'RESTful and GraphQL APIs for your applications',
        icon: 'server',
        order: 6,
        isActive: true,
      },
    ];

    await prisma.service.createMany({
      data: services,
    });

    console.log('✅ Services created');

    // Create default pricing
    const pricing = [
      {
        name: 'BASIC LANDING PAGE',
        price: 299,
        currency: 'RM',
        description: 'Perfect for startups and small businesses',
        features: ['1 Page website', 'Responsive design', 'WhatsApp integration', 'Fast delivery'],
        isActive: true,
        order: 1,
      },
      {
        name: 'BUSINESS WEBSITE',
        price: 599,
        currency: 'RM',
        description: 'Ideal for growing businesses',
        features: [
          '5–7 Pages',
          'Contact form',
          'Admin panel',
          'WhatsApp integration',
          'SEO Optimization',
        ],
        isActive: true,
        order: 2,
      },
      {
        name: 'E-COMMERCE WEBSITE',
        price: 999,
        currency: 'RM',
        description: 'Complete e-commerce solution',
        features: [
          '2–5 Pages',
          'Unlimited products',
          'Payment gateway',
          'Order dashboard',
          'Inventory management',
          'Email notifications',
        ],
        isActive: true,
        order: 3,
      },
    ];

    await prisma.pricing.createMany({
      data: pricing,
    });

    console.log('✅ Pricing created');

    // Create default portfolio items
    const portfolio = [
      {
        title: 'E-Commerce Platform',
        description: 'Full-featured e-commerce platform with payment integration',
        category: 'Web Development',
        isActive: true,
        order: 1,
      },
      {
        title: 'Mobile Social App',
        description: 'Social networking application for iOS and Android',
        category: 'Mobile Development',
        isActive: true,
        order: 2,
      },
      {
        title: 'Business Analytics Dashboard',
        description: 'Data analytics dashboard for enterprise clients',
        category: 'Custom Software',
        isActive: true,
        order: 3,
      },
    ];

    await prisma.portfolio.createMany({
      data: portfolio,
    });

    console.log('✅ Portfolio created');
    console.log('✅ Default data initialized successfully');
  } catch (error) {
    console.error('Error initializing default data:', error);
  } finally {
    await prisma.$disconnect();
  }
};

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDefaultData();
}
