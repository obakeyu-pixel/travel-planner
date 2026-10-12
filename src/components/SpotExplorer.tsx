import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Clock, 
  Coins, 
  Heart, 
  Plus, 
  ExternalLink, 
  Sparkles, 
  Search,
  Filter,
  CalendarPlus,
  Phone,
  Ticket,
  Users,
  Camera
} from 'lucide-react';
import type { Spot, SpotCategory, ScheduleCategory } from '../types/travel';
import { PhotoEditorModal } from './PhotoEditorModal';

interface SpotExplorerProps {
  savedSpots: Spot[];
  members: string[];
  onToggleSaveSpot: (spot: Spot) => void;
  onAddCustomSpot: (spot: Spot) => void;
  onAddToSchedule: (spot: Spot, dayNumber: number, time: string, category: ScheduleCategory) => void;
  onToggleMemberVote: (spotId: string, memberName: string) => void;
  onUpdateSpotPhoto?: (spotId: string, newImageUrl?: string) => void;
  totalDays: number;
}

// カテゴリ別バッジ情報
const CATEGORY_MAP: Record<SpotCategory, { label: string; color: string; bg: string }> = {
  sightseeing: { label: '観光・名所', color: '#0284c7', bg: '#e0f2fe' },
  gourmet: { label: 'グルメ・カフェ', color: '#ea580c', bg: '#ffedd5' },
  nature: { label: '絶景・自然', color: '#16a34a', bg: '#dcfce7' },
  activity: { label: '体験・遊び', color: '#9333ea', bg: '#f3e8ff' },
  hotspring: { label: '温泉・宿', color: '#db2777', bg: '#fce7f3' },
  shopping: { label: 'お土産・買物', color: '#ca8a04', bg: '#fef9c3' },
};

export const SpotExplorer: React.FC<SpotExplorerProps> = ({
  savedSpots,
  members,
  onToggleSaveSpot,
  onAddCustomSpot,
  onAddToSchedule,
  onToggleMemberVote,
  onUpdateSpotPhoto,
  totalDays,
}) => {
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // モーダル状態
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [scheduleModalSpot, setScheduleModalSpot] = useState<Spot | null>(null);
  const [scheduleDay, setScheduleDay] = useState(1);
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [editingPhotoSpot, setEditingPhotoSpot] = useState<Spot | null>(null);
  
  // 新規スポットフォーム
  const [newSpotName, setNewSpotName] = useState('');
  const [newSpotArea, setNewSpotArea] = useState('');
  const [newSpotCategory, setNewSpotCategory] = useState<SpotCategory>('sightseeing');
  const [newSpotDesc, setNewSpotDesc] = useState('');
  const [newSpotDuration, setNewSpotDuration] = useState('約1時間');
  const [newSpotBudget, setNewSpotBudget] = useState('無料');
  const [newSpotTips, setNewSpotTips] = useState('');
  const [newSpotImage, setNewSpotImage] = useState('');
  const [newSpotAddress, setNewSpotAddress] = useState('');
  const [newSpotPhone, setNewSpotPhone] = useState('');
  const [newSpotBookingUrl, setNewSpotBookingUrl] = useState('');

  // スポットの保存状態を判定
  const isSpotSaved = (spotId: string) => savedSpots.some((s) => s.id === spotId);

  // ユーザーが登録・保存したスポットのみを対象とする（デフォルト観光地は全廃）
  const allSpots = savedSpots.map((s) => ({ ...s, isSaved: true }));

  // エリア一覧の抽出（登録されたスポットのエリアのみ）
  const dynamicAreas = Array.from(new Set(allSpots.map((s) => s.area).filter(Boolean)));
  const areas = dynamicAreas.length > 0 ? ['all', ...dynamicAreas] : [];

  // フィルタリング処理
  const filteredSpots = allSpots.filter((spot) => {
    const matchArea = selectedArea === 'all' || spot.area === selectedArea;
    const matchCat = selectedCategory === 'all' || spot.category === selectedCategory;
    const matchQuery = 
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (spot.tips && spot.tips.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (spot.address && spot.address.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchArea && matchCat && matchQuery;
  });

  // 新規スポットの追加送信
  const handleCreateCustomSpot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpotName.trim()) return;

    const newSpot: Spot = {
      id: `custom-${Date.now()}`,
      name: newSpotName.trim(),
      area: newSpotArea.trim() || 'その他',
      category: newSpotCategory,
      description: newSpotDesc.trim() || 'メンバーが登録した行きたいスポット',
      imageUrl: newSpotImage.trim() || undefined,
      recommendedDuration: newSpotDuration || '約1時間',
      estimatedBudget: newSpotBudget || '予算未定',
      tips: newSpotTips.trim(),
      address: newSpotAddress.trim() || undefined,
      phoneNumber: newSpotPhone.trim() || undefined,
      bookingUrl: newSpotBookingUrl.trim() || undefined,
      isSaved: true,
      isCustom: true,
      wantedMembers: ['自分'],
    };

    onAddCustomSpot(newSpot);
    setIsAddModalOpen(false);

    // リセット
    setNewSpotName('');
    setNewSpotDesc('');
    setNewSpotTips('');
    setNewSpotImage('');
    setNewSpotAddress('');
    setNewSpotPhone('');
    setNewSpotBookingUrl('');
  };

  // 旅程への追加実行
  const handleConfirmAddToSchedule = () => {
    if (!scheduleModalSpot) return;
    const category: ScheduleCategory = 
      scheduleModalSpot.category === 'gourmet' ? 'meal' : 'spot';

    onAddToSchedule(scheduleModalSpot, scheduleDay, scheduleTime, category);
    setScheduleModalSpot(null);
  };

  return (
    <div className="spot-explorer">
      {/* 上部ヘッダー＆アクション */}
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <Compass className="icon-teal" size={24} />
            どこ行く？（行きたいスポット）
          </h2>
          <p className="section-desc">
            行きたい観光地やカフェ・レストランを登録。メンバーと「ここ行きたい！」と投票しながら旅程に組み込めます。
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={18} />
          行きたい場所を新しく登録
        </button>
      </div>

      {/* スポットが0件の初期白紙状態 */}
      {allSpots.length === 0 ? (
        <div className="empty-state card" style={{ padding: '48px 24px', textAlign: 'center', marginTop: '16px' }}>
          <Compass size={48} className="empty-icon" style={{ margin: '0 auto 12px', color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>登録されているスポットはありません</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.6 }}>
            各地の観光地サンプルはすべてクリアされています。<br />
            右上の「＋ 行きたい場所を新しく登録」から、行きたい観光地やお店を自由に追加してください。
          </p>
          <button 
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
            style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> 行きたい場所を新しく登録する
          </button>
        </div>
      ) : (
        <>
          {/* 検索＆フィルターバー */}
          <div className="card filter-bar-card">
            {/* キーワード検索 */}
            <div className="search-input-wrap">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="スポット名、見どころ、住所、キーワードで検索..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>×</button>
              )}
            </div>

            <div className="filter-tags-row">
              {/* エリアフィルター（エリアが存在する場合のみ表示） */}
              {areas.length > 1 && (
                <div className="filter-group">
                  <span className="filter-label"><MapPin size={14} /> エリア:</span>
                  <div className="filter-chips">
                    {areas.map((area) => (
                      <button
                        key={area}
                        className={`chip-btn ${selectedArea === area ? 'active' : ''}`}
                        onClick={() => setSelectedArea(area)}
                      >
                        {area === 'all' ? 'すべての地域' : area}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ジャンルフィルター */}
              <div className="filter-group">
                <span className="filter-label"><Filter size={14} /> ジャンル:</span>
                <div className="filter-chips">
                  <button
                    className={`chip-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('all')}
                  >
                    すべて
                  </button>
                  {(Object.keys(CATEGORY_MAP) as SpotCategory[]).map((cat) => (
                    <button
                      key={cat}
                      className={`chip-btn ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {CATEGORY_MAP[cat].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ヒット件数・ステータス表示 */}
          <div className="results-count-bar">
            <span>全 <strong>{filteredSpots.length}</strong> 件のスポット</span>
            {savedSpots.length > 0 && (
              <span className="saved-summary-pill">
                <Heart size={14} fill="#f43f5e" color="#f43f5e" />
                行きたいリスト: {savedSpots.length} 件ストック中
              </span>
            )}
          </div>

          {/* スポットカードグリッド */}
          <div className="spots-grid">
            {filteredSpots.map((spot) => {
              const saved = isSpotSaved(spot.id);
          const catInfo = CATEGORY_MAP[spot.category] || CATEGORY_MAP.sightseeing;
          const wanted = spot.wantedMembers || [];

          return (
            <div key={spot.id} className="card spot-card">
              {/* カード画像 または 写真なしヘッダー */}
              {spot.imageUrl ? (
                <div className="spot-image-container">
                  <img 
                    src={spot.imageUrl} 
                    alt={spot.name} 
                    className="spot-image" 
                    loading="lazy"
                    onError={(e) => {
                      // エラー時は非表示またはプレースホルダー
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <span 
                    className="spot-cat-badge"
                    style={{ color: catInfo.color, backgroundColor: catInfo.bg }}
                  >
                    {catInfo.label}
                  </span>
                  <span className="spot-area-badge">
                    <MapPin size={12} /> {spot.area}
                  </span>

                  {/* 写真変更ボタン */}
                  <button
                    type="button"
                    className="spot-photo-change-btn"
                    onClick={() => setEditingPhotoSpot(spot)}
                    title="写真を変更する・写真をなしにする"
                  >
                    <Camera size={13} /> 写真を変更
                  </button>

                  {/* お気に入りトグルボタン */}
                  <button 
                    className={`spot-fav-btn ${saved ? 'saved' : ''}`}
                    onClick={() => onToggleSaveSpot(spot)}
                    title={saved ? '行きたいリストから外す' : '行きたいリストに追加'}
                  >
                    <Heart size={18} fill={saved ? '#f43f5e' : 'none'} color={saved ? '#f43f5e' : '#fff'} />
                  </button>
                </div>
              ) : (
                <div 
                  className="spot-no-image-header"
                  style={{
                    background: `linear-gradient(135deg, ${catInfo.bg} 0%, #f8fafc 100%)`,
                    borderBottom: `2px solid ${catInfo.color}33`,
                  }}
                >
                  <div className="no-image-badge-row">
                    <span 
                      className="spot-cat-badge"
                      style={{ color: catInfo.color, backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                    >
                      {catInfo.label}
                    </span>
                    <span className="spot-area-badge" style={{ position: 'static' }}>
                      <MapPin size={12} /> {spot.area}
                    </span>
                  </div>

                  <div className="no-image-actions">
                    <button
                      type="button"
                      className="btn-add-photo-pill"
                      onClick={() => setEditingPhotoSpot(spot)}
                      title="写真を追加・設定する（任意）"
                    >
                      <Camera size={12} /> 写真を追加
                    </button>
                    <button 
                      className={`spot-fav-btn static ${saved ? 'saved' : ''}`}
                      onClick={() => onToggleSaveSpot(spot)}
                      title={saved ? '行きたいリストから外す' : '行きたいリストに追加'}
                    >
                      <Heart size={18} fill={saved ? '#f43f5e' : 'none'} color={saved ? '#f43f5e' : '#94a3b8'} />
                    </button>
                  </div>
                </div>
              )}

              {/* カード本文 */}
              <div className="spot-card-body">
                <h3 className="spot-name">{spot.name}</h3>
                <p className="spot-desc">{spot.description}</p>

                {/* おすすめポイント・Tips */}
                {spot.tips && (
                  <div className="spot-tips-box">
                    <Sparkles size={14} className="tips-icon" />
                    <p className="spot-tips-text">{spot.tips}</p>
                  </div>
                )}

                {/* 住所・連絡先詳細 */}
                <div className="spot-detail-info-box">
                  {spot.address && (
                    <div className="detail-line">
                      <MapPin size={13} className="info-icon" />
                      <span className="address-text">{spot.address}</span>
                    </div>
                  )}
                  {spot.phoneNumber && (
                    <div className="detail-line">
                      <Phone size={13} className="info-icon" />
                      <a href={`tel:${spot.phoneNumber}`} className="phone-link" title="タップして電話をかける">
                        {spot.phoneNumber}
                      </a>
                    </div>
                  )}
                </div>

                {/* グループ行きたい投票機能 */}
                {members.length > 0 && (
                  <div className="spot-members-vote">
                    <span className="vote-label">
                      <Users size={13} /> 行きたい人:
                      {wanted.length > 0 && (
                        <span className="vote-count-badge" title={`${wanted.join(', ')} が投票中`}>
                          {wanted.length}名
                        </span>
                      )}
                    </span>
                    <div className="member-chips-vote">
                      {members.map((m) => {
                        const isVoted = wanted.includes(m);
                        return (
                          <button
                            key={m}
                            type="button"
                            className={`member-vote-chip ${isVoted ? 'voted' : ''}`}
                            onClick={() => onToggleMemberVote(spot.id, m)}
                            title={`${m} の「行きたい！」投票を切り替える`}
                          >
                            <span className="chip-name">{m}</span>
                            <span className="chip-mark">{isVoted ? '♥ 行きたい' : '+'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* メタ情報（滞在時間、予算） */}
                <div className="spot-meta-row">
                  <div className="spot-meta-item">
                    <Clock size={14} className="meta-icon" />
                    <span>{spot.recommendedDuration}</span>
                  </div>
                  <div className="spot-meta-item">
                    <Coins size={14} className="meta-icon" />
                    <span>{spot.estimatedBudget}</span>
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="spot-card-actions">
                  <button
                    className="btn btn-outline btn-sm schedule-add-btn"
                    onClick={() => {
                      setScheduleModalSpot(spot);
                      setScheduleDay(1);
                    }}
                  >
                    <CalendarPlus size={15} />
                    旅程に追加
                  </button>

                  {spot.bookingUrl && (
                    <a 
                      href={spot.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm booking-btn"
                      title="予約サイト（じゃらん・食べログ等）を開く"
                    >
                      <Ticket size={14} />
                      予約
                    </a>
                  )}

                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ' ' + (spot.address || spot.area))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm map-link-btn"
                    title="Googleマップで場所やルートを確認"
                  >
                    <ExternalLink size={14} />
                    地図
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSpots.length === 0 && (
        <div className="empty-state card">
          <Compass size={48} className="empty-icon" />
          <h3>該当するスポットが見つかりませんでした</h3>
          <p>検索条件を変更するか、右上の「行きたい場所を新しく登録」から追加してみてください。</p>
        </div>
      )}
      </>
      )}

      {/* モーダル: 旅程への追加 */}
      {scheduleModalSpot && (
        <div className="modal-overlay" onClick={() => setScheduleModalSpot(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">「{scheduleModalSpot.name}」を旅程に追加</h3>
              <button className="modal-close-btn" onClick={() => setScheduleModalSpot(null)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-subtext">
                何日目の何時にこのスポットを訪れるか選択してください。旅程タイムラインに自動登録されます。
              </p>
              
              <div className="form-row" style={{ marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">訪れる日程</label>
                  <select 
                    className="form-control"
                    value={scheduleDay} 
                    onChange={(e) => setScheduleDay(Number(e.target.value))}
                  >
                    {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>{d}日目</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">開始時間</label>
                  <input 
                    type="time" 
                    className="form-control"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="spot-preview-banner">
                <img src={scheduleModalSpot.imageUrl} alt="" className="preview-mini-img" />
                <div>
                  <strong>{scheduleModalSpot.name}</strong>
                  <div className="preview-meta">{scheduleModalSpot.recommendedDuration} / {scheduleModalSpot.estimatedBudget}</div>
                  {scheduleModalSpot.address && <div className="preview-meta">📍 {scheduleModalSpot.address}</div>}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setScheduleModalSpot(null)}>キャンセル</button>
              <button className="btn btn-primary" onClick={handleConfirmAddToSchedule}>
                <CalendarPlus size={16} />
                旅程に追加する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* モーダル: 新規スポット登録 */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">行きたい場所・スポットを新しく登録</h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCreateCustomSpot}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">スポット・店舗名 *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="例: 嵐山 鯛茶漬けの店 鯛匠 Hanana"
                    value={newSpotName}
                    onChange={(e) => setNewSpotName(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">エリア</label>
                    <input 
                      type="text"
                      placeholder="例: 京都、嵐山"
                      value={newSpotArea}
                      onChange={(e) => setNewSpotArea(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ジャンル</label>
                    <select 
                      className="form-control"
                      value={newSpotCategory}
                      onChange={(e) => setNewSpotCategory(e.target.value as SpotCategory)}
                    >
                      {(Object.keys(CATEGORY_MAP) as SpotCategory[]).map((cat) => (
                        <option key={cat} value={cat}>{CATEGORY_MAP[cat].label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">住所（任意）</label>
                  <input 
                    type="text"
                    placeholder="例: 京都府京都市右京区嵯峨天龍寺瀬戸川町26-1"
                    value={newSpotAddress}
                    onChange={(e) => setNewSpotAddress(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">電話番号（任意）</label>
                    <input 
                      type="tel"
                      placeholder="例: 075-862-0720"
                      value={newSpotPhone}
                      onChange={(e) => setNewSpotPhone(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">予約サイトURL（任意）</label>
                    <input 
                      type="url"
                      placeholder="https://tabelog.com/... または公式予約URL"
                      value={newSpotBookingUrl}
                      onChange={(e) => setNewSpotBookingUrl(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">概要・メモ</label>
                  <textarea 
                    rows={2}
                    placeholder="どんなお店・場所か、気になった理由など"
                    value={newSpotDesc}
                    onChange={(e) => setNewSpotDesc(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">見どころ・おすすめポイント（Tips）</label>
                  <input 
                    type="text"
                    placeholder="例: 名物鯛茶漬けは並ぶので事前予約が安心！"
                    value={newSpotTips}
                    onChange={(e) => setNewSpotTips(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">所要時間目安</label>
                    <input 
                      type="text"
                      placeholder="例: 約1時間半"
                      value={newSpotDuration}
                      onChange={(e) => setNewSpotDuration(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">予算目安</label>
                    <input 
                      type="text"
                      placeholder="例: 約2,500円"
                      value={newSpotBudget}
                      onChange={(e) => setNewSpotBudget(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">写真画像URL（任意）</label>
                  <input 
                    type="url"
                    placeholder="https://..."
                    value={newSpotImage}
                    onChange={(e) => setNewSpotImage(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary">
                  登録して行きたいリストに追加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 写真編集・変更モーダル */}
      <PhotoEditorModal
        isOpen={!!editingPhotoSpot}
        onClose={() => setEditingPhotoSpot(null)}
        title={editingPhotoSpot?.name || 'スポット写真'}
        currentImageUrl={editingPhotoSpot?.imageUrl}
        onSave={(newUrl) => {
          if (editingPhotoSpot && onUpdateSpotPhoto) {
            onUpdateSpotPhoto(editingPhotoSpot.id, newUrl);
          }
          setEditingPhotoSpot(null);
        }}
      />
    </div>
  );
};
