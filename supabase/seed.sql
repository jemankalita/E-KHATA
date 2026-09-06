-- Demo data for E-Khata. Safe to re-run: existing rows are left untouched.
-- To reset the ledger to this exact pitch state (discarding anything created
-- during a demo run) uncomment the truncate below before running.
--
-- truncate table public.pay_intents, public.transactions, public.customers cascade;

insert into public.customers (id, name, phone, current_balance, last_settlement_date, next_settlement_date)
values
  ('cust-aarav', 'Aarav Mehta', '9876543210', 1240, '2026-08-30T10:00:00Z', '2026-09-30T10:00:00Z'),
  ('cust-priya', 'Priya Sharma', '9988776655', 0, '2026-08-30T10:00:00Z', '2026-09-30T10:00:00Z'),
  ('cust-imran', 'Imran Khan', '9123456780', 0, null, '2026-09-30T10:00:00Z')
on conflict (id) do nothing;

insert into public.transactions (
  id, customer_id, merchant_name, items, amount, status, payment_mode,
  reference_id, occurred_at, voice_played, settlement_state
)
values
  (
    'tx-sharma', 'cust-aarav', 'Sharma Stores',
    '[{"name":"Milk","quantity":2,"price":64,"matchedProductId":"milk","confidence":0.96},
      {"name":"Bread","quantity":1,"price":41,"matchedProductId":"bread","confidence":0.94}]'::jsonb,
    105, 'verified', 'ocr-qr', 'EKH-1041', '2026-09-05T18:20:00Z', true, 'open'
  ),
  (
    'tx-bus', 'cust-aarav', 'Bus Route 21G',
    '[{"name":"Ticket","quantity":1,"price":25,"matchedProductId":null,"confidence":0.4}]'::jsonb,
    25, 'verified', 'quick-qr', 'EKH-1042', '2026-09-04T09:05:00Z', true, 'open'
  ),
  (
    'tx-canteen', 'cust-aarav', 'Campus Canteen',
    '[{"name":"Maggi","quantity":1,"price":40,"matchedProductId":"maggi","confidence":0.91},
      {"name":"Chips","quantity":2,"price":40,"matchedProductId":"chips","confidence":0.9}]'::jsonb,
    80, 'pending', 'qr', 'EKH-1043', '2026-09-03T13:40:00Z', false, 'open'
  )
on conflict (id) do nothing;
