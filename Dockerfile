FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build
RUN rm -rf node_modules
RUN find /app -mindepth 1 ! -path "/app/dist/*" ! -path "/app/package.json" -delete
RUN npm i --production
CMD ["node", "dist/main.js"]