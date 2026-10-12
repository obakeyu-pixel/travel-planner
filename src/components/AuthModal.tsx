import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  KeyRound, 
  HelpCircle, 
  UserPlus, 
  LogIn, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  ArrowRight,
  RefreshCw,
  LogOut,
  Trash2
} from 'lucide-react';
import type { UserAccount } from '../types/auth';
import { SECRET_QUESTIONS, AVATAR_COLORS } from '../types/auth';
import { 
  getStoredUsers, 
  registerUser, 
  authenticateUser, 
  resetUserPassword,
  setStoredCurrentUserId,
  deleteUserAccount,
  loginWithSocialProvider,
  validatePasswordPolicy,
  updateUserProfile
} from '../utils/authStorage';
import { PasswordInput } from './PasswordInput';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onUserChange: (user: UserAccount | null) => void;
}

type AuthTab = 'login' | 'register' | 'switch' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('switch');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // ログインフォーム
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 新規登録フォーム
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAvatarColor, setRegAvatarColor] = useState(AVATAR_COLORS[0]);
  const [regQuestion, setRegQuestion] = useState(SECRET_QUESTIONS[0]);
  const [regAnswer, setRegAnswer] = useState('');

  // パスワード再設定フォーム
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotFoundUser, setForgotFoundUser] = useState<UserAccount | null>(null);
  const [forgotAnswer, setForgotAnswer] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);

  // 初回ソーシャル登録後のニックネーム設定オンボーディング
  const [pendingProfileUser, setPendingProfileUser] = useState<UserAccount | null>(null);
  const [profileNickname, setProfileNickname] = useState('');
  const [profileAvatarColor, setProfileAvatarColor] = useState(AVATAR_COLORS[0]);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  if (!isOpen) return null;

  const users = getStoredUsers();

  const clearAlerts = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  // ワンタップソーシャルログイン処理（Apple / Google）
  const handleSocialClick = (provider: 'apple' | 'google') => {
    clearAlerts();
    const res = loginWithSocialProvider(provider);
    if (!res.success || !res.user) {
      setErrorMessage(res.message || '認証に失敗しました');
      return;
    }

    if (res.isNewUser || res.user.needsProfileSetup || !res.user.username) {
      setPendingProfileUser(res.user);
      setProfileNickname(res.user.username || '');
      setProfileAvatarColor(res.user.avatarColor || AVATAR_COLORS[0]);
    } else {
      setSuccessMessage(res.message);
      onUserChange(res.user);
      setTimeout(() => {
        onClose();
        clearAlerts();
      }, 600);
    }
  };

  // 初回ニックネーム設定の確定
  const handleCompleteProfileSetup = (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!pendingProfileUser) return;

    const trimmed = profileNickname.trim();
    if (!trimmed) {
      setErrorMessage('お名前（ニックネーム）を入力してください。');
      return;
    }

    setIsSubmittingProfile(true);
    const res = updateUserProfile(pendingProfileUser.id, {
      username: trimmed,
      avatarColor: profileAvatarColor,
    });

    if (res.success && res.user) {
      setSuccessMessage(`${res.user.username} さん、登録が完了しました！`);
      onUserChange(res.user);
      setTimeout(() => {
        onClose();
        clearAlerts();
      }, 600);
    } else {
      setErrorMessage(res.message);
      setIsSubmittingProfile(false);
    }
  };

  // タブ切り替え
  const switchTab = (tab: AuthTab) => {
    clearAlerts();
    setActiveTab(tab);
    if (tab === 'forgot') {
      setForgotStep(1);
      setForgotFoundUser(null);
      setForgotAnswer('');
      setForgotNewPassword('');
    }
  };

  // ログイン送信
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();

    const res = authenticateUser(loginId, loginPassword);
    if (res.success && res.user) {
      onUserChange(res.user);
      setSuccessMessage(`${res.user.username} としてログインしました！`);
      setTimeout(() => {
        onClose();
        clearAlerts();
      }, 800);
    } else {
      setErrorMessage(res.message);
    }
  };

  // 新規登録送信
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();

    const pwdCheck = validatePasswordPolicy(regPassword);
    if (!pwdCheck.valid) {
      setErrorMessage(pwdCheck.message);
      return;
    }

    const res = registerUser({
      username: regUsername,
      email: regEmail,
      password: regPassword,
      avatarColor: regAvatarColor,
      secretQuestion: regQuestion,
      secretAnswer: regAnswer,
    });

    if (res.success && res.user) {
      onUserChange(res.user);
      setSuccessMessage(`アカウントを作成しました！ようこそ、${res.user.username}さん！`);
      setTimeout(() => {
        onClose();
        clearAlerts();
      }, 1000);
    } else {
      setErrorMessage(res.message);
    }
  };

  // ワンタップアカウント切り替え
  const handleSwitchUser = (user: UserAccount) => {
    setStoredCurrentUserId(user.id);
    onUserChange(user);
    setSuccessMessage(`${user.username} にアカウントを切り替えました！`);
    setTimeout(() => {
      onClose();
      clearAlerts();
    }, 600);
  };

  // ログアウト
  const handleLogout = () => {
    setStoredCurrentUserId(null);
    onUserChange(null);
    setSuccessMessage('ログアウトしました。');
  };

  // アカウント削除（App Store Guideline 5.1.1(v) 必須要件）
  const handleDeleteAccount = (user: UserAccount) => {
    const isCurrent = currentUser?.id === user.id;
    const confirmText = isCurrent
      ? `本当にアカウント「${user.username}」を完全に削除しますか？\n（この操作は元に戻せません。登録データやパスワード設定が削除されます）`
      : `アカウント「${user.username}」を端末から削除しますか？`;

    if (!window.confirm(confirmText)) return;

    const res = deleteUserAccount(user.id);
    if (res.success) {
      if (isCurrent) {
        onUserChange(null);
      }
      setSuccessMessage(res.message);
    } else {
      setErrorMessage(res.message);
    }
  };

  // パスワード再設定 - ステップ1: ユーザー確認
  const handleFindUserForForgot = (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    const cleanId = forgotIdentifier.trim().toLowerCase();
    const found = users.find(
      (u) => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
    );

    if (!found) {
      setErrorMessage('該当するユーザー（メールアドレスまたはアカウント名）が見つかりません。');
      return;
    }

    setForgotFoundUser(found);
    setForgotStep(2);
  };

  // パスワード再設定 - ステップ2: 質問に回答して再設定
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();

    if (!forgotFoundUser) return;

    const pwdCheck = validatePasswordPolicy(forgotNewPassword);
    if (!pwdCheck.valid) {
      setErrorMessage(pwdCheck.message);
      return;
    }

    const res = resetUserPassword(forgotFoundUser.email, forgotAnswer, forgotNewPassword);
    if (res.success && res.user) {
      onUserChange(res.user);
      setSuccessMessage(res.message);
      setTimeout(() => {
        onClose();
        clearAlerts();
      }, 1500);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog auth-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} className="icon-primary" />
            <h3 className="modal-title">アカウント設定・ユーザー切替</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        {/* タブナビゲーション（初回ニックネーム設定時は非表示） */}
        {!pendingProfileUser && (
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${activeTab === 'switch' ? 'active' : ''}`}
              onClick={() => switchTab('switch')}
            >
              <RefreshCw size={14} /> かんたん切替
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => switchTab('login')}
            >
              <LogIn size={14} /> ログイン
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => switchTab('register')}
            >
              <UserPlus size={14} /> 新規登録
            </button>
          </div>
        )}

        <div className="modal-body">
          {/* メッセージアラート */}
          {errorMessage && (
            <div className="auth-alert error">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="auth-alert success">
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {pendingProfileUser ? (
            /* 初回ソーシャル登録後のニックネーム設定オンボーディング */
            <div className="profile-setup-card" style={{ padding: '8px 0' }}>
              <div className="profile-setup-header">
                <span className="profile-setup-badge">初回セットアップ</span>
                <h3 className="profile-setup-title">旅ぷらんへようこそ！🎉</h3>
                <p className="profile-setup-desc">
                  アプリ内で表示するお名前（ニックネーム）を設定してください。
                </p>
                <div 
                  className="avatar-preview-badge"
                  style={{ backgroundColor: profileAvatarColor }}
                >
                  {profileNickname.trim() ? profileNickname.trim().charAt(0).toUpperCase() : <User size={28} />}
                </div>
              </div>

              <form onSubmit={handleCompleteProfileSetup} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
                <div className="form-group">
                  <label className="form-label">
                    ニックネーム <span className="badge-required" style={{ fontSize: '0.7rem', color: '#ef4444' }}>必須</span>
                  </label>
                  <div className="input-with-icon">
                    <User size={16} className="input-icon" />
                    <input
                      type="text"
                      required
                      autoFocus
                      value={profileNickname}
                      onChange={(e) => setProfileNickname(e.target.value)}
                      className="form-control"
                      placeholder="ニックネームを入力"
                      maxLength={30}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">アイコンの色</label>
                  <div className="color-swatches-grid" style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {AVATAR_COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        className={`color-swatch-circle ${profileAvatarColor === col ? 'selected' : ''}`}
                        style={{
                          backgroundColor: col,
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          border: profileAvatarColor === col ? '2.5px solid #0f172a' : '2px solid transparent',
                          cursor: 'pointer',
                          padding: 0
                        }}
                        onClick={() => setProfileAvatarColor(col)}
                        title={col}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setPendingProfileUser(null);
                      clearAlerts();
                    }}
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={isSubmittingProfile}
                  >
                    設定を完了してはじめる
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* 1. かんたんアカウント切替タブ */}
              {activeTab === 'switch' && (
                <div className="auth-panel">
                  <p className="modal-subtext" style={{ marginBottom: '14px' }}>
                登録されているアカウント一覧です。ワンクリックで操作ユーザーを切り替えできます。
              </p>

              <div className="user-cards-grid">
                {users.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <div
                      key={u.id}
                      className={`user-card-item ${isCurrent ? 'current' : ''}`}
                      onClick={() => !isCurrent && handleSwitchUser(u)}
                    >
                      <div 
                        className="user-avatar-circle"
                        style={{ backgroundColor: u.avatarColor }}
                      >
                        {u.username.slice(0, 1)}
                      </div>
                      <div className="user-info-text">
                        <div className="user-name-title">
                          {u.username}
                          {isCurrent && <span className="current-user-tag">ログイン中</span>}
                        </div>
                        <div className="user-email-subtitle">{u.email}</div>
                      </div>
                      <div className="user-card-actions" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {!isCurrent && (
                          <button type="button" className="btn-user-select" title="このアカウントに切り替える">
                            切替
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-user-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAccount(u);
                          }}
                          title={`「${u.username}」のアカウントを削除`}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="auth-actions-bar" style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem' }}
                  onClick={() => switchTab('register')}
                >
                  <UserPlus size={14} /> 新しいメンバーのアカウントを作成
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {currentUser && (
                    <button
                      type="button"
                      className="btn btn-text"
                      style={{ color: '#ef4444', fontSize: '0.8rem', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => handleDeleteAccount(currentUser)}
                      title="Appleガイドライン準拠: アカウントを完全に削除（退会）します"
                    >
                      <Trash2 size={13} /> 退会（アカウント削除）
                    </button>
                  )}
                  {currentUser && (
                    <button
                      type="button"
                      className="btn btn-text"
                      style={{ color: '#64748b', fontSize: '0.82rem' }}
                      onClick={handleLogout}
                    >
                      <LogOut size={14} /> ログアウト
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. ログインタブ */}
          {activeTab === 'login' && (
            <div className="auth-panel">
              {/* Apple / Google ワンタップログイン */}
              <div className="auth-social-btns">
                <button
                  type="button"
                  className="auth-social-btn auth-btn-apple"
                  onClick={() => handleSocialClick('apple')}
                >
                  <svg viewBox="0 0 170 170" width="16" height="16" fill="currentColor">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.77-11.64-14.18-5.99-9.47-10.74-20.19-14.26-32.14-3.52-11.96-5.28-23.23-5.28-33.82 0-14.14 3.58-26.06 10.75-35.75 7.17-9.69 16.27-14.65 27.31-14.88 5.43.12 11.26 1.48 17.48 4.09 6.22 2.61 10.22 3.97 12 4.08 1.96-.11 6.1-1.52 12.43-4.25 6.33-2.73 11.97-4.04 16.92-3.93 12.63.65 22.84 5.34 30.64 14.07-11.09 6.75-16.52 16.01-16.31 27.76.22 9.14 3.75 16.92 10.59 23.34 6.84 6.42 14.93 10.12 24.28 11.11-2.18 6.53-4.8 12.74-7.87 18.63zM119.22 33.15c0-7.18 2.61-13.93 7.84-20.25 5.23-6.32 11.75-10.45 19.58-12.4-1.31 7.4-4.24 14.26-8.8 20.59-4.57 6.32-10.66 10.45-18.28 12.38-.11-.11-.23-.21-.34-.32z"/>
                  </svg>
                  <span>Appleで続ける</span>
                </button>
                <button
                  type="button"
                  className="auth-social-btn auth-btn-google"
                  onClick={() => handleSocialClick('google')}
                >
                  <svg viewBox="0 0 48 48" width="16" height="16">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span>Googleで続ける</span>
                </button>
              </div>

              <div className="auth-divider">
                <span className="auth-divider-line" />
                <span className="auth-divider-text">または メールアドレスで</span>
                <span className="auth-divider-line" />
              </div>

              <form onSubmit={handleLoginSubmit}>
              <p className="modal-subtext" style={{ marginBottom: '14px' }}>
                アカウント名またはメールアドレスとパスワードでログインします。
              </p>

              <div className="form-group">
                <label className="form-label">アカウント名 または メールアドレス</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="メールアドレス または アカウント名を入力"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">パスワード</label>
                  <button
                    type="button"
                    className="forgot-link-btn"
                    onClick={() => switchTab('forgot')}
                  >
                    パスワードをお忘れですか？
                  </button>
                </div>
                <PasswordInput
                  value={loginPassword}
                  onChange={setLoginPassword}
                  placeholder="パスワードを入力（鍵マークで表示/非表示）"
                  autoComplete="current-password"
                />
              </div>

              <div style={{ marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <LogIn size={16} /> ログインする
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>アカウントをお持ちでない方は </span>
                <button
                  type="button"
                  className="link-btn-text"
                  onClick={() => switchTab('register')}
                >
                  新規登録はこちら
                </button>
              </div>
            </form>
          </div>
          )}

          {/* 3. 新規アカウント作成タブ */}
          {activeTab === 'register' && (
            <div className="auth-panel">
              {/* Apple / Google ワンタップ新規登録 */}
              <div className="auth-social-btns">
                <button
                  type="button"
                  className="auth-social-btn auth-btn-apple"
                  onClick={() => handleSocialClick('apple')}
                >
                  <svg viewBox="0 0 170 170" width="16" height="16" fill="currentColor">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.77-11.64-14.18-5.99-9.47-10.74-20.19-14.26-32.14-3.52-11.96-5.28-23.23-5.28-33.82 0-14.14 3.58-26.06 10.75-35.75 7.17-9.69 16.27-14.65 27.31-14.88 5.43.12 11.26 1.48 17.48 4.09 6.22 2.61 10.22 3.97 12 4.08 1.96-.11 6.1-1.52 12.43-4.25 6.33-2.73 11.97-4.04 16.92-3.93 12.63.65 22.84 5.34 30.64 14.07-11.09 6.75-16.52 16.01-16.31 27.76.22 9.14 3.75 16.92 10.59 23.34 6.84 6.42 14.93 10.12 24.28 11.11-2.18 6.53-4.8 12.74-7.87 18.63zM119.22 33.15c0-7.18 2.61-13.93 7.84-20.25 5.23-6.32 11.75-10.45 19.58-12.4-1.31 7.4-4.24 14.26-8.8 20.59-4.57 6.32-10.66 10.45-18.28 12.38-.11-.11-.23-.21-.34-.32z"/>
                  </svg>
                  <span>Appleで続ける</span>
                </button>
                <button
                  type="button"
                  className="auth-social-btn auth-btn-google"
                  onClick={() => handleSocialClick('google')}
                >
                  <svg viewBox="0 0 48 48" width="16" height="16">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span>Googleで続ける</span>
                </button>
              </div>

              <div className="auth-divider">
                <span className="auth-divider-line" />
                <span className="auth-divider-text">または メールアドレスで</span>
                <span className="auth-divider-line" />
              </div>

              <form onSubmit={handleRegisterSubmit}>
              <p className="modal-subtext" style={{ marginBottom: '14px' }}>
                旅行メンバーそれぞれのアカウントを作成できます。旅程や行きたいスポットに名前が自動連動します！
              </p>

              <div className="form-group">
                <label className="form-label">お名前（表示名） *</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="お名前（ニックネーム）を入力"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">メールアドレス または ログインID *</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="メールアドレスを入力"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">パスワード *（大文字・小文字込みの8文字以上）</label>
                <PasswordInput
                  value={regPassword}
                  onChange={setRegPassword}
                  placeholder="大文字・小文字含む8文字以上"
                  showPolicyHints={true}
                  autoComplete="new-password"
                />
              </div>

              {/* パスワード再設定用の秘密の質問 */}
              <div className="form-group" style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px dashed var(--border-light)' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0284c7' }}>
                  <HelpCircle size={14} />
                  パスワードを忘れたときの合言葉（秘密の質問） *
                </label>
                <select
                  value={regQuestion}
                  onChange={(e) => setRegQuestion(e.target.value)}
                  className="form-control"
                  style={{ marginBottom: '8px' }}
                >
                  {SECRET_QUESTIONS.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
                <div className="input-with-icon">
                  <KeyRound size={16} className="input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="質問の答えを入力"
                    value={regAnswer}
                    onChange={(e) => setRegAnswer(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  ※パスワードを忘れた際、この答えを入力することで再度パスワードを設定できます。
                </div>
              </div>

              {/* アイコンカラー選択 */}
              <div className="form-group">
                <label className="form-label">アイコンのカラー</label>
                <div className="avatar-color-picker">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-pick-circle ${regAvatarColor === c ? 'selected' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setRegAvatarColor(c)}
                    />
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <UserPlus size={16} /> この内容でアカウントを作成する
                </button>
              </div>
            </form>
          </div>
          )}

          {/* 4. パスワード再設定タブ */}
          {activeTab === 'forgot' && (
            <div className="auth-panel">
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <KeyRound size={18} className="icon-primary" /> パスワードの再設定
              </h4>
              <p className="modal-subtext" style={{ marginBottom: '14px' }}>
                パスワードをお忘れの場合でも、秘密の質問に回答することで新しいパスワードを再設定できます。
              </p>

              {forgotStep === 1 ? (
                <form onSubmit={handleFindUserForForgot}>
                  <div className="form-group">
                    <label className="form-label">登録したメールアドレス または アカウント名</label>
                    <div className="input-with-icon">
                      <Mail size={16} className="input-icon" />
                      <input
                        type="text"
                        required
                        placeholder="アカウント名 または メールアドレスを入力"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => switchTab('login')}
                    >
                      戻る
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      次へ進む <ArrowRight size={14} />
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit}>
                  {forgotFoundUser && (
                    <div style={{ background: '#f0fdf4', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', border: '1px solid #bbf7d0' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534' }}>
                        対象アカウント: {forgotFoundUser.username}（{forgotFoundUser.email}）
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label" style={{ color: '#0284c7' }}>
                      質問: <strong>{forgotFoundUser?.secretQuestion}</strong>
                    </label>
                    <div className="input-with-icon">
                      <HelpCircle size={16} className="input-icon" />
                      <input
                        type="text"
                        required
                        placeholder="登録した質問の答え"
                        value={forgotAnswer}
                        onChange={(e) => setForgotAnswer(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">新しいパスワード *（大文字・小文字込みの8文字以上）</label>
                    <PasswordInput
                      value={forgotNewPassword}
                      onChange={setForgotNewPassword}
                      placeholder="新しいパスワード（大文字・小文字含む8文字以上）"
                      showPolicyHints={true}
                      autoComplete="new-password"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setForgotStep(1)}
                    >
                      戻る
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      新しいパスワードで再設定＆ログイン
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </>
      )}
    </div>
  </div>
</div>
);
};
