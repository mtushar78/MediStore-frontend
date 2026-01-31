# MediStore Frontend (Next.js 16)

## Setup

```bash
cd frontend/medistore-frontend
cp .env.example .env.local
```

Update `.env.local`:

- `NEXT_PUBLIC_BACKEND_URL` (backend base url)
- `NEXTAUTH_URL` (this app url)
- `NEXTAUTH_SECRET` (random string)

## Run

```bash
npm run dev
```

Open http://localhost:3000

## Auth

NextAuth is configured with `CredentialsProvider` that calls backend:

- `POST /api/v1/auth/login`

After login, we store `accessToken` + user fields in the JWT/session.

## Routes

- `/login` (CSR login form)
- `/me` (SSR-protected page)
- `/api/health` (Next.js Route Handler proxying backend health with `revalidate: 10`)
