import { Router } from 'express';
import axios from 'axios';

const router = Router();
const legacyApiBase = process.env.LEGACY_API_BASE_URL || 'https://technovan-production.up.railway.app/api';
const remoteBlogUrl = `${legacyApiBase.replace(/\/$/, '')}/blog`;

const fallbackPosts = [
  {
    id: 'blog-compat-1',
    title: 'Quotation Revision Playbook',
    excerpt: 'How to manage v1, v2, and approval-ready revisions efficiently.',
    content: 'Use clear scope summaries, lock approved versions, and track audit logs for every status change.',
    slug: 'quotation-revision-playbook',
    image: null,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'blog-compat-2',
    title: 'SST and Commercial Calculations',
    excerpt: 'A practical checklist for subtotal, discount, SST, and grand total.',
    content: 'Always calculate taxable amount after discount, then apply SST and round amounts consistently.',
    slug: 'sst-commercial-calculations',
    image: null,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

router.get('/', async (_req, res) => {
  try {
    const response = await axios.get(remoteBlogUrl, { timeout: 5000 });
    res.json(response.data);
    return;
  } catch (_error) {
    res.json(fallbackPosts);
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const response = await axios.get(`${remoteBlogUrl}/${encodeURIComponent(req.params.slug)}`, { timeout: 5000 });
    res.json(response.data);
    return;
  } catch (_error) {
    const post = fallbackPosts.find((entry) => entry.slug === req.params.slug);
    if (!post) {
      res.status(404).json({ error: 'Blog post not found' });
      return;
    }
    res.json(post);
  }
});

export default router;