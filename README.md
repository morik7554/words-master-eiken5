# 英検5級 Words Master

既存の English-Words-Master を独立複製した英検5級向け学習アプリ。700項目、レベル別300／300／100、12カテゴリー。ビルドは不要です。

## ローカル起動

このフォルダで次を実行して http://127.0.0.1:8765 を開きます。

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

`index.html` をブラウザーで直接開くこともできますが、保存やOCRを確認するときは上記のローカルサーバーを使ってください。OCRは既存どおり外部CDNと英語認識モデルのダウンロードにインターネット接続が必要です。音声は端末・ブラウザーの英語音声に依存します。

## 保存領域

localStorage の `words-master-eiken5:v1:nickname`、`words-master-eiken5:v1:soundOn`、`words-master-eiken5:v1:userStats` だけを使用します。同じオリジンでも旧アプリのキーは読み書きしません。IndexedDB・Cookie・認証・外部DBは使用しません。

元アプリの仕様どおり、Typing／Card／マッチの累計・カテゴリー別ベストを保存します。間違えた問題は結果画面で復習できます。手書き結果・誤答一覧はセッション内表示で、永続保存しません。

## 検証

- `python3 tests/data.py`：CSV対応、件数・重複・保存キー・元アプリと手書きコードのハッシュを検証。
- `node tests/recognition.cjs`：既存OCR正規化と判定の700項目互換性、誤答・許容誤差・得点を検証。
- `tests/browser.cjs`：PlaywrightによるPC・スマートフォン幅の機能テスト。
- `tests/layout.cjs`：主要画面の表示とスクリーンショット。
- `tests/media.cjs`：音声APIと実際のOCRエンジン。
- `tests/handwriting-flow.cjs`：OCR応答を固定した手書きの正解・誤答・結果・復習テスト。

ブラウザーテストにはPlaywrightとChromeが必要です。今回の一時環境では `NODE_PATH=/tmp/eiken5-browser-test/node_modules node tests/browser.cjs` のように実行しました。テストは分離したブラウザープロファイルを使います。

詳細は `REPORT.md` と `verification/` を参照してください。2026年11月11日、ユーザーの依頼で https://words-master-eiken5.vercel.app/ に本番公開しました。GitHubへのpushは行っていません。詳細はREPORT.mdのVercel本番公開を参照してください。
