<div align="center">

# OpenCode Remote

[English](./README.md) | [简体中文](./README.zh-CN.md) | **[日本語](./README.ja.md)** | [한국어](./README.ko.md)

**どこからでも、どんなデバイスからでも OpenCode にアクセス**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![OpenCode](https://img.shields.io/badge/OpenCode-1.1.15+-green.svg)](https://opencode.ai)

<img src="https://opencode.ai/logo.svg" alt="OpenCode Remote" width="120" />

*高性能ワークステーションで AI コーディングエージェントを実行し、タブレット、スマートフォン、または任意のブラウザからアクセス — インターネット経由でも。*

</div>

---

## なぜ OpenCode Remote？

OpenCode のような AI コーディングエージェントは、以下の条件を満たすマシンで実行する必要があります：
- コードベースと開発環境へのアクセス
- 適切な API キーと設定
- 十分な計算能力

でも、**ソファでスマホを使いたい**、**iPad でペアプログラミングしたい**、**世界中どこからでも開発マシンにアクセスしたい**場合はどうしますか？

**OpenCode Remote** は、ブラウザを持つ任意のデバイスから動作する Web インターフェースを提供することで、この問題を解決します。

### 主な機能

| 機能 | 説明 |
|------|------|
| **任意端末からのリモートアクセス** | スマホ、タブレット、ノートPC など、ブラウザを持つ任意のデバイスからクリーンな Web UI で OpenCode にアクセス |
| **ワンクリック公開トンネル** | Cloudflare Tunnel でワンクリックでインターネットアクセスを有効化 — ポートフォワーディングや VPN 不要 |
| **LAN アクセス** | ローカルネットワーク上の任意のデバイスから即座にアクセス可能 |
| **QR コード接続** | モバイルデバイスからスキャンで接続 — URL 入力不要 |
| **デフォルトで安全** | セッションごとにランダムな 6 桁のアクセスコードを使用 |
| **リアルタイムストリーミング** | Server-Sent Events による ライブメッセージストリーミング |
| **フル機能対応** | すべての OpenCode 機能が Web UI でシームレスに動作 |
| **公式 OpenCode UI** | 完全な機能を備えた OpenCode ウェブアプリにアクセス |
| **クロスデバイス同期** | 複数のデバイス間でシームレスに作業を継続 |

---

## クイックスタート

### 前提条件

- [Bun](https://bun.sh)（推奨）または Node.js 18+
- [OpenCode CLI](https://opencode.ai) がインストール済み

### インストール

```bash
# リポジトリをクローン（サブモジュール含む）
git clone --recursive https://github.com/realDuang/opencode-remote.git
cd opencode-remote

# 依存関係をインストール
bun install

# 公式 OpenCode アプリをビルド（初回のみ）
bun run build:official-app

# アプリケーションを起動
bun run start
```

> **注意**: `--recursive` なしでクローンした場合は、`git submodule update --init` を実行して OpenCode サブモジュールを初期化してください。

### 起動時の動作

1. ランダムな **6 桁のアクセスコード**が生成されターミナルに表示
2. OpenCode サーバーがポート `4096` で起動
3. Web UI がポート `5174` で起動
4. `http://localhost:5174` を開いてアクセスコードを入力

```
============================================================
Starting OpenCode Remote
============================================================

Access Code: 847291

Starting OpenCode Server...
Starting Web UI...

============================================================
All services started!
Web UI: http://localhost:5174
Use code: 847291
============================================================
```

---

## 2つの UI オプション

OpenCode Remote は OpenCode にアクセスする2つの方法を提供します：

### 1. シンプルチャット UI（デフォルト）

クイックインタラクション向けに最適化された軽量でモバイルフレンドリーなチャットインターフェース。ログイン後、ルート URL でアクセスできます。

### 2. 公式 OpenCode UI

すべての機能を備えた完全な OpenCode ウェブアプリケーション。チャットページの右上にある **「公式 UI」** ボタンをクリックしてアクセスします。

| 機能 | シンプルチャット UI | 公式 OpenCode UI |
|------|-------------------|-----------------|
| モバイル最適化 | ✅ | ⚠️ デスクトップ向け |
| フル機能 | 基本チャット | ✅ 完全 |
| クロスデバイス同期 | ✅ | ✅ |
| 軽量 | ✅ | 重め |

**クロスデバイス同期**: セッション状態（現在のプロジェクト、レイアウト設定）がすべてのデバイス間で自動的に同期されます。

---

## リモートアクセスガイド

### 方法1：LAN アクセス（同一ネットワーク）

ローカルネットワーク上の任意のデバイスからアクセス：

1. マシンの IP アドレスを確認（リモートアクセスページに表示）
2. 他のデバイスから `http://<あなたのIP>:5174` を開く
3. 6 桁のアクセスコードを入力

**またはリモートアクセスページに表示される QR コードをスキャン。**

### 方法2：パブリックインターネットアクセス

Cloudflare Tunnel で世界中どこからでもアクセス：

1. `cloudflared` をインストール（`bun run setup` でガイド付きインストール）
2. Web UI で **設定** → **リモートアクセス** に移動
3. **「パブリックアクセス」** をオン
4. 生成された `*.trycloudflare.com` URL を共有

**ポートフォワーディング不要、ファイアウォール変更不要、VPN 不要。**

```
┌──────────────────────────────────────────────────────────┐
│                  あなたのスマホ/タブレット                 │
│                          ↓                                │
│              https://xyz.trycloudflare.com                │
│                          ↓                                │
│                 Cloudflare ネットワーク                    │
│                          ↓                                │
│             あなたのワークステーション (OpenCode)           │
└──────────────────────────────────────────────────────────┘
```

---

## ユースケース

### どこでも作業
高性能デスクトップで OpenCode を実行し、カフェのノートパソコンから操作。

### モバイルコーディングアシスタント
紙やホワイトボードでコードをレビューしながら、スマホで AI の助けを借りる。

### ペアプログラミング
パブリック URL を同僚と共有し、リアルタイムでコラボレーション。

### ホームサーバー設定
ホームサーバーで実行し、家中の任意のデバイスからアクセス。

---

## セキュリティ

OpenCode Remote は複数のセキュリティレイヤーを使用：

| レイヤー | 保護 |
|----------|------|
| **アクセスコード** | セッションごとにランダムな 6 桁のコードが必要 |
| **トークン認証** | ログイン後、JWT ライクなトークンを localStorage に保存 |
| **HTTPS** | パブリックトンネルは Cloudflare 経由で自動的に HTTPS を使用 |
| **一時的な URL** | トンネルを起動するたびにパブリック URL が変更 |

**ベストプラクティス：**
- アクセスコードを公開しない
- 使用しないときはパブリックトンネルを無効化
- 個人使用のみ — マルチユーザーシナリオには設計されていません

---

## 開発

### コマンド

```bash
# すべてを起動（OpenCode サーバー + Web UI）
bun run start

# 開発モード（Web UI のみ、OpenCode サーバーは手動で起動が必要）
bun run dev

# オプションの依存関係をインストール（cloudflared など）
bun run setup

# 本番ビルド
bun run build

# 公式 OpenCode アプリをビルド/再ビルド
bun run build:official-app

# OpenCode サブモジュールを更新して公式アプリを再ビルド
bun run update:official-app

# 型チェック
bunx tsc --noEmit
```

### プロジェクト構造

```
opencode-remote/
├── src/
│   ├── pages/           # ページコンポーネント (Chat, Login, Settings, RemoteAccess, OfficialApp)
│   ├── components/      # UI コンポーネント
│   ├── lib/             # コアライブラリ (API クライアント, 認証, i18n, ストレージ同期)
│   ├── stores/          # 状態管理
│   └── types/           # TypeScript 型定義
├── scripts/
│   ├── start.ts         # 起動スクリプト
│   ├── setup.ts         # 依存関係セットアップ
│   └── build-official-app.ts  # 公式アプリビルドスクリプト
├── opencode/            # OpenCode サブモジュール（公式アプリ用）
└── vite.config.ts       # Vite 設定（認証ミドルウェア含む）
```

---

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | SolidJS |
| ビルドツール | Vite |
| スタイリング | Tailwind CSS |
| 言語 | TypeScript |
| パッケージマネージャー | Bun |
| トンネル | Cloudflare Tunnel |

---

## トラブルシューティング

### OpenCode CLI が見つからない

```bash
# セットアップスクリプトを実行してガイド付きインストール
bun run setup

# または手動でインストール：
# macOS/Linux
curl -fsSL https://opencode.ai/install.sh | bash

# Windows
irm https://opencode.ai/install.ps1 | iex
```

### ポートが使用中

```bash
# ポート 5174 を使用しているプロセスを終了
lsof -ti:5174 | xargs kill -9

# または vite.config.ts でポートを変更
```

### パブリックトンネルが動作しない

1. `cloudflared` がインストールされていることを確認：`bun run setup`
2. インターネット接続を確認
3. リモートアクセスページからトンネルを再起動してみる

### 公式アプリが読み込まれない

1. サブモジュールが初期化されていることを確認：`git submodule update --init`
2. 公式アプリをビルド：`bun run build:official-app`
3. ビルドが失敗した場合、`bun` がインストールされていることを確認して再試行

---

## コントリビューション

コントリビューション歓迎！PR を提出する前にコントリビューションガイドラインをお読みください。

### コードスタイル
- TypeScript 厳格モード
- SolidJS リアクティブパターン
- スタイリングには Tailwind を使用

### コミット規約
- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント
- `refactor:` コードリファクタリング

---

## ライセンス

[MIT](LICENSE)

---

## リンク

- [OpenCode](https://opencode.ai) — AI コーディングエージェント
- [ドキュメント](https://opencode.ai/docs) — OpenCode ドキュメント
- [イシュー](https://github.com/realDuang/opencode-remote/issues) — バグ報告や機能リクエスト

---

<div align="center">

**[OpenCode](https://opencode.ai) と [SolidJS](https://solidjs.com) で構築**

</div>
