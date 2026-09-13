import React, { useState } from 'react';
import { Palette, Sparkles, Users } from 'lucide-react';
import type { TripPlan } from '../types/travel';
import { THEME_PRESETS, detectThemeByKeyword } from '../data/sampleData';
import { POPULAR_THEMES, generateTripPlanFromTheme } from '../utils/planGenerator';

interface EditTripModalProps {
  tripPlan: TripPlan;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<TripPlan>) => void;
  onResetToSample?: () => void;
}

export const EditTripModal: React.FC<EditTripModalProps> = ({
  tripPlan,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(tripPlan.title);
  const [destination, setDestination] = useState(tripPlan.destination);
  const [startDate, setStartDate] = useState(tripPlan.startDate);
  const [endDate, setEndDate] = useState(tripPlan.endDate);
  const [totalDays, setTotalDays] = useState(tripPlan.totalDays);
  const [members, setMembers] = useState(tripPlan.members.join(', '));
  const [memo, setMemo] = useState(tripPlan.memo);
  const [selectedThemeId, setSelectedThemeId] = useState(tripPlan.themeId || 'trad-kyoto');
  const [themeKeyword, setThemeKeyword] = useState(tripPlan.themeKeyword || '');

  if (!isOpen) return null;

  // テーマキーワードが入力されたら自動でテーマを推測して切り替え
  const handleKeywordChange = (val: string) => {
    setThemeKeyword(val);
    if (val.trim()) {
      const matched = detectThemeByKeyword(val);
      setSelectedThemeId(matched.id);
    }
  };

  // テーマからプラン全体（旅程・持ち物・スポット・予算）を一括自動生成して適用
  const handleAutoGeneratePlan = (keywordToUse: string) => {
    const targetKw = keywordToUse.trim() || '温泉 癒やし';
    const memberList = members.split(',').map((m) => m.trim()).filter(Boolean);
    const generated = generateTripPlanFromTheme(targetKw, memberList.length > 0 ? memberList : ['けんた', 'さくら']);

    // フォームフィールドを更新
    setTitle(generated.title);
    setDestination(generated.destination);
    setStartDate(generated.startDate);
    setEndDate(generated.endDate);
    setTotalDays(generated.totalDays);
    setMemo(generated.memo);
    setSelectedThemeId(generated.themeId);
    setThemeKeyword(generated.themeKeyword || targetKw);

    // ユーザーに確認してプラン全体を即時反映
    if (window.confirm(`「${targetKw}」のテーマに合わせて、タイトル・旅程スケジュール・スポット・持ち物・予算を一括自動作成しました！\n\n今すぐ旅行しおり全体に反映しますか？`)) {
      onSave({
        ...generated,
        members: memberList.length > 0 ? memberList : ['けんた', 'さくら'],
      });
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: title.trim() || '旅行計画',
      destination: destination.trim() || '未設定',
      startDate,
      endDate,
      totalDays: Number(totalDays) || 1,
      members: members.split(',').map((m) => m.trim()).filter(Boolean),
      memo: memo.trim(),
      themeId: selectedThemeId,
      themeKeyword: themeKeyword.trim(),
    });
    onClose();
  };

  const currentTheme = THEME_PRESETS.find((t) => t.id === selectedThemeId) || THEME_PRESETS[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog edit-trip-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">旅行の基本設定＆テーマカスタマイズ</h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* テーマ設定セクション */}
            <div className="theme-setting-section">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Palette size={16} className="icon-primary" />
                旅行のテーマ・雰囲気（色合い・柄パターン＆プラン自動作成）
              </label>
              <p className="modal-subtext" style={{ marginBottom: '8px' }}>
                テーマ（例: 温泉、沖縄、京都、北海道、キャンプ、グルメなど）を入力して<strong>「プラン自動作成」</strong>を押すと、タイトル・日程・タイムライン・持ち物・予算・スポットが一発で自動生成されます！
              </p>

              {/* テーマ入力欄＆自動作成ボタン */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <div className="theme-keyword-input-wrap" style={{ flex: 1, margin: 0 }}>
                  <Sparkles size={16} className="sparkle-icon" />
                  <input 
                    type="text" 
                    placeholder="テーマを入力（例: 温泉、京都、沖縄、北海道、キャンプ）"
                    value={themeKeyword}
                    onChange={(e) => handleKeywordChange(e.target.value)}
                    className="form-control"
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
                  onClick={() => handleAutoGeneratePlan(themeKeyword)}
                  title="入力したテーマに合わせてプラン・旅程・持ち物・スポットを自動作成します"
                >
                  <Sparkles size={16} />
                  このテーマで自動作成
                </button>
              </div>

              {/* 人気テーマのクイック選択チップ */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
                  おすすめの旅行テーマ（クリックで自動作成）:
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {POPULAR_THEMES.map((pt) => (
                    <button
                      type="button"
                      key={pt.id}
                      className="tag-filter-btn"
                      style={{ fontSize: '0.78rem', padding: '4px 10px', borderRadius: '16px' }}
                      onClick={() => {
                        setThemeKeyword(pt.themeKeyword);
                        handleAutoGeneratePlan(pt.themeTitle);
                      }}
                      title={pt.description}
                    >
                      {pt.badge} {pt.themeTitle.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* テーマカラー・柄プリセット一覧選択 */}
              <div className="theme-chips-list">
                {THEME_PRESETS.map((theme) => {
                  const isSelected = theme.id === selectedThemeId;
                  return (
                    <button
                      type="button"
                      key={theme.id}
                      className={`theme-chip-card ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedThemeId(theme.id)}
                    >
                      <span 
                        className="theme-color-dot" 
                        style={{ backgroundColor: theme.primaryColor }} 
                      />
                      <span className="theme-name">{theme.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* 選択中テーマの柄プレビュー */}
              <div 
                className="theme-preview-box"
                style={{ background: currentTheme.heroGradient }}
              >
                <div className={`hero-pattern-overlay pattern-${currentTheme.patternType}`} />
                <div className="theme-preview-text">
                  <span>選択中: <strong>{currentTheme.name}</strong></span>
                  <span className="pattern-badge">{currentTheme.patternDescription}</span>
                </div>
              </div>
            </div>

            {/* 基本情報フォーム */}
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">旅行タイトル *</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: 京都 2泊3日 風情とグルメを満喫する癒やし旅"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">目的地・主なエリア</label>
              <input 
                type="text" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="例: 京都府（嵐山・祇園・東山）"
                className="form-control"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">出発日</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">帰着日</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">旅行日数</label>
                <input 
                  type="number" 
                  min="1"
                  max="14"
                  value={totalDays}
                  onChange={(e) => setTotalDays(Number(e.target.value))}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Users size={14} /> 一緒に行くメンバー（カンマ区切り）
                </label>
                <input 
                  type="text" 
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                  placeholder="例: 自分, さくら, けんじ"
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">旅のテーマ・メモ</label>
              <textarea 
                rows={2}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="今回の旅の目的や合流場所、注意事項など"
                className="form-control"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary">
              設定を保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
