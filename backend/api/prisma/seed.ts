import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('password', 10);

  await prisma.user.upsert({
    where: { email: 'admin@technovan.com' },
    update: {
      firstName: 'Admin',
      lastName: 'Technovan',
      role: 'ADMIN',
      company: 'Technovan',
      isActive: true,
    },
    create: {
      id: 'admin-1',
      email: 'admin@technovan.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Technovan',
      role: 'ADMIN',
      company: 'Technovan',
      isActive: true,
    },
  });

  const services = [
    {
      id: 's1',
      title: 'Web Development',
      description: 'Custom websites and web apps built with modern tech.',
      icon: '🌐',
      order: 1,
    },
    {
      id: 's2',
      title: 'Mobile App Development',
      description: 'iOS & Android apps with React Native.',
      icon: '📱',
      order: 2,
    },
    {
      id: 's3',
      title: 'UI/UX Design',
      description: 'Beautiful, user-friendly interfaces for any platform.',
      icon: '🎨',
      order: 3,
    },
    {
      id: 's4',
      title: 'Cloud & DevOps',
      description: 'Scalable cloud infrastructure and CI/CD pipelines.',
      icon: '☁️',
      order: 4,
    },
    {
      id: 's5',
      title: 'API Integration',
      description: 'Connect your systems with third-party APIs.',
      icon: '🔗',
      order: 5,
    },
    {
      id: 's6',
      title: 'IT Consulting',
      description: 'Expert advice to align technology with your business.',
      icon: '💡',
      order: 6,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: {
        title: service.title,
        description: service.description,
        icon: service.icon,
        order: service.order,
        isActive: true,
      },
      create: {
        ...service,
        isActive: true,
      },
    });
  }

  const pricing = [
    {
      id: 'p1',
      name: 'Starter',
      price: 1500,
      currency: 'RM',
      order: 1,
      description: 'Perfect for small businesses getting started online.',
      features: ['5-page website', 'Mobile responsive', 'Contact form', 'Basic SEO', '1 month support'],
    },
    {
      id: 'p2',
      name: 'Professional',
      price: 4500,
      currency: 'RM',
      order: 2,
      description: 'Ideal for growing businesses needing more functionality.',
      features: ['Up to 15 pages', 'CMS integration', 'E-commerce ready', 'Advanced SEO', 'API integration', '3 months support'],
    },
    {
      id: 'p3',
      name: 'Enterprise',
      price: 12000,
      currency: 'RM',
      order: 3,
      description: 'Full-scale custom solution for large organizations.',
      features: ['Unlimited pages', 'Custom backend', 'Mobile app included', 'Analytics dashboard', 'Priority support', '12 months support', 'Dedicated team'],
    },
  ];

  for (const plan of pricing) {
    await prisma.pricing.upsert({
      where: { id: plan.id },
      update: {
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        order: plan.order,
        description: plan.description,
        features: plan.features,
        isActive: true,
      },
      create: {
        ...plan,
        isActive: true,
      },
    });
  }

  const portfolio = [
    {
      id: 'port-1',
      title: 'E-Commerce Platform',
      description: 'Full-stack online store with payment integration.',
      image: '',
      link: '#',
      category: 'Web',
      order: 1,
    },
    {
      id: 'port-2',
      title: 'Delivery Mobile App',
      description: 'React Native app for iOS & Android with real-time tracking.',
      image: '',
      link: '#',
      category: 'Mobile',
      order: 2,
    },
    {
      id: 'port-3',
      title: 'Company Dashboard',
      description: 'Analytics and management dashboard for a logistics company.',
      image: '',
      link: '#',
      category: 'Web',
      order: 3,
    },
  ];

  for (const item of portfolio) {
    await prisma.portfolio.upsert({
      where: { id: item.id },
      update: {
        title: item.title,
        description: item.description,
        image: item.image,
        link: item.link,
        category: item.category,
        order: item.order,
        isActive: true,
      },
      create: {
        ...item,
        isActive: true,
      },
    });
  }

  const posts = [
    {
      id: 'blog-1',
      title: 'Why Your Business Needs a Mobile App in 2026',
      excerpt: 'Mobile apps drive engagement and revenue. Here is why now is the time to invest.',
      content: 'Full content here...',
      slug: 'why-your-business-needs-a-mobile-app',
      image: '',
      createdAt: new Date('2026-01-15T00:00:00.000Z'),
    },
    {
      id: 'blog-2',
      title: 'React Native vs Flutter: Which Should You Choose?',
      excerpt: 'A practical comparison for business owners deciding on their mobile tech stack.',
      content: 'Full content here...',
      slug: 'react-native-vs-flutter',
      image: '',
      createdAt: new Date('2026-02-20T00:00:00.000Z'),
    },
    {
      id: 'blog-3',
      title: 'How We Build Scalable APIs at Technovan',
      excerpt: 'Behind the scenes of our API development process using Node.js and TypeScript.',
      content: 'Full content here...',
      slug: 'how-we-build-scalable-apis',
      image: '',
      createdAt: new Date('2026-03-10T00:00:00.000Z'),
    },
  ];

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { id: post.id },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        slug: post.slug,
        image: post.image,
        published: true,
      },
      create: {
        ...post,
        published: true,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
