# HTML Downloader 自動デプロイ設定ガイド

このプロジェクトはGitHub Actionsを使用して、`main` ブランチへのマージ時に自動でバージョンをインクリメントし、Chrome Web Storeへアップロード(Draft状態)するCDパイプラインが構築されています。

このパイプラインを機能させるためには、以下の初期設定が必要です。

## 1. Chrome Web Store API の設定

自動アップロードを行うためには、Google Cloud ConsoleでOAuth2.0の認証情報を取得する必要があります。

1. **Google Cloud Console** にアクセスし、新しいプロジェクトを作成します。
2. **APIとサービス > ライブラリ** から `Chrome Web Store API` を検索し、有効化します。
3. **OAuth 同意画面** を設定します(テスト用で十分です)。
4. **認証情報 > 認証情報を作成 > OAuth クライアント ID** を選択します。
   - アプリケーションの種類: `デスクトップ アプリ` または `その他の UI`
   - 名前: `Chrome Web Store Upload` など
5. 作成後、**クライアント ID (`CLIENT_ID`)** と **クライアント シークレット (`CLIENT_SECRET`)** が表示されるのでメモします。
6. 次のURLをブラウザで開き、アクセスを許可して **リフレッシュトークン (`REFRESH_TOKEN`)** を取得します。
   - `https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=【あなたのCLIENT_ID】&redirect_uri=urn:ietf:wg:oauth:2.0:oob`
   - 画面に表示された承認コードをコピーします。
   - ターミナル等で以下のリクエストを実行し、リフレッシュトークンを取得します。
     ```bash
     curl "https://accounts.google.com/o/oauth2/token" -d "client_id=【あなたのCLIENT_ID】&client_secret=【あなたのCLIENT_SECRET】&code=【先ほどコピーした承認コード】&grant_type=authorization_code&redirect_uri=urn:ietf:wg:oauth:2.0:oob"
     ```
   - レスポンス内の `"refresh_token"` の値をメモします。

## 2. GitHub Secrets の設定

GitHubリポジトリの設定画面から、先ほど取得した値をSecretとして登録します。

1. GitHub リポジトリを開き、**Settings > Secrets and variables > Actions** へ進みます。
2. **New repository secret** をクリックし、以下の4つを登録します。

| Name            | Secret                                         | 備考                                                |
| --------------- | ---------------------------------------------- | --------------------------------------------------- |
| `EXTENSION_ID`  | Chrome Web Store上の拡張機能ID                 | ストアのダッシュボード等で確認可能な `a-z` の32文字 |
| `CLIENT_ID`     | Google Cloudで取得したクライアントID           |                                                     |
| `CLIENT_SECRET` | Google Cloudで取得したクライアントシークレット |                                                     |
| `REFRESH_TOKEN` | 先ほどcurlで取得したリフレッシュトークン       |                                                     |

## 3. デプロイの運用

以上の設定が完了すると、`develop` から `main` へPRをマージするたびに以下のフローが自動実行されます。

1. **Semantic Release**: コミットメッセージ(`feat:`, `fix:` 等)を解析し、適切なバージョンアップ(例: `v1.0.0` -> `v1.1.0`)を自動で行います。
2. **manifest.json 更新**: 拡張機能のバージョン表記が自動的に書き換わります。
3. **ZIPパッケージ化**: 必要なファイルだけを含んだZIPファイルを作成します。
4. **Chrome Web Storeへのアップロード**: 構成されたZIPファイルがWeb Storeの開発者ダッシュボードへアップロードされます。

> **注意**: 現在のWorkflow(`.github/workflows/release.yml`)の設定は `publish: false` となっており、**下書き(Draft)状態**でのアップロードとなります。即時公開したい場合は、該当箇所を `publish: true` に変更してコミットしてください。
