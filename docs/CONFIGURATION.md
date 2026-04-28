# TECHNOVAN Platform Configuration

## Technology Versions

- Node.js: 18.0.0+
- Yarn: 4.0.0+
- TypeScript: 5.0.0+
- React: 18.2.0+
- React Native: 0.73.0+
- Express.js: 4.18.2+
- PostgreSQL: 13+
- Prisma: 5.5.2+

## Recommended Tools

### Development
- Visual Studio Code
- Postman / Insomnia
- PostgreSQL Client (pgAdmin)
- Git CLI
- Docker Desktop (optional)

### Monitoring
- Cloudflare Dashboard
- Railway Dashboard (or preferred hosting)
- PostgreSQL psql
- Prisma Studio

### Testing
- Postman
- Jest
- React Testing Library
- Cypress (for E2E)

## File Structure Reference

```
technovan-platform/
├── apps/
│   ├── web/                 # React Native Web (Expo)
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── mobile/              # React Native + Expo
│       ├── src/
│       ├── app.json
│       └── package.json
├── backend/
│   └── api/                 # Node.js Express API
│       ├── src/
│       ├── prisma/
│       ├── package.json
│       └── tsconfig.json
├── shared/
│   ├── ui/                  # Shared UI components
│   ├── types/               # TypeScript types
│   └── utils/               # Utility functions
├── docs/                    # Documentation
├── .github/
│   └── workflows/           # CI/CD pipelines
├── package.json             # Monorepo root
└── README.md
```

## Environment Variables

### Backend (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | - | PostgreSQL connection string |
| JWT_SECRET | - | Secret key for JWT signing |
| JWT_EXPIRE | 7d | Token expiration time |
| NODE_ENV | development | Environment (development/production) |
| PORT | 3000 | Server port |
| CORS_ORIGIN | localhost | CORS allowed origins |

### Frontend (.env.local / .env)

| Variable | Default | Description |
|----------|---------|-------------|
| EXPO_PUBLIC_API_URL | - | Backend API URL |
| NODE_ENV | development | Environment |

## Database Schema Overview

### Core Tables
- **User** - User accounts and profiles
- **Service** - Available services
- **Pricing** - Pricing tiers
- **Project** - Customer projects
- **Payment** - Payment records
- **Message** - Project messages
- **Inquiry** - Contact inquiries

### Additional Tables
- **Portfolio** - Portfolio projects
- **BlogPost** - Blog content
- **Analytics** - Analytics data

## API Routes Summary

### Public Routes (No Auth)
- `GET /health` - Health check
- `GET /services` - Get services
- `GET /pricing` - Get pricing
- `POST /contact` - Contact form
- `POST /auth/register` - Register
- `POST /auth/login` - Login

### Authenticated Routes (JWT Required)
- `GET /auth/profile` - Get profile
- `PUT /auth/profile` - Update profile
- `GET /projects` - Get projects
- `POST /projects` - Create project
- `GET /payments` - Get payments
- `POST /payments` - Create payment

### Admin Routes (JWT + ADMIN Role Required)
- `GET /admin` - Dashboard
- `GET/POST/PUT/DELETE /admin/services` - Manage services
- `GET/POST/PUT/DELETE /admin/pricing` - Manage pricing
- `GET /admin/projects` - All projects
- `GET /admin/inquiries` - All inquiries
- `GET /admin/analytics` - Analytics

## Build & Deployment

### Local Development
```bash
yarn dev              # Start all services
yarn build            # Build all apps
yarn lint             # Lint code
yarn type-check       # Check types
```

### Production Deployment
```bash
# Build for production
yarn build

# Deploy to Cloudflare Pages
wrangler pages deploy dist

# Deploy backend
git push heroku main  # If using Heroku
```

## Performance Metrics

### Frontend Targets
- First Contentful Paint (FCP): < 2s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Lighthouse Score: > 90

### Backend Targets
- API Response Time: < 200ms
- Database Query Time: < 100ms
- Error Rate: < 0.1%
- Uptime: > 99.9%

## Security Checklist

- ✅ HTTPS enforced
- ✅ JWT authentication
- ✅ Password hashing (bcryptjs)
- ✅ CORS configured
- ✅ Rate limiting enabled
- ✅ Input validation
- ✅ XSS protection
- ✅ SQL injection prevention
- ✅ Security headers set
- ✅ WAF enabled

## Monitoring & Logging

### Backend Logs
- Application logs → `logs/app.log`
- Error logs → `logs/error.log`
- Access logs → `logs/access.log`

### Uptime Monitoring
- Cloudflare Dashboard
- Status page: (to be configured)
- Email alerts: (to be configured)

### Performance Monitoring
- Sentry (error tracking)
- New Relic (APM)
- Datadog (infrastructure)

## Backup & Recovery

### Database Backups
- Frequency: Daily
- Retention: 30 days
- Location: Encrypted cloud storage
- Recovery Time: < 1 hour

### Code Backups
- GitHub repository
- Automated backups daily
- Disaster recovery enabled

## Cost Optimization

- Cloudflare free tier features
- Database query optimization
- Image compression
- CDN caching
- Scheduled data cleanup

## Support & Contact

- Email: support@tecnovand.com
- Slack: #technovan-support
- GitHub Issues: [Link to repo]
- Documentation: [This folder]

---

**Last Updated**: April 28, 2026
**Version**: 1.0.0
