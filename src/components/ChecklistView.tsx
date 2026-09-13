import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  Shirt, 
  Pill, 
  Smartphone, 
  ClipboardList,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ChecklistItem, ChecklistCategory } from '../types/travel';

interface ChecklistViewProps {
  checklists: ChecklistItem[];
  onToggleItem: (id: string) => void;
  onAddItem: (category: ChecklistCategory, title: string) => void;
  onDeleteItem: (id: string) => void;
  onAddPresets: () => void;
  onResetChecks: () => void;
}

// カテゴリ別設定
const CATEGORY_CONFIG: Record<ChecklistCategory, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  valuable: { label: '貴重品・チケット', icon: <ShieldCheck size={18} />, color: '#0284c7', bg: '#e0f2fe' },
  gadget: { label: '充電器・電子機器', icon: <Smartphone size={18} />, color: '#8b5cf6', bg: '#ede9fe' },
  clothes: { label: '衣類・靴', icon: <Shirt size={18} />, color: '#ea580c', bg: '#ffedd5' },
  daily: { label: '日用品・常備薬', icon: <Pill size={18} />, color: '#16a34a', bg: '#dcfce7' },
  todo: { label: '事前予約・やること', icon: <ClipboardList size={18} />, color: '#db2777', bg: '#fce7f3' },
};

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  checklists,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  onAddPresets,
  onResetChecks,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ChecklistCategory>('valuable');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // 計算
  const totalCount = checklists.length;
  const completedCount = checklists.filter((c) => c.isDone).length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // チェック切り替え時に100%達成なら紙吹雪
  const handleToggle = (id: string) => {
    const target = checklists.find((c) => c.id === id);
    if (target && !target.isDone && completedCount + 1 === totalCount && totalCount > 0) {
      // 100%達成！
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    onToggleItem(id);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddItem(newCategory, newTitle.trim());
    setNewTitle('');
  };

  // フィルタリング
  const filteredItems = checklists.filter((item) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'incomplete') return !item.isDone;
    return item.category === selectedFilter;
  });

  return (
    <div className="checklist-view">
      {/* ヘッダー */}
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <CheckSquare className="icon-teal" size={24} />
            持ち物＆事前準備ToDoチェックリスト
          </h2>
          <p className="section-desc">
            旅行の忘れ物を徹底防止！定番アイテムの一括追加や、カテゴリごとの確認ができます。
          </p>
        </div>
        <div className="checklist-top-actions">
          <button className="btn btn-secondary btn-sm" onClick={onAddPresets}>
            <Sparkles size={16} />
            定番アイテムを一括追加
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onResetChecks} title="すべてのチェックを外す">
            <RefreshCw size={14} />
            チェックをリセット
          </button>
        </div>
      </div>

      {/* 進捗プログレスカード */}
      <div className="card progress-card">
        <div className="progress-header">
          <div className="progress-info">
            <span className="progress-label">準備の達成状況</span>
            <span className="progress-numbers">
              <strong>{completedCount}</strong> / {totalCount} 完了
            </span>
          </div>
          <span className={`progress-percentage ${progressPercent === 100 ? 'complete' : ''}`}>
            {progressPercent}%
            {progressPercent === 100 && <CheckCircle2 size={20} className="check-all-icon" />}
          </span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className={`progress-bar-fill ${progressPercent === 100 ? 'complete' : ''}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {progressPercent === 100 && totalCount > 0 && (
          <p className="congrats-text">🎉 素晴らしい！すべての持ち物と準備が完了しました！よい旅を！</p>
        )}
      </div>

      {/* 新規アイテム入力フォーム */}
      <div className="card add-item-bar-card">
        <form onSubmit={handleAddSubmit} className="add-item-form">
          <select 
            value={newCategory} 
            onChange={(e) => setNewCategory(e.target.value as ChecklistCategory)}
            className="form-control category-select"
          >
            {(Object.keys(CATEGORY_CONFIG) as ChecklistCategory[]).map((cat) => (
              <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder="新しい持ち物や準備タスクを入力（例: モバイルバッテリー、新幹線の予約）" 
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="form-control item-input"
          />
          <button type="submit" className="btn btn-primary add-submit-btn">
            <Plus size={18} />
            追加
          </button>
        </form>
      </div>

      {/* 絞り込みフィルタータブ */}
      <div className="checklist-filter-bar">
        <button
          className={`chip-btn ${selectedFilter === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('all')}
        >
          すべて ({totalCount})
        </button>
        <button
          className={`chip-btn ${selectedFilter === 'incomplete' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('incomplete')}
        >
          未チェック ({totalCount - completedCount})
        </button>
        {(Object.keys(CATEGORY_CONFIG) as ChecklistCategory[]).map((cat) => {
          const catCount = checklists.filter((c) => c.category === cat).length;
          if (catCount === 0) return null;
          return (
            <button
              key={cat}
              className={`chip-btn ${selectedFilter === cat ? 'active' : ''}`}
              onClick={() => setSelectedFilter(cat)}
            >
              {CATEGORY_CONFIG[cat].label} ({catCount})
            </button>
          );
        })}
      </div>

      {/* リスト本体（カテゴリ別に整列） */}
      <div className="checklist-container">
        {filteredItems.length > 0 ? (
          <div className="checklist-items-grid">
            {filteredItems.map((item) => {
              const catConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.valuable;
              return (
                <div 
                  key={item.id} 
                  className={`card checklist-item-card ${item.isDone ? 'done' : ''}`}
                  onClick={() => handleToggle(item.id)}
                >
                  <button className="check-btn" type="button">
                    {item.isDone ? (
                      <CheckSquare size={22} className="icon-checked" />
                    ) : (
                      <Square size={22} className="icon-unchecked" />
                    )}
                  </button>

                  <div className="item-text-wrap">
                    <span className={`item-title ${item.isDone ? 'line-through' : ''}`}>
                      {item.title}
                    </span>
                    <span 
                      className="item-cat-tag"
                      style={{ color: catConfig.color, backgroundColor: catConfig.bg }}
                    >
                      {catConfig.icon}
                      {catConfig.label}
                    </span>
                  </div>

                  <button 
                    className="delete-item-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    title="削除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state card">
            <CheckSquare size={44} className="empty-icon" />
            <h3>表示するアイテムがありません</h3>
            <p>上部の入力バーから追加するか、「定番アイテムを一括追加」を押してみてください。</p>
          </div>
        )}
      </div>
    </div>
  );
};
