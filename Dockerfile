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

# --- STAGE 2: PRAMUSAJI (FINAL IMAGE) ---
FROM node:20-alpine
WORKDIR /usr/src/app

# Cuma copy file yang dibutuhin buat JALAN doang
# Kita gak butuh file .ts lagi, cuma butuh folder dist & node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 3000
CMD ["node", "dist/main"]