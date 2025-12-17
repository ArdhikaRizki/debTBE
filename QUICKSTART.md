# 🚀 Quick Start Guide - Debt Management API

## ⚡ Langkah Cepat untuk Developer Baru

### 1. Setup Project (First Time)
```bash
# Clone project
git clone <repo-url>
cd debt

# Install dependencies
npm install

# Setup database
cp .env.example .env
# Edit .env, sesuaikan DATABASE_URL dan JWT_SECRET

# Generate Prisma Client & Run Migrations
npx prisma generate
npx prisma migrate dev

# Run server
npm run start:dev
```

Server running di: `http://localhost:3000`

---

## 🎯 Test API - Step by Step

### Step 1: Register User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "secret123",
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

### Step 2: Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "secret123"
  }'
```

**Response akan ada `access_token`. COPY TOKEN INI!**

### Step 3: Access Protected Endpoint
```bash
# Ganti YOUR_TOKEN dengan token dari step 2
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔑 Authentication Cheat Sheet

### ✅ Endpoint yang TIDAK butuh login:
- `GET /` - Health check
- `POST /auth/register` - Register user baru
- `POST /auth/login` - Login

### 🔒 Endpoint yang BUTUH login (protected):
- `GET /users/profile` - Get profile sendiri
- `GET /users` - Get semua user

**Cara pakai token:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📂 Struktur Project

```
src/
├── auth/                    # 🔐 Authentication Module
│   ├── auth.controller.ts   # Endpoint: /auth/register, /auth/login
│   ├── auth.service.ts      # Logic: validate user, generate JWT
│   ├── jwt-auth.guard.ts    # Guard untuk proteksi endpoint
│   └── jwt.strategy.ts      # Strategy untuk JWT validation
│
├── user/                    # 👤 User Module
│   ├── user.controller.ts   # Endpoint: /users/profile, /users
│   └── user.service.ts      # Logic: CRUD user
│
├── prisma/                  # 🗄️ Database Module
│   ├── prisma.service.ts    # Database connection service
│   └── prisma.module.ts     # Prisma module
│
├── app.module.ts            # Root module (import semua module)
└── main.ts                  # Entry point aplikasi
```

---

## 🐛 Troubleshooting Cepat

### ❌ "Cannot connect to database"
```bash
# Cek PostgreSQL running
sudo systemctl status postgresql

# Test connection
psql -h localhost -U postgres -d debt

# Cek .env file
cat .env
```

### ❌ "Unauthorized" saat access endpoint
- Pastikan sudah login dan punya token
- Pastikan token dikirim di header: `Authorization: Bearer <token>`
- Cek token belum expired (default: 1 hari)

### ❌ "PrismaClient needs adapter"
```bash
# Install adapter
npm install @prisma/adapter-pg pg

# Regenerate
npx prisma generate
```

### ❌ Port 3000 sudah digunakan
```bash
# Cari process yang pakai port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Atau ubah port di src/main.ts
await app.listen(3001);
```

---

## 💡 Tips Development

### 1. Auto Restart saat Edit Code
```bash
npm run start:dev  # Watch mode
```

### 2. Lihat Database dengan Prisma Studio
```bash
npx prisma studio
# Buka browser: http://localhost:5555
```

### 3. Format Code
```bash
npm run format
```

### 4. Test API di VS Code
- Install extension: **REST Client**
- Buka file: `api-test.http`
- Klik "Send Request" di atas setiap request

---

## 📝 Environment Variables

```env
# .env file
DATABASE_URL="postgresql://postgres:admin@localhost:5432/debt"
JWT_SECRET="ganti-dengan-secret-key-kamu-yang-panjang"
```

**⚠️ PENTING:**
- Jangan commit file `.env` ke git
- Gunakan secret key yang kuat untuk production
- Ubah password database default

---

## 🔄 Common Commands

```bash
# Development
npm run start:dev         # Run dengan watch mode
npm run start:debug       # Run dengan debug mode

# Production
npm run build             # Build project
npm run start:prod        # Run production build

# Database
npx prisma generate       # Generate Prisma Client
npx prisma migrate dev    # Create & run migration
npx prisma migrate reset  # Reset database (HATI-HATI!)
npx prisma studio         # Open Prisma Studio GUI

# Testing
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Test coverage

# Code Quality
npm run format            # Format dengan Prettier
npm run lint              # Lint dengan ESLint
```

---

## 🎓 Next: Buat Fitur Baru

Mau buat controller baru? Follow pattern ini:

### 1. Generate Module
```bash
nest g module debt
nest g controller debt
nest g service debt
```

### 2. Add CRUD di Service
```typescript
// debt.service.ts
@Injectable()
export class DebtService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.debt.create({ data });
  }

  async findAll() {
    return this.prisma.debt.findMany();
  }
}
```

### 3. Add Endpoints di Controller
```typescript
// debt.controller.ts
@Controller('debts')
export class DebtController {
  constructor(private debtService: DebtService) {}

  @UseGuards(JwtAuthGuard)  // Protected
  @Post()
  create(@Body() data: any) {
    return this.debtService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.debtService.findAll();
  }
}
```

---

## 📚 Resources

- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [JWT.io](https://jwt.io) - Debug JWT tokens
- [PostgreSQL Docs](https://www.postgresql.org/docs)

---

**Happy Coding! 🚀**
