import { Router } from 'express';
import axios from 'axios';

const router = Router();
const legacyApiBase = process.env.LEGACY_API_BASE_URL || 'https://technovan-production.up.railway.app/api';
const remotePortfolioUrl = `${legacyApiBase.replace(/\/$/, '')}/portfolio`;

const fallbackPortfolio = [
  {
    id: 'port-compat-1',
    title: 'Enterprise Quotation Hub',
    description: 'Internal system for generating and approving project quotations.',
    image: null,
    link: null,
    category: 'Web App',
    isActive: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'port-compat-2',
    title: 'Client Approval Portal',
    description: 'Secure portal for quotation review and acceptance tracking.',
    image: null,
    link: null,
    category: 'Portal',
    isActive: true,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

router.get('/', async (_req, res) => {
  try {
    const response = await axios.get(remotePortfolioUrl, { timeout: 5000 });
    res.json(response.data);
    return;
  } catch (_error) {
    res.json(fallbackPortfolio);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(`${remotePortfolioUrl}/${encodeURIComponent(req.params.id)}`, { timeout: 5000 });
    res.json(response.data);
    return;
  } catch (_error) {
    const item = fallbackPortfolio.find((entry) => entry.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Portfolio item not found' });
      return;
    }
    res.json(item);
  }
});

export default router;