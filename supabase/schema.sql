create table if not exists public.titles (
  id text primary key,
  name text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.cards (
  id text primary key,
  title_id text not null references public.titles (id) on update cascade on delete restrict,
  name text not null,
  color text not null,
  cost integer not null check (cost >= 0),
  bp integer not null default 0 check (bp >= 0),
  type text not null,
  symbol text not null default '',
  image text,
  card_number text,
  rarity text,
  ap_cost integer,
  required_energy integer,
  generated_energy integer,
  effect text,
  updated_at timestamptz not null default now()
);

create index if not exists cards_title_id_idx on public.cards (title_id);

create table if not exists public.user_decks (
  user_id uuid not null references auth.users (id) on delete cascade,
  deck_id text not null,
  deck_data jsonb not null check (jsonb_typeof(deck_data) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (user_id, deck_id)
);

alter table public.titles enable row level security;
alter table public.cards enable row level security;
alter table public.user_decks enable row level security;

drop policy if exists "Titles are readable by everyone" on public.titles;
create policy "Titles are readable by everyone"
  on public.titles for select
  to anon, authenticated
  using (true);

drop policy if exists "Cards are readable by everyone" on public.cards;
create policy "Cards are readable by everyone"
  on public.cards for select
  to anon, authenticated
  using (true);

drop policy if exists "Users can read their own decks" on public.user_decks;
create policy "Users can read their own decks"
  on public.user_decks for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own decks" on public.user_decks;
create policy "Users can create their own decks"
  on public.user_decks for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own decks" on public.user_decks;
create policy "Users can update their own decks"
  on public.user_decks for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own decks" on public.user_decks;
create policy "Users can delete their own decks"
  on public.user_decks for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select on public.titles, public.cards to anon, authenticated;
grant select, insert, update, delete on public.user_decks to authenticated;
