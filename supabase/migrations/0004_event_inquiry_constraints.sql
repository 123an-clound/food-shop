-- Mirror the most important public form checks at the database boundary.
alter table public.event_inquiries
  add constraint event_inquiries_name_not_blank check (char_length(btrim(name)) >= 2),
  add constraint event_inquiries_phone_format check (
    phone ~ '^[0-9+().[:space:]-]{9,18}$'
    and char_length(regexp_replace(phone, '[^0-9]', '', 'g')) >= 9
  ),
  add constraint event_inquiries_email_format check (
    email = btrim(email)
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  );
