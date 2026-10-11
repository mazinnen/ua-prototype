# カード画像

カード画像はタイトルごとにフォルダーを分けてPNG形式で配置します。

```text
assets/
  cards/
    <title-id>/
      <card-id>.png
```

例: `assets/cards/blue-lock/ua-bl-001.png`

アプリ内蔵カタログでは、カードデータの `image` にアプリのルートからの相対パスを設定すると、一人回しのカード表示に画像が使われます。

```js
{ id: "ua-bl-001", name: "カード名", titleId: "blue-lock", image: "assets/cards/blue-lock/ua-bl-001.png" }
```

画像を追加するときは、利用許諾のあるファイルだけを登録してください。画像ファイル自体はこのサンプルには含めていません。

## 外部カタログでカードを追加する

新タイトルやカードをアプリの再デプロイなしで追加する場合は、PNG画像と `catalog.json` をCORSを許可したHTTPSの公開領域に置きます。アプリのデッキ一覧にある「外部カードカタログ」にJSONのURLを登録すると、以降は起動時に最新データを読み込みます。JSON内の画像パスは、JSONファイルのURLからの相対パスでも指定できます。

```text
public-card-data/
  catalog.json
  cards/
    blue-lock/
      ua-bl-001.png
```

JSONの形式は [`catalog.example.json`](./catalog.example.json) を参照してください。新タイトルを追加する場合は `titles` にタイトル情報を加え、`cards` に各カードの `titleId` とカードデータを登録します。カードIDはカタログ全体で一意にしてください。

JSONの配信元はブラウザーから取得できる必要があるため、HTTPSに加えてCORSでアプリの配信元（または `*`）を許可してください。Google Driveの共有リンクはJSON取得時のCORSやURL形式が安定しないため、そのままカタログURLにする方法は推奨しません。Driveを使う場合は、JSONをCORS対応のHTTPSエンドポイント経由で公開してください。画像は一般公開されたPNGの直接URLを指定します。

カード一覧の属性（タイトル、ID、名前、色、コスト、BP、種類、画像）はこのJSONで管理します。タイトル発売後は、公開領域のPNGとJSONを更新すればカード一覧に反映されます。カード効果などの詳細ルール処理は別途アプリ側の実装が必要です。

## Supabaseの共有カタログにカードを追加する

Supabase連携を利用している場合、`assets/cards/catalog.json`をカード情報の管理元として更新し、生成したSQLをSupabaseへ適用します。カード情報の追加・更新だけなら、GitHub Pagesの再デプロイは不要です。

1. `catalog.json`の`cards`にカード情報を追加します。新しいタイトルの場合は、`titles`にもタイトルの`id`と`name`を追加し、カードの`titleId`にそのIDを指定します。カード`id`はカタログ全体で一意にしてください。項目と形式は同じフォルダーの[`catalog.example.json`](./catalog.example.json)を参照してください。
2. 画像を使う場合は、ブラウザーから直接取得できる公開PNG URLを`image`に設定します。Supabase Storageを使う場合は、公開バケットに画像を置き、その公開URLを設定してください。画像はこのSQLには含まれず、Supabaseのデータベースにも保存されません。
3. リポジトリのルートでSQLを生成します。

   ```powershell
   node scripts\catalog-to-sql.js
   ```

4. 生成された[`supabase/catalog-seed.sql`](../../supabase/catalog-seed.sql)を開き、内容をSupabaseダッシュボードの **SQL Editor** で実行します。初回は先に[`supabase/schema.sql`](../../supabase/schema.sql)を実行してテーブルを作成してください。

このSQLは、カードIDが既に登録されていればそのカード情報を更新し、未登録なら追加します。同じSQLを再実行しても同じIDのカードが重複しません。カタログからカードを削除しただけではSupabase上のカードは削除されないため、不要カードの削除はSupabase SQL Editorで別途行ってください。

## シュタインズ・ゲートのカタログ

[`catalog.json`](./catalog.json)には、公式カードリストをもとにしたシュタインズ・ゲートのカード情報を収録しています。通常カード、パラレル版、アクションポイントカードを含み、画像は公式サイトのPNGを参照します。アプリで利用するには、このJSONをHTTPS/CORS対応の公開領域に配置して外部カードカタログURLに登録してください。カード画像そのものはリポジトリには保存していません。
