FROM node:22-alpine
# cache-bust: 3
WORKDIR /app
COPY package.json ./
RUN npm install --include=dev --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "serve.mjs"]
