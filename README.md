# StudyForge 📚⚡

タイマーで勉強時間を正確に記録し、統計グラフで振り返り、Gemini AIに質問しながら学習できる、黒基調のモダンな学習支援アプリです。

- ⏱ **勉強タイマー** — 開始・一時停止してもズレない正確な計測
- 📊 **統計** — 時系列の推移グラフ・科目別グラフ
- 🤖 **AIチャット** — Gemini API と連携し、勉強記録を踏まえた質問・アドバイス
- 🎵 **作業用BGM** — YouTube動画を埋め込んで再生
- ☁️ **アカウント連携** — Googleログイン + Firestoreでデータを複数端末に同期

このREADMEは、**プログラミング初心者の方でも実際に自分のアプリとして動かせる**ことを目標に、手順を省略せずに書いています。上から順番に進めてください。

---

## 目次

1. [事前に必要なもの](#1-事前に必要なもの)
2. [プロジェクトの取得とインストール](#2-プロジェクトの取得とインストール)
3. [Firebaseのセットアップ（アカウント連携・データ保存）](#3-firebaseのセットアップアカウント連携データ保存)
4. [Gemini APIキーの取得](#4-gemini-apiキーの取得)
5. [ローカルで動かす](#5-ローカルで動かす)
6. [GitHub Pagesへの公開](#6-github-pagesへの公開)
7. [よくあるトラブル](#7-よくあるトラブル)
8. [フォルダ構成](#8-フォルダ構成)
9. [セキュリティに関する注意](#9-セキュリティに関する注意)

---

## 1. 事前に必要なもの

以下をまだ持っていない場合は、先にインストール・準備してください。

| 必要なもの | 用途 | 入手先 |
|---|---|---|
| Node.js（v18以上推奨） | アプリを動かすための実行環境 | https://nodejs.org/ja （「LTS」版をダウンロード） |
| Googleアカウント | Firebase・Gemini APIキー取得に使用 | 既にお持ちのもので構いません |
| GitHubアカウント | コードの公開・デプロイに使用 | https://github.com/ |
| Git | GitHubへのアップロードに使用 | https://git-scm.com/ |

Node.jsをインストールしたら、ターミナル（Macは「ターミナル」、Windowsは「コマンドプロンプト」または「PowerShell」）で以下を実行し、バージョンが表示されればOKです。

```bash
node -v
npm -v
```

---

## 2. プロジェクトの取得とインストール

このリポジトリをダウンロード（または `git clone`）した後、フォルダに移動して依存パッケージをインストールします。

```bash
cd study-forge
npm install
```

これで `node_modules` フォルダが作られ、必要なライブラリ（React、Firebase、Chart.jsなど）がすべてダウンロードされます。数分かかることがあります。

---

## 3. Firebaseのセットアップ（アカウント連携・データ保存）

Googleログインと、勉強記録をクラウドに保存する機能のために、**Firebase**というGoogleの無料サービスを使います。クレジットカード登録は不要です。

### 3-1. Firebaseプロジェクトを作る

1. https://console.firebase.google.com/ を開き、Googleアカウントでログインします。
2. 「プロジェクトを追加」をクリックします。
3. プロジェクト名を入力します（例: `study-forge`）。
4. Googleアナリティクスは「有効にしない」を選んでOKです（不要な機能です）。
5. 「プロジェクトを作成」をクリックし、完了するまで待ちます。

### 3-2. Webアプリを登録する

1. プロジェクトのトップ画面で `</>`（Webアプリのアイコン）をクリックします。
2. アプリのニックネームを入力します（例: `study-forge-web`）。
3. 「Firebase Hosting」のチェックボックスは**チェックしなくてOK**です（GitHub Pagesを使うため）。
4. 「アプリを登録」をクリックすると、以下のような設定情報（`firebaseConfig`）が表示されます。**この画面を閉じないでください**（後で使います）。

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "study-forge-xxxx.firebaseapp.com",
  projectId: "study-forge-xxxx",
  storageBucket: "study-forge-xxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 3-3. Googleログインを有効にする

1. 左メニューの「構築」→「Authentication」を開きます。
2. 「始める」をクリックします。
3. 「Sign-in method」タブで「Google」を選択し、有効にする（トグルをON）→保存します。

### 3-4. Firestore（データベース）を作る

1. 左メニューの「構築」→「Firestore Database」を開きます。
2. 「データベースの作成」をクリックします。
3. ロケーションは `asia-northeast1`（東京）などお好みで選び、「次へ」。
4. **本番環境モードで開始**を選択して「作成」します。

### 3-5. セキュリティルールを設定する

このままだと誰もデータを読み書きできない状態なので、「自分のデータだけ読み書きできる」ルールを設定します。

1. Firestore Databaseの画面で「ルール」タブを開きます。
2. 中身をすべて削除し、このプロジェクトに含まれる `firestore.rules` ファイルの内容をコピーして貼り付けます。
3. 「公開」をクリックします。

これで、ログインした本人だけが自分のデータを読み書きできるようになります。

### 3-6. 環境変数ファイルを作る

プロジェクトのルートフォルダにある `.env.example` をコピーして `.env.local` という名前のファイルを作ります。

```bash
cp .env.example .env.local
```

`.env.local` をテキストエディタで開き、3-2で表示された `firebaseConfig` の値を、それぞれ対応する項目に入力します。

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=study-forge-xxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=study-forge-xxxx
VITE_FIREBASE_STORAGE_BUCKET=study-forge-xxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

> ⚠️ `.env.local` は `.gitignore` に含まれているため、GitHubには公開されません。安心してAPIキーを入力してください。

### 3-7. ログインを許可するドメインを追加する（公開時に必要）

GitHub Pagesで公開したあと、そのURL（例: `https://your-name.github.io`）からログインできるようにする設定です。

1. Firebaseコンソールの「Authentication」→「Settings」タブ→「承認済みドメイン」を開きます。
2. 「ドメインを追加」をクリックし、`your-name.github.io` を追加します（`https://` は不要）。

---

## 4. Gemini APIキーの取得

AIチャット機能では、Googleの **Gemini API**（`gemini-flash-lite-latest` モデル）を使います。こちらも無料枠があります。

1. https://aistudio.google.com/apikey を開き、Googleアカウントでログインします。
2. 「Create API key」（APIキーを作成）をクリックします。
3. 表示された文字列（`AIzaSy` から始まるもの）をコピーします。

このAPIキーは `.env` ファイルには入れません。アプリを起動した後、**アプリ内の「設定」画面から直接入力**してください（Firestoreに保存され、複数端末で共有されます）。

> 💡 APIキーは他人に教えないでください。第三者があなたのAPIキーを使うと、あなたのGoogleアカウントの利用枠が消費されます。

---

## 5. ローカルで動かす

ここまで完了したら、以下のコマンドで開発サーバーを起動します。

```bash
npm run dev
```

ターミナルに表示される `http://localhost:5173` をブラウザで開けば、アプリが表示されます。

1. サイドバーの「Googleでログイン」をクリックしてログインします。
2. 「設定」画面を開き、Gemini APIキーを貼り付けて「保存」→「接続テスト」で確認します。
3. 「勉強タイマー」で計測してみましょう。

---

## 6. GitHub Pagesへの公開

### 6-1. GitHubリポジトリを作る

1. GitHubで新しいリポジトリを作成します（例: `study-forge`）。Public/Privateどちらでも構いません。
2. ローカルのプロジェクトフォルダで以下を実行し、コードをアップロードします。

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/study-forge.git
git push -u origin main
```

### 6-2. base pathを設定する

GitHub Pagesでは `https://あなたのユーザー名.github.io/study-forge/` のようにリポジトリ名がURLの一部になります。このため、ビルド時に `VITE_BASE_PATH` を設定する必要があります。

`package.json` に以下の1行を追加してください（`study-forge` の部分は実際のリポジトリ名に置き換えます）。

```json
"homepage": "https://あなたのユーザー名.github.io/study-forge/",
```

### 6-3. デプロイする

```bash
VITE_BASE_PATH=/study-forge/ npm run build
npm run deploy
```

Windowsのコマンドプロンプトを使っている場合は、代わりに以下のように2行に分けて実行してください。

```bash
set VITE_BASE_PATH=/study-forge/
npm run build
npm run deploy
```

`npm run deploy` は `gh-pages` パッケージを使って `dist` フォルダの内容を `gh-pages` ブランチに自動でプッシュします。

### 6-4. GitHub Pagesを有効化する

1. GitHubのリポジトリページで「Settings」→「Pages」を開きます。
2. 「Branch」で `gh-pages` を選択し、「Save」をクリックします。
3. 数分待つと、`https://あなたのユーザー名.github.io/study-forge/` でアプリが公開されます。

### 6-5. 公開後の確認

- 3-7で「承認済みドメイン」に `あなたのユーザー名.github.io` を追加したか確認してください（追加していないとログインが失敗します）。
- Firestoreに保存したデータは、公開後もそのまま同じFirebaseプロジェクトを参照するので引き継がれます。

---

## 7. よくあるトラブル

| 症状 | 原因と対処 |
|---|---|
| `npm install` がエラーになる | Node.jsのバージョンが古い可能性があります。18以上を入れ直してください。 |
| ログインボタンを押しても反応しない | `.env.local` の値が間違っているか未設定です。3-6をやり直してください。 |
| ログイン画面がポップアップでブロックされる | ブラウザのポップアップブロックを一時的に許可してください。 |
| 公開後にログインが失敗する（`auth/unauthorized-domain`） | 3-7の「承認済みドメイン」への追加を忘れています。 |
| AIチャットが「APIキーが設定されていません」と出る | 「設定」画面でGemini APIキーを保存してください。 |
| AIチャットでエラーが出る | APIキーが正しいか、Google AI Studio側で利用制限に達していないか確認してください。 |
| GitHub Pagesで真っ白なページになる | `VITE_BASE_PATH` とリポジトリ名が一致しているか、`homepage` の設定を確認してください。 |
| データがリロードで消える | ログインしていない状態では、データはこのブラウザの中だけ（localStorage）に保存されます。複数端末で使うにはログインが必要です。 |

---

## 8. フォルダ構成

```
study-forge/
├── src/
│   ├── components/     # 共通UIパーツ（レイアウト、ヘッダーなど）
│   ├── contexts/        # 認証・勉強データの状態管理
│   ├── hooks/            # タイマーなどのカスタムフック
│   ├── lib/              # Firebase・Firestore・Gemini APIとの通信処理
│   ├── pages/            # 各画面（ダッシュボード・タイマー・統計・チャット・BGM・設定）
│   ├── styles/           # グローバルCSS（Tailwind）
│   ├── App.jsx            # ルーティング定義
│   └── main.jsx           # エントリポイント
├── firestore.rules        # Firestoreのセキュリティルール
├── .env.example            # 環境変数のテンプレート
├── tailwind.config.js       # デザイントークン（色・フォントなど）
└── vite.config.js            # ビルド設定
```

---

## 9. セキュリティに関する注意

- Gemini APIキーはFirestore（ログイン時）またはブラウザのlocalStorage（未ログイン時）に平文に近い形で保存されます。共有パソコンで使う場合は、使用後にログアウトすることをおすすめします。
- `firestore.rules` は「ログインした本人のデータのみ読み書き可能」というルールになっています。このルールを削除・緩和すると、他人のデータが読めてしまう可能性があるため変更しないでください。
- `.env.local` は絶対にGitHubにコミットしないでください（`.gitignore` で除外済みですが、誤って `git add -f` しないよう注意してください）。

---

## ライセンス

このプロジェクトは自由に改変・公開して構いません。学習目的での利用を想定しています。
