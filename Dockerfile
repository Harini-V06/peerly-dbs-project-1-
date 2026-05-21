FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --include=dev --legacy-peer-deps
COPY . .
RUN npm run build && echo "=== dist/server contents ===" && find dist/server -type f 2>/dev/null || echo "no dist/server"
EXPOSE 3000
CMD ["node", "dist/server/index.js"]
