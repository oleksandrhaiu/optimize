-- ============================================================
-- Lumina – Migration v5: Security & auth fixes
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── 1. Username login (anon-safe email lookup) ───────────────────────────────

create or replace function public.get_login_email(p_username text)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select email
  from public.users
  where lower(username) = lower(trim(p_username))
  limit 1;
$$;

revoke all on function public.get_login_email(text) from public;
grant execute on function public.get_login_email(text) to anon, authenticated;

-- ─── 2. Friend logs: hide private / archived habits ─────────────────────────

drop policy if exists "Logs: read friend" on public.habit_logs;

create policy "Logs: read friend" on public.habit_logs
  for select using (
    public.are_friends(auth.uid(), user_id)
    and exists (
      select 1 from public.habits h
      where h.id = habit_logs.habit_id
        and h.is_private = false
        and h.is_archived = false
    )
  );

-- ─── 3. Invite tokens: restrict updates ───────────────────────────────────────

drop policy if exists "Tokens: update any" on public.invite_tokens;

create policy "Tokens: update own" on public.invite_tokens
  for update using (auth.uid() = creator_user_id);

-- ─── 4. Accept invite via RPC (accepter can mark token used) ──────────────────

create or replace function public.accept_invite(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.invite_tokens%rowtype;
  v_exists boolean;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'Not authenticated');
  end if;

  select * into v_row
  from public.invite_tokens
  where token = p_token and used = false
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Invalid or already used invite link.');
  end if;

  if v_row.creator_user_id = v_uid then
    return jsonb_build_object('ok', false, 'error', 'You cannot add yourself as a friend.');
  end if;

  select exists (
    select 1 from public.friendships
    where (user_a_id = v_uid and user_b_id = v_row.creator_user_id)
       or (user_a_id = v_row.creator_user_id and user_b_id = v_uid)
  ) into v_exists;

  if v_exists then
    return jsonb_build_object('ok', true, 'already_friends', true);
  end if;

  insert into public.friendships (user_a_id, user_b_id, status)
  values (v_row.creator_user_id, v_uid, 'accepted');

  update public.invite_tokens set used = true where id = v_row.id;

  return jsonb_build_object('ok', true, 'already_friends', false);
exception
  when others then
    return jsonb_build_object('ok', false, 'error', sqlerrm);
end;
$$;

revoke all on function public.accept_invite(text) from public;
grant execute on function public.accept_invite(text) to authenticated;
