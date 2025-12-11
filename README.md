# 観戦アプリ (Spectator App)

スポーツ観戦中に親が使用する、BLE接続対応のWebアプリケーションです。

## 📱 概要

このアプリは、親が子どものハプティックデバイスとBluetooth接続し、試合の状況に応じて振動パターンを送信したり、子どもの応援活動をログに記録したりできます。

## ✨ 主な機能

### ホーム画面
- BLEデバイスとの接続・切断
- 接続状態の表示
- 観戦セッションの開始

### 観戦画面
- リアルタイムの叩き回数カウンター
- 3つの状態ボタン（通常・チャンス・ピンチ）
- BLEデバイスへのパターン送信
- セッション情報の表示
- 観戦の終了

### ログ画面
- 過去の観戦セッション一覧
- セッション詳細表示（統計・タイムライン）
- 叩き回数・チャンス/ピンチ送信回数の確認

## 🚀 使い方

### 1. アプリを開く

ブラウザで `index.html` を開きます。

**重要な注意事項:**
- Web Bluetooth APIを使用するため、**HTTPS接続**または**localhost**が必要です
- 推奨ブラウザ: Chrome、Edge（iOSのSafariは実験的サポート）

### 2. ローカルサーバーで起動（推奨）

```bash
# Python 3の場合
python -m http.server 8000

# Node.jsの場合
npx http-server
```

その後、ブラウザで `http://localhost:8000` にアクセスします。

### 3. デバイスに接続

1. ホーム画面で「デバイスに接続」ボタンをクリック
2. BLEデバイスのスキャンが開始されます
3. 一覧から対象デバイスを選択して接続

### 4. 観戦を開始

1. 「観戦を開始」ボタンをクリック
2. 観戦画面に遷移します
3. 状態ボタンを押してデバイスにパターンを送信
4. 叩き回数がリアルタイムで更新されます

### 5. 観戦を終了

1. 「観戦を終了」ボタンをクリック
2. セッションが保存されます
3. ログ画面で確認できます

## 🎨 デザイン

- **iPhone 16対応**: 393×852pxの縦長レイアウト
- **ダークモード**: 目に優しい暗色テーマ
- **グラスモーフィズム**: モダンな半透明エフェクト
- **スムーズアニメーション**: 快適な操作感

## 🔧 技術仕様

### BLE通信

**パターンID:**
- `0`: 通常
- `1`: チャンス
- `2`: ピンチ

**イベント受信:**
- デバイスからのタップイベントを受信
- リアルタイムでカウンター更新

### データ保存

- **localStorage**を使用
- セッションとイベントを永続化
- ブラウザキャッシュクリアで削除

### ファイル構成

```
spectator-app/
├── index.html              # メインHTML
├── style.css               # スタイルシート
├── app.js                  # アプリコントローラー
├── ble-manager.js          # BLE接続管理
├── data-manager.js         # データ管理
├── home-screen.js          # ホーム画面
├── spectating-screen.js    # 観戦画面
├── log-screen.js           # ログ画面
└── README.md               # このファイル
```

## 🔌 BLE設定のカスタマイズ

デバイスのUUIDを変更する場合は、`ble-manager.js`の以下の部分を編集してください:

```javascript
this.SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef0';
this.TX_CHARACTERISTIC_UUID = '12345678-1234-5678-1234-56789abcdef1';
this.RX_CHARACTERISTIC_UUID = '12345678-1234-5678-1234-56789abcdef2';
```

## 📝 データ構造

### セッション
```javascript
{
  id: string,
  dateTime: string (ISO),
  deviceName: string,
  gameTitle: string | null,
  tapCountTotal: number,
  chanceCountTotal: number,
  pinchCountTotal: number,
  normalCountTotal: number,
  status: 'active' | 'completed',
  startTime: number,
  endTime: number
}
```

### イベントログ
```javascript
{
  id: string,
  sessionId: string,
  timestamp: string (ISO),
  timestampMs: number,
  type: 'tap' | 'chance' | 'pinch' | 'normal',
  data: object
}
```

## 🐛 トラブルシューティング

### BLE接続ができない

- HTTPS接続またはlocalhostで実行しているか確認
- Chrome/Edgeブラウザを使用しているか確認
- デバイスのBluetoothがオンになっているか確認

### データが保存されない

- ブラウザのlocalStorageが有効か確認
- プライベートブラウジングモードでないか確認

### iOSで動作しない

- iOSのSafariは実験的サポートのため、設定で有効化が必要
- Chrome for iOSの使用を推奨

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🙏 謝辞

Google Fonts (Noto Sans JP) を使用しています。
