# Implementation Plan: Migrasi Static ke Dynamic Backend (NestJS)

## Ringkasan

Aplikasi Expo/React Native debt manager saat ini menggunakan data statis dari `staticDatabase.ts`. Tujuan migrasi ini adalah mengintegrasikan aplikasi dengan backend NestJS yang sudah didokumentasikan di `endpointdocumentation.md`.

Backend NestJS sudah menyediakan 19 endpoint yang mencakup:
- Authentication (register, login)
- User management (profile, list users)
- Debt optimization (optimize, simulate, path finding, suggestions)
- Activity tracking
- Payment methods CRUD

## User Review Required

> [!IMPORTANT]
> **Pertanyaan untuk User:**
> 1. Apakah backend NestJS sudah berjalan? Jika ya, di URL mana? (default: `http://localhost:3000`)
> 2. Apakah Anda ingin saya membuat backend NestJS dari awal, atau hanya mengintegrasikan frontend dengan backend yang sudah ada?
> 3. Apakah ada endpoint tambahan yang belum didokumentasikan di `endpointdocumentation.md`?
> 4. Untuk data yang belum ada endpoint-nya (seperti Groups, Group Transactions, Settlement Requests), apakah tetap menggunakan static data atau perlu backend endpoint juga?

> [!WARNING]
> **Breaking Changes:**
> - Struktur data `User` di backend berbeda dengan frontend (tidak ada `paymentMethods` di dalam object User)
> - Payment methods sekarang menjadi entitas terpisah dengan endpoint sendiri
> - Perlu migrasi data dari AsyncStorage ke format baru
> - Semua operasi akan asynchronous dan memerlukan error handling

## Proposed Changes

### API Service Layer

#### [NEW] [api/client.ts](file:///home/dragnell/Documents/CodingGILOO/JEES/debt-manager/api/client.ts)

API client dengan axios untuk handle:
- Base URL configuration
- Request/response interceptors
- JWT token injection
- Error handling
- Retry logic

#### [NEW] [api/auth.api.ts](file:///home/dragnell/Documents/CodingGILOO/JEES/debt-manager/api/auth.api.ts)

Authentication API calls:
- `POST /auth/register`
- `POST /auth/login`

#### [NEW] [api/users.api.ts](file:///home/dragnell/Documents/CodingGILOO/JEES/debt-manager/api/users.api.ts)

User management API calls:
- `GET /users/profile`
- `GET /users`

#### [NEW] [api/debts.api.ts](file:///home/dragnell/Documents/CodingGILOO/JEES/debt-manager/api/debts.api.ts)

Debt optimization API calls:
- `POST /debts/optimize`
- `POST /debts/simulate`
- `POST /debts/path`
- `POST /debts/suggestions`

#### [NEW] [api/activities.api.ts](file:///home/dragnell/Documents/CodingGILOO/JEES/debt-manager/api/activities.api.ts)

Activity tracking API calls:
- `GET /debts/activities`
- `GET /debts/activities/:userId`
- `POST /debts/activity`
- `DELETE /debts/activities`

#### [NEW] [api/payment-methods.api.ts](file:///home/dragnell/Documents/CodingGILOO/JEES/debt-manager/api/payment-methods.api.ts)

Payment methods API calls:
- `POST /payment-methods`
- `GET /payment-methods`
- `GET /payment-methods/primary`
- `GET /payment-methods/:id`
- `PUT /payment-methods/:id`
- `DELETE /payment-methods/:id`
- `POST /payment-methods/:id/set-primary`

#### [NEW] [api/types.ts](file:///home/dragnell/Documents/CodingGILOO/JEES/debt-manager/api/types.ts)

TypeScript interfaces untuk API responses dan requests

---

### Context Updates

#### [MODIFY] [contexts/AuthContext.tsx](file:///home/dragnell/Documents/CodingGILOO/JEES/debt-manager/contexts/AuthContext.tsx)

Update untuk menggunakan API:
- Replace `StaticDB.authenticateUser()` dengan API call ke `/auth/login`
- Replace `StaticDB.registerUser()` dengan API call ke `/auth/register`
- Store JWT token di AsyncStorage
- Add token refresh logic
- Update user profile dari `/users/profile`

#### [MODIFY] [contexts/DebtContext.tsx](file:///home/dragnell/Documents/CodingGILOO/JEES/debt-manager/contexts/DebtContext.tsx)

Update untuk menggunakan API:
- Integrate debt optimization endpoints
- Add activity tracking
- Handle async operations properly

---

### Configuration

#### [NEW] [config/api.config.ts](file:///home/dragnell/Documents/CodingGILOO/JEES/debt-manager/config/api.config.ts)

API configuration:
- Base URL (environment-based)
- Timeout settings
- Retry configuration

---

### Package Dependencies

#### [MODIFY] [package.json](file:///home/dragnell/Documents/CodingGILOO/JEES/debt-manager/package.json)

Add dependencies:
- `axios` - HTTP client
- `@tanstack/react-query` (optional) - Data fetching and caching

## Verification Plan

### Automated Tests

Karena project ini belum memiliki test suite, saya akan membuat test manual yang jelas.

### Manual Verification

**Prerequisites:**
1. Backend NestJS harus running di `http://localhost:3000`
2. Frontend Expo harus running dengan `npm start`

**Test Case 1: Authentication Flow**
1. Buka aplikasi
2. Klik "Register" dan buat user baru
3. Verify: User berhasil terdaftar dan auto-login
4. Logout
5. Login dengan credentials yang sama
6. Verify: Berhasil login dan dapat melihat profile

**Test Case 2: Debt Operations**
1. Login sebagai user
2. Tambah debt baru (hutang/piutang)
3. Verify: Debt muncul di list
4. Update debt
5. Verify: Perubahan tersimpan
6. Delete debt
7. Verify: Debt terhapus

**Test Case 3: Payment Methods**
1. Login sebagai user
2. Tambah payment method baru
3. Verify: Payment method muncul di list
4. Set sebagai primary
5. Verify: Status primary berubah
6. Delete payment method
7. Verify: Payment method terhapus

**Test Case 4: Error Handling**
1. Matikan backend server
2. Coba login
3. Verify: Error message muncul dengan jelas
4. Verify: App tidak crash

**Test Case 5: Token Management**
1. Login sebagai user
2. Tunggu token expire (atau manipulasi token di AsyncStorage)
3. Coba akses protected endpoint
4. Verify: Auto-redirect ke login atau token refresh

---

## Notes

- Saya akan membuat API service layer yang modular dan mudah di-maintain
- Error handling akan comprehensive dengan user-friendly messages
- Token management akan automatic dengan interceptors
- Backward compatibility dengan static data untuk development (optional flag)
