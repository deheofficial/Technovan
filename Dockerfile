FROM node:22-alpine

WORKDIR /app

# Enable Corepack for Yarn 4
RUN corepack enable

# Copy package files and Yarn config
COPY package.json yarn.lock .yarnrc.yml ./

# Install dependencies
RUN yarn install --immutable

# Copy all source code
COPY . .

# Build the application
RUN yarn build

# Expose port
EXPOSE 3000

# Start the application
CMD ["yarn", "workspace", "@technovan/api", "start"]
