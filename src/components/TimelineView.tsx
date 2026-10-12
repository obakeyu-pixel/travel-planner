import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Car, 
  Footprints, 
  Train, 
  Plane, 
  Utensils, 
  Camera, 
  Hotel, 
  Sparkles,
  Heart
} from 'lucide-react';
import type { ScheduleItem, ScheduleCategory, Spot } from '../types/travel';

interface TimelineViewProps {
  schedules: ScheduleItem[];
  savedSpots: Spot[];
  totalDays: number;
  onAddScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  onUpdateScheduleItem: (item: ScheduleItem) => void;
  onDeleteScheduleItem: (id: string) => void;
  onAddDay: () => void;
}

// カテゴリ別アイコンとカラー
const CATEGORY_CONFIG: Record<ScheduleCategory, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  spot: { label: '観光・散策', icon: <Camera size={16} />, color: '#0284c7', bg: '#e0f2fe' },
  meal: { label: '食事・カフェ', icon: <Utensils size={16} />, color: '#ea580c', bg: '#ffedd5' },
  transport: { label: '移動', icon: <Train size={16} />, color: '#0d9488', bg: '#ccfbf1' },
  hotel: { label: 'ホテル・宿泊', icon: <Hotel size={16} />, color: '#7c3aed', bg: '#ede9fe' },
  free: { label: '自由時間', icon: <Sparkles size={16} />, color: '#64748b', bg: '#f1f5f9' },
};

// 交通手段アイコン
const getTransportIcon = (mode?: string) => {
  switch (mode) {
    case 'walk': return <Footprints size={14} />;
    case 'train': return <Train size={14} />;
    case 'car': return <Car size={14} />;
    case 'plane': return <Plane size={14} />;
    default: return <Footprints size={14} />;
  }
};

export const TimelineView: React.FC<TimelineViewProps> = ({
  schedules,
  savedSpots,
  totalDays,
  onAddScheduleItem,
  onUpdateScheduleItem,
  onDeleteScheduleItem,
  onAddDay,
}) => {
  const [activeDay, setActiveDay] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  // フォームステート
  const [formTime, setFormTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('10:30');
  const [formCategory, setFormCategory] = useState<ScheduleCategory>('spot');
  const [formTitle, setFormTitle] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formMemo, setFormMemo] = useState('');
  const [formCost, setFormCost] = useState<string>('');
  const [formTransportMode, setFormTransportMode] = useState<'walk' | 'train' | 'car' | 'bus' | 'plane'>('walk');
  const [formTransportDuration, setFormTransportDuration] = useState('');

  // 編集モーダルを開く
  const openEditModal = (item: ScheduleItem) => {
    setEditingItem(item);
    setFormTime(item.time);
    setFormEndTime(item.endTime || '');
    setFormCategory(item.category);
    setFormTitle(item.title);
    setFormLocation(item.location || '');
    setFormMemo(item.memo || '');
    setFormCost(item.cost ? String(item.cost) : '');
    setFormTransportMode(item.transportMode || 'walk');
    setFormTransportDuration(item.transportDuration || '');
    setIsAddModalOpen(true);
  };

  // 新規追加モーダルを開く
  const openCreateModal = () => {
    setEditingItem(null);
    setFormTime('10:00');
    setFormEndTime('11:30');
    setFormCategory('spot');
    setFormTitle('');
    setFormLocation('');
    setFormMemo('');
    setFormCost('');
    setFormTransportMode('walk');
    setFormTransportDuration('');
    setIsAddModalOpen(true);
  };

  // フォーム送信
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingItem) {
      onUpdateScheduleItem({
        ...editingItem,
        time: formTime,
        endTime: formEndTime.trim() || undefined,
        category: formCategory,
        title: formTitle.trim(),
        location: formLocation.trim() || undefined,
        memo: formMemo.trim() || undefined,
        cost: formCost ? Number(formCost) : undefined,
        transportMode: formTransportMode,
        transportDuration: formTransportDuration.trim() || undefined,
      });
    } else {
      onAddScheduleItem({
        dayNumber: activeDay,
        time: formTime,
        endTime: formEndTime.trim() || undefined,
        category: formCategory,
        title: formTitle.trim(),
        location: formLocation.trim() || undefined,
        memo: formMemo.trim() || undefined,
        cost: formCost ? Number(formCost) : undefined,
        transportMode: formTransportMode,
        transportDuration: formTransportDuration.trim() || undefined,
      });
    }

    setIsAddModalOpen(false);
  };

  // 行きたいリストからワンクリックでフォームに反映
  const handleSelectSavedSpot = (spot: Spot) => {
    setFormTitle(spot.name);
    setFormLocation(spot.address || spot.name);
    setFormMemo(spot.tips || spot.description);
    setFormCategory(spot.category === 'gourmet' ? 'meal' : 'spot');
  };

  // 現在の日の予定を時刻順でソート
  const currentDaySchedules = schedules
    .filter((item) => item.dayNumber === activeDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="timeline-view">
      {/* 上部ヘッダー */}
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <Calendar className="icon-teal" size={24} />
            旅程・タイムライン管理（しおり）
          </h2>
          <p className="section-desc">
            日ごとのタイムスケジュールを時系列で整理。何時にどこへ行くか、移動時間やメモを直感的に管理できます。
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          この日に予定を追加
        </button>
      </div>

      {/* 日程タブ切り替え */}
      <div className="day-tabs-bar">
        <div className="day-tabs-list">
          {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
            const dayCount = schedules.filter((s) => s.dayNumber === day).length;
            return (
              <button
                key={day}
                className={`day-tab-btn ${activeDay === day ? 'active' : ''}`}
                onClick={() => setActiveDay(day)}
              >
                <span className="day-number">{day}日目</span>
                <span className="day-count-badge">{dayCount} 件</span>
              </button>
            );
          })}
        </div>
        <button 
          className="btn btn-secondary btn-sm add-day-btn"
          onClick={onAddDay}
          title="旅行の日数を1日追加する"
        >
          <Plus size={14} />
          日数を追加
        </button>
      </div>

      {/* タイムラインメインエリア */}
      <div className="timeline-container">
        {currentDaySchedules.length > 0 ? (
          <div className="timeline-list">
            {currentDaySchedules.map((item, index) => {
              const catConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.spot;
              return (
                <div key={item.id} className="timeline-item">
                  {/* 左側：時刻表示 */}
                  <div className="timeline-time-col">
                    <span className="time-start">{item.time}</span>
                    {item.endTime && (
                      <span className="time-end">〜 {item.endTime}</span>
                    )}
                  </div>

                  {/* 中央：軸とアイコンピン */}
                  <div className="timeline-axis-col">
                    <div 
                      className="timeline-pin"
                      style={{ backgroundColor: catConfig.bg, color: catConfig.color, borderColor: catConfig.color }}
                    >
                      {catConfig.icon}
                    </div>
                    {index !== currentDaySchedules.length - 1 && <div className="timeline-line" />}
                  </div>

                  {/* 右側：カード本文 */}
                  <div className="timeline-card card">
                    <div className="timeline-card-header">
                      <span 
                        className="cat-badge"
                        style={{ color: catConfig.color, backgroundColor: catConfig.bg }}
                      >
                        {catConfig.label}
                      </span>
                      <div className="item-actions">
                        <button 
                          className="action-icon-btn" 
                          onClick={() => openEditModal(item)}
                          title="編集"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button 
                          className="action-icon-btn delete" 
                          onClick={() => onDeleteScheduleItem(item.id)}
                          title="削除"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <h3 className="timeline-item-title">{item.title}</h3>

                    {item.location && (
                      <div className="timeline-meta-row">
                        <MapPin size={14} className="icon-muted" />
                        <span className="location-text">{item.location}</span>
                      </div>
                    )}

                    {item.memo && (
                      <p className="timeline-item-memo">{item.memo}</p>
                    )}

                    {/* 移動情報または費用 */}
                    <div className="timeline-footer-row">
                      {item.transportDuration && (
                        <span className="transport-chip">
                          {getTransportIcon(item.transportMode)}
                          {item.transportDuration}
                        </span>
                      )}
                      {item.cost !== undefined && item.cost > 0 && (
                        <span className="cost-badge">
                          ¥{item.cost.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state card">
            <Clock size={44} className="empty-icon" />
            <h3>{activeDay}日目の予定はまだありません</h3>
            <p>「この日に予定を追加」ボタンからスケジュールを作成しましょう！</p>
            <button className="btn btn-primary" onClick={openCreateModal} style={{ marginTop: '16px' }}>
              <Plus size={16} />
              予定を追加する
            </button>
          </div>
        )}
      </div>

      {/* 予定追加・編集モーダル */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingItem ? '予定を編集' : `${activeDay}日目の予定を追加`}
              </h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* 行きたいリストからのクイック選択（新規追加時のみ） */}
                {!editingItem && savedSpots.length > 0 && (
                  <div className="saved-spots-picker">
                    <label className="picker-label">
                      <Heart size={14} fill="#f43f5e" color="#f43f5e" />
                      「行きたいリスト」から選んで自動入力:
                    </label>
                    <div className="picker-chips-scroll">
                      {savedSpots.map((spot) => (
                        <button
                          key={spot.id}
                          type="button"
                          className="picker-chip"
                          onClick={() => handleSelectSavedSpot(spot)}
                        >
                          {spot.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">予定のタイトル *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="予定のタイトルを入力"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">開始時間 *</label>
                    <input 
                      type="time" 
                      required
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">終了時間（目安）</label>
                    <input 
                      type="time" 
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">カテゴリ</label>
                    <select 
                      className="form-control"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as ScheduleCategory)}
                    >
                      {(Object.keys(CATEGORY_CONFIG) as ScheduleCategory[]).map((cat) => (
                        <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">費用目安（円）</label>
                    <input 
                      type="number" 
                      placeholder="金額を入力（円）"
                      value={formCost}
                      onChange={(e) => setFormCost(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">場所・アクセス</label>
                  <input 
                    type="text" 
                    placeholder="場所や住所を入力"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">移動手段</label>
                    <select 
                      className="form-control"
                      value={formTransportMode}
                      onChange={(e) => setFormTransportMode(e.target.value as any)}
                    >
                      <option value="walk">徒歩</option>
                      <option value="train">電車</option>
                      <option value="bus">バス</option>
                      <option value="car">車・タクシー</option>
                      <option value="plane">飛行機</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">移動時間</label>
                    <input 
                      type="text" 
                      placeholder="移動時間を入力"
                      value={formTransportDuration}
                      onChange={(e) => setFormTransportDuration(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">メモ・見どころ・予約詳細</label>
                  <textarea 
                    rows={3}
                    placeholder="予約番号や持ち物、見どころなどのメモ"
                    value={formMemo}
                    onChange={(e) => setFormMemo(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? '変更を保存' : '予定を追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
