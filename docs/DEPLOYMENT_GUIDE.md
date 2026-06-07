# Chrome Web Store 自動デプロイ設定ガイド

このガイドでは、GitHub Actions を使用して `html-downloader` を自動的に Chrome Web Store へアップロード(下書き保存)するための認証情報取得手順を説明します。

## ステップ 1: Chrome Web Store に下書きを登録する
1. [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/) にアクセスします。
2. 「新しいアイテム」を追加し、手動で一度ビルドした `html_downloader.zip` をアップロードします。
3. アップロード後に表示される **アイテム ID** をコピーします。これが `EXTENSION_ID` です。

## ステップ 2: Google Cloud API の設定
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセスし、新しいプロジェクトを作成します。
2. **API とサービス > ライブラリ** から "Chrome Web Store API" を検索し、有効化します。
3. **API とサービス > 認証情報** から「認証情報を作成 > OAuth クライアント ID」を選択します。
   - アプリケーションの種類: 「デスクトップ アプリ」を選択。
   - 名前: 「Chrome Web Store Deployment」など。
4. 作成された **クライアント ID** (`CLIENT_ID`) と **クライアント シークレット** (`CLIENT_SECRET`) を控えます。

## ステップ 3: リフレッシュトークンの取得
1. [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) にアクセスします。
2. 右上の設定アイコン(歯車)をクリックし、"Use your own OAuth credentials" にチェックを入れ、ステップ 2 で取得した ID とシークレットを入力します。
3. 左側の "Step 1" で、`https://www.googleapis.com/auth/chromewebstore` を入力し、"Authorize APIs" をクリックします。
4. Google アカウントでログインし、権限を許可します。
5. "Step 2" で "Exchange authorization code for tokens" をクリックします。
6. 表示された **Refresh Token** (`REFRESH_TOKEN`) をコピーします。

## ステップ 4: GitHub Secrets への登録
GitHub リポジトリの `Settings > Secrets and variables > Actions` に移動し、以下の 4 つの New repository secret を登録します。

- `EXTENSION_ID`
- `CLIENT_ID`
- `CLIENT_SECRET`
- `REFRESH_TOKEN`

---
これで準備は完了です!今後 `main` ブランチにプッシュ(またはPRをマージ)するたびに、自動的にバージョンが上がり、ストアに下書きがアップロードされます。
