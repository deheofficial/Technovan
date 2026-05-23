import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/async-handler';

const router = Router();
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(posts);
}));

router.get('/:slug', asyncHandler(async (req: Request, res: Response) => {
  const post = await prisma.blogPost.findUnique({ where: { slug: req.params.slug } });
  if (!post) return res.status(404).json({ error: 'Blog post not found' });
  res.json(post);
}));

export default router;
