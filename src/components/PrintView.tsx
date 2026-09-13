import React from 'react';
import { Printer, MapPin, Calendar, Users, FileText, CheckSquare, Coins } from 'lucide-react';
import type { TripPlan } from '../types/travel';
import { THEME_PRESETS } from '../data/sampleData';

interface PrintViewProps {
  tripPlan: TripPlan;
  onBack: () => void;
}

export const PrintView: React.FC<PrintViewProps> = ({ tripPlan, onBack }) => {
  const currentTheme = THEME_PRESETS.find((t) => t.id === tripPlan.themeId) || THEME_PRESETS[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-view-container">
      {/* 印刷・操作コントロールバー（画面上のみ表示、印刷時は非表示） */}
      <div className="print-actions-bar no-print">
        <button className="btn btn-secondary" onClick={onBack}>
          ← アプリ編集画面に戻る
        </button>
        <button className="btn btn-primary" onClick={handlePrint}>
          <Printer size={18} />
          しおりを印刷 / PDF保存
        </button>
      </div>

      {/* しおりシート本体 */}
      <div className="shiori-sheet">
        {/* 表紙・ヘッダー */}
        <div className="shiori-header" style={{ borderBottomColor: currentTheme.primaryColor }}>
          <span className="shiori-kicker" style={{ color: currentTheme.primaryColor }}>
            TRAVEL GUIDEBOOK & ITINERARY - {currentTheme.name}
          </span>
          <h1 className="shiori-title">{tripPlan.title}</h1>
          <div className="shiori-meta-grid">
            <div className="shiori-meta-item">
              <MapPin size={16} style={{ color: currentTheme.primaryColor }} />
              <span>目的地: <strong>{tripPlan.destination}</strong></span>
            </div>
            <div className="shiori-meta-item">
              <Calendar size={16} style={{ color: currentTheme.primaryColor }} />
              <span>日程: <strong>{tripPlan.startDate} 〜 {tripPlan.endDate} ({tripPlan.totalDays}日間)</strong></span>
            </div>
            {tripPlan.members && tripPlan.members.length > 0 && (
              <div className="shiori-meta-item">
                <Users size={16} style={{ color: currentTheme.primaryColor }} />
                <span>参加メンバー: <strong>{tripPlan.members.join('、')}</strong></span>
              </div>
            )}
          </div>
          {tripPlan.memo && (
            <div className="shiori-memo-box">
              <FileText size={15} />
              <span>{tripPlan.memo}</span>
            </div>
          )}
        </div>

        {/* 日程タイムライン */}
        <div className="shiori-section">
          <h2 className="shiori-section-title">
            <Calendar size={18} /> 旅程スケジュール
          </h2>
          <div className="shiori-days-grid">
            {Array.from({ length: tripPlan.totalDays }, (_, i) => i + 1).map((day) => {
              const daySchedules = (tripPlan.schedules || [])
                .filter((s) => s.dayNumber === day)
                .sort((a, b) => a.time.localeCompare(b.time));

              return (
                <div key={day} className="shiori-day-card">
                  <div className="shiori-day-header">
                    <span className="shiori-day-badge" style={{ backgroundColor: currentTheme.primaryColor }}>
                      Day {day}
                    </span>
                  </div>
                  {daySchedules.length > 0 ? (
                    <ul className="shiori-timeline-list">
                      {daySchedules.map((item) => (
                        <li key={item.id} className="shiori-schedule-row">
                          <span className="shiori-time" style={{ color: currentTheme.primaryColor }}>
                            {item.time}
                          </span>
                          <div className="shiori-schedule-detail">
                            <span className="shiori-schedule-title">{item.title}</span>
                            {item.location && <span className="shiori-location">📍 {item.location}</span>}
                            {item.memo && <span className="shiori-submemo">{item.memo}</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="shiori-empty">予定なし</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 行きたいスポット・連絡先一覧 */}
        {tripPlan.savedSpots && tripPlan.savedSpots.length > 0 && (
          <div className="shiori-section">
            <h2 className="shiori-section-title">
              <MapPin size={18} /> 行きたい場所・連絡先メモ
            </h2>
            <div className="shiori-spots-grid">
              {tripPlan.savedSpots.map((spot) => (
                <div key={spot.id} className="shiori-spot-item">
                  <strong>{spot.name}</strong>
                  {spot.address && <div className="shiori-spot-sub">📍 {spot.address}</div>}
                  {spot.phoneNumber && <div className="shiori-spot-sub">📞 {spot.phoneNumber}</div>}
                  {spot.tips && <div className="shiori-spot-tips">💡 {spot.tips}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 持ち物＆ToDoチェックリスト */}
        <div className="shiori-section">
          <h2 className="shiori-section-title">
            <CheckSquare size={18} /> 持ち物＆準備チェック
          </h2>
          <div className="shiori-checklist-grid">
            {(tripPlan.checklists || []).map((item) => (
              <div key={item.id} className="shiori-check-item">
                <span className={`shiori-box ${item.isDone ? 'checked' : ''}`} style={item.isDone ? { backgroundColor: currentTheme.primaryColor } : {}}>
                  {item.isDone ? '✓' : ''}
                </span>
                <span className={item.isDone ? 'done-text' : ''}>
                  {item.title}
                  {item.assignedTo && <small style={{ marginLeft: '4px', color: '#64748b' }}>({item.assignedTo})</small>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 予算・費用メモ */}
        <div className="shiori-section">
          <h2 className="shiori-section-title">
            <Coins size={18} /> 費用＆予算メモ
          </h2>
          <div className="shiori-budget-summary">
            <span>総予算: ¥{(tripPlan.totalBudget || 0).toLocaleString()}</span>
            <span>
              予定合計: ¥{(tripPlan.expenses || []).reduce((s, e) => s + e.amount, 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="shiori-footer">
          旅ぷらん (TabiPlan) で作成
        </div>
      </div>
    </div>
  );
};
