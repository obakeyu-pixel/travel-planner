/**
 * ユーザーアカウント＆認証型定義
 */

export interface UserAccount {
  id: string;
  username: string;          // 表示名（例: "けんた", "さくら"）
  email: string;             // ログインID / メールアドレス
  password: string;          // パスワード（平文/ハッシュ）
  avatarColor: string;       // アイコン背景色
  secretQuestion: string;    // パスワード再設定用の秘密の質問
  secretAnswer: string;      // 秘密の質問の答え
  createdAt: string;
}

export interface AuthState {
  currentUser: UserAccount | null;
  users: UserAccount[];
}

// 秘密の質問の選択肢プリセット
export const SECRET_QUESTIONS = [
  '初めて飼ったペットの名前は？',
  '子どもの頃のニックネームは？',
  '一番好きな旅行先・行ってみたい国は？',
  '母親の旧姓は？',
  '一番好きな食べ物・大好物は？',
];

// アバターカラー選択肢
export const AVATAR_COLORS = [
  '#0284c7', // スカイブルー
  '#ec4899', // ピンク
  '#10b981', // エメラルドグリーン
  '#f59e0b', // アンバー
  '#8b5cf6', // パープル
  '#ef4444', // ローズレッド
  '#14b8a6', // ティール
  '#6366f1', // インディゴ
];
