# HTML Downloader

現在閲覧中のWebページをローカルファイルとして保存するChrome拡張機能。

## 機能

| 保存モード | 形式     | 内容                                          |
| ---------- | -------- | --------------------------------------------- |
| HTMLのみ   | `.html`  | 現在のDOMスナップショット(テキスト・構造のみ) |
| ページ全体 | `.mhtml` | 画像・CSS・JSを含む完全なアーカイブ           |
| Markdown   | `.md`    | テキストと数値を抽出したMarkdown形式          |

- ダウンロード完了後、保存先フォルダをワンクリックで開く機能
- ファイル名はページタイトルから自動生成(禁止文字は自動サニタイズ)
- 構造を解析してMarkdown形式での出力に対応（新規）

## 開発とインストール

### 開発環境でのインストール

1. `chrome://extensions/` を開く
2. 「デベロッパーモード」を有効にする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. **`src` ディレクトリ**を選択

### 配布用パッケージの作成

以下のコマンドを実行すると、ルートディレクトリに `html_downloader.zip` が生成されます。

```bash
npm install
npm run build
```

## 技術仕様

- **Manifest Version**: 3
- **権限**: `activeTab`, `scripting`, `downloads`, `pageCapture`
- **対象ブラウザ**: Google Chrome (Chromium系)
- **テスト基盤**: Vitest (Unit, Integration, System Testing)
- **コード品質**: ESLint, Prettier (100文字制限)

## プロジェクト構成

```
Ayato Site Downloader/
  src/            # 拡張機能の本体ソースコード
    manifest.json # 拡張機能の定義
    popup.html    # ポップアップUI
    popup.js      # ポップアップロジック
    converter.js  # Markdown変換コアロジック
    style.css     # スタイル定義
    icons/        # アイコン素材
  tests/          # 自動テストコード
  docs/           # ドキュメント (ADR, 要件定義等)
  package.json    # プロジェクト管理・ビルドスクリプト
  html_downloader.zip # 配布用パッケージ（ビルド後に生成）
```

## 制約

- `chrome://` や `chrome-extension://` 等のシステムページでは動作しない(ブラウザのセキュリティ制限)
- HTMLのみモードでは外部リソース(画像・CSS等)は保存対象外
