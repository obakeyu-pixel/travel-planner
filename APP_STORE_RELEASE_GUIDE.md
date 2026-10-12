# 📱 旅ぷらん (TabiPlan) - App Store (iOS) リリース完全ガイド

本アプリは **Capacitor (iOS)** を用いて、iPhone / iPad 向けネイティブアプリとして Apple App Store に申請・リリース可能な構成になっています。
本ドキュメントでは、Apple Developer Program の準備から Xcode でのビルド、審査提出までの全手順をわかりやすくまとめています。

---

## 📋 目次
1. [リリース前の必要環境・準備物](#1-リリース前の必要環境準備物)
2. [アプリのビルドとiOSプロジェクト同期](#2-アプリのビルドとiosプロジェクト同期)
3. [Xcodeでの各種設定](#3-xcodeでの各種設定)
4. [App Store審査対策（超重要チェック項目）](#4-app-store審査対策超重要チェック項目)
5. [アーカイブとApp Store Connectへのアップロード](#5-アーカイブとapp-store-connectへのアップロード)
6. [TestFlightによる実機テストと審査提出](#6-testflightによる実機テストと審査提出)

---

## 1. リリース前の必要環境・準備物

| 項目 | 詳細 |
| :--- | :--- |
| **開発マシン** | macOS が動作する Mac（MacBook, Mac mini 等）<br>※Windows単体ではXcodeを実行できないため、ビルド時はMac環境を使用します。 |
| **開発ツール** | 最新版の **Xcode**（Mac App Storeから無料でインストール可能） |
| **Apple Developer アカウント** | [Apple Developer Program](https://developer.apple.com/programs/)（年間 99 USD）への加入 |
| **アプリアイコン画像** | `1024 × 1024 px` の PNG 画像（**角丸なし・透過/アルファチャンネルなし**） |
| **スクリーンショット** | iPhone 6.9インチ（iPhone 16 Pro Maxなど）および 6.5インチの縦向き画面キャプチャ（各3〜10枚） |

---

## 2. アプリのビルドとiOSプロジェクト同期

Windows または Mac のターミナルで、最新のWebアセットをビルドして iOS プロジェクトに同期します。

```bash
# 1. Webアプリの最新コードをビルド
npm run build

# 2. CapacitorのiOSプロジェクトにアセットと設定を同期
npx cap sync ios
```

※このコマンドにより、`dist/` フォルダの成果物が `ios/App/App/public/` に自動コピーされます。

---

## 3. Xcodeでの各種設定

Mac 上でターミナルを開き、以下のコマンドで Xcode プロジェクトを起動します：

```bash
npx cap open ios
```
（または `ios/App/App.xcworkspace` をダブルクリックして開きます）

### ① Signing & Capabilities（署名と証明書）
1. 左側のナビゲーターで最上部の「**App**」を選択。
2. 「**Signing & Capabilities**」タブを開きます。
3. **Automatically manage signing** にチェックを入れる。
4. **Team**: 加入した Apple Developer アカウントのチームを選択。
5. **Bundle Identifier**: `com.tabiplan.travelapp`（重複している場合は任意の一意なIDに変更）

### ② General（基本情報設定）
- **Display Name**: `旅ぷらん`（iPhoneのホーム画面に表示される名前）
- **Version**: `1.0.0`
- **Build**: `1`
- **Deployment Info**: iOS 15.0 以上を推奨
- **Supported Device Orientations**: `Portrait`（縦向き）のみにチェック（スマホ最適化のため）

### ③ アプリアイコンの設定
1. 左のファイルツリーから `App/App/Assets.xcassets` を選択。
2. `AppIcon` を開き、準備した `1024 × 1024 px` のアイコン画像をドラッグ＆ドロップします。

---

## 4. App Store審査対策（超重要チェック項目）

Appleの審査（App Store Review Guidelines）でリジェクトされないために、本アプリでは以下の対策を実装済みです。

### ✅ 1. アカウント削除（退会）機能の提供【審査ガイドライン 5.1.1(v) 必須】
- **要件**: アカウント作成ができるアプリは、アプリ内で即座にアカウントを削除できなければならない。
- **実装状況**: 
  - 本アプリの「アカウント設定」画面（`AuthModal`）に、各アカウントごとの**「削除（ゴミ箱）」ボタン**およびログイン中の**「退会（アカウント削除）」ボタン**を完備しています。審査でも問題なくクリアできます。

### ✅ 2. 審査用テストアカウントの提供
- App Store Connect の申請フォーム「サインイン情報」に、審査員がログインして全機能をテストできるアカウント情報を記載します。
  - **ログインID**: `kenta`（または新規登録したテスト用アカウント）
  - **パスワード**: `password123`
  - **秘密の質問の答え**: `ポチ`

### ✅ 3. カメラ・写真ライブラリの利用目的説明（Info.plist）
写真のアップロード機能を使用するため、`ios/App/App/Info.plist` に以下のプライバシー説明を追加します：

```xml
<key>NSCameraUsageDescription</key>
<string>旅行の思い出写真やスポットのカスタム写真を撮影・設定するためにカメラを使用します。</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>旅行のしおりのカバー写真やスポット写真をお手持ちの写真アルバムから選択するためにライブラリにアクセスします。</string>
```

---

## 5. アーカイブとApp Store Connectへのアップロード

1. Xcode の上部ツールバーで、ターゲット端末を実機または「**Any iOS Device (arm64)**」に選択。
2. 上部メニューから **Product** > **Archive** をクリック。
3. ビルドが完了すると「Organizer」ウィンドウが開きます。
4. 最新のアーカイブを選択し、右側の「**Distribute App**」ボタンをクリック。
5. **Custom** または **App Store Connect** を選択 > 「**Upload**」を選択してウィザードを進めます。
6. アップロードが完了すると、10〜20分程度で App Store Connect にビルドが反映されます。

---

## 6. TestFlightによる実機テストと審査提出

1. [App Store Connect](https://appstoreconnect.apple.com/) にログイン。
2. 「マイ App」>「新規 App」をクリック：
   - プラットフォーム: **iOS**
   - 名前: **旅ぷらん - 旅行しおり＆予定管理**
   - プライマリ言語: **日本語**
   - バンドルID: Xcodeで設定したID（`com.tabiplan.travelapp`）
   - SKU: 任意の英数字（例: `tabiplan-001`）
3. **TestFlight タブ**:
   - アップロードされたビルドが表示されたら、開発者自身のiPhoneに「TestFlight」アプリを入れて実機で動作確認を行います。
4. **App Store タブ（本番申請）**:
   - スクリーンショット、プロモーションテキスト、概要、キーワード（例: `旅行,しおり,旅程,持ち物,観光,グループ旅行`）を入力。
   - サポートURLとプライバシーポリシーURLを設定。
   - レビュー用情報（審査用アカウント情報）を入力。
   - 「**審査へ提出**」をクリック！

通常、提出から **24〜48時間以内** に審査結果が届きます。承認されれば、App Store で世界中のユーザーに向けて配信されます！
