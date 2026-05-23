import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin@123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@technovan.com' },
    update: {
      fullName: 'Technovan Admin',
      phone: '+60123456789',
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      email: 'admin@technovan.com',
      password: adminPassword,
      fullName: 'Technovan Admin',
      phone: '+60123456789',
      role: 'ADMIN',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager@technovan.com' },
    update: {
      fullName: 'Technovan Manager',
      phone: '+60123456780',
      role: 'MANAGER',
      isActive: true,
    },
    create: {
      email: 'manager@technovan.com',
      password: await bcrypt.hash('Manager@123', 10),
      fullName: 'Technovan Manager',
      phone: '+60123456780',
      role: 'MANAGER',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'sales@technovan.com' },
    update: {
      fullName: 'Technovan Sales',
      phone: '+60123456781',
      role: 'SALES',
      isActive: true,
    },
    create: {
      email: 'sales@technovan.com',
      password: await bcrypt.hash('Sales@123', 10),
      fullName: 'Technovan Sales',
      phone: '+60123456781',
      role: 'SALES',
      isActive: true,
    },
  });

  const clients = [
    {
      companyName: 'Apex Logistics Sdn Bhd',
      contactPerson: 'Nadia Rahman',
      email: 'nadia@apexlogistics.my',
      phone: '+60340221111',
      addressLine1: 'Level 12, Menara Apex',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      notes: 'Interested in logistics dashboard and shipment tracking.',
    },
    {
      companyName: 'Vista Retail Group',
      contactPerson: 'Amir Shukri',
      email: 'amir@vistaretail.my',
      phone: '+60340332222',
      addressLine1: '18 Jalan Metro',
      city: 'Petaling Jaya',
      country: 'Malaysia',
      notes: 'Needs CRM integration and e-commerce enhancements.',
    },
  ];

  for (const client of clients) {
    const existingClient = await prisma.client.findFirst({
      where: { email: client.email },
      select: { id: true },
    });

    if (existingClient) {
      await prisma.client.update({
        where: { id: existingClient.id },
        data: {
          companyName: client.companyName,
          contactPerson: client.contactPerson,
          phone: client.phone,
          addressLine1: client.addressLine1,
          city: client.city,
          country: client.country,
          notes: client.notes,
        },
      });
    } else {
      await prisma.client.create({ data: client });
    }
  }

  await prisma.quotationTemplate.upsert({
    where: { id: 'website-template' },
    update: {
      name: 'Website Project Template',
      description: 'Starter template for business website quotations.',
      defaultDiscount: 500,
      defaultSstRate: 0.06,
      termsAndConditions: 'Quotation valid for 14 days. 50% upfront, 50% upon delivery.',
      lineItems: [
        {
          serviceName: 'Discovery & Planning',
          description: 'Requirements workshop, site map, and delivery plan.',
          quantity: 1,
          unitPrice: 1200,
        },
        {
          serviceName: 'UI/UX Design',
          description: 'Responsive interface design for desktop and mobile.',
          quantity: 1,
          unitPrice: 2800,
        },
        {
          serviceName: 'Frontend Development',
          description: 'Implementation of approved screens and CMS pages.',
          quantity: 1,
          unitPrice: 6200,
        },
      ],
    },
    create: {
      id: 'website-template',
      name: 'Website Project Template',
      description: 'Starter template for business website quotations.',
      defaultDiscount: 500,
      defaultSstRate: 0.06,
      termsAndConditions: 'Quotation valid for 14 days. 50% upfront, 50% upon delivery.',
      lineItems: [
        {
          serviceName: 'Discovery & Planning',
          description: 'Requirements workshop, site map, and delivery plan.',
          quantity: 1,
          unitPrice: 1200,
        },
        {
          serviceName: 'UI/UX Design',
          description: 'Responsive interface design for desktop and mobile.',
          quantity: 1,
          unitPrice: 2800,
        },
        {
          serviceName: 'Frontend Development',
          description: 'Implementation of approved screens and CMS pages.',
          quantity: 1,
          unitPrice: 6200,
        },
      ],
      createdById: (await prisma.user.findUniqueOrThrow({ where: { email: 'admin@technovan.com' } })).id,
    },
  });

  console.log('Seeded default users, clients, and quotation template.');
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
