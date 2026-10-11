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

## 4. Load card data into the shared catalog

The app reads shared titles and cards from the `titles` and `cards` tables. To generate an idempotent SQL seed from the checked-in catalog:

```powershell
node scripts\catalog-to-sql.js
```

Open the generated `supabase/catalog-seed.sql`, then run it in the Supabase SQL Editor. Re-run this after updating `assets/cards/catalog.json`. The script only generates SQL; it does not connect to Supabase or upload anything.

For future catalogs, add their title and card records to Supabase using the same columns as `supabase/schema.sql`. Card image files remain outside the database; store their public PNG URLs in the `image` column.

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
