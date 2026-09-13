import React, { useState } from 'react';
import { 
  User, 
  Lock, 
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
  LogOut
} from 'lucide-react';
import type { UserAccount } from '../types/auth';
import { SECRET_QUESTIONS, AVATAR_COLORS } from '../types/auth';
import { 
  getStoredUsers, 
  registerUser, 
  authenticateUser, 
  resetUserPassword,
  setStoredCurrentUserId 
} from '../utils/authStorage';
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

  if (!isOpen) return null;

  const users = getStoredUsers();

  const clearAlerts = () => {
    setErrorMessage('');
    setSuccessMessage('');
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

        {/* タブナビゲーション */}
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
                      {!isCurrent && (
                        <button type="button" className="btn-user-select" title="このアカウントに切り替える">
                          切替
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="auth-actions-bar" style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem' }}
                  onClick={() => switchTab('register')}
                >
                  <UserPlus size={14} /> 新しいメンバーのアカウントを作成
                </button>

                {currentUser && (
                  <button
                    type="button"
                    className="btn btn-text"
                    style={{ color: '#ef4444', fontSize: '0.82rem' }}
                    onClick={handleLogout}
                  >
                    <LogOut size={14} /> ログアウト
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 2. ログインタブ */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="auth-panel">
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
                    placeholder="例: けんた または kenta@example.com"
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
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="form-control"
                  />
                </div>
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
          )}

          {/* 3. 新規アカウント作成タブ */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="auth-panel">
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
                    placeholder="例: けんた、さくら、たろう"
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
                    placeholder="例: kenta@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">パスワード *（4文字以上）</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    type="password"
                    required
                    minLength={4}
                    placeholder="4文字以上のパスワード"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="form-control"
                  />
                </div>
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
                    placeholder="質問の答えを入力（例: ポチ、京都 など）"
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
                        placeholder="例: kenta@example.com または けんた"
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
                    <label className="form-label">新しいパスワード *（4文字以上）</label>
                    <div className="input-with-icon">
                      <Lock size={16} className="input-icon" />
                      <input
                        type="password"
                        required
                        minLength={4}
                        placeholder="新しいパスワードを入力"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        className="form-control"
                      />
                    </div>
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
        </div>
      </div>
    </div>
  );
};
