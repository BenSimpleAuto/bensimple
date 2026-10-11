create table if not exists public.customer_reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  email text not null,
  vehicle text,
  rating smallint not null,
  review_text text not null,
  permission_to_publish boolean not null default false,
  display_name_preference text not null,
  custom_display_name text,
  display_name text not null,
  status text not null default 'pending',
  admin_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  consent_at timestamptz not null,
  source text not null default 'bensimple.co',
  page_path text not null default '/',
  submission_fingerprint text not null,
  metadata jsonb not null default '{}'::jsonb,
  constraint customer_reviews_rating_check check (rating between 1 and 5),
  constraint customer_reviews_text_length_check check (char_length(review_text) between 20 and 2000),
  constraint customer_reviews_name_length_check check (char_length(name) between 2 and 120),
  constraint customer_reviews_email_length_check check (char_length(email) between 5 and 180),
  constraint customer_reviews_display_name_preference_check check (display_name_preference in ('full_name', 'first_last_initial', 'first_name', 'anonymous', 'custom')),
  constraint customer_reviews_status_check check (status in ('pending', 'approved', 'rejected', 'published')),
  constraint customer_reviews_publish_permission_check check (permission_to_publish = true)
);

create unique index if not exists customer_reviews_submission_fingerprint_idx
  on public.customer_reviews (submission_fingerprint);
create index if not exists customer_reviews_status_created_at_idx
  on public.customer_reviews (status, created_at desc);
create index if not exists customer_reviews_reviewed_by_idx
  on public.customer_reviews (reviewed_by);

alter table public.auto_leads enable row level security;
alter table public.auto_events enable row level security;
alter table public.customer_reviews enable row level security;

do $$
declare
  policy_row record;
begin
  for policy_row in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('auto_leads', 'auto_events', 'customer_reviews')
  loop
    execute format('drop policy %I on public.%I', policy_row.policyname, policy_row.tablename);
  end loop;
end $$;

revoke all on table public.auto_leads from anon, authenticated;
revoke all on table public.auto_events from anon, authenticated;
revoke all on table public.customer_reviews from anon, authenticated;

grant insert on table public.auto_leads to anon, authenticated;
grant select, update on table public.auto_leads to authenticated;
grant insert on table public.auto_events to anon, authenticated;
grant select on table public.auto_events to authenticated;
grant insert on table public.customer_reviews to anon, authenticated;
grant select, update on table public.customer_reviews to authenticated;

create policy auto_leads_public_insert
on public.auto_leads
for insert
to anon, authenticated
with check (
  consent_to_contact = true
  and status in ('new', 'appointment_requested')
  and (nullif(phone, '') is not null or nullif(email, '') is not null)
);

create policy auto_leads_admin_select
on public.auto_leads
for select
to authenticated
using (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'ben@bensimple.co');

create policy auto_leads_admin_update
on public.auto_leads
for update
to authenticated
using (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'ben@bensimple.co')
with check (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'ben@bensimple.co');

create policy auto_events_public_insert
on public.auto_events
for insert
to anon, authenticated
with check (true);

create policy auto_events_admin_select
on public.auto_events
for select
to authenticated
using (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'ben@bensimple.co');

create policy customer_reviews_public_insert
on public.customer_reviews
for insert
to anon, authenticated
with check (
  status = 'pending'
  and permission_to_publish = true
  and reviewed_at is null
  and reviewed_by is null
  and char_length(review_text) between 20 and 2000
);

create policy customer_reviews_admin_select
on public.customer_reviews
for select
to authenticated
using (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'ben@bensimple.co');

create policy customer_reviews_admin_update
on public.customer_reviews
for update
to authenticated
using (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'ben@bensimple.co')
with check (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'ben@bensimple.co');
