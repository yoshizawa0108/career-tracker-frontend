# Career Tracker Frontend

[career-tracker-api]に対応するフロントエンド。転職活動の企業・応募・面接を一元管理する。

---

# Tech Stack

* React 18
* TypeScript
* Vite
* Tailwind CSS

---

# Project Structure

```text
src/
├── api/
│   └── client.ts          # APIクライアント（fetchラッパー）
├── components/
│   ├── ui/                # 共通UIコンポーネント
│   ├── layout/             # サイドバーレイアウト
│   ├── dashboard/          # ダッシュボード画面
│   ├── companies/          # 企業管理画面
│   ├── applications/       # 応募管理画面
│   └── interviews/         # 面接管理画面
├── hooks/
│   └── useAsync.ts         # データ取得・更新用フック
├── lib/
│   └── utils.ts             # ステータスラベル・日付フォーマット等
└── types/
    └── api.ts              # APIレスポンスの型定義
```

---

# Setup

```bash
npm install
```

---

# Environment Variables

`.env`

```env
VITE_API_URL=http://localhost:8000
```

---

# Run Application

```bash
npm run dev
```

http://localhost:5173 で起動。

開発時は `vite.config.ts` のプロキシ設定により `/companies`、`/applications`、`/interviews` 等のAPIリクエストが自動的に `localhost:8000` へ転送される。

---

# Build

```bash
npm run build
```

---

# Type Check

```bash
npm run type-check
```

---

# Features

* 企業管理（一覧・登録・編集・削除）
* 応募管理（一覧・登録・編集・削除・ステータス絞り込み・検索）
* 面接管理（一覧・登録・編集・削除・種別絞り込み）
* ダッシュボード（応募数・内定数・直近の面接予定・直近の応募一覧）