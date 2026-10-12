import type { UserAccount, GroupInvitation, FriendProfile } from '../types/auth';
import { SECRET_QUESTIONS, AVATAR_COLORS } from '../types/auth';

const USERS_STORAGE_KEY = 'tabi_planner_users_v1';
const CURRENT_USER_ID_KEY = 'tabi_planner_current_user_id_v1';

/**
 * 保存された全ユーザーを取得
 */
export function getStoredUsers(): UserAccount[] {
  try {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('ユーザー情報読み込みエラー:', e);
  }
  return [];
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
 * 現在ログイン中のユーザーを取得（アプリ起動時・再読み込み時）
 * ログイン中かつ登録済みユーザーが存在する場合のみ返し、未ログイン時は null を返す
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
  return null;
}

/**
 * 現在ログイン中のユーザーIDを保存（アプリを閉じても維持）
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
/**
 * パスワード強度バリデーション
 * 要件: 大文字・小文字込みの8文字以上
 */
export const validatePasswordPolicy = (password: string): { valid: boolean; message: string } => {
  if (!password || password.length < 8) {
    return { valid: false, message: 'パスワードは大文字・小文字を含む8文字以上で設定してください。（現在8文字未満です）' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'パスワードに半角英小文字（a〜z）を少なくとも1文字含めてください。' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'パスワードに半角英大文字（A〜Z）を少なくとも1文字含めてください。' };
  }
  return { valid: true, message: '安全なパスワードです。' };
};

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
  
  // パスワードポリシーチェック（大文字・小文字込み8文字以上）
  const pwdCheck = validatePasswordPolicy(data.password);
  if (!pwdCheck.valid) {
    return { success: false, message: pwdCheck.message };
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
 * Apple / Google によるソーシャルログイン＆新規作成
 */
/**
 * Apple / Google によるワンタップソーシャルログイン＆新規作成
 * 既存ユーザーがあればそのままログイン。
 * 初回登録の場合は needsProfileSetup: true で作成し、ログイン完了後にニックネーム設定へ案内する。
 */
export function loginWithSocialProvider(
  provider: 'apple' | 'google',
  profile?: {
    username?: string;
    email?: string;
  }
): { success: boolean; message: string; user: UserAccount; isNewUser: boolean } {
  const users = getStoredUsers();
  const providerName = provider === 'apple' ? 'Apple' : 'Google';

  // もし指定のメールアドレスで登録済みのユーザーがいれば、そのユーザーで即時ログイン
  const targetEmail = profile?.email?.trim().toLowerCase();
  const existingUser = targetEmail
    ? users.find((u) => u.provider === provider && u.email.toLowerCase() === targetEmail)
    : undefined;

  if (existingUser) {
    setStoredCurrentUserId(existingUser.id);
    return {
      success: true,
      message: `${providerName}でログインしました！`,
      user: existingUser,
      isNewUser: false,
    };
  }

  // 初回登録の場合: アカウントを作成（ニックネーム設定ステップへ）
  const initialUsername = profile?.username?.trim() || '';
  const initialEmail = profile?.email?.trim() || (provider === 'apple' ? `user_${Date.now()}@privaterelay.appleid.com` : `user_${Date.now()}@gmail.com`);

  const newUser: UserAccount = {
    id: `user-${provider}-${Date.now()}`,
    username: initialUsername,
    email: initialEmail,
    avatarColor: provider === 'apple' ? '#000000' : '#4285f4',
    provider,
    needsProfileSetup: true, // 初回ニックネーム設定が必要
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  saveStoredUsers(updatedUsers);
  setStoredCurrentUserId(newUser.id);

  return {
    success: true,
    message: `${providerName}アカウントを作成しました！`,
    user: newUser,
    isNewUser: true,
  };
}

/**
 * ユーザーのニックネーム・プロフィールの更新（初回ニックネーム設定時など）
 */
export function updateUserProfile(
  userId: string,
  updates: {
    username: string;
    avatarColor?: string;
  }
): { success: boolean; message: string; user?: UserAccount } {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) {
    return { success: false, message: 'ユーザーが見つかりません。' };
  }

  const cleanName = updates.username.trim();
  if (!cleanName) {
    return { success: false, message: 'お名前（ニックネーム）を入力してください。' };
  }

  const updatedUser: UserAccount = {
    ...users[index],
    username: cleanName,
    avatarColor: updates.avatarColor || users[index].avatarColor,
    needsProfileSetup: false, // 設定完了
  };

  users[index] = updatedUser;
  saveStoredUsers(users);
  setStoredCurrentUserId(updatedUser.id);

  return {
    success: true,
    message: `ニックネームを「${cleanName}」に設定しました！`,
    user: updatedUser,
  };
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
  if (!user.secretAnswer || user.secretAnswer.trim().toLowerCase() !== secretAnswer.trim().toLowerCase()) {
    return { success: false, message: '質問の答えが一致しません。もう一度お試しください。' };
  }

  // パスワードポリシーチェック（大文字・小文字込み8文字以上）
  const pwdCheck = validatePasswordPolicy(newPassword);
  if (!pwdCheck.valid) {
    return { success: false, message: pwdCheck.message };
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

/**
 * ユーザー検索（ユーザー名、メール/IDによる部分一致検索）
 */
export function searchUsers(query: string, currentUserId?: string): UserAccount[] {
  const users = getStoredUsers();
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return users.filter((u) => {
    if (currentUserId && u.id === currentUserId) return false;
    return (
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });
}

const INVITATIONS_STORAGE_KEY = 'tabi_planner_invitations_v1';

/**
 * 保存された全招待リストを取得
 */
export function getStoredInvitations(): GroupInvitation[] {
  try {
    const saved = localStorage.getItem(INVITATIONS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('招待リスト読み込みエラー:', e);
  }
  return [];
}

/**
 * 招待リストを保存
 */
export function saveStoredInvitations(invites: GroupInvitation[]): void {
  try {
    localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(invites));
  } catch (e) {
    console.error('招待リスト保存エラー:', e);
  }
}

/**
 * グループへの招待送信
 */
export function sendGroupInvitation(
  tripId: string,
  tripTitle: string,
  inviter: UserAccount,
  targetUser: UserAccount
): { success: boolean; message: string; invitation?: GroupInvitation } {
  const invites = getStoredInvitations();

  // 既に招待送信済みかチェック
  const existing = invites.find(
    (inv) => inv.tripId === tripId && inv.inviteeId === targetUser.id && inv.status === 'pending'
  );

  if (existing) {
    return { success: false, message: `${targetUser.username} さんには既に招待を送信済みです（相手の承認待ちです）。` };
  }

  const newInvitation: GroupInvitation = {
    id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    tripId,
    tripTitle,
    inviterId: inviter.id,
    inviterName: inviter.username,
    inviteeId: targetUser.id,
    inviteeName: targetUser.username,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const updatedInvites = [newInvitation, ...invites];
  saveStoredInvitations(updatedInvites);

  return { 
    success: true, 
    message: `${targetUser.username} さんにグループ招待を送信しました！相手が承認するとグループに追加されます。`, 
    invitation: newInvitation 
  };
}

/**
 * 招待への応答（承認 / 辞退）
 */
export function respondToInvitation(
  inviteId: string,
  accept: boolean
): { success: boolean; message: string; invitation?: GroupInvitation } {
  const invites = getStoredInvitations();
  const index = invites.findIndex((inv) => inv.id === inviteId);

  if (index === -1) {
    return { success: false, message: '招待が見つかりませんでした。' };
  }

  const targetInvite = invites[index];
  const newStatus: 'accepted' | 'rejected' = accept ? 'accepted' : 'rejected';

  const updatedInvite: GroupInvitation = {
    ...targetInvite,
    status: newStatus,
  };

  invites[index] = updatedInvite;
  saveStoredInvitations(invites);

  return {
    success: true,
    message: accept
      ? `「${targetInvite.tripTitle}」への参加を承認しました！旅行しおりが共有されました。`
      : `招待を辞退しました。`,
    invitation: updatedInvite,
  };
}

/**
 * 特定のユーザー宛ての保留中招待を取得
 */
export function getPendingInvitationsForUser(userId: string): GroupInvitation[] {
  const invites = getStoredInvitations();
  return invites.filter((inv) => inv.inviteeId === userId && inv.status === 'pending');
}

/**
 * アカウント削除（App Store Guideline 5.1.1(v) 必須対応）
 */
export function deleteUserAccount(userId: string): { success: boolean; message: string } {
  const users = getStoredUsers();
  const targetUser = users.find((u) => u.id === userId);

  if (!targetUser) {
    return { success: false, message: 'ユーザーが見つかりません。' };
  }

  const updatedUsers = users.filter((u) => u.id !== userId);
  saveStoredUsers(updatedUsers);

  // 関連する招待も削除
  const invites = getStoredInvitations();
  const updatedInvites = invites.filter((inv) => inv.inviteeId !== userId && inv.inviterId !== userId);
  saveStoredInvitations(updatedInvites);

  // ログイン中の場合は別ユーザーに切り替えまたはクリア
  const currentUserId = localStorage.getItem('tabi_planner_current_user_id_v1');
  if (currentUserId === userId) {
    if (updatedUsers.length > 0) {
      setStoredCurrentUserId(updatedUsers[0].id);
    } else {
      setStoredCurrentUserId(null);
    }
  }

  return { success: true, message: `アカウント「${targetUser.username}」を完全に削除しました。` };
}

const FRIENDS_STORAGE_KEY = 'tabi_planner_friends_v1';

/**
 * QRコード交換で追加された友達リストを取得
 */
export function getStoredFriends(): FriendProfile[] {
  try {
    const saved = localStorage.getItem(FRIENDS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('友達リスト取得エラー:', e);
  }
  return [];
}

/**
 * 友達リストを保存
 */
export function saveStoredFriends(friends: FriendProfile[]): void {
  try {
    localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friends));
  } catch (e) {
    console.error('友達リスト保存エラー:', e);
  }
}

/**
 * 友達を追加（重複時は情報を更新）
 */
export function addStoredFriend(friend: Omit<FriendProfile, 'addedAt'>): { success: boolean; message: string; friend: FriendProfile } {
  const friends = getStoredFriends();
  const existingIndex = friends.findIndex((f) => f.username.toLowerCase() === friend.username.toLowerCase() || f.id === friend.id);

  const newFriend: FriendProfile = {
    ...friend,
    addedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    friends[existingIndex] = newFriend;
    saveStoredFriends(friends);
    return {
      success: true,
      message: `「${newFriend.username}」さんの友達情報を更新しました！`,
      friend: newFriend,
    };
  }

  const updated = [newFriend, ...friends];
  saveStoredFriends(updated);
  return {
    success: true,
    message: `「${newFriend.username}」さんを友達に追加しました！`,
    friend: newFriend,
  };
}

/**
 * 友達を削除
 */
export function removeStoredFriend(friendIdOrName: string): void {
  const friends = getStoredFriends();
  const filtered = friends.filter((f) => f.id !== friendIdOrName && f.username !== friendIdOrName);
  saveStoredFriends(filtered);
}

