import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import './PasswordInput.css';

interface PasswordInputProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  showPolicyHints?: boolean; // 新規登録や再設定時のみポリシーインジケーターを表示
  className?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  value,
  onChange,
  placeholder = '大文字・小文字含む8文字以上',
  required = true,
  autoComplete = 'current-password',
  showPolicyHints = false,
  className = '',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // 大文字小文字8文字以上のポリシー判定
  const hasMinLength = value.length >= 8;
  const hasLower = /[a-z]/.test(value);
  const hasUpper = /[A-Z]/.test(value);

  const toggleShow = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={`password-input-wrapper ${className}`}>
      <div className="input-with-icon password-input-row">
        {/* 鍵マーク（クリックすると施錠/開錠が切り替わり中身が見れる） */}
        <button
          type="button"
          className={`password-lock-toggle-btn ${showPassword ? 'unlocked' : 'locked'}`}
          onClick={toggleShow}
          title={showPassword ? '鍵マークを押してパスワードを隠す' : '鍵マークを押してパスワードを表示'}
          aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
        >
          {showPassword ? <Unlock size={17} /> : <Lock size={17} />}
        </button>

        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="form-control password-text-input"
          autoComplete={autoComplete}
        />

        {/* 右端の「表示/隠す」ボタン */}
        <button
          type="button"
          className="password-peek-badge-btn"
          onClick={toggleShow}
          title="中身の表示/非表示を切り替え"
        >
          {showPassword ? '隠す' : '表示'}
        </button>
      </div>

      {/* 新規登録・パスワード再設定時用のポリシー案内 */}
      {showPolicyHints && (
        <div className="password-policy-hints">
          <div className="policy-hint-header">要件: 大文字・小文字込みの8文字以上</div>
          <div className="policy-hint-chips">
            <span className={`policy-chip ${hasMinLength ? 'ok' : 'ng'}`}>
              {hasMinLength ? '✓ 8文字以上' : '• 8文字以上'}
            </span>
            <span className={`policy-chip ${hasLower ? 'ok' : 'ng'}`}>
              {hasLower ? '✓ 小文字(a-z)' : '• 小文字(a-z)'}
            </span>
            <span className={`policy-chip ${hasUpper ? 'ok' : 'ng'}`}>
              {hasUpper ? '✓ 大文字(A-Z)' : '• 大文字(A-Z)'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
