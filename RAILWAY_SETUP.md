# Postman + Neon API Workflow for TECHNOVAN

## Step 1: Configure Backend Environment

```bash
cd /Users/apple/Documents/GitHub/Technovan/backend/api
cp .env.example .env
```

Set the required variables:

- `DATABASE_URL` = your Neon PostgreSQL connection string
- `JWT_SECRET` = any long random secret
- `NODE_ENV` = `development` (or `production` in hosted env)
- `PORT` = `3000`

## Step 2: Start API Locally

```bash
cd /Users/apple/Documents/GitHub/Technovan
yarn workspace @technovan/api dev
```

Your API endpoints will be available at:

- Health: `http://localhost:3000/health`
- API base: `http://localhost:3000/api`

## Step 3: Use Postman for API Testing

1. Import collection: `exports/postman/Technovan API.postman_collection.json`
2. Import environment: `exports/postman/Technovan Local.postman_environment.json`
3. Confirm `baseUrl` = `http://localhost:3000`
4. Run **Auth > Register** or **Auth > Login**
5. Run **Auth > Profile** and other protected routes using token variable

## Step 4: Deploy API to Any Host (Optional)

You can deploy the backend to Render, Fly.io, Heroku, VPS, or Docker.
After deployment, only update Postman environment:

- `baseUrl` = `https://your-api-domain.com`

No changes are needed in Neon or Prisma besides a valid `DATABASE_URL`.

## Done

Your workflow is now:

- Neon for PostgreSQL
- Express API as DB access layer
- Postman for API testing and verification
