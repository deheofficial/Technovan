# Deployment Guide

## Cloudflare Pages Deployment

### Prerequisites
1. Cloudflare account
2. Domain (tecnovand.com)
3. GitHub repository
4. GitHub token

### Step 1: Connect GitHub Repository

1. Go to Cloudflare Dashboard
2. Select Pages
3. Create Application → Connect to Git
4. Authorize GitHub
5. Select repository

### Step 2: Configure Build Settings

- **Framework preset**: None (custom)
- **Build command**: `yarn build`
- **Build output directory**: `dist`
- **Root directory**: `apps/web`

### Step 3: Environment Variables

Add to Cloudflare Pages:

```
EXPO_PUBLIC_API_URL=https://api.tecnovand.com
NODE_ENV=production
```

### Step 4: Deploy

Push code to main branch:
```bash
git push origin main
```

Cloudflare automatically builds and deploys.

---

## Backend Deployment (Node.js API)

### Option 1: Railway

1. Sign up at railway.app
2. Connect GitHub
3. Select repository
4. Configure environment variables:
   - DATABASE_URL
   - JWT_SECRET
   - NODE_ENV=production
5. Deploy

### Option 2: Heroku

```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
heroku create technovan-api

# Set environment variables
heroku config:set DATABASE_URL=postgresql://...
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

### Option 3: Docker on VPS

```bash
# Build image
docker build -t technovan-api .

# Run container
docker run -d \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=your-secret \
  -p 3000:3000 \
  technovan-api

# Or use docker-compose
docker-compose up -d
```

---

## Database Setup

### PostgreSQL on Supabase

1. Go to supabase.com
2. Create new project
3. Get connection string
4. Set DATABASE_URL in backend
5. Run migrations: `yarn prisma:push`

### PostgreSQL on AWS RDS

1. Create RDS instance
2. Configure security groups
3. Get connection string
4. Update DATABASE_URL
5. Run migrations

---

## SSL/TLS Setup

### Cloudflare SSL

1. Dashboard → SSL/TLS
2. Select Full (Strict) mode
3. Update nameservers to Cloudflare
4. Enable automatic HTTPS rewrites

### Certificate Management

- Cloudflare handles SSL automatically
- Certificates auto-renew
- No additional configuration needed

---

## CDN Configuration

### Cloudflare CDN

1. Dashboard → Caching
2. Set cache level to "Cache Everything"
3. Add cache rules for:
   - Static assets (max-age: 1 year)
   - API responses (no cache)
   - HTML files (cache, revalidate)

### Cache Purge

```bash
# Purge all cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

---

## WAF Rules

### Cloudflare WAF

1. Dashboard → Security → WAF
2. Add rules:
   - Block common attacks
   - Rate limiting
   - Bot management
   - Custom rules

### Example Rule

```
(cf.threat_score > 50) or
(cf.bot_management.score > 70)
```

---

## Monitoring & Logs

### Cloudflare Analytics

- Dashboard → Analytics
- Real-time request logs
- Error tracking
- Performance metrics

### Application Monitoring

```bash
# View logs
tail -f logs/error.log

# Monitor API
curl https://api.tecnovand.com/health

# Check database
psql -U user -d database -c "SELECT 1"
```

---

## Domain Configuration

### DNS Records

```
A     tecnovand.com          →  <Cloudflare IP>
CNAME www                    →  tecnovand.com
CNAME api                    →  workers.dev
CNAME mail                   →  <email provider>
MX                          →  <email provider>
TXT   (SPF record)          →  v=spf1 include:...
```

### Nameservers

Update at domain registrar:
- `alma.ns.cloudflare.com`
- `beck.ns.cloudflare.com`

---

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL/TLS enabled
- [ ] CDN configured
- [ ] WAF rules enabled
- [ ] Backups scheduled
- [ ] Monitoring enabled
- [ ] Error tracking setup
- [ ] Email notifications enabled
- [ ] API rate limiting enabled
- [ ] CORS configured correctly
- [ ] Security headers set
- [ ] SEO optimized
- [ ] Analytics enabled
- [ ] Load testing done

---

## Scaling

### Horizontal Scaling

1. **Multiple API instances**: Use load balancer
2. **Database replication**: Read replicas
3. **CDN caching**: Reduce origin requests
4. **Message queues**: Async processing

### Performance Optimization

1. Enable compression (gzip, brotli)
2. Optimize images
3. Implement caching strategies
4. Use edge functions for computation
5. Lazy load resources

---

## Backup & Recovery

### Database Backups

```bash
# Manual backup
pg_dump -U user -d database > backup.sql

# Automated backups
# Schedule daily backups using cron

# Restore
psql -U user -d database < backup.sql
```

### Disaster Recovery

1. Automated daily backups
2. Point-in-time recovery enabled
3. Replicated to separate region
4. Recovery time objective (RTO): 1 hour
5. Recovery point objective (RPO): 24 hours

---

## Cost Optimization

- Use Cloudflare free tier where applicable
- Optimize database queries
- Enable compression
- Cache aggressively
- Monitor bandwidth usage
- Use spot instances for non-critical workloads

---

## Support

For deployment issues:
1. Check Cloudflare status page
2. Review application logs
3. Check database connections
4. Verify environment variables
5. Contact support@tecnovand.com
