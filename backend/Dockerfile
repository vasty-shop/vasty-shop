FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Development
FROM base AS development
CMD ["npm", "run", "start:dev"]

# Build
FROM base AS build
RUN npm run build

# Production
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 4005
CMD ["node", "dist/main.js"]
