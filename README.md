# BRED Ecommerce

Next.js storefront + admin panel for BRED indumentaria masculina.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Supabase** (Postgres, Auth, Storage)
- **Mercado Pago** Checkout Pro
- **Vercel** deployment

## Setup local

```bash
cd bred-web
npm install
cp .env.example .env.local
```

### 1. Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com)
2. En SQL Editor, ejecutá `supabase/migrations/001_initial_schema.sql`
3. Copiá URL y keys a `.env.local`

### 2. Seed de productos

```bash
# Extraer imágenes del HTML original (ya hecho en public/products/)
node scripts/extract-images.js

# Sembrar base de datos
curl -X POST http://localhost:3000/api/seed \
  -H "x-seed-secret: change-me-in-production"
```

### 3. Admin user

1. En Supabase Auth → Users → Add user (email + password)
2. En SQL Editor:

```sql
INSERT INTO admin_users (id, email)
SELECT id, email FROM auth.users WHERE email = 'tu@email.com';
```

### 4. Mercado Pago

1. Obtené credenciales en [mercadopago.com.uy/developers](https://www.mercadopago.com.uy/developers)
2. Configurá `MERCADOPAGO_ACCESS_TOKEN` en `.env.local`
3. Para test: `MERCADOPAGO_SANDBOX=true`
4. Webhook: `https://tu-dominio.vercel.app/api/webhooks/mp`

## Desarrollo

```bash
npm run dev
```

- Tienda: http://localhost:3000
- Admin: http://localhost:3000/admin

Sin Supabase configurado, la tienda muestra productos de seed local (checkout requiere Supabase).

## Deploy en Vercel

1. Conectá el repo a Vercel
2. Configurá todas las env vars de `.env.example`
3. Ejecutá el seed post-deploy
4. Configurá webhook de Mercado Pago

## Estructura

```
app/           # Pages y API routes
components/    # UI components
lib/           # DB, orders, MP, types
public/products/  # Imágenes de productos
supabase/      # SQL migrations
scripts/       # Utilidades (extract-images, seed)
```
