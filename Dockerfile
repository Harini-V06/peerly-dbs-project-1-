FROM node:22-alpine
# cache-bust: 4
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "serve.mjs"]
