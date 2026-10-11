update public.auto_leads
set status = case status
  when 'contacted' then 'needs_contact'
  when 'appointment' then 'appointment_requested'
  when 'closed' then 'lost'
  else status
end
where status in ('contacted', 'appointment', 'closed');

alter table public.auto_leads
  drop constraint if exists auto_leads_status_check;

alter table public.auto_leads
  add constraint auto_leads_status_check
  check (status = any (array[
    'new'::text,
    'needs_contact'::text,
    'appointment_requested'::text,
    'appointment_confirmed'::text,
    'follow_up_today'::text,
    'future_follow_up'::text,
    'long_term'::text,
    'sold'::text,
    'lost'::text
  ]));
