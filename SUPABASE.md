# Supabase setup

The app is a static GitHub Pages site. Supabase provides email/password authentication, private per-user decks, and a shared read-only card catalog. Local storage remains enabled as a browser cache and offline fallback.

## 1. Create the project and database schema

1. Create a Supabase project and save its database password somewhere private.
2. Open **SQL Editor** in the Supabase dashboard.
3. Run the contents of [`supabase/schema.sql`](./supabase/schema.sql).

The schema enables Row Level Security (RLS). Signed-in users can only read and change rows whose `user_id` is their own. The card catalog is public read-only; maintain it from the Supabase dashboard/SQL editor.

## 2. Configure email/password authentication

In **Authentication → URL Configuration**:

- Set the Site URL to the deployed site, for example `https://mazinnen.github.io/ua-prototype/`.
- Add the deployed site URL and local development URL (for example `http://127.0.0.1:8765/`) to Redirect URLs.
- Keep email confirmation enabled for account creation. Users confirm their email before their first login.

## 3. Set the browser-safe client credentials

Copy the Project URL and the public anon/publishable key from **Project Settings → API** into [`supabase-config.js`](./supabase-config.js):

```js
window.UNION_DECK_SUPABASE = {
  url: "https://YOUR-PROJECT.supabase.co",
  anonKey: "YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY",
};
```

These values are intended to be present in a browser app. **Never put the `service_role` key or database password in this file or in GitHub Pages.** RLS is the security boundary for the public key.

## 4. Manage the shared card catalog

The app reads titles and cards directly from the Supabase `titles` and `cards` tables. Manage all catalog additions, edits, and removals in the Supabase dashboard's **SQL Editor**; there is no external JSON catalog setting in the app. Card image files remain outside the database, so store their public PNG URLs in the `image` column (for example, from a public Supabase Storage bucket).

For the initial catalog import, run [`supabase/catalog-seed.sql`](./supabase/catalog-seed.sql) in SQL Editor. It contains the checked-in sample catalog. Do not regenerate and rerun this seed for routine updates; make future catalog changes directly in the database so the database remains the single source of truth.

For example, add or update a title and card with:

```sql
insert into public.titles (id, name)
values ('NEW-TITLE', 'タイトル名')
on conflict (id) do update set name = excluded.name, updated_at = now();

insert into public.cards (
  id, title_id, name, color, cost, bp, type, symbol, image, card_number, rarity, effect
)
values (
  'NEW-TITLE-001', 'NEW-TITLE', 'カード名', 'red', 1, 2000,
  'キャラクター', '記', 'https://example.com/card.png', 'UA00BT/001', 'C', '効果テキスト'
)
on conflict (id) do update set
  title_id = excluded.title_id,
  name = excluded.name,
  color = excluded.color,
  cost = excluded.cost,
  bp = excluded.bp,
  type = excluded.type,
  symbol = excluded.symbol,
  image = excluded.image,
  card_number = excluded.card_number,
  rarity = excluded.rarity,
  effect = excluded.effect,
  updated_at = now();
```

Adding or updating database rows does not require redeploying the static app. App code or Supabase configuration changes do.

## 5. Sign in and move local decks to the cloud

Deploy the configured app, open it, and use **ログイン → アカウント作成**. On first login, the app asks whether to upload this browser's local decks if the account has none. Existing cloud decks take precedence; the current browser's prior local data is backed up under `union-deck-lab-decks-v1-before-cloud` in local storage. Download a JSON backup before switching accounts or browsers if you need to retain local-only decks.

Every deck edit is saved locally first and then synchronized to the signed-in user's account. On another browser, open the same deployed URL and sign in with the same account. Without a configured Supabase project, the app continues to use local storage.

## 6. Play a friend match

On the solo-play screen, select a deck and create a room. Share the displayed six-character code with one friend; they select their deck, enter the code, and join. The two players' field cards, rotations, turn number, hand/deck/life counts, and public trash/removed cards are broadcast live through Supabase Realtime. Hand contents, deck order, and life-card identities are not shared. The room is temporary and disappears when both players leave; no room table or additional schema is required.

Anyone who knows the room code can join and see the public board state, so share it only with the intended friend. This first version synchronizes board display only; it does not enforce game rules or turn ownership, prevent either player from making any manual move, or provide anti-cheat protection. The app remains a manual playtest tool, not an authoritative competitive game server.

## Development notes

- Do not commit project secrets. The URL and public key are not secrets, but use a separate Supabase project for development if desired.
- Email confirmation and password policies are controlled in the Supabase Auth dashboard.
- Free-plan quotas and inactivity/pause rules can change; check the current [Supabase pricing page](https://supabase.com/pricing).
