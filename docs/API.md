# API Documentation

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://api.tecnovand.com`

## Authentication

### JWT Token
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

### Token Expiration
- Tokens expire in 7 days
- Refresh tokens not yet implemented

---

## Endpoints

### Authentication Endpoints

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}

Response (201):
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER"
  },
  "token": "jwt_token"
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response (200):
{
  "user": { ... },
  "token": "jwt_token"
}
```

#### Get Profile
```
GET /auth/profile
Authorization: Bearer <token>

Response (200):
{
  "id": "user_id",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "company": "Company Name",
  "role": "CUSTOMER",
  "avatar": "url_to_avatar",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Update Profile
```
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "phone": "+9876543210",
  "company": "New Company"
}

Response (200):
{
  "id": "user_id",
  "email": "user@example.com",
  "firstName": "Jane",
  ...
}
```

---

### Services Endpoints

#### Get All Services
```
GET /services

Response (200):
[
  {
    "id": "service_id",
    "title": "Web Development",
    "description": "Modern web applications",
    "icon": "icon_url",
    "order": 1,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  ...
]
```

#### Get Single Service
```
GET /services/:id

Response (200):
{
  "id": "service_id",
  "title": "Web Development",
  ...
}
```

---

### Pricing Endpoints

#### Get All Pricing
```
GET /pricing

Response (200):
[
  {
    "id": "pricing_id",
    "name": "BASIC LANDING PAGE",
    "price": 299,
    "currency": "RM",
    "description": "Perfect for startups",
    "features": ["1 Page website", "Responsive design", "WhatsApp integration"],
    "isActive": true,
    "order": 1
  },
  ...
]
```

#### Get Single Pricing
```
GET /pricing/:id

Response (200):
{
  "id": "pricing_id",
  "name": "BASIC LANDING PAGE",
  ...
}
```

---

### Projects Endpoints

#### Get All Projects
```
GET /projects
Authorization: Bearer <token>

Response (200):
[
  {
    "id": "project_id",
    "title": "My Website",
    "description": "A great website",
    "status": "PENDING",
    "pricingId": "pricing_id",
    "userId": "user_id",
    "budget": 5000,
    "deadline": "2024-12-31T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  ...
]
```

#### Create Project
```
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Website",
  "description": "A great website",
  "pricingId": "pricing_id",
  "budget": 5000,
  "deadline": "2024-12-31"
}

Response (201):
{
  "id": "project_id",
  "title": "My Website",
  ...
}
```

#### Get Project Details
```
GET /projects/:id
Authorization: Bearer <token>

Response (200):
{
  "id": "project_id",
  "title": "My Website",
  "messages": [...],
  "payments": [...]
}
```

#### Update Project
```
PUT /projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "notes": "Started development"
}

Response (200):
{
  "id": "project_id",
  ...
}
```

---

### Payments Endpoints

#### Get All Payments
```
GET /payments
Authorization: Bearer <token>

Response (200):
[
  {
    "id": "payment_id",
    "amount": 299,
    "currency": "RM",
    "status": "PENDING",
    "method": "stripe",
    "projectId": "project_id",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  ...
]
```

#### Create Payment
```
POST /payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "project_id",
  "amount": 299,
  "method": "stripe"
}

Response (201):
{
  "id": "payment_id",
  "status": "PENDING",
  ...
}
```

#### Get Payment Status
```
GET /payments/:id
Authorization: Bearer <token>

Response (200):
{
  "id": "payment_id",
  "status": "COMPLETED",
  ...
}
```

---

### Inquiries Endpoints

#### Create Inquiry
```
POST /inquiries
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "I'm interested in your services"
}

Response (201):
{
  "id": "inquiry_id",
  "name": "John Doe",
  "email": "john@example.com",
  "isRead": false
}
```

#### Get All Inquiries
```
GET /inquiries

Response (200):
[
  {
    "id": "inquiry_id",
    ...
  },
  ...
]
```

---

### Contact Endpoints

#### Submit Contact Form
```
POST /contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "I have a question"
}

Response (201):
{
  "message": "Message sent successfully",
  "inquiry": {
    "id": "inquiry_id",
    ...
  }
}
```

---

## Error Handling

All errors return appropriate HTTP status codes:

- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error response format:
```json
{
  "error": "Error message",
  "message": "Detailed error message"
}
```

---

## Rate Limiting

API endpoints are rate-limited to 100 requests per 15 minutes per IP address.

Headers:
- `X-RateLimit-Limit: 100`
- `X-RateLimit-Remaining: 99`
- `X-RateLimit-Reset: 1704067200`

---

## CORS

CORS is enabled for:
- `http://localhost:3000` (web)
- `http://localhost:8081` (web)
- `http://localhost:19006` (mobile)
- `https://tecnovand.com` (production)

---

## Best Practices

1. Always use HTTPS in production
2. Include authentication tokens with all requests
3. Handle rate limiting gracefully
4. Implement proper error handling
5. Log all API calls for debugging
6. Validate input on client side
7. Use appropriate HTTP methods (GET, POST, PUT, DELETE)
