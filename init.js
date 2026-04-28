#!/usr/bin/env node

/**
 * TECHNOVAN Platform - Post-Setup Initialization
 * This script initializes default data and validates the setup
 */

const path = require('path');
const fs = require('fs');

console.log('🚀 TECHNOVAN Platform - Post-Setup Initialization\n');

// Check environment files
console.log('✅ Checking environment files...');

const requiredFiles = [
  { path: 'backend/api/.env', name: 'Backend .env' },
  { path: 'apps/web/.env.local', name: 'Web App .env' },
  { path: 'apps/mobile/.env', name: 'Mobile App .env' },
];

let allFilesExist = true;
requiredFiles.forEach((file) => {
  if (fs.existsSync(path.join(__dirname, file.path))) {
    console.log(`   ✓ ${file.name}`);
  } else {
    console.log(`   ✗ ${file.name} - NOT FOUND`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log(
    '\n⚠️  Some environment files are missing. Please create them using .env.example files.\n'
  );
}

// Check package.json files
console.log('\n✅ Checking package.json files...');

const packages = [
  { path: 'package.json', name: 'Root package.json' },
  { path: 'backend/api/package.json', name: 'Backend package.json' },
  { path: 'apps/web/package.json', name: 'Web app package.json' },
  { path: 'apps/mobile/package.json', name: 'Mobile app package.json' },
  { path: 'shared/ui/package.json', name: 'Shared UI package.json' },
  { path: 'shared/types/package.json', name: 'Shared types package.json' },
  { path: 'shared/utils/package.json', name: 'Shared utils package.json' },
];

packages.forEach((pkg) => {
  if (fs.existsSync(path.join(__dirname, pkg.path))) {
    console.log(`   ✓ ${pkg.name}`);
  } else {
    console.log(`   ✗ ${pkg.name} - MISSING`);
  }
});

// Check documentation
console.log('\n📚 Checking documentation files...');

const docs = [
  { path: 'README.md', name: 'README' },
  { path: 'docs/API.md', name: 'API Documentation' },
  { path: 'docs/DEPLOYMENT.md', name: 'Deployment Guide' },
  { path: 'docs/SECURITY.md', name: 'Security Guide' },
  { path: 'docs/DEVELOPMENT.md', name: 'Development Guide' },
  { path: 'docs/CONFIGURATION.md', name: 'Configuration' },
  { path: 'docs/ARCHITECTURE.md', name: 'Architecture' },
];

docs.forEach((doc) => {
  if (fs.existsSync(path.join(__dirname, doc.path))) {
    console.log(`   ✓ ${doc.name}`);
  } else {
    console.log(`   ✗ ${doc.name} - MISSING`);
  }
});

// Check configuration files
console.log('\n🔧 Checking configuration files...');

const configs = [
  { path: 'tsconfig.json', name: 'TypeScript config' },
  { path: '.eslintrc.json', name: 'ESLint config' },
  { path: '.prettierrc', name: 'Prettier config' },
  { path: 'docker-compose.yml', name: 'Docker Compose' },
  { path: 'Dockerfile', name: 'Dockerfile' },
  { path: '.github/workflows/ci-cd.yml', name: 'CI/CD Pipeline' },
];

configs.forEach((config) => {
  if (fs.existsSync(path.join(__dirname, config.path))) {
    console.log(`   ✓ ${config.name}`);
  } else {
    console.log(`   ✗ ${config.name} - MISSING`);
  }
});

// Print next steps
console.log('\n\n📋 SETUP COMPLETE!\n');
console.log('📝 Next Steps:');
console.log('   1. Configure environment variables:');
console.log('      nano backend/api/.env');
console.log('      nano apps/web/.env.local');
console.log('      nano apps/mobile/.env');
console.log('');
console.log('   2. Install dependencies:');
console.log('      yarn install');
console.log('');
console.log('   3. Setup database:');
console.log('      yarn workspace @technovan/api prisma:push');
console.log('      yarn workspace @technovan/api prisma:studio (optional)');
console.log('');
console.log('   4. Start development:');
console.log('      yarn dev');
console.log('');
console.log('📚 Documentation:');
console.log('   • Getting Started: README.md');
console.log('   • Development Guide: docs/DEVELOPMENT.md');
console.log('   • API Documentation: docs/API.md');
console.log('   • Deployment Guide: docs/DEPLOYMENT.md');
console.log('   • Architecture: docs/ARCHITECTURE.md');
console.log('   • Security: docs/SECURITY.md');
console.log('');
console.log('🎉 Happy Coding!\n');
