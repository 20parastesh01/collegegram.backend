# Stage 1: Install the Dependencies
FROM node:16-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Build the App
FROM node:16-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Create a smaller runtime image
FROM node:16-alpine
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/raw ./raw
COPY --from=build /app/src ./src
RUN npm install --only=production
CMD ["node", "dist/app.js"]