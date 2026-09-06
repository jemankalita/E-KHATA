-- Covering index for pay_intents_customer_id_fkey, flagged by the Supabase
-- performance advisor (unindexed_foreign_keys): without it, deleting a customer
-- has to sequentially scan pay_intents to enforce the cascade.

create index pay_intents_customer_id_idx
  on public.pay_intents (customer_id);
