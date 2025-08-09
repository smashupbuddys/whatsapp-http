FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm ci 

COPY src/ ./src

RUN npm run build && npm prune --production

FROM node:22-alpine

WORKDIR /app

# Install runtime dependencies only
RUN apk add --no-cache tzdata

# Copy package and built files and production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD ["npm","run", "start"]
