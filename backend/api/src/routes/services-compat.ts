import { Router } from 'express';
import axios from 'axios';

const router = Router();
const legacyApiBase = process.env.LEGACY_API_BASE_URL || 'https://technovan-production.up.railway.app/api';
const remoteServicesUrl = `${legacyApiBase.replace(/\/$/, '')}/services`;

const fallbackServices = [
    {
      id: 'svc-discovery',
      title: 'Discovery & Planning',
      description: 'Requirement workshops, scoping, and delivery planning.',
      icon: 'clipboard-list',
      order: 1,
      isActive: true,
    },
    {
      id: 'svc-design',
      title: 'UI/UX Design',
      description: 'Wireframing, visual design, and responsive experience design.',
      icon: 'palette',
      order: 2,
      isActive: true,
    },
    {
      id: 'svc-engineering',
      title: 'Software Engineering',
      description: 'Web apps, APIs, and integrations for business operations.',
      icon: 'code',
      order: 3,
      isActive: true,
    },
    {
      id: 'svc-support',
      title: 'Maintenance & Support',
      description: 'Monitoring, bug fixes, and performance improvements.',
      icon: 'life-buoy',
      order: 4,
      isActive: true,
    },
  ];

// Temporary compatibility route for legacy frontend calls.
router.get('/', async (_req, res) => {
  try {
    const response = await axios.get(remoteServicesUrl, { timeout: 5000 });
    res.json(response.data);
    return;
  } catch (_error) {
    res.json(fallbackServices);
  }
});

export default router;