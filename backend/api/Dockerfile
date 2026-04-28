FROM node:22-alpine

WORKDIR /app

# Enable Corepack for Yarn 4
RUN corepack enable && corepack prepare yarn@4.0.0 --activate

# Copy package files
COPY package.json yarn.lock .yarnrc.yml ./

# Install dependencies with yarn
RUN yarn install --frozen-lockfile

# Copy Prisma schema and src
COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./
COPY public ./public

# Generate Prisma client
RUN yarn prisma generate

# Build TypeScript
RUN yarn build 2>/dev/null || true

# Expose port
EXPOSE 3000

# Start app
CMD ["yarn", "start"]
