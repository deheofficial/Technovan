FROM node:22-alpine

WORKDIR /app

# Copy root package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy all source code
COPY . .

# Build the application
RUN yarn build

# Expose port
EXPOSE 3000

CMD ["npm", "start"]
