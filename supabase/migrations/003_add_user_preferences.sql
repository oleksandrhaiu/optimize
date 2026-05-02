-- Add user preferences for themes and sound
alter table public.users
  add column if not exists theme text not null default 'green',
  add column if not exists sound_enabled boolean not null default true;
