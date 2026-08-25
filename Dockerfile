FROM node:20-alpine
WORKDIR /app

# Install OpenSSL for Prisma SQLite support
RUN apk add --no-cache openssl libc6-compat

# Copy dependencies definitions
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies
RUN npm install

# Copy application source
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/app/prisma/dev.db"
ENV NODE_ENV=production
ENV PORT=3000

# Generate Prisma Client and build Next.js
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Push DB schema on startup (creates SQLite db in mounted volume) and start Next.js
CMD ["sh", "-c", "npx prisma db push && npm start"]
