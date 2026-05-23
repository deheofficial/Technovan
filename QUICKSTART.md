# TECHNOVAN Platform - Quick Start

Welcome to TECHNOVAN Platform! This quick start guide will help you get up and running in minutes.

## 🚀 Prerequisites

Before you start, ensure you have:
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Yarn** 4.0+ (`npm install -g yarn`)
- **PostgreSQL** 13+ ([Download](https://www.postgresql.org/))
- **Git** ([Download](https://git-scm.com/))

## ⚡ Quick Setup (3 Steps)

### Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/technovan/technovan-platform.git
cd technovan-platform

# Install all dependencies
yarn install
```

### Step 2: Configure Environment

```bash
# Backend
cd backend/api
cp .env.example .env
# Edit with your database URL and secrets

# Web App
cd ../../apps/web
cp .env.example .env.local

# Mobile App
cd ../mobile
cp .env.example .env
```

### Step 3: Setup Database & Run

```bash
# Go back to root
cd ../../

# Setup database
yarn workspace @technovan/api prisma:push

# Start development servers
yarn dev
```

## 📱 Access Your App

- **Web App**: http://localhost:8081
- **Mobile App**: http://localhost:19006
- **Backend API**: http://localhost:3000
- **API Health**: http://localhost:3000/health
- **Prisma Studio**: `yarn workspace @technovan/api prisma:studio`

## 🔐 Default Test Account

After initialization, create a test account:

```bash
# Via API
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

## 📚 Project Structure

```
technovan-platform/
├── apps/
│   ├── web/              # React Native Web
│   └── mobile/           # React Native + Expo
├── backend/
│   └── api/              # Node.js Express API
├── shared/
│   ├── ui/               # UI Components
│   ├── types/            # TypeScript Types
│   └── utils/            # Utilities
├── docs/                 # Documentation
└── package.json          # Monorepo Config
```

## 🛠 Common Commands

```bash
# Development
yarn dev              # Start all services
yarn build            # Build all apps
yarn lint             # Lint code
yarn type-check       # Check TypeScript types
yarn format           # Format code

# Backend specific
yarn db:push          # Push schema to DB
yarn db:migrate       # Run migrations
yarn db:studio        # Open Prisma Studio

# Individual workspaces
yarn workspace @technovan/web dev
yarn workspace @technovan/api dev
yarn workspace @technovan/mobile dev
```

## 🚨 Troubleshooting

### Port Already in Use

```bash
# Kill process using port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Database Connection Error

```bash
# Check PostgreSQL is running
psql --version

# Test connection
psql postgresql://user:password@localhost:5432/technovan_db
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules
yarn install
```

## 📖 Documentation

- **[Full Setup Guide](docs/DEVELOPMENT.md)** - Complete setup instructions
- **[API Documentation](docs/API.md)** - All API endpoints
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Deploy to production
- **[Architecture](docs/ARCHITECTURE.md)** - System design
- **[Security Guide](docs/SECURITY.md)** - Security best practices

## 🌟 Features

✅ Full-stack React Native application
✅ Cross-platform (Web, iOS, Android)
✅ Node.js REST API
✅ PostgreSQL database
✅ JWT authentication
✅ Admin dashboard
✅ Payment integration ready
✅ Cloudflare-ready
✅ Production-ready

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Commit changes: `git commit -am 'feat: description'`
3. Push to branch: `git push origin feature/name`
4. Create Pull Request

## 📞 Support

- **Email**: support@tecnovand.com
- **GitHub Issues**: [Open Issue](https://github.com/technovan/technovan-platform/issues)
- **Documentation**: [Docs Folder](./docs)

## 📄 License

MIT License - See LICENSE file

---

**Happy Coding!** 🚀

For more information, check the full [README.md](README.md) or visit the [docs](./docs) folder.
