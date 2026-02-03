# futsal-scoreboard-app

フットサルの試合スコアを記録し、結果カードを生成・共有するアプリです（Next.js / Supabase）。

## 開発

`src/futsal-scoresheet/` 配下がアプリ本体です。

```bash
cd src/futsal-scoresheet
npm install
npm run dev
```

## Supabase

DBスキーマは `src/futsal-scoresheet/supabase/migrations/` にあります。必要に応じて Supabase の SQL Editor で実行してください。
