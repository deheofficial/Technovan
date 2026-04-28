#!/bin/bash

# TECHNOVAN Platform - Complete Setup Script

echo "🚀 TECHNOVAN Platform Setup Script"
echo "=================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+";
    exit 1;
fi

if ! command -v yarn &> /dev/null; then
    echo "❌ Yarn is not installed. Installing Yarn...";
    npm install -g yarn;
fi

if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Please install PostgreSQL 13+";
fi

echo "✅ Prerequisites checked"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
yarn install
echo "✅ Dependencies installed"
echo ""

# Create .env files
echo "🔧 Setting up environment variables..."

if [ ! -f "backend/api/.env" ]; then
    cp backend/api/.env.example backend/api/.env
    echo "✅ Created backend/api/.env"
else
    echo "⏭️  backend/api/.env already exists"
fi

if [ ! -f "apps/web/.env.local" ]; then
    cp apps/web/.env.example apps/web/.env.local
    echo "✅ Created apps/web/.env.local"
else
    echo "⏭️  apps/web/.env.local already exists"
fi

if [ ! -f "apps/mobile/.env" ]; then
    cp apps/mobile/.env.example apps/mobile/.env
    echo "✅ Created apps/mobile/.env"
else
    echo "⏭️  apps/mobile/.env already exists"
fi

echo ""

# Database setup
echo "📊 Setting up database..."

DB_NAME="technovan_db"
DB_USER="postgres"

# Check if database exists
if psql -U $DB_USER -l | grep -q $DB_NAME; then
    echo "⏭️  Database $DB_NAME already exists"
else
    echo "Creating database $DB_NAME..."
    createdb -U $DB_USER $DB_NAME
    echo "✅ Database created"
fi

# Run migrations
echo "Running Prisma migrations..."
cd backend/api
yarn prisma:push
echo "✅ Database migrations completed"
cd ../..

echo ""

# Build types
echo "🏗️  Building shared packages..."
yarn workspace @technovan/types build
yarn workspace @technovan/utils build
yarn workspace @technovan/ui build
echo "✅ Shared packages built"
echo ""

echo "✅ Setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Edit environment variables:"
echo "   - backend/api/.env"
echo "   - apps/web/.env.local"
echo "   - apps/mobile/.env"
echo ""
echo "2. Start development servers:"
echo "   yarn dev"
echo ""
echo "3. View API documentation:"
echo "   open docs/API.md"
echo ""
echo "4. For more information:"
echo "   open docs/DEVELOPMENT.md"
echo ""
echo "Happy coding! 🚀"
