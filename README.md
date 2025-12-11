# ブラウザ対応状況

## Web Bluetooth API サポート

### ✅ 対応ブラウザ

#### Android
- **Chrome** - 完全対応 ✅
- **Edge** - 完全対応 ✅
- **Opera** - 対応 ✅

#### Windows / Mac / Linux
- **Chrome** - 完全対応 ✅
- **Edge** - 完全対応 ✅
- **Opera** - 対応 ✅

### ❌ 非対応ブラウザ

#### iOS / iPadOS
- **Safari** - 非対応 ❌
- **Chrome for iOS** - 非対応 ❌（SafariのWebViewを使用）
- **Firefox for iOS** - 非対応 ❌

### 🔧 iOS での解決方法

iOSでこのアプリを使用するには、以下のいずれかの方法があります：

#### 方法1: Bluefy（推奨）
1. App Storeから「Bluefy」をインストール（無料）
2. BluefyでアプリのURLを開く
3. Web Bluetooth APIが使用可能

#### 方法2: Safari実験的機能（iOS 16以降）
1. 設定 → Safari → 詳細 → Experimental Features
2. 「Web Bluetooth」を有効化
3. Safariでアプリを開く

> **注意**: 方法2は実験的機能のため、動作が不安定な場合があります。Bluefyの使用を推奨します。

---

## 推奨環境

- **Android**: Chrome ブラウザ
- **iOS**: Bluefy アプリ
- **PC**: Chrome または Edge

---

## トラブルシューティング

### 「このブラウザはBluetooth非対応です」と表示される場合

1. **Androidの場合**
   - Chromeブラウザをインストール
   - アプリのURLをChromeで開く

2. **iOSの場合**
   - Bluefyアプリをインストール
   - Bluefyでアプリを開く

3. **PCの場合**
   - Chrome または Edge をインストール
   - アプリのURLを開く

### その他のエラー

- **「HTTPS接続が必要です」**: Vercelでデプロイ済みのURLを使用してください
- **「デバイスが見つかりません」**: BLEデバイスの電源とBluetoothがオンか確認
