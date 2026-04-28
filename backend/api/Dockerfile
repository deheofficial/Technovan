FROM node:22-alpine

WORKDIR /app

# Install and enable Corepack
RUN corepack enable

# Copy only package files first
COPY package.json yarn.lock ./

# Create .yarnrc.yml for node-modules linker to fix Prisma
RUN echo "nodeLinker: node-modules" > .yarnrc.yml

# Install dependencies
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
