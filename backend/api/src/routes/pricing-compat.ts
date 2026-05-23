import { Router } from 'express';
import axios from 'axios';

const router = Router();
const legacyApiBase = process.env.LEGACY_API_BASE_URL || 'https://technovan-production.up.railway.app/api';
const remotePricingUrl = `${legacyApiBase.replace(/\/$/, '')}/pricing`;

const fallbackPricing = [
    {
      id: 'plan-basic',
      name: 'Basic',
      price: 3500,
      currency: 'MYR',
      description: 'Starter scope for small projects.',
      features: ['Discovery workshop', 'Core implementation', 'Deployment support'],
      order: 1,
      isActive: true,
    },
    {
      id: 'plan-growth',
      name: 'Growth',
      price: 8500,
      currency: 'MYR',
      description: 'Balanced package for scaling teams.',
      features: ['Advanced UI/UX', 'API integration', 'Revision cycle and QA'],
      order: 2,
      isActive: true,
    },
    {
      id: 'plan-enterprise',
      name: 'Enterprise',
      price: 18000,
      currency: 'MYR',
      description: 'End-to-end delivery with dedicated support.',
      features: ['Architecture planning', 'Multi-module delivery', 'Priority support'],
      order: 3,
      isActive: true,
    },
  ];

// Temporary compatibility route for legacy frontend calls.
router.get('/', async (_req, res) => {
  try {
    const response = await axios.get(remotePricingUrl, { timeout: 5000 });
    res.json(response.data);
    return;
  } catch (_error) {
    res.json(fallbackPricing);
  }
});

export default router;