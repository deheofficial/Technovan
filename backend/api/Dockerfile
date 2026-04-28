FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies using npm (simpler for Docker)
RUN npm install --legacy-peer-deps

# Copy Prisma schema and src
COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./
COPY public ./public

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
