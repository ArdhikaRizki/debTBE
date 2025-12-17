# Debt Management API

API untuk manajemen hutang piutang menggunakan NestJS, Prisma, dan PostgreSQL.

## 📋 Table of Contents

- [Fitur yang Sudah Ada](#-fitur-yang-sudah-dibuat)
- [Quick Start](#project-setup)
- [API Documentation](#-api-documentation--usage)
- [Authentication Flow](#-cara-kerja-authentication)
- [Testing API](#-testing-dengan-curl-atau-postman)
- [Deep Dive Architecture](#-deep-dive-penjelasan-arsitektur)
- [Troubleshooting](#troubleshooting)

## 🎯 Apa yang Sudah Dibuat?

### ✅ Fitur Aktif:
1. **Authentication System** - Register, Login, JWT Token
2. **User Management** - Get profile, Get all users
3. **Database Models** - 6 models (User, Debt, DebtGroup, dll)
4. **Protected Endpoints** - Pakai JWT Guard
5. **Password Encryption** - Bcrypt hashing

### 📝 Yang Belum Ada (Tinggal Develop):
- CRUD untuk Debt, DebtGroup, Transactions
- Email notifications
- File upload
- Dashboard & statistics

**👉 Lihat [QUICKSTART.md](./QUICKSTART.md) untuk tutorial cepat!**

---

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **Prisma 7** - Modern database ORM dengan PostgreSQL adapter
- **PostgreSQL** - Relational database
- **JWT** - Authentication dengan Bearer token
- **Bcrypt** - Password hashing
- **TypeScript** - Type-safe development

## Prerequisites

- Node.js >= 18
- PostgreSQL database running
- npm atau yarn

## Project Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Buat file `.env` di root project:

```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/debt"
JWT_SECRET="your-secret-key-here"
```

### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio
npx prisma studio
```

## Run Application

```bash
# Development mode dengan auto-reload
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

Server akan berjalan di `http://localhost:3000`

---

## 🎯 Fitur yang Sudah Dibuat

### 1. **Authentication System (JWT)**
✅ Register user baru dengan password terenkripsi (bcrypt)  
✅ Login dengan JWT token  
✅ JWT Guard untuk proteksi endpoint  
✅ Validasi user credentials  

### 2. **User Management**
✅ Get user profile (protected)  
✅ Get all users (protected)  
✅ CRUD operations untuk User  

### 3. **Database Models (Prisma)**
✅ User - Data user & authentication  
✅ Debt - Hutang piutang individual  
✅ DebtGroup - Grup untuk hutang bersama  
✅ GroupMember - Member dalam grup  
✅ GroupTransaction - Transaksi dalam grup  
✅ SettlementRequest - Request pelunasan hutang  

### 4. **Infrastructure**
✅ Prisma 7 dengan PostgreSQL Adapter  
✅ Connection pooling  
✅ TypeScript strict mode  
✅ NestJS modular architecture  

---

## 📡 API Documentation & Usage

### **Authentication Endpoints**

#### 1. Register User Baru
```http
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "password": "password123",
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "id": "uuid-here",
  "username": "johndoe",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2025-12-17T10:30:00.000Z"
}
```

#### 2. Login
```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**⚠️ Simpan `access_token` ini untuk request berikutnya!**

---

### **User Endpoints (Protected - Butuh Login)**

#### 3. Get User Profile
```http
GET http://localhost:3000/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "id": "uuid-here",
  "username": "johndoe",
  "name": "John Doe",
  "email": "john@example.com",
  "profileImage": null,
  "createdAt": "2025-12-17T10:30:00.000Z"
}
```

#### 4. Get All Users
```http
GET http://localhost:3000/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
[
  {
    "id": "uuid-1",
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com"
  },
  {
    "id": "uuid-2",
    "username": "janedoe",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
]
```

---

## 🔐 Cara Kerja Authentication

### Flow Login:

```
1. User Register
   ↓
   POST /auth/register
   ↓
   Password di-hash dengan bcrypt (10 rounds)
   ↓
   Simpan ke database
   ↓
   Return user data (tanpa password)

2. User Login
   ↓
   POST /auth/login
   ↓
   Cari user berdasarkan username
   ↓
   Compare password dengan bcrypt.compare()
   ↓
   Jika valid, generate JWT token
   ↓
   Return { access_token, user }

3. Access Protected Endpoint
   ↓
   GET /users/profile
   Header: Authorization: Bearer <token>
   ↓
   JwtAuthGuard validate token
   ↓
   JwtStrategy extract payload (userId, username)
   ↓
   Inject user data ke Request object
   ↓
   Controller bisa akses req.user
```

### Struktur JWT Token:

```typescript
// Payload yang disimpan di token:
{
  "username": "johndoe",
  "sub": "user-id-uuid",  // subject = user ID
  "iat": 1702819200,      // issued at
  "exp": 1702905600       // expiration
}
```

### Cara Pakai di Code:

```typescript
// Protected endpoint dengan @UseGuards
@Controller('users')
export class UserController {
  
  @UseGuards(JwtAuthGuard)  // ← Ini wajib untuk protected endpoint
  @Get('profile')
  async getProfile(@Request() req) {
    // req.user otomatis ada dari JWT validation
    console.log(req.user); // { userId: '...', username: '...' }
    
    return this.userService.findUnique({ 
      id: req.user.userId 
    });
  }
}
```

---

## 🧪 Testing dengan cURL atau Postman

### 1. Register User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123",
    "name": "Test User",
    "email": "test@example.com"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123"
  }'
```

**Copy `access_token` dari response!**

### 3. Get Profile (dengan token)
```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 4. Jika Tidak Login (Error)
```bash
# Request tanpa token
curl -X GET http://localhost:3000/users/profile

# Response:
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 📊 Database Models

### User Model
```prisma
model User {
  id            String   @id @default(uuid())
  username      String   @unique
  password      String
  name          String
  email         String   @unique
  profileImage  String?
  createdAt     DateTime @default(now())
  
  // Relations
  debts                 Debt[]
  createdGroups         DebtGroup[]
  groupMemberships      GroupMember[]
  transactionsFrom      GroupTransaction[]
  transactionsTo        GroupTransaction[]
}
```

### Debt Model
```prisma
model Debt {
  id          String   @id @default(uuid())
  amount      Decimal
  description String?
  status      String   // PENDING, PAID, CANCELLED
  dueDate     DateTime?
  userId      String
  user        User     @relation(...)
}
```

**Note:** Model lain (DebtGroup, GroupMember, dll) sudah didefinisikan tapi belum ada controller/service nya.

---

## 🚀 Next Steps - Fitur yang Bisa Ditambahkan

### Belum Ada (Bisa Kamu Develop):

- [ ] **Debt CRUD** - Create, read, update, delete hutang
- [ ] **Debt Group Management** - Buat grup hutang bersama
- [ ] **Group Transactions** - Catat transaksi dalam grup
- [ ] **Settlement Requests** - Request pelunasan hutang
- [ ] **Email Notifications** - Notif saat ada hutang baru
- [ ] **Debt Reminders** - Reminder otomatis sebelum due date
- [ ] **Dashboard Statistics** - Total hutang, piutang, dll
- [ ] **File Upload** - Upload bukti pembayaran
- [ ] **Search & Filter** - Cari hutang berdasarkan status, tanggal, dll

---

## API Endpoints

### Authentication
- `POST /auth/register` - Register user baru
- `POST /auth/login` - Login user

### Users (Protected)
- `GET /users` - Get all users (protected)
- `GET /users/profile` - Get user profile (protected)

### Root
- `GET /` - Health check

## Project Structure

```
src/
├── auth/           # Authentication module (JWT, Guards, Strategies)
├── user/           # User module (Controller, Service)
├── prisma/         # Prisma module (Database service)
├── app.module.ts   # Root module
└── main.ts         # Application entry point

prisma/
├── schema.prisma   # Database schema
└── migrations/     # Database migrations
```

## Important Notes - Prisma 7 Changes

### ⚠️ Breaking Changes dari Prisma 6 ke Prisma 7

Prisma 7 mengubah cara koneksi database:

1. **Database URL tidak lagi di schema.prisma**
   ```prisma
   // ❌ Tidak lagi didukung
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   
   // ✅ Prisma 7
   datasource db {
     provider = "postgresql"
   }
   ```

2. **Wajib menggunakan Adapter**
   ```typescript
   // src/prisma/prisma.service.ts
   import { PrismaPg } from '@prisma/adapter-pg';
   import { Pool } from 'pg';
   
   const pool = new Pool({ 
     connectionString: process.env.DATABASE_URL 
   });
   const adapter = new PrismaPg(pool);
   const prisma = new PrismaClient({ adapter });
   ```

3. **Dependencies yang dibutuhkan**
   ```bash
   npm install @prisma/adapter-pg pg
   ```

---

## 📚 Deep Dive: Penjelasan Arsitektur

### 1️⃣ Lokasi Prisma Client Generated Files

**Q: Ketika `npx prisma generate`, file disimpan dimana?**

**A:** File disimpan di `node_modules/@prisma/client/`

```bash
node_modules/@prisma/client/
├── index.d.ts          # TypeScript type definitions
├── index.js            # Main entry point
├── default.js          # Default exports
├── edge.js             # Edge runtime support
├── runtime/            # Prisma runtime engine
│   └── library.js
└── src/                # Generated source code
    └── ...
```

**Mengapa bukan di `src/generated/` lagi?**

Sebelumnya di config ada:
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"  // ❌ Custom location
}
```

Ini menyebabkan masalah karena:
- Path relatif tidak resolve dengan benar saat runtime
- Folder `dist/` tidak include generated files
- Harus manual copy ke dist setiap build

**Solusi:** Gunakan lokasi default:
```prisma
generator client {
  provider = "prisma-client-js"
  // ✅ Tidak ada output = generate ke node_modules/@prisma/client
}
```

**Keuntungan:**
- Import standard: `import { PrismaClient } from '@prisma/client'`
- Node.js otomatis resolve dari node_modules
- Tidak perlu copy-paste saat build
- Compatible dengan semua tools (webpack, esbuild, dll)

---

### 2️⃣ Prisma Adapter - Apa dan Dimana Digunakan?

**Q: Apa itu Adapter dan kenapa dibutuhkan?**

**A:** Di Prisma 7, **Adapter adalah bridge antara PrismaClient dan database driver**.

**Sebelum Prisma 7:**
```typescript
// Prisma punya built-in engine, langsung connect
const prisma = new PrismaClient();
```

**Prisma 7:**
```typescript
// Harus pakai adapter + driver eksternal
import { Pool } from 'pg';                    // Database driver
import { PrismaPg } from '@prisma/adapter-pg'; // Adapter

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});
const adapter = new PrismaPg(pool);           // Wrap driver dengan adapter
const prisma = new PrismaClient({ adapter }); // Pass adapter ke PrismaClient
```

**Mengapa perlu adapter?**
1. **Flexibility** - Bisa pakai driver pilihan sendiri (pg, node-postgres, dll)
2. **Connection Pooling** - Control lebih baik atas connection management
3. **Edge Runtime Support** - Bisa deploy ke Cloudflare Workers, Vercel Edge, dll
4. **Performance** - Lebih efisien untuk serverless/edge environments

**Adapter digunakan dimana?**

Di `src/prisma/prisma.service.ts` - saat inisialisasi PrismaClient:

```typescript
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;
  private pool: Pool;

  constructor() {
    // 1. Buat connection pool untuk PostgreSQL
    this.pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 20,              // Max connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    
    // 2. Wrap pool dengan adapter
    const adapter = new PrismaPg(this.pool);
    
    // 3. Pass adapter ke PrismaClient
    this.prisma = new PrismaClient({ adapter });
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
    await this.pool.end(); // ⚠️ Penting: close pool juga
  }
}
```

**Flow koneksi:**
```
Your Code → PrismaClient → Adapter → Database Driver (pg) → PostgreSQL
```

---

### 3️⃣ PrismaService Architecture - Composition vs Inheritance

**Q: Kenapa tidak pakai inheritance seperti biasa?**

**Cara Lama (Inheritance):**
```typescript
// ❌ Tidak berfungsi dengan baik di Prisma 7 + adapter
export class PrismaService extends PrismaClient {
  constructor() {
    super(); // Error: needs adapter
  }
}
```

Masalah:
- `super()` tidak bisa pass adapter dengan mudah
- Hard to manage pool lifecycle
- Coupling terlalu kuat dengan PrismaClient

**Cara Baru (Composition):**
```typescript
// ✅ Better approach
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;  // Composition: "has-a" relationship
  private pool: Pool;

  constructor() {
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(this.pool);
    this.prisma = new PrismaClient({ adapter });
  }
}
```

**Keuntungan Composition:**

1. **Separation of Concerns**
   - Pool management terpisah dari Prisma logic
   - Lebih mudah di-test dan di-mock

2. **Lifecycle Management**
   ```typescript
   async onModuleDestroy() {
     await this.prisma.$disconnect();  // Close Prisma
     await this.pool.end();            // Close pool
   }
   ```

3. **Flexibility**
   - Bisa ganti adapter tanpa ubah class structure
   - Bisa add custom methods tanpa conflict dengan PrismaClient

4. **Type Safety dengan Getters**
   ```typescript
   // Expose models melalui getters
   get user() {
     return this.prisma.user;
   }
   
   get debt() {
     return this.prisma.debt;
   }
   ```

**Cara Pakai di Service Lain:**

```typescript
// user.service.ts
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findUnique(id: string) {
    // Akses melalui getter
    return this.prisma.user.findUnique({ 
      where: { id } 
    });
  }
}
```

**Pattern ini memberikan:**
- ✅ Clean API
- ✅ Type-safe
- ✅ Testable (easy to mock)
- ✅ Proper resource management
- ✅ NestJS dependency injection friendly

---

### Solusi Error "Cannot find module"

Jika mendapat error `Cannot find module '../generated/prisma'`:

1. Pastikan Prisma Client di-generate ke lokasi default:
   ```prisma
   generator client {
     provider = "prisma-client-js"
     // Jangan tambahkan output custom
   }
   ```

2. Gunakan import dari `@prisma/client`:
   ```typescript
   import { PrismaClient } from '@prisma/client';
   ```

3. Regenerate client:
   ```bash
   npx prisma generate
   ```

## Database Schema

Project ini menggunakan schema untuk:
- Users (Authentication & Profile)
- Debts (Hutang/Piutang)
- Debt Groups (Grup hutang)
- Group Members (Anggota grup)
- Group Transactions (Transaksi dalam grup)
- Settlement Requests (Permintaan pelunasan)

Detail schema ada di `prisma/schema.prisma`

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Build for Production

```bash
npm run build
```

Output ada di folder `dist/`

## Troubleshooting

### Error: PrismaClient needs adapter

**Solusi:** Install dependencies dan pastikan adapter di-setup dengan benar
```bash
npm install @prisma/adapter-pg pg
```

### Error: Cannot connect to database

**Solusi:** 
1. Pastikan PostgreSQL running
2. Cek `DATABASE_URL` di `.env`
3. Test connection: `psql -h localhost -U postgres -d debt`

### TypeScript errors setelah generate

**Solusi:** Restart TypeScript server di VS Code
- Cmd/Ctrl + Shift + P
- "TypeScript: Restart TS Server"

## License

This project is [MIT licensed](LICENSE).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers.

$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## Technical Debt

### Database Schema - onDelete Behaviors
Perlu ditentukan behavior saat data dihapus untuk relasi di Prisma schema:

1. **GroupMember** → Pertimbangkan `onDelete: Cascade` (jika user dihapus, membership ikut terhapus)
2. **DebtGroup.creator** → Pertimbangkan `onDelete: Restrict` atau `SetNull` (grup tidak hilang saat creator dihapus)
3. **Debt.user** → Pertimbangkan `onDelete: Restrict` (user tidak bisa dihapus jika masih ada debt aktif)

Referensi: https://www.prisma.io/docs/concepts/components/prisma-schema/relations/referential-actions

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
