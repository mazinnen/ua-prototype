# カードカタログ

カードのタイトル・データはSupabaseの `titles` / `cards` テーブルで管理し、画像は公開PNGのURLを `cards.image` に設定します。アプリは起動時にSupabaseからカタログを読み込みます。新しいカードの追加・編集・削除はSupabaseダッシュボードの **SQL Editor** で行ってください。アプリに外部JSONカタログを登録する機能はありません。

初期データ投入用に、[`catalog.json`](./catalog.json)と[`supabase/catalog-seed.sql`](../../supabase/catalog-seed.sql)をリポジトリに置いています。初回セットアップ時は[`SUPABASE.md`](../../SUPABASE.md)の手順でseed SQLを実行してください。以降の更新ではこのJSONやseed SQLを更新・再実行せず、Supabase上のデータを直接変更してください。カード情報だけの変更ならアプリの再デプロイは不要です。

## 画像の管理

画像は利用許諾のあるPNGを公開領域（例: Supabase Storageの公開バケット）に配置し、その直接URLを `cards.image` に保存します。画像ファイルそのものはデータベースに保存されません。

## 初期カタログに含まれるタイトル

初期seedには、公式カードリストをもとにした通常カード、パラレル版、アクションポイントカードが含まれます。画像は公式サイトのPNGを参照しています。

- シュタインズ・ゲート（STG）
- 天元突破グレンラガン（TTG、UA56BT）
