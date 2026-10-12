import React, { useState } from 'react';
import { 
  Luggage, 
  LogIn, 
  UserPlus, 
  User, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import type { UserAccount } from '../types/auth';
import { SECRET_QUESTIONS, AVATAR_COLORS } from '../types/auth';
import { 
  registerUser, 
  authenticateUser, 
  resetUserPassword, 
  getStoredUsers, 
  setStoredCurrentUserId,
  loginWithSocialProvider,
  validatePasswordPolicy,
  updateUserProfile
} from '../utils/authStorage';
import { PasswordInput } from './PasswordInput';
import './WelcomeGate.css';

interface WelcomeGateProps {
  onLoginSuccess: (user: UserAccount) => void;
}

type GateTab = 'login' | 'register' | 'forgot';

export const WelcomeGate: React.FC<WelcomeGateProps> = ({ onLoginSuccess }) => {
  const [tab, setTab] = useState<GateTab>('login');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 初回ログイン時のニックネーム設定オンボーディング用
  const [pendingProfileUser, setPendingProfileUser] = useState<UserAccount | null>(null);
  const [profileNickname, setProfileNickname] = useState('');
  const [profileAvatarColor, setProfileAvatarColor] = useState(AVATAR_COLORS[0]);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  // メールログイン入力
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 新規登録入力
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAvatarColor, setRegAvatarColor] = useState(AVATAR_COLORS[0]);
  const [regQuestion, setRegQuestion] = useState(SECRET_QUESTIONS[0]);
  const [regAnswer, setRegAnswer] = useState('');

  // パスワード再設定入力
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotFoundUser, setForgotFoundUser] = useState<UserAccount | null>(null);
  const [forgotAnswer, setForgotAnswer] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);

  const clearAlerts = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  // タブ切り替え
  const handleSwitchTab = (newTab: GateTab) => {
    clearAlerts();
    setTab(newTab);
    if (newTab === 'forgot') {
      setForgotStep(1);
      setForgotFoundUser(null);
      setForgotAnswer('');
      setForgotNewPassword('');
    }
  };

  // 1. ワンタップソーシャルログイン（Apple / Google）
  const handleSocialClick = (provider: 'apple' | 'google') => {
    clearAlerts();
    const res = loginWithSocialProvider(provider);
    if (!res.success || !res.user) {
      setErrorMessage(res.message || '認証に失敗しました');
      return;
    }

    // 初回登録またはプロフィール設定がまだの場合
    if (res.isNewUser || res.user.needsProfileSetup || !res.user.username) {
      setPendingProfileUser(res.user);
      setProfileNickname(res.user.username || '');
      setProfileAvatarColor(res.user.avatarColor || AVATAR_COLORS[0]);
    } else {
      // 既存ユーザー：そのままログイン完了
      setSuccessMessage(res.message);
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 400);
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
      setSuccessMessage(`${res.user.username} さん、登録が完了しました！旅ぷらんへようこそ！`);
      setTimeout(() => {
        onLoginSuccess(res.user!);
      }, 500);
    } else {
      setErrorMessage(res.message);
      setIsSubmittingProfile(false);
    }
  };

  // 2. メールログイン実行
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();

    const res = authenticateUser(loginId, loginPassword);
    if (res.success && res.user) {
      setStoredCurrentUserId(res.user.id);
      setSuccessMessage(`${res.user.username} さん、おかえりなさい！`);
      setTimeout(() => {
        onLoginSuccess(res.user!);
      }, 500);
    } else {
      setErrorMessage(res.message);
    }
  };

  // 3. メール新規登録実行
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();

    if (!regUsername.trim()) {
      setErrorMessage('アカウント名（お名前）を入力してください。');
      return;
    }
    const pwdCheck = validatePasswordPolicy(regPassword);
    if (!pwdCheck.valid) {
      setErrorMessage(pwdCheck.message);
      return;
    }
    if (!regAnswer.trim()) {
      setErrorMessage('秘密の質問の答えを入力してください（パスワード再設定時に必要です）。');
      return;
    }

    const res = registerUser({
      username: regUsername.trim(),
      email: regEmail.trim(),
      password: regPassword,
      avatarColor: regAvatarColor,
      secretQuestion: regQuestion,
      secretAnswer: regAnswer.trim(),
    });

    if (res.success && res.user) {
      setStoredCurrentUserId(res.user.id);
      setSuccessMessage('アカウントが作成されました！旅ぷらんへようこそ！');
      setTimeout(() => {
        onLoginSuccess(res.user!);
      }, 700);
    } else {
      setErrorMessage(res.message);
    }
  };

  // パスワード再設定 - ユーザー検索
  const handleForgotFindUser = (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    const cleanId = forgotIdentifier.trim().toLowerCase();
    const users = getStoredUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
    );

    if (!found) {
      setErrorMessage('該当するユーザー（アカウント名またはメールアドレス）が見つかりません。');
      return;
    }
    setForgotFoundUser(found);
    setForgotStep(2);
  };

  // パスワード再設定 - 新パスワード適用
  const handleForgotResetPassword = (e: React.FormEvent) => {
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
      setSuccessMessage(res.message);
      setStoredCurrentUserId(res.user.id);
      setTimeout(() => {
        onLoginSuccess(res.user!);
      }, 1000);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="welcome-gate-screen">
      <div className="welcome-gate-container">
        {/* ブランドヘッダー */}
        <div className="welcome-brand">
          <div className="welcome-logo-badge">
            <Luggage size={36} />
          </div>
          <h1 className="welcome-app-name">旅ぷらん</h1>
          <p className="welcome-subtitle">
            旅行のしおり作成・予定タイムライン・持ち物管理アプリ
          </p>
        </div>

        {/* ログイン / 新規登録 カード */}
        <div className="welcome-card">
          {pendingProfileUser ? (
            /* 初回ソーシャル登録後のニックネーム設定オンボーディング */
            <div className="profile-setup-card">
              <div className="profile-setup-header">
                <span className="profile-setup-badge">初回セットアップ</span>
                <h2 className="profile-setup-title">旅ぷらんへようこそ！🎉</h2>
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

              {/* メッセージアラート */}
              {errorMessage && (
                <div className="welcome-alert error" style={{ margin: '0 0 10px' }}>
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="welcome-alert success" style={{ margin: '0 0 10px' }}>
                  <CheckCircle2 size={16} />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleCompleteProfileSetup} className="welcome-form" style={{ padding: 0 }}>
                <div className="form-group">
                  <label className="form-label">
                    ニックネーム <span className="badge-required">必須</span>
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
                  <div className="color-swatches-grid">
                    {AVATAR_COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        className={`color-swatch-circle ${profileAvatarColor === col ? 'selected' : ''}`}
                        style={{ backgroundColor: col }}
                        onClick={() => setProfileAvatarColor(col)}
                        title={col}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="welcome-submit-btn"
                  disabled={isSubmittingProfile}
                >
                  <Sparkles size={18} />
                  旅ぷらんをはじめる
                </button>

                <div className="welcome-toggle-hint" style={{ marginTop: '6px' }}>
                  <button
                    type="button"
                    className="btn-text-link"
                    onClick={() => {
                      setPendingProfileUser(null);
                      clearAlerts();
                    }}
                  >
                    別のアカウントでやり直す
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* ソーシャルサインインセクション（Apple / Google） */}
              <div className="social-signin-section">
                <p className="social-signin-heading">ワンタップで新規登録・ログイン</p>

                {/* Appleで続けるボタン（Apple公式デザイン準拠） */}
                <button
                  type="button"
                  className="btn-social-signin btn-apple-signin"
                  onClick={() => handleSocialClick('apple')}
                  title="Apple IDで新規登録またはログイン"
                >
                  <svg className="social-logo-svg" viewBox="0 0 170 170" width="18" height="18" fill="currentColor">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.77-11.64-14.18-5.99-9.47-10.74-20.19-14.26-32.14-3.52-11.96-5.28-23.23-5.28-33.82 0-14.14 3.58-26.06 10.75-35.75 7.17-9.69 16.27-14.65 27.31-14.88 5.43.12 11.26 1.48 17.48 4.09 6.22 2.61 10.22 3.97 12 4.08 1.96-.11 6.1-1.52 12.43-4.25 6.33-2.73 11.97-4.04 16.92-3.93 12.63.65 22.84 5.34 30.64 14.07-11.09 6.75-16.52 16.01-16.31 27.76.22 9.14 3.75 16.92 10.59 23.34 6.84 6.42 14.93 10.12 24.28 11.11-2.18 6.53-4.8 12.74-7.87 18.63zM119.22 33.15c0-7.18 2.61-13.93 7.84-20.25 5.23-6.32 11.75-10.45 19.58-12.4-1.31 7.4-4.24 14.26-8.8 20.59-4.57 6.32-10.66 10.45-18.28 12.38-.11-.11-.23-.21-.34-.32z"/>
                  </svg>
                  <span>Appleで続ける</span>
                </button>

                {/* Googleで続けるボタン（Google公式デザイン準拠） */}
                <button
                  type="button"
                  className="btn-social-signin btn-google-signin"
                  onClick={() => handleSocialClick('google')}
                  title="Googleアカウントで新規登録またはログイン"
                >
                  <svg className="social-logo-svg" viewBox="0 0 48 48" width="18" height="18">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span>Googleで続ける</span>
                </button>
              </div>

          {/* 仕切り線 */}
          <div className="welcome-divider">
            <span className="welcome-divider-line" />
            <span className="welcome-divider-text">または メールアドレスで</span>
            <span className="welcome-divider-line" />
          </div>

          {/* メール用タブナビゲーション */}
          <div className="welcome-tabs">
            <button
              type="button"
              className={`welcome-tab-btn ${tab === 'login' ? 'active' : ''}`}
              onClick={() => handleSwitchTab('login')}
            >
              <LogIn size={16} /> ログイン
            </button>
            <button
              type="button"
              className={`welcome-tab-btn ${tab === 'register' ? 'active' : ''}`}
              onClick={() => handleSwitchTab('register')}
            >
              <UserPlus size={16} /> 新規登録
            </button>
          </div>

          {/* メッセージアラート */}
          {errorMessage && (
            <div className="welcome-alert error">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="welcome-alert success">
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. メールログインフォーム */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="welcome-form">
              <div className="form-group">
                <label className="form-label">メールアドレス または アカウント名</label>
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
                    className="btn-text-link"
                    onClick={() => handleSwitchTab('forgot')}
                  >
                    パスワードをお忘れの方
                  </button>
                </div>
                <PasswordInput
                  value={loginPassword}
                  onChange={setLoginPassword}
                  placeholder="パスワードを入力（鍵マークで表示/非表示）"
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" className="btn btn-primary welcome-submit-btn">
                <LogIn size={18} /> メールアドレスでログイン
              </button>

              <div className="welcome-toggle-hint">
                アカウントをお持ちでないですか？{' '}
                <button
                  type="button"
                  className="btn-text-highlight"
                  onClick={() => handleSwitchTab('register')}
                >
                  新規登録はこちら
                </button>
              </div>
            </form>
          )}

          {/* 2. メール新規登録フォーム */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="welcome-form">
              <div className="form-group">
                <label className="form-label">
                  アカウント名（ニックネーム） <span className="badge-required">必須</span>
                </label>
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
                <label className="form-label">メールアドレス（ログイン用） <span className="badge-required">必須</span></label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    required
                    placeholder="メールアドレスを入力"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  パスワード（大文字・小文字込みの8文字以上） <span className="badge-required">必須</span>
                </label>
                <PasswordInput
                  value={regPassword}
                  onChange={setRegPassword}
                  placeholder="大文字・小文字含む8文字以上"
                  showPolicyHints={true}
                  autoComplete="new-password"
                />
              </div>

              {/* アイコンカラー選択 */}
              <div className="form-group">
                <label className="form-label">アバターカラー</label>
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

              {/* 秘密の質問（パスワードを忘れた場合） */}
              <div className="form-group security-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <HelpCircle size={14} className="icon-primary" /> パスワード再設定用の質問と答え
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
              </div>

              <button type="submit" className="btn btn-primary welcome-submit-btn">
                <Sparkles size={18} /> メールアドレスで新規登録
              </button>

              <div className="welcome-toggle-hint">
                すでにアカウントをお持ちですか？{' '}
                <button
                  type="button"
                  className="btn-text-highlight"
                  onClick={() => handleSwitchTab('login')}
                >
                  ログインはこちら
                </button>
              </div>
            </form>
          )}

          {/* 3. パスワード再設定フォーム */}
          {tab === 'forgot' && (
            <div className="welcome-form">
              {forgotStep === 1 ? (
                <form onSubmit={handleForgotFindUser}>
                  <p className="welcome-helper-text">
                    登録したアカウント名、またはメールアドレスを入力してください。
                  </p>
                  <div className="form-group">
                    <label className="form-label">アカウント名 または メールアドレス</label>
                    <div className="input-with-icon">
                      <User size={16} className="input-icon" />
                      <input
                        type="text"
                        required
                        placeholder="アカウント名 または メールアドレスを入力"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        className="form-control"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleSwitchTab('login')}
                      style={{ flex: 1 }}
                    >
                      ログインに戻る
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      次へ進む <ArrowRight size={15} />
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleForgotResetPassword}>
                  <p className="welcome-helper-text">
                    アカウント「<strong>{forgotFoundUser?.username}</strong>」の本人確認を行います。
                  </p>
                  <div className="form-group">
                    <label className="form-label">秘密の質問</label>
                    <div className="static-field-box">
                      {forgotFoundUser?.secretQuestion}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">質問の答え</label>
                    <div className="input-with-icon">
                      <KeyRound size={16} className="input-icon" />
                      <input
                        type="text"
                        required
                        placeholder="設定した答えを入力"
                        value={forgotAnswer}
                        onChange={(e) => setForgotAnswer(e.target.value)}
                        className="form-control"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">新しいパスワード（大文字・小文字込みの8文字以上）</label>
                    <PasswordInput
                      value={forgotNewPassword}
                      onChange={setForgotNewPassword}
                      placeholder="新しいパスワード（大文字・小文字含む8文字以上）"
                      showPolicyHints={true}
                      autoComplete="new-password"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setForgotStep(1)}
                      style={{ flex: 1 }}
                    >
                      戻る
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      パスワードを変更してログイン
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
