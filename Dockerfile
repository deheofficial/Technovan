FROM node:22-alpine

WORKDIR /app

# Build only the backend API to avoid monorepo Yarn/Corepack issues in deploy environments.
COPY backend/api/package.json ./package.json
RUN npm install --legacy-peer-deps

# backend/api/tsconfig extends ../../tsconfig.json, which resolves to /tsconfig.json in this container layout.
COPY tsconfig.json /tsconfig.json

COPY backend/api/prisma ./prisma
COPY backend/api/src ./src
COPY backend/api/public ./public
COPY backend/api/tsconfig.json ./tsconfig.json

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
