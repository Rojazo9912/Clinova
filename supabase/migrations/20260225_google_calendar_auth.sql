-- Agrega columnas a la tabla profiles para almacenar los tokens de Google Calendar
alter table public.profiles 
add column if not exists gcal_access_token text,
add column if not exists gcal_refresh_token text,
add column if not exists gcal_token_expiry timestamptz,
add column if not exists gcal_calendar_id text;
