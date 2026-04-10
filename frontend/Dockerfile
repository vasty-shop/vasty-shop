FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Development
FROM base AS development
EXPOSE 5186
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build
FROM base AS build
RUN npm run build

# Production - serve with lightweight server
FROM node:20-alpine AS production
RUN npm install -g serve
WORKDIR /app
COPY --from=build /app/dist ./dist
EXPOSE 5186
CMD ["serve", "-s", "dist", "-l", "5186"]
