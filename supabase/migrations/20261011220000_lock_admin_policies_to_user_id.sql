drop policy if exists auto_leads_admin_select on public.auto_leads;
drop policy if exists auto_leads_admin_update on public.auto_leads;
drop policy if exists auto_events_admin_select on public.auto_events;
drop policy if exists customer_reviews_admin_select on public.customer_reviews;
drop policy if exists customer_reviews_admin_update on public.customer_reviews;

create policy auto_leads_admin_select
on public.auto_leads
for select
to authenticated
using ((select auth.uid()) = '78be7b4e-7106-4b4f-959e-64e59a8bba2b'::uuid);

create policy auto_leads_admin_update
on public.auto_leads
for update
to authenticated
using ((select auth.uid()) = '78be7b4e-7106-4b4f-959e-64e59a8bba2b'::uuid)
with check ((select auth.uid()) = '78be7b4e-7106-4b4f-959e-64e59a8bba2b'::uuid);

create policy auto_events_admin_select
on public.auto_events
for select
to authenticated
using ((select auth.uid()) = '78be7b4e-7106-4b4f-959e-64e59a8bba2b'::uuid);

create policy customer_reviews_admin_select
on public.customer_reviews
for select
to authenticated
using ((select auth.uid()) = '78be7b4e-7106-4b4f-959e-64e59a8bba2b'::uuid);

create policy customer_reviews_admin_update
on public.customer_reviews
for update
to authenticated
using ((select auth.uid()) = '78be7b4e-7106-4b4f-959e-64e59a8bba2b'::uuid)
with check ((select auth.uid()) = '78be7b4e-7106-4b4f-959e-64e59a8bba2b'::uuid);
