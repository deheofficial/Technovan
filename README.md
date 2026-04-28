# TECHNOVAN Platform - Complete Production-Ready System

A comprehensive, enterprise-grade software development company platform built with React Native, Expo, Node.js, and Cloudflare.

## 🚀 Features

### Public Website
- **Landing Page**: Hero section with services overview, pricing, and call-to-action
- **About Us**: Company mission, vision, core values, and team section
- **Services**: Web development, mobile apps, custom software, UI/UX design
- **Portfolio**: Project gallery and case studies
- **Pricing**: Display and management of service packages
- **Contact**: Form submission and WhatsApp integration

### Admin Dashboard
- Secure JWT authentication
- Manage services and pricing
- Portfolio management
- Customer management
- Inquiry management
- Blog post management
- Analytics and reporting
- Order management

### Customer Features
- User registration and login
- Dashboard with project status tracking
- Project request submission
- Document upload
- Chat with support
- Invoice viewing and download
- Payment status tracking

### Payment System
- Stripe integration
- PayPal integration
- Invoice generation
- Payment confirmation

## 📁 Project Structure

```
/technovan-platform
├── /apps
│   ├── /web                 # React Native Web
│   └── /mobile              # React Native + Expo
├── /backend
│   └── /api                 # Node.js REST API
├── /shared
│   ├── /ui                  # Shared UI components
│   ├── /types               # TypeScript types
│   └── /utils               # Shared utilities
├── package.json             # Monorepo root
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
└── README.md
```

## 🛠 Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - React Native development platform
- **React Native Web** - Web support for React Native apps
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **Tailwind CSS (NativeWind)** - Styling
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Prisma** - ORM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting

### Hosting & Services
- **Cloudflare Pages** - Frontend hosting
- **Cloudflare Workers** - Edge computing
- **Cloudflare R2** - File storage
- **Cloudflare WAF** - Web application firewall
- **Cloudflare CDN** - Content delivery
- **Cloudflare SSL** - HTTPS/TLS

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and Yarn
- PostgreSQL database
- Cloudflare account
- Git

### 1. Clone the repository
```bash
git clone <repository-url>
cd technovan-platform
```

### 2. Install dependencies
```bash
yarn install
```

### 3. Set up environment variables

Backend (.env):
```bash
cd backend/api
cp .env.example .env
# Edit .env with your configuration
```

Frontend (.env.local):
```bash
cd apps/web
cp .env.example .env.local
```

Mobile (.env):
```bash
cd apps/mobile
cp .env.example .env
```

### 4. Database setup
```bash
cd backend/api
yarn prisma:push      # Push schema to database
yarn prisma:migrate   # Run migrations
```

### 5. Start development servers
```bash
# From root directory
yarn dev

# This runs:
# - Backend API: http://localhost:3000
# - Web app: http://localhost:8081
# - Mobile app: http://localhost:19006
```

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ HTTPS/TLS via Cloudflare SSL
- ✅ CORS protection
- ✅ XSS protection
- ✅ SQL injection protection
- ✅ Rate limiting
- ✅ OWASP compliance
- ✅ Cloudflare WAF rules

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update profile

### Services
- `GET /services` - Get all services

### Pricing
- `GET /pricing` - Get all pricing tiers
- `GET /pricing/:id` - Get single pricing

### Projects
- `GET /projects` - Get user's projects
- `POST /projects` - Create new project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project

### Payments
- `GET /payments` - Get user's payments
- `POST /payments` - Create payment
- `GET /payments/:id` - Get payment status

### Inquiries & Contact
- `POST /inquiries` - Submit inquiry
- `POST /contact` - Submit contact form

## 🎨 UI/UX Design

### Color Palette
- **Primary**: Teal/Cyan (#0D9488, #14B8A6)
- **Secondary**: Purple (#9333EA, #A855F7)
- **Background**: Dark (#111827, #1f2937)
- **Text**: White/Gray (#ffffff, #d1d5db)

### Typography
- **Headings**: Poppins Bold
- **Body**: Montserrat Regular
- **Code**: Monospace

## 📱 Responsive Design
- Mobile-first approach
- Tablet and desktop support
- Optimized for all screen sizes
- Touch-friendly interfaces

## 🚀 Deployment

### Deploy to Cloudflare Pages

1. **Build the web app**
```bash
yarn build
```

2. **Connect to GitHub**
- Push code to GitHub repository
- Connect Cloudflare Pages to GitHub

3. **Configure Cloudflare Pages**
- Build command: `yarn build`
- Build output directory: `dist`
- Environment variables from `.env`

4. **Domain Setup**
- Add domain: tecnovand.com
- Configure DNS nameservers
- Enable SSL/TLS
- Set up WAF rules

### Deploy Backend

Options:
1. **Heroku**: `git push heroku main`
2. **Railway**: Railway CLI deployment
3. **Digital Ocean**: App Platform
4. **AWS**: Elastic Beanstalk or Lambda
5. **Cloudflare Workers**: Serverless functions

## 📊 Pricing Packages

### BASIC LANDING PAGE - RM 299
- 1 page website
- Responsive design
- WhatsApp integration
- Fast delivery

### BUSINESS WEBSITE - RM 599
- 5-7 pages
- Contact form
- Admin panel
- WhatsApp integration

### E-COMMERCE WEBSITE - RM 999
- 2-5 pages
- Unlimited products
- Payment gateway
- Order dashboard

## 📈 Performance Optimization

- ✅ Lazy loading for images
- ✅ Code splitting
- ✅ API response caching
- ✅ CDN delivery via Cloudflare
- ✅ Image optimization
- ✅ Minification and compression
- ✅ Tree shaking

## 🔍 SEO Optimization

- ✅ Meta tags
- ✅ Open Graph tags
- ✅ Structured data (Schema.org)
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ Mobile-friendly
- ✅ Fast page load

## 🧪 Testing

```bash
# Run tests
yarn test

# Run linting
yarn lint

# Type checking
yarn type-check

# Format code
yarn format
```

## 📝 Database Schema

**Users** - Store user accounts and profiles
**Services** - Available services
**Pricing** - Pricing tiers
**Projects** - Customer projects
**Payments** - Payment records
**Messages** - Project messages
**Inquiries** - Contact inquiries
**Portfolio** - Portfolio projects
**BlogPosts** - Blog content
**Analytics** - Analytics data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📜 License

MIT License - See LICENSE file

## 📞 Support

For support, email support@tecnovand.com or contact via WhatsApp

---

**TECHNOVAN** - Software Development & IT Solutions Platform
Built with ❤️ by the TECHNOVAN Team
