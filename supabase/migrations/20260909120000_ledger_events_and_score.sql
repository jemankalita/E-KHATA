-- Optional scoring/event layer. The live demo stores the same events inside khata_states JSON
-- and does not require this migration. Phase 2 NBFC adapters can read these tables.

create type public.settlement_source as enum ('customer', 'auto');
create type public.ledger_event_kind as enum ('payment', 'dispute', 'correction');
create type public.payment_kind as enum ('partial', 'full');

alter table public.transactions
  add column if not exists amount_paid numeric(12, 2) not null default 0
    constraint transactions_amount_paid_non_negative check (amount_paid >= 0),
  add column if not exists settled_at timestamptz,
  add column if not exists settlement_source public.settlement_source,
  add column if not exists disputed boolean not null default false;

comment on column public.transactions.amount_paid is 'FIFO customer payments applied to this bill. Not a credit limit.';
comment on column public.transactions.settlement_source is 'customer = confirmed repayment; auto = due-date close (excluded from scores).';

create table public.ledger_events (
  id text primary key,
  customer_id text references public.customers (id) on delete cascade,
  customer_name text not null,
  merchant_name text not null,
  kind public.ledger_event_kind not null,
  source text not null,
  occurred_at timestamptz not null default now(),
  amount numeric(12, 2),
  payment_kind public.payment_kind,
  transaction_ids jsonb not null default '[]'::jsonb
    constraint ledger_events_transaction_ids_is_array check (jsonb_typeof(transaction_ids) = 'array'),
  note text,
  previous_amount numeric(12, 2),
  next_amount numeric(12, 2),
  created_at timestamptz not null default now()
);

comment on table public.ledger_events is 'Repayment, dispute, and correction facts for khata-score-v1. No lending fields.';

create index ledger_events_merchant_customer_occurred_idx
  on public.ledger_events (merchant_name, customer_name, occurred_at desc);

alter table public.ledger_events enable row level security;

create policy "demo anon can read ledger events"
  on public.ledger_events for select to anon using (true);

create policy "demo anon can insert ledger events"
  on public.ledger_events for insert to anon with check (true);
