# --- STAGE 1: TUKANG MASAK (BUILDER) ---
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Install semua library (termasuk buat compile TypeScript)
COPY package*.json ./
RUN npm install

# Copy kodingan dan build jadi JavaScript
COPY . .
RUN npx prisma generate
RUN npm run build

# --- STAGE 2 (RUNNER) ---
FROM node:20-alpine
WORKDIR /usr/src/app

# Ambil semuanya yang penting dari builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/prisma.config.ts ./

# Pastikan copy folder dist ke folder dist lagi di Stage 2
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000
# Gunakan node dist/main.js sebagai default
CMD ["node", "dist/main.js"]