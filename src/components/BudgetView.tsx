import React, { useState } from 'react';
import { 
  Coins, 
  Plus, 
  Trash2, 
  Wallet, 
  Train, 
  Hotel, 
  Utensils, 
  Ticket, 
  Gift, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import type { ExpenseItem, ExpenseCategory } from '../types/travel';

interface BudgetViewProps {
  expenses: ExpenseItem[];
  totalBudget: number;
  onUpdateTotalBudget: (newBudget: number) => void;
  onAddExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  onTogglePaid: (id: string) => void;
  onDeleteExpense: (id: string) => void;
}

const CATEGORY_MAP: Record<ExpenseCategory, { label: string; icon: React.ReactNode; color: string }> = {
  transport: { label: '交通費', icon: <Train size={16} />, color: '#0d9488' },
  hotel: { label: '宿泊費', icon: <Hotel size={16} />, color: '#7c3aed' },
  food: { label: '飲食代', icon: <Utensils size={16} />, color: '#ea580c' },
  activity: { label: '観光・入場料', icon: <Ticket size={16} />, color: '#0284c7' },
  souvenir: { label: 'お土産', icon: <Gift size={16} />, color: '#ca8a04' },
  other: { label: 'その他', icon: <Coins size={16} />, color: '#64748b' },
};

export const BudgetView: React.FC<BudgetViewProps> = ({
  expenses,
  totalBudget,
  onUpdateTotalBudget,
  onAddExpense,
  onTogglePaid,
  onDeleteExpense,
}) => {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(totalBudget));

  // 新規費用フォーム
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('food');
  const [newMemo, setNewMemo] = useState('');
  const [newIsPaid, setNewIsPaid] = useState(false);

  // 計算
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remainingBudget = totalBudget - totalSpent;
  const spentPercent = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;
  const isOverBudget = totalSpent > totalBudget;

  // カテゴリ別集計
  const categoryTotals = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(budgetInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateTotalBudget(val);
      setIsEditingBudget(false);
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(newAmount);
    if (!newTitle.trim() || isNaN(amt) || amt <= 0) return;

    onAddExpense({
      title: newTitle.trim(),
      amount: amt,
      category: newCategory,
      isPaid: newIsPaid,
      memo: newMemo.trim() || undefined,
    });

    setNewTitle('');
    setNewAmount('');
    setNewMemo('');
    setNewIsPaid(false);
  };

  return (
    <div className="budget-view">
      {/* ヘッダー */}
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <Coins className="icon-amber" size={24} />
            予算＆旅行費用の管理
          </h2>
          <p className="section-desc">
            新幹線・飛行機、ホテル代から食事やお土産まで、使った金額をまとめて把握できます。
          </p>
        </div>
      </div>

      {/* 予算サマリーカード */}
      <div className="budget-summary-grid">
        <div className="card budget-card">
          <div className="budget-card-header">
            <span className="budget-card-title">
              <Wallet size={18} className="icon-primary" /> 設定総予算
            </span>
            <button 
              className="btn-edit-link"
              onClick={() => {
                setBudgetInput(String(totalBudget));
                setIsEditingBudget(!isEditingBudget);
              }}
            >
              {isEditingBudget ? 'キャンセル' : '予算を変更'}
            </button>
          </div>

          {isEditingBudget ? (
            <form onSubmit={handleSaveBudget} className="budget-edit-form">
              <input 
                type="number" 
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="form-control"
                placeholder="予算額を入力"
              />
              <button type="submit" className="btn btn-primary btn-sm">保存</button>
            </form>
          ) : (
            <div className="budget-amount-display">
              ¥{totalBudget.toLocaleString()}
            </div>
          )}

          <div className="budget-progress-track">
            <div 
              className={`budget-progress-fill ${isOverBudget ? 'over' : ''}`}
              style={{ width: `${spentPercent}%` }}
            />
          </div>
          <span className="budget-percent-text">予算の {spentPercent}% を使用中</span>
        </div>

        <div className="card budget-card">
          <span className="budget-card-title">現在の合計支出</span>
          <div className="budget-amount-display spent">
            ¥{totalSpent.toLocaleString()}
          </div>
          <span className="budget-sub-text">登録件数: {expenses.length} 件</span>
        </div>

        <div className={`card budget-card ${isOverBudget ? 'card-alert' : ''}`}>
          <span className="budget-card-title">
            {isOverBudget ? (
              <span className="over-label"><AlertCircle size={16} /> 予算オーバー</span>
            ) : (
              '残りの予算'
            )}
          </span>
          <div className={`budget-amount-display ${isOverBudget ? 'over' : 'remaining'}`}>
            ¥{Math.abs(remainingBudget).toLocaleString()}
            {isOverBudget && <span className="over-unit"> 超過</span>}
          </div>
          <span className="budget-sub-text">
            {isOverBudget ? '計画を見直すか予算を調整しましょう' : '無理のない範囲で旅を楽しめます'}
          </span>
        </div>
      </div>

      {/* カテゴリ別内訳バー */}
      <div className="card category-breakdown-card">
        <h3 className="breakdown-title">カテゴリ別支出の内訳</h3>
        <div className="category-chips-row">
          {(Object.keys(CATEGORY_MAP) as ExpenseCategory[]).map((cat) => {
            const catAmt = categoryTotals[cat] || 0;
            const config = CATEGORY_MAP[cat];
            const catPercent = totalSpent > 0 ? Math.round((catAmt / totalSpent) * 100) : 0;

            return (
              <div key={cat} className="category-stat-pill">
                <div className="stat-pill-top">
                  <span className="pill-icon" style={{ color: config.color }}>{config.icon}</span>
                  <span className="pill-name">{config.label}</span>
                </div>
                <div className="pill-amount">¥{catAmt.toLocaleString()}</div>
                <div className="pill-percent">{catPercent}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 新規支出入力フォーム */}
      <div className="card add-expense-card">
        <h3 className="form-heading">新しい支出を追加</h3>
        <form onSubmit={handleAddExpense} className="add-expense-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">項目名 *</label>
              <input 
                type="text" 
                required
                placeholder="費用の項目名・使途を入力"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">金額（円） *</label>
              <input 
                type="number" 
                required
                min="1"
                placeholder="金額を入力（円）"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">カテゴリ</label>
              <select 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ExpenseCategory)}
                className="form-control"
              >
                {(Object.keys(CATEGORY_MAP) as ExpenseCategory[]).map((cat) => (
                  <option key={cat} value={cat}>{CATEGORY_MAP[cat].label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">メモ（任意）</label>
              <input 
                type="text" 
                placeholder="備考やメモを入力"
                value={newMemo}
                onChange={(e) => setNewMemo(e.target.value)}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-actions-row">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={newIsPaid}
                onChange={(e) => setNewIsPaid(e.target.checked)}
              />
              <span>支払い完了済み</span>
            </label>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} />
              支出を記録する
            </button>
          </div>
        </form>
      </div>

      {/* 支出一覧テーブル */}
      <div className="card expense-table-card">
        <h3 className="table-heading">支出・支払い一覧 ({expenses.length} 件)</h3>
        {expenses.length > 0 ? (
          <div className="table-responsive">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>状態</th>
                  <th>項目</th>
                  <th>カテゴリ</th>
                  <th>メモ</th>
                  <th style={{ textAlign: 'right' }}>金額</th>
                  <th style={{ textAlign: 'center' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((item) => {
                  const config = CATEGORY_MAP[item.category] || CATEGORY_MAP.other;
                  return (
                    <tr key={item.id}>
                      <td>
                        <button 
                          className={`paid-status-btn ${item.isPaid ? 'paid' : 'unpaid'}`}
                          onClick={() => onTogglePaid(item.id)}
                          title="クリックで支払い状況を切り替え"
                        >
                          {item.isPaid ? (
                            <>
                              <CheckCircle2 size={14} /> 済
                            </>
                          ) : (
                            '未払い'
                          )}
                        </button>
                      </td>
                      <td className="item-name-cell">{item.title}</td>
                      <td>
                        <span className="table-cat-badge" style={{ color: config.color }}>
                          {config.icon}
                          {config.label}
                        </span>
                      </td>
                      <td className="memo-cell">{item.memo || '-'}</td>
                      <td className="amount-cell">¥{item.amount.toLocaleString()}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="delete-table-btn"
                          onClick={() => onDeleteExpense(item.id)}
                          title="削除"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>まだ登録された支出項目はありません。</p>
          </div>
        )}
      </div>
    </div>
  );
};
