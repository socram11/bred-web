-- BRED Ecommerce initial schema

create extension if not exists "pgcrypto";

-- Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Products (flat model: each color/photo = one product)
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  legacy_id int unique,
  name text not null,
  category_id uuid not null references categories(id) on delete restrict,
  color_label text not null default '',
  price int not null check (price > 0),
  badge text,
  image_url text not null,
  sizes text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Stock per product/size
create table if not exists product_stock (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size text not null,
  quantity int not null default 0 check (quantity >= 0),
  unique (product_id, size)
);

create index if not exists idx_product_stock_product on product_stock(product_id);

-- Orders
create type shipping_method as enum ('delivery', 'pickup');
create type payment_method as enum ('mercadopago', 'transfer', 'cash');
create type order_status as enum ('pending', 'paid', 'confirmed', 'shipped', 'cancelled');

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  email text not null,
  phone text,
  items jsonb not null default '[]',
  subtotal int not null,
  shipping_cost int not null default 0,
  total int not null,
  shipping_method shipping_method not null default 'delivery',
  payment_method payment_method not null,
  status order_status not null default 'pending',
  mp_preference_id text,
  mp_payment_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created on orders(created_at desc);

-- Settings singleton
create table if not exists settings (
  id int primary key default 1 check (id = 1),
  shipping_flat_rate int not null default 300,
  low_stock_threshold int not null default 2,
  whatsapp_number text not null default '59899123456',
  bank_transfer_info text not null default 'Banco: BROU\nTitular: BRED Indumentaria\nCuenta: XXXXX',
  instagram_handle text not null default '@bred_indumentaria',
  contact_email text not null default 'bred.indumentaria@gmail.com',
  updated_at timestamptz not null default now()
);

insert into settings (id) values (1) on conflict (id) do nothing;

-- Admin users (linked to Supabase Auth)
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- RLS
alter table categories enable row level security;
alter table products enable row level security;
alter table product_stock enable row level security;
alter table orders enable row level security;
alter table settings enable row level security;
alter table admin_users enable row level security;

-- Public read for storefront
create policy "categories_public_read" on categories for select using (true);
create policy "products_public_read" on products for select using (active = true);
create policy "product_stock_public_read" on product_stock for select using (true);
create policy "settings_public_read" on settings for select using (true);

-- Admin policies
create policy "admin_categories_all" on categories for all
  using (exists (select 1 from admin_users where id = auth.uid()));

create policy "admin_products_all" on products for all
  using (exists (select 1 from admin_users where id = auth.uid()));

create policy "admin_stock_all" on product_stock for all
  using (exists (select 1 from admin_users where id = auth.uid()));

create policy "admin_orders_all" on orders for all
  using (exists (select 1 from admin_users where id = auth.uid()));

create policy "admin_settings_all" on settings for all
  using (exists (select 1 from admin_users where id = auth.uid()));

create policy "admin_users_read_self" on admin_users for select
  using (id = auth.uid());

-- Storage bucket for product images
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

create policy "products_storage_public_read" on storage.objects
  for select using (bucket_id = 'products');

create policy "products_storage_admin_write" on storage.objects
  for all using (
    bucket_id = 'products' and
    exists (select 1 from admin_users where id = auth.uid())
  );

-- Function to decrement stock on paid order
create or replace function decrement_stock_for_order(order_items jsonb)
returns void
language plpgsql
as $$
declare
  item jsonb;
begin
  for item in select * from jsonb_array_elements(order_items)
  loop
    update product_stock
    set quantity = quantity - (item->>'qty')::int
    where product_id = (item->>'product_id')::uuid
      and size = item->>'size'
      and quantity >= (item->>'qty')::int;

    if not found then
      raise exception 'Insufficient stock for product % size %', item->>'product_id', item->>'size';
    end if;
  end loop;
end;
$$;
