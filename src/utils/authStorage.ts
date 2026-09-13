import type { UserAccount } from '../types/auth';
import { SECRET_QUESTIONS, AVATAR_COLORS } from '../types/auth';

const USERS_STORAGE_KEY = 'tabi_planner_users_v1';
const CURRENT_USER_ID_KEY = 'tabi_planner_current_user_id_v1';

// 初期のサンプルアカウント
const DEFAULT_SAMPLE_USERS: UserAccount[] = [
  {
    id: 'user-kenta',
    username: 'けんた',
    email: 'kenta@example.com',
    password: 'password123',
    avatarColor: '#0284c7',
    secretQuestion: SECRET_QUESTIONS[0],
    secretAnswer: 'ポチ',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-sakura',
    username: 'さくら',
    email: 'sakura@example.com',
    password: 'password123',
    avatarColor: '#ec4899',
    secretQuestion: SECRET_QUESTIONS[2],
    secretAnswer: '京都',
    createdAt: new Date().toISOString(),
  },
];

/**
 * 保存された全ユーザーを取得
 */
export function getStoredUsers(): UserAccount[] {
  try {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('ユーザー情報読み込みエラー:', e);
  }
  // 初期ユーザーを保存して返す
  saveStoredUsers(DEFAULT_SAMPLE_USERS);
  return DEFAULT_SAMPLE_USERS;
}

/**
 * ユーザーリストを保存
 */
export function saveStoredUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('ユーザー情報保存エラー:', e);
  }
}

/**
 * 現在ログイン中のユーザーを取得
 */
export function getStoredCurrentUser(): UserAccount | null {
  const users = getStoredUsers();
  try {
    const currentId = localStorage.getItem(CURRENT_USER_ID_KEY);
    if (currentId) {
      const found = users.find((u) => u.id === currentId);
      if (found) return found;
    }
  } catch (e) {}
  // デフォルトで1人目のユーザーをログイン状態にする
  if (users.length > 0) {
    setStoredCurrentUserId(users[0].id);
    return users[0];
  }
  return null;
}

/**
 * 現在ログイン中のユーザーIDを保存
 */
export function setStoredCurrentUserId(userId: string | null): void {
  try {
    if (userId) {
      localStorage.setItem(CURRENT_USER_ID_KEY, userId);
    } else {
      localStorage.removeItem(CURRENT_USER_ID_KEY);
    }
  } catch (e) {}
}

/**
 * 新規アカウント登録
 */
export function registerUser(data: {
  username: string;
  email: string;
  password: string;
  avatarColor?: string;
  secretQuestion: string;
  secretAnswer: string;
}): { success: boolean; message: string; user?: UserAccount } {
  const users = getStoredUsers();

  const trimmedUsername = data.username.trim();
  const trimmedEmail = data.email.trim().toLowerCase();

  if (!trimmedUsername) {
    return { success: false, message: 'ユーザー名（お名前）を入力してください。' };
  }
  if (!trimmedEmail) {
    return { success: false, message: 'メールアドレス（またはID）を入力してください。' };
  }
  if (!data.password || data.password.length < 4) {
    return { success: false, message: 'パスワードは4文字以上で設定してください。' };
  }
  if (!data.secretAnswer.trim()) {
    return { success: false, message: 'パスワード再設定用の「質問の答え」を入力してください。' };
  }

  // 重複チェック
  if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
    return { success: false, message: 'このメールアドレスは既に登録されています。' };
  }
  if (users.some((u) => u.username.toLowerCase() === trimmedUsername.toLowerCase())) {
    return { success: false, message: 'このユーザー名は既に使用されています。別のお名前をお試しください。' };
  }

  const newUser: UserAccount = {
    id: `user-${Date.now()}`,
    username: trimmedUsername,
    email: trimmedEmail,
    password: data.password,
    avatarColor: data.avatarColor || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    secretQuestion: data.secretQuestion || SECRET_QUESTIONS[0],
    secretAnswer: data.secretAnswer.trim(),
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  saveStoredUsers(updatedUsers);
  setStoredCurrentUserId(newUser.id);

  return { success: true, message: 'アカウントを作成しました！', user: newUser };
}

/**
 * ログイン処理
 */
export function authenticateUser(
  identifier: string,
  password: string
): { success: boolean; message: string; user?: UserAccount } {
  const users = getStoredUsers();
  const cleanId = identifier.trim().toLowerCase();

  const user = users.find(
    (u) => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
  );

  if (!user) {
    return { success: false, message: 'ユーザーが見つかりません。アカウント名またはメールアドレスをご確認ください。' };
  }

  if (user.password !== password) {
    return { success: false, message: 'パスワードが正しくありません。' };
  }

  setStoredCurrentUserId(user.id);
  return { success: true, message: 'ログインしました！', user };
}

/**
 * パスワード再設定（リセット）
 */
export function resetUserPassword(
  identifier: string,
  secretAnswer: string,
  newPassword: string
): { success: boolean; message: string; user?: UserAccount } {
  const users = getStoredUsers();
  const cleanId = identifier.trim().toLowerCase();

  const userIndex = users.findIndex(
    (u) => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
  );

  if (userIndex === -1) {
    return { success: false, message: '該当するユーザーが見つかりません。' };
  }

  const user = users[userIndex];

  // 秘密の質問の回答チェック
  if (user.secretAnswer.trim().toLowerCase() !== secretAnswer.trim().toLowerCase()) {
    return { success: false, message: '質問の答えが一致しません。もう一度お試しください。' };
  }

  if (!newPassword || newPassword.length < 4) {
    return { success: false, message: '新しいパスワードは4文字以上で設定してください。' };
  }

  // パスワード更新
  const updatedUser: UserAccount = {
    ...user,
    password: newPassword,
  };

  users[userIndex] = updatedUser;
  saveStoredUsers(users);
  setStoredCurrentUserId(updatedUser.id);

  return { success: true, message: 'パスワードを再設定しました！新しいパスワードでログイン完了しました。', user: updatedUser };
}
