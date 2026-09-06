-- E-Khata initial schema: digital credit ledger for kirana stores.
--
-- Money unit: rupees, stored as numeric(12,2). The client domain model uses plain
-- JS numbers of rupees (amount: 105 === Rs 105), so the row mappers must coerce the
-- string that Postgres returns for numeric back into a number.
--
-- Column naming: the domain field `Transaction.timestamp` is stored as `occurred_at`
-- because `timestamp` is a Postgres type keyword and would need quoting everywhere.

create type public.transaction_status as enum ('verified', 'pending', 'settled');
create type public.payment_mode as enum ('qr', 'quick-qr', 'ocr-qr');
create type public.settlement_state as enum ('open', 'settled');
create type public.intent_status as enum ('waiting', 'confirmed');

create table public.customers (
  id text primary key,
  name text not null constraint customers_name_not_blank check (btrim(name) <> ''),
  phone text not null constraint customers_phone_is_ten_digits check (phone ~ '^[0-9]{10}$'),
  current_balance numeric(12, 2) not null default 0
    constraint customers_balance_non_negative check (current_balance >= 0),
  last_settlement_date timestamptz,
  next_settlement_date timestamptz not null,
  created_at timestamptz not null default now()
);

comment on table public.customers is 'Khata account holders. Phone is the natural key a shopkeeper types.';

alter table public.customers
  add constraint customers_phone_unique unique (phone);

create table public.transactions (
  id text primary key,
  customer_id text not null references public.customers (id) on delete cascade,
  merchant_name text not null,
  items jsonb not null default '[]'::jsonb
    constraint transactions_items_is_array check (jsonb_typeof(items) = 'array'),
  amount numeric(12, 2) not null constraint transactions_amount_positive check (amount > 0),
  status public.transaction_status not null default 'pending',
  payment_mode public.payment_mode not null,
  reference_id text not null,
  occurred_at timestamptz not null default now(),
  voice_played boolean not null default false,
  settlement_state public.settlement_state not null default 'open',
  created_at timestamptz not null default now()
);

comment on column public.transactions.occurred_at is 'Maps to Transaction.timestamp in the client domain model.';

alter table public.transactions
  add constraint transactions_reference_id_unique unique (reference_id);

-- Leading column covers the per-customer ledger lookup and the foreign key,
-- the trailing column covers the newest-first ordering used by every list view.
create index transactions_customer_id_occurred_at_idx
  on public.transactions (customer_id, occurred_at desc);

create index transactions_occurred_at_idx
  on public.transactions (occurred_at desc);

create table public.pay_intents (
  reference_id text primary key,
  customer_id text not null references public.customers (id) on delete cascade,
  merchant_name text not null,
  amount numeric(12, 2) not null constraint pay_intents_amount_positive check (amount > 0),
  items jsonb not null default '[]'::jsonb
    constraint pay_intents_items_is_array check (jsonb_typeof(items) = 'array'),
  payment_mode public.payment_mode not null default 'qr',
  status public.intent_status not null default 'waiting',
  created_at timestamptz not null default now()
);

comment on table public.pay_intents is 'Pending QR payment requests, looked up by the reference id encoded in the QR.';

alter table public.customers enable row level security;
alter table public.transactions enable row level security;
alter table public.pay_intents enable row level security;

-- ---------------------------------------------------------------------------
-- DEMO ONLY -- PERMISSIVE ANON POLICIES
--
-- This app is an unauthenticated hackathon demo: a customer scans a QR on their
-- own phone and confirms a bill without ever signing in, so every request reaches
-- Postgres as the `anon` role. The policies below therefore grant `anon` full
-- read/insert/update on the entire ledger.
--
-- RISK: anyone who obtains the (publicly shipped, browser-visible) anon key can
-- read every customer's name, phone number and balance, insert fake debts against
-- any customer, and mark any balance as settled. There is no tenant isolation and
-- no audit trail. Do not put real customer data in this project.
--
-- A PRODUCTION VERSION WOULD INSTEAD:
--   * Require Supabase Auth (phone OTP) and drop all `to anon` policies.
--   * Add a `shop_id` column plus a `shop_members` table, and scope every policy
--     with `auth.uid()`, e.g. shopkeepers see rows for shops they belong to and
--     customers see only `customer_id = auth.uid()`.
--   * Make `transactions` and `customers` insert/update service-role only, driven
--     by an Edge Function that validates the pay intent server-side, so a client
--     can never write a balance directly.
--   * Keep DELETE denied and rely on reversal rows for an immutable audit trail.
--
-- DELETE is intentionally not granted to any role on any table here.
-- ---------------------------------------------------------------------------

create policy "demo anon can read customers"
  on public.customers for select to anon using (true);

create policy "demo anon can insert customers"
  on public.customers for insert to anon with check (true);

create policy "demo anon can update customers"
  on public.customers for update to anon using (true) with check (true);

create policy "demo anon can read transactions"
  on public.transactions for select to anon using (true);

create policy "demo anon can insert transactions"
  on public.transactions for insert to anon with check (true);

create policy "demo anon can update transactions"
  on public.transactions for update to anon using (true) with check (true);

create policy "demo anon can read pay intents"
  on public.pay_intents for select to anon using (true);

create policy "demo anon can insert pay intents"
  on public.pay_intents for insert to anon with check (true);

create policy "demo anon can update pay intents"
  on public.pay_intents for update to anon using (true) with check (true);

-- Realtime: the shopkeeper screen listens for postgres_changes on these tables so
-- a customer confirming on their own phone/network updates the shop dashboard.
alter publication supabase_realtime add table public.customers;
alter publication supabase_realtime add table public.transactions;
