# Development Setup Guide

## Prerequisites

Before you start, make sure you have:

- Node.js 18+ ([download](https://nodejs.org/))
- Yarn 4.0+ (`npm install -g yarn`)
- PostgreSQL 13+ ([download](https://www.postgresql.org/))
- Git ([download](https://git-scm.com/))
- Visual Studio Code (recommended)
- Postman or Insomnia (for API testing)

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/technovan/technovan-platform.git
cd technovan-platform
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
yarn install

# Or install specific workspace
cd backend/api && yarn install
```

### 3. Setup Environment Variables

#### Backend (.env)

```bash
cd backend/api
cp .env.example .env

# Edit .env with your values
nano .env
```

```env
DATABASE_URL="postgresql://user:password@localhost:5432/technovan_db"
JWT_SECRET="your-super-secret-key-generate-random-string"
JWT_EXPIRE="7d"
NODE_ENV="development"
PORT=3000
CORS_ORIGIN="http://localhost:3000,http://localhost:8081,http://localhost:19006"

# Optional - Stripe
STRIPE_SECRET_KEY="sk_test_..."

# Optional - PayPal
PAYPAL_CLIENT_ID="..."
```

#### Web App (.env.local)

```bash
cd apps/web
cp .env.example .env.local
```

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

#### Mobile App (.env)

```bash
cd apps/mobile
cp .env.example .env
```

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### 4. Database Setup

```bash
# Create PostgreSQL database
createdb technovan_db

# Or with password:
createdb -U postgres -W technovan_db

# Navigate to backend
cd backend/api

# Push Prisma schema to database
yarn prisma:push

# Or run migrations
yarn prisma:migrate

# (Optional) Open Prisma Studio for visual editing
yarn prisma:studio
```

---

## Running the Application

### Development Mode

```bash
# From root directory, run all services
yarn dev

# This starts:
# - Backend API: http://localhost:3000
# - Web app: http://localhost:8081
# - Mobile app: http://localhost:19006
```

### Individual Services

#### Backend API

```bash
cd backend/api
yarn dev

# API available at: http://localhost:3000
# Health check: http://localhost:3000/health
```

#### Web App

```bash
cd apps/web
yarn dev

# Available at: http://localhost:8081
```

#### Mobile App

```bash
cd apps/mobile
yarn dev

# Follow the terminal prompts
# Press 'i' for iOS, 'a' for Android, 'w' for web
```

---

## Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"SecurePass123",
    "firstName":"John",
    "lastName":"Doe"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"SecurePass123"
  }'

# Get services (with token)
curl http://localhost:3000/api/services \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Open Postman
2. Create new collection "TECHNOVAN API"
3. Create requests for each endpoint
4. Save tokens in environment variables

#### Example Postman Setup

```
Base URL: http://localhost:3000/api

Variables:
- token: (set after login)
- userId: (set after register)
```

---

## Code Quality

### Linting

```bash
# Lint all code
yarn lint

# Fix linting issues
yarn lint --fix
```

### Type Checking

```bash
# Check TypeScript types
yarn type-check
```

### Code Formatting

```bash
# Format all files
yarn format

# Or using Prettier directly
yarn prettier --write "**/*.{ts,tsx,js,jsx,json,md}"
```

### Running Tests

```bash
# Run all tests
yarn test

# Watch mode
yarn test --watch

# Coverage report
yarn test --coverage
```

---

## Common Development Tasks

### Adding a New Endpoint

1. Create route file in `backend/api/src/routes/`
2. Create controller in `backend/api/src/controllers/`
3. Add to `backend/api/src/index.ts`
4. Document in `docs/API.md`

### Creating a Database Migration

```bash
cd backend/api

# Modify schema.prisma
# Then:
yarn prisma:migrate

# Follow prompts and enter migration name
```

### Adding a New Package

```bash
# Monorepo root
yarn add package-name

# Specific workspace
yarn workspace @technovan/api add package-name

# Dev dependency
yarn add -D package-name
```

### Creating a UI Component

1. Create in `shared/ui/src/`
2. Export from `shared/ui/src/index.ts`
3. Import in apps as: `import { Component } from '@technovan/ui'`

---

## Debugging

### Backend Debugging

Enable debug logging:
```bash
# Set DEBUG environment variable
DEBUG=technovan:* yarn dev
```

### Frontend Debugging

Use React Developer Tools:
- Chrome: React Developer Tools extension
- Firefox: React Developer Tools addon

### Network Debugging

Use browser DevTools → Network tab to inspect API calls

### Database Debugging

```bash
# Open Prisma Studio
yarn workspace @technovan/api prisma:studio

# Query database directly
psql -U postgres -d technovan_db
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 PID
```

### Database Connection Error

```bash
# Check PostgreSQL is running
psql --version

# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

### Yarn Workspace Issues

```bash
# Clear cache
yarn cache clean

# Reinstall dependencies
rm -rf node_modules
yarn install
```

### TypeScript Errors

```bash
# Rebuild types
yarn type-check

# Clear TypeScript cache
rm -rf .eslintcache
```

---

## VS Code Setup

### Recommended Extensions

1. **ES7+ React/Redux/React-Native snippets**
   - ID: `dsznajder.es7-react-js-snippets`

2. **ESLint**
   - ID: `dbaeumer.vscode-eslint`

3. **Prettier - Code formatter**
   - ID: `esbenp.prettier-vscode`

4. **Thunder Client** (or REST Client)
   - ID: `rangav.vscode-thunder-client`

5. **PostgreSQL**
   - ID: `cweijan.vscode-postgresql-client2`

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

---

## Git Workflow

### Create Feature Branch

```bash
git checkout -b feature/feature-name
```

### Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
```

### Push Branch

```bash
git push origin feature/feature-name
```

### Create Pull Request

On GitHub:
1. Go to repository
2. Click "New Pull Request"
3. Select your branch
4. Add description
5. Request review

---

## Performance Monitoring

### Backend Performance

```bash
# Monitor with clinic.js
npm install -g clinic
clinic doctor -- node dist/index.js
```

### Frontend Performance

Use Lighthouse in Chrome DevTools:
1. Open DevTools
2. Go to Lighthouse tab
3. Generate report

---

## Database Backups

### Manual Backup

```bash
pg_dump -U postgres technovan_db > backup.sql
```

### Restore Backup

```bash
psql -U postgres -d technovan_db < backup.sql
```

---

## Useful Commands Reference

```bash
# Workspace commands
yarn dev              # Start all services
yarn build            # Build all apps
yarn lint             # Lint all code
yarn type-check       # Check types
yarn format           # Format code

# Backend commands
yarn db:push          # Push schema to database
yarn db:migrate       # Run migrations
yarn db:studio        # Open Prisma Studio

# Individual workspace
yarn workspace @technovan/api [command]
```

---

## Support

For issues or questions:

1. Check existing GitHub issues
2. Search documentation
3. Ask in discussions
4. Contact team: dev@techovand.com

Happy coding! 🚀
