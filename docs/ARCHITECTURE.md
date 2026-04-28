# TECHNOVAN - Visual Architecture & System Design

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE EDGE                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ WAF | DDoS Protection | Rate Limiting | Bot Management   │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
   ┌─────────────┐         ┌─────────────┐
   │  CLOUDFLARE │         │ CLOUDFLARE  │
   │    PAGES    │         │   WORKERS   │
   │  (Frontend) │         │  (API Edge) │
   └─────────────┘         └─────────────┘
        │                         │
        └────────────┬────────────┘
                     ▼
        ┌────────────────────────┐
        │   YOUR ORIGIN SERVER   │
        │  (Express.js Backend)  │
        │      Port 3000         │
        └────────┬───────────────┘
                 │
        ┌────────▼───────────┐
        │   POSTGRESQL DB    │
        │   Port 5432        │
        └────────────────────┘
```

## Request Flow

```
1. CLIENT REQUEST
   ├─ Web Browser    (tecnovand.com)
   ├─ Mobile App     (via API)
   └─ Third-party    (API)
         │
         ▼
2. CLOUDFLARE EDGE
   ├─ Check Cache (CDN)
   ├─ Validate WAF Rules
   ├─ Rate Limiting Check
   └─ Route to Origin
         │
         ▼
3. EXPRESS SERVER
   ├─ CORS Validation
   ├─ Helmet Security Headers
   ├─ Request Logging
   └─ Route Handler
         │
         ▼
4. MIDDLEWARE
   ├─ JWT Verification (if needed)
   ├─ Input Validation
   ├─ Rate Limit Check
   └─ Request Body Parse
         │
         ▼
5. BUSINESS LOGIC
   ├─ Controller Logic
   ├─ Service Layer
   └─ Data Operations
         │
         ▼
6. DATABASE
   ├─ Query Execution
   ├─ Data Retrieval
   └─ Transaction Handling
         │
         ▼
7. RESPONSE
   ├─ Serialize Data
   ├─ Cache Headers
   ├─ Compression
   └─ Send to Client
         │
         ▼
8. CLOUDFLARE
   ├─ Cache (if applicable)
   └─ Deliver to Client
```

## Authentication Flow

```
┌─────────────────┐
│   USER LOGIN    │
└────────┬────────┘
         │ Email + Password
         ▼
┌──────────────────────────┐
│ VALIDATION & SANITIZATION│
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ CHECK USER EXISTS        │
│ (Database Query)         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ COMPARE PASSWORD         │
│ (bcrypt)                 │
└────────┬─────────────────┘
         │ ✓ Match
         ▼
┌──────────────────────────┐
│ GENERATE JWT TOKEN       │
│ Payload:                 │
│  - user_id               │
│  - email                 │
│  - role                  │
│  - exp: +7 days          │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ RETURN TOKEN + USER      │
│ Store in localStorage    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ AUTHENTICATED            │
│ Include in Auth Header:  │
│ "Bearer {token}"         │
└──────────────────────────┘
```

## State Management (Redux)

```
┌─────────────────────────────────────┐
│         REACT COMPONENT             │
│  (HomeScreen, LoginScreen, etc.)    │
└─────────────┬───────────────────────┘
              │
     ┌────────┴────────┐
     │ useSelector()   │ useDispatch()
     ▼                 ▼
  ┌─────────┐    ┌──────────┐
  │ CONNECT │    │ DISPATCH │
  │  STATE  │    │  ACTION  │
  └────┬────┘    └────┬─────┘
       │              │
       ▼              ▼
    ┌──────────────────────┐
    │   REDUX STORE        │
    │ ┌──────────────────┐ │
    │ │ auth: {          │ │
    │ │   user: {...}    │ │
    │ │   token: "..."   │ │
    │ │   loading: false │ │
    │ │ }                │ │
    │ ├──────────────────┤ │
    │ │ projects: {      │ │
    │ │   items: [...]   │ │
    │ │   loading: false │ │
    │ │ }                │ │
    │ └──────────────────┘ │
    └──────────┬───────────┘
               │
     ┌─────────┴─────────┐
     ▼                   ▼
  REDUCERS           MIDDLEWARE
  (authSlice)        (Thunks)
  (projectsSlice)    (Async)
```

## Database Schema (ER Diagram)

```
┌──────────────┐         ┌──────────────┐
│     User     │◄────────┤   Project    │
├──────────────┤         ├──────────────┤
│ id (PK)      │         │ id (PK)      │
│ email        │         │ title        │
│ password     │         │ userId (FK)  │
│ firstName    │         │ pricingId(FK)│
│ lastName     │         │ status       │
│ role         │         │ createdAt    │
│ createdAt    │         └──────────────┘
└──────────────┘                │
       ▲                        │
       │                        │
       │            ┌───────────┴──────────┐
       │            ▼                      ▼
       │      ┌──────────────┐      ┌──────────────┐
       │      │   Message    │      │   Payment    │
       │      ├──────────────┤      ├──────────────┤
       │      │ id (PK)      │      │ id (PK)      │
       │      │ projectId(FK)│      │ projectId(FK)│
       │      │ userId (FK)  │      │ userId (FK)  │
       │      │ content      │      │ amount       │
       │      │ createdAt    │      │ status       │
       │      └──────────────┘      │ method       │
       │                            │ createdAt    │
       │                            └──────────────┘
       │
       ├─────────────────────────────────┐
       │                                  │
       ▼                                  ▼
┌──────────────┐              ┌──────────────┐
│   Inquiry    │              │   Service    │
├──────────────┤              ├──────────────┤
│ id (PK)      │              │ id (PK)      │
│ name         │              │ title        │
│ email        │              │ description  │
│ message      │              │ icon         │
│ userId (FK)  │              │ order        │
│ isRead       │              │ isActive     │
│ createdAt    │              └──────────────┘
└──────────────┘

              ┌──────────────┐
              │   Pricing    │
              ├──────────────┤
              │ id (PK)      │
              │ name         │
              │ price        │
              │ features[]   │
              │ isActive     │
              │ order        │
              └──────────────┘

┌──────────────┐    ┌──────────────┐
│  Portfolio   │    │  BlogPost    │
├──────────────┤    ├──────────────┤
│ id (PK)      │    │ id (PK)      │
│ title        │    │ title        │
│ image        │    │ content      │
│ category     │    │ slug         │
│ isActive     │    │ published    │
└──────────────┘    └──────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION ENVIRONMENT                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │  CLOUDFLARE CDN  │         │   CLOUDFLARE     │        │
│  │   & CACHE        │         │  PAGES/WORKERS   │        │
│  │ • Static Assets  │◄───────►│  • Frontend      │        │
│  │ • API Responses  │         │  • Edge Logic    │        │
│  │ • Images         │         │  • Redirects     │        │
│  └────────┬─────────┘         └────────┬─────────┘        │
│           │                            │                   │
│           └──────────────┬─────────────┘                   │
│                          │                                 │
│                 ┌────────▼────────┐                        │
│                 │  API SERVER     │                        │
│                 │  (Node.js)      │                        │
│                 │  • Express      │                        │
│                 │  • Load Balanced│                        │
│                 │  • Auto-scaled  │                        │
│                 └────────┬────────┘                        │
│                          │                                 │
│                 ┌────────▼────────┐                        │
│                 │   DATABASE      │                        │
│                 │   PostgreSQL    │                        │
│                 │ • Primary       │                        │
│                 │ • Read Replicas │                        │
│                 │ • Backups       │                        │
│                 └────────┬────────┘                        │
│                          │                                 │
│                 ┌────────▼────────┐                        │
│                 │  CLOUDFLARE R2  │                        │
│                 │   STORAGE       │                        │
│                 │  • Files        │                        │
│                 │  • Invoices     │                        │
│                 │  • Documents    │                        │
│                 └─────────────────┘                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack Layers

```
┌────────────────────────────────────────────────┐
│           PRESENTATION LAYER                   │
│  ┌──────────────────────────────────────────┐ │
│  │ React Native (Web/Mobile)                │ │
│  │ Redux Toolkit State Management           │ │
│  │ Tailwind CSS (NativeWind) Styling        │ │
│  │ React Navigation (Routing)               │ │
│  └──────────────────────────────────────────┘ │
└────────────┬─────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────┐
│           APPLICATION LAYER                   │
│  ┌──────────────────────────────────────────┐ │
│  │ Express.js (HTTP Server)                 │ │
│  │ JWT Authentication                       │ │
│  │ Request Validation (Zod)                 │ │
│  │ Error Handling & Middleware              │ │
│  │ API Routes & Controllers                 │ │
│  └──────────────────────────────────────────┘ │
└────────────┬─────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────┐
│           BUSINESS LOGIC LAYER               │
│  ┌──────────────────────────────────────────┐ │
│  │ Services & Repositories                  │ │
│  │ Business Rules Implementation            │ │
│  │ Data Transformation                      │ │
│  │ External API Integrations                │ │
│  └──────────────────────────────────────────┘ │
└────────────┬─────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────┐
│           DATA ACCESS LAYER                   │
│  ┌──────────────────────────────────────────┐ │
│  │ Prisma ORM                               │ │
│  │ Query Building & Execution               │ │
│  │ Database Migrations                      │ │
│  │ Transaction Management                   │ │
│  └──────────────────────────────────────────┘ │
└────────────┬─────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────┐
│           DATABASE LAYER                      │
│  ┌──────────────────────────────────────────┐ │
│  │ PostgreSQL                               │ │
│  │ Data Storage & Retrieval                 │ │
│  │ Backup & Replication                     │ │
│  │ Indexing & Optimization                  │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

## Scalability & Performance

```
┌─────────────────────────────────────────────┐
│        HORIZONTAL SCALING                   │
│                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ API #1  │  │ API #2  │  │ API #N  │   │
│  │ Port    │  │ Port    │  │ Port    │   │
│  │ 3000    │  │ 3001    │  │ 300N    │   │
│  └────┬────┘  └────┬────┘  └────┬────┘   │
│       └────────────┼────────────┘        │
│                    ▼                      │
│            ┌──────────────┐              │
│            │ LOAD BALANCER│              │
│            │ (Nginx/CF)   │              │
│            └──────────────┘              │
│                    │                      │
│                    ▼                      │
│            ┌──────────────┐              │
│            │   DATABASE   │              │
│            │  (Replicated)│              │
│            └──────────────┘              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│        VERTICAL SCALING                     │
│                                             │
│  ├─ CPU: 2 core → 4 core → 8 core         │
│  ├─ Memory: 2GB → 4GB → 8GB → 16GB        │
│  ├─ Storage: Add SSD, Increase IOPS        │
│  └─ Database: Connection pooling           │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│        CACHING STRATEGY                     │
│                                             │
│  ┌─ CDN Cache (Cloudflare)                │
│  │  └─ Static assets: 1 year               │
│  │  └─ HTML: 1 day                         │
│  │  └─ API: conditional                    │
│  ├─ Browser Cache                          │
│  │  └─ Static: 30 days                     │
│  │  └─ Dynamic: 5 min                      │
│  └─ Database Query Cache (planned)         │
│     └─ Redis integration                   │
└─────────────────────────────────────────────┘
```

---

**Diagram Version**: 1.0
**Last Updated**: April 28, 2026
