import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  CheckSquare, 
  Coins, 
  Settings, 
  Printer, 
  Sparkles, 
  Luggage, 
  Compass,
  Users,
  BookOpen,
  Share2
} from 'lucide-react';
import type { 
  TripPlan, 
  Spot, 
  ScheduleItem, 
  ChecklistCategory, 
  ExpenseItem, 
  ScheduleCategory,
  ThemeStyle
} from './types/travel';
import type { UserAccount } from './types/auth';
import { INITIAL_TRIPS, THEME_PRESETS, DEFAULT_CHECKLIST_PRESETS, RECOMMENDED_SPOTS } from './data/sampleData';
import { getStoredCurrentUser } from './utils/authStorage';

import { SpotExplorer } from './components/SpotExplorer';
import { TimelineView } from './components/TimelineView';
import { ChecklistView } from './components/ChecklistView';
import { BudgetView } from './components/BudgetView';
import { PrintView } from './components/PrintView';
import { EditTripModal } from './components/EditTripModal';
import { TripListModal } from './components/TripListModal';
import { ShareModal } from './components/ShareModal';
import { AuthModal } from './components/AuthModal';

import './components/SpotExplorer.css';
import './components/TimelineView.css';
import './components/ChecklistView.css';
import './components/BudgetView.css';
import './components/PrintView.css';
import './components/Modals.css';

const TRIPS_STORAGE_KEY = 'tabi_planner_all_trips_v2';
const CURRENT_TRIP_ID_KEY = 'tabi_planner_current_trip_id_v2';

type ActiveTab = 'spots' | 'timeline' | 'checklist' | 'budget' | 'print';

export default function App() {
  // 全旅行しおりリストの初期化（LocalStorage）
  const [trips, setTrips] = useState<TripPlan[]>(() => {
    try {
      const saved = localStorage.getItem(TRIPS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('LocalStorage読み込みエラー:', e);
    }
    return INITIAL_TRIPS;
  });

  // 現在選択中の旅行ID
  const [currentTripId, setCurrentTripId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(CURRENT_TRIP_ID_KEY);
      if (savedId && trips.some((t) => t.id === savedId)) {
        return savedId;
      }
    } catch (e) {}
    return trips[0]?.id || INITIAL_TRIPS[0].id;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('spots');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTripListOpen, setIsTripListOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // ユーザーアカウント管理
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getStoredCurrentUser());

  // スクロール検知（スクロール時にヘッダーを自動でコンパクト化）
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ユーザー切り替え・ログイン時の処理
  const handleUserChange = (user: UserAccount | null) => {
    setCurrentUser(user);
    if (user) {
      updateCurrentTrip((prev) => {
        if (!prev.members.includes(user.username)) {
          return {
            ...prev,
            members: [user.username, ...prev.members],
          };
        }
        return prev;
      });
    }
  };

  // 現在の旅行プランを取得
  const currentTrip = trips.find((t) => t.id === currentTripId) || trips[0] || INITIAL_TRIPS[0];

  // 現在のテーマスタイルを取得
  const currentTheme: ThemeStyle = 
    THEME_PRESETS.find((theme) => theme.id === currentTrip.themeId) || THEME_PRESETS[0];

  // 1. テーマ変更に合わせてCSSカスタムプロパティを更新
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', currentTheme.primaryColor);
    root.style.setProperty('--primary-hover', currentTheme.primaryHover);
    root.style.setProperty('--primary-light', currentTheme.primaryLight);
    root.style.setProperty('--hero-gradient', currentTheme.heroGradient);
    root.style.setProperty('--border-focus', currentTheme.primaryColor);
  }, [currentTheme]);

  // 2. 旅行データの永続化
  useEffect(() => {
    try {
      localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
      localStorage.setItem(CURRENT_TRIP_ID_KEY, currentTripId);
    } catch (e) {
      console.error('LocalStorage書き込みエラー:', e);
    }
  }, [trips, currentTripId]);

  // 3. URLハッシュからの共有プランの自動読み込み
  useEffect(() => {
    if (window.location.hash.startsWith('#share=')) {
      try {
        const base64 = window.location.hash.replace('#share=', '');
        const jsonStr = decodeURIComponent(atob(base64));
        const importedPlan: TripPlan = JSON.parse(jsonStr);

        if (importedPlan && importedPlan.title) {
          const newId = `shared-${Date.now()}`;
          const planWithNewId = { ...importedPlan, id: newId, title: `【共有】${importedPlan.title}` };

          if (window.confirm(`友達から共有された旅行しおり「${importedPlan.title}」をアプリに読み込みますか？`)) {
            setTrips((prev) => [planWithNewId, ...prev]);
            setCurrentTripId(newId);
            window.location.hash = '';
          }
        }
      } catch (e) {
        console.error('共有リンクの復元エラー:', e);
      }
    }
  }, []);

  // カレントプランを更新するヘルパー関数
  const updateCurrentTrip = (updater: (prev: TripPlan) => TripPlan) => {
    setTrips((prevList) =>
      prevList.map((trip) => (trip.id === currentTripId ? updater(trip) : trip))
    );
  };

  // ==========================================
  // 旅行しおり管理（一覧、新規、複製、削除）
  // ==========================================
  const handleSelectTrip = (tripId: string) => {
    setCurrentTripId(tripId);
  };

  const handleCreateNewTrip = () => {
    const newTripId = `trip-${Date.now()}`;
    const newTrip: TripPlan = {
      id: newTripId,
      title: '新しい旅行のしおり',
      destination: '目的地を設定してください',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      totalDays: 2,
      coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80',
      themeId: 'trad-kyoto',
      themeKeyword: '',
      members: ['自分'],
      memo: 'どんな旅行にするかメモを書きましょう！',
      totalBudget: 50000,
      savedSpots: [],
      schedules: [],
      checklists: [
        { id: `chk-${Date.now()}-1`, category: 'valuable', title: '財布・身分証・チケット', isDone: false },
        { id: `chk-${Date.now()}-2`, category: 'gadget', title: 'スマホ充電器・バッテリー', isDone: false },
        { id: `chk-${Date.now()}-3`, category: 'clothes', title: '着替え（日数分）', isDone: false },
      ],
      expenses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTrips((prev) => [newTrip, ...prev]);
    setCurrentTripId(newTripId);
    setIsEditModalOpen(true); // 新規作成時はそのまま設定を開く
  };

  const handleDuplicateTrip = (tripId: string) => {
    const target = trips.find((t) => t.id === tripId);
    if (!target) return;

    const duplicated: TripPlan = {
      ...JSON.parse(JSON.stringify(target)),
      id: `trip-copy-${Date.now()}`,
      title: `${target.title} (コピー)`,
      createdAt: new Date().toISOString(),
    };

    setTrips((prev) => [duplicated, ...prev]);
    setCurrentTripId(duplicated.id);
  };

  const handleDeleteTrip = (tripId: string) => {
    setTrips((prev) => {
      const filtered = prev.filter((t) => t.id !== tripId);
      if (filtered.length > 0 && currentTripId === tripId) {
        setCurrentTripId(filtered[0].id);
      }
      return filtered;
    });
  };

  // ==========================================
  // スポット関連ハンドラ
  // ==========================================
  const handleToggleSaveSpot = (spot: Spot) => {
    updateCurrentTrip((prev) => {
      const isAlreadySaved = prev.savedSpots.some((s) => s.id === spot.id);
      let updatedSaved: Spot[];
      if (isAlreadySaved) {
        updatedSaved = prev.savedSpots.filter((s) => s.id !== spot.id);
      } else {
        updatedSaved = [...prev.savedSpots, { ...spot, isSaved: true }];
      }
      return { ...prev, savedSpots: updatedSaved };
    });
  };

  const handleAddCustomSpot = (spot: Spot) => {
    updateCurrentTrip((prev) => ({
      ...prev,
      savedSpots: [...prev.savedSpots, spot],
    }));
  };

  const handleToggleMemberVote = (spotId: string, memberName: string) => {
    updateCurrentTrip((prev) => {
      const isAlreadySaved = prev.savedSpots.some((s) => s.id === spotId);

      if (isAlreadySaved) {
        // すでに保存済みの場合、該当スポットの投票メンバーをトグル
        const updatedSavedSpots = prev.savedSpots.map((s) => {
          if (s.id !== spotId) return s;
          const currentWanted = s.wantedMembers || [];
          const isVoted = currentWanted.includes(memberName);
          const newWanted = isVoted
            ? currentWanted.filter((m) => m !== memberName)
            : [...currentWanted, memberName];
          return { ...s, wantedMembers: newWanted };
        });

        return {
          ...prev,
          savedSpots: updatedSavedSpots,
        };
      } else {
        // 未保存のおすすめスポットの場合、マスターデータから取得して投票済みとして行きたいリストに追加
        const masterSpot = RECOMMENDED_SPOTS.find((s) => s.id === spotId);
        if (!masterSpot) return prev;

        const newSavedSpot: Spot = {
          ...masterSpot,
          isSaved: true,
          wantedMembers: [memberName],
        };

        return {
          ...prev,
          savedSpots: [...prev.savedSpots, newSavedSpot],
        };
      }
    });
  };

  const handleAddToSchedule = (
    spot: Spot, 
    dayNumber: number, 
    time: string, 
    category: ScheduleCategory
  ) => {
    const newItem: ScheduleItem = {
      id: `sch-${Date.now()}`,
      dayNumber,
      time,
      category,
      title: spot.name,
      location: spot.address || spot.area,
      memo: spot.tips || spot.description,
      cost: spot.estimatedBudget.includes('無料') ? 0 : undefined,
    };

    updateCurrentTrip((prev) => {
      const isAlreadySaved = prev.savedSpots.some((s) => s.id === spot.id);
      const updatedSaved = isAlreadySaved ? prev.savedSpots : [...prev.savedSpots, { ...spot, isSaved: true }];
      return {
        ...prev,
        savedSpots: updatedSaved,
        schedules: [...prev.schedules, newItem],
      };
    });

    setActiveTab('timeline');
  };

  // ==========================================
  // 旅程タイムライン関連ハンドラ
  // ==========================================
  const handleAddScheduleItem = (item: Omit<ScheduleItem, 'id'>) => {
    const newItem: ScheduleItem = {
      ...item,
      id: `sch-${Date.now()}`,
    };
    updateCurrentTrip((prev) => ({
      ...prev,
      schedules: [...prev.schedules, newItem],
    }));
  };

  const handleUpdateScheduleItem = (updated: ScheduleItem) => {
    updateCurrentTrip((prev) => ({
      ...prev,
      schedules: prev.schedules.map((s) => (s.id === updated.id ? updated : s)),
    }));
  };

  const handleDeleteScheduleItem = (id: string) => {
    updateCurrentTrip((prev) => ({
      ...prev,
      schedules: prev.schedules.filter((s) => s.id !== id),
    }));
  };

  const handleAddDay = () => {
    updateCurrentTrip((prev) => ({
      ...prev,
      totalDays: prev.totalDays + 1,
    }));
  };

  // ==========================================
  // チェックリスト関連ハンドラ
  // ==========================================
  const handleToggleCheckItem = (id: string) => {
    updateCurrentTrip((prev) => ({
      ...prev,
      checklists: prev.checklists.map((c) =>
        c.id === id ? { ...c, isDone: !c.isDone } : c
      ),
    }));
  };

  const handleAddCheckItem = (category: ChecklistCategory, title: string) => {
    const newItem = {
      id: `chk-${Date.now()}`,
      category,
      title,
      isDone: false,
    };
    updateCurrentTrip((prev) => ({
      ...prev,
      checklists: [...prev.checklists, newItem],
    }));
  };

  const handleDeleteCheckItem = (id: string) => {
    updateCurrentTrip((prev) => ({
      ...prev,
      checklists: prev.checklists.filter((c) => c.id !== id),
    }));
  };

  const handleAddPresets = () => {
    updateCurrentTrip((prev) => {
      const existingTitles = new Set(prev.checklists.map((c) => c.title));
      const newItems = DEFAULT_CHECKLIST_PRESETS
        .filter((preset) => !existingTitles.has(preset.title))
        .map((preset, idx) => ({
          id: `chk-preset-${Date.now()}-${idx}`,
          category: preset.category,
          title: preset.title,
          isDone: false,
        }));
      return {
        ...prev,
        checklists: [...prev.checklists, ...newItems],
      };
    });
  };

  const handleResetChecks = () => {
    updateCurrentTrip((prev) => ({
      ...prev,
      checklists: prev.checklists.map((c) => ({ ...c, isDone: false })),
    }));
  };

  // ==========================================
  // 予算・費用関連ハンドラ
  // ==========================================
  const handleUpdateTotalBudget = (newBudget: number) => {
    updateCurrentTrip((prev) => ({ ...prev, totalBudget: newBudget }));
  };

  const handleAddExpense = (expense: Omit<ExpenseItem, 'id'>) => {
    const newItem = {
      ...expense,
      id: `exp-${Date.now()}`,
    };
    updateCurrentTrip((prev) => ({
      ...prev,
      expenses: [...prev.expenses, newItem],
    }));
  };

  const handleTogglePaid = (id: string) => {
    updateCurrentTrip((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) =>
        e.id === id ? { ...e, isPaid: !e.isPaid } : e
      ),
    }));
  };

  const handleDeleteExpense = (id: string) => {
    updateCurrentTrip((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  };

  // ==========================================
  // 基本設定・テーマ更新
  // ==========================================
  const handleSaveTripInfo = (updated: Partial<TripPlan>) => {
    updateCurrentTrip((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const handleImportPlan = (imported: TripPlan) => {
    const newId = `imported-${Date.now()}`;
    const newPlan = { ...imported, id: newId };
    setTrips((prev) => [newPlan, ...prev]);
    setCurrentTripId(newId);
  };

  return (
    <div className="app-container">
      {/* サイト上部バー */}
      <header className={`site-header ${isScrolled ? 'header-compact' : ''}`}>
        <div className="header-inner">
          <div className="brand-logo">
            <div className="brand-icon-wrap" style={{ background: currentTheme.primaryColor }}>
              <Luggage size={22} />
            </div>
            <div>
              <span>旅ぷらん</span>
              <span className="brand-subtitle">TabiPlan しおり＆予定管理</span>
            </div>
          </div>

          <div className="header-actions">
            {/* テーマから自動作成ボタン（目立たせる） */}
            <button 
              className="btn btn-primary btn-sm header-action-btn header-btn-primary"
              onClick={() => setIsEditModalOpen(true)}
              title="テーマを入力してプラン・旅程・持ち物・スポットを一括自動作成"
            >
              <Sparkles size={15} />
              <span className="btn-label-desktop">テーマ自動作成</span>
              <span className="btn-label-mobile">自動作成</span>
            </button>

            {/* アカウント設定・切り替えボタン */}
            <button 
              className="btn btn-secondary btn-sm header-action-btn"
              onClick={() => setIsAuthModalOpen(true)}
              title="アカウント設定・ユーザー切り替え"
            >
              {currentUser ? (
                <>
                  <span 
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: currentUser.avatarColor,
                      color: '#fff',
                      fontSize: '0.72rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                    }}
                  >
                    {currentUser.username.slice(0, 1)}
                  </span>
                  <span className="btn-label-desktop">{currentUser.username}</span>
                </>
              ) : (
                <>
                  <Users size={15} />
                  <span className="btn-label-desktop">アカウント</span>
                </>
              )}
            </button>

            {/* しおりアルバム一覧ボタン */}
            <button 
              className="btn btn-secondary btn-sm header-action-btn"
              onClick={() => setIsTripListOpen(true)}
              title="保存された旅行のしおり一覧を開く"
            >
              <BookOpen size={15} />
              <span className="btn-label-desktop">マイしおり ({trips.length})</span>
              <span className="btn-label-mobile">しおり ({trips.length})</span>
            </button>

            {/* スマホで開く＆共有ボタン */}
            <button 
              className="btn btn-secondary btn-sm header-action-btn"
              onClick={() => setIsShareModalOpen(true)}
              title="共有リンク・QRコード"
            >
              <Share2 size={15} />
              <span className="btn-label-desktop">スマホで開く</span>
              <span className="btn-label-mobile">共有</span>
            </button>

            {/* 旅の設定ボタン */}
            <button 
              className="btn btn-secondary btn-sm header-action-btn"
              onClick={() => setIsEditModalOpen(true)}
              title="テーマカラー・柄や旅行情報の編集"
            >
              <Settings size={15} />
              <span className="btn-label-desktop">設定</span>
            </button>

            {/* しおり印刷ビュー切替 */}
            <button 
              className="btn btn-outline btn-sm header-action-btn no-print"
              onClick={() => setActiveTab(activeTab === 'print' ? 'timeline' : 'print')}
            >
              <Printer size={15} />
              <span className="btn-label-desktop">{activeTab === 'print' ? '編集に戻る' : '完成しおり'}</span>
              <span className="btn-label-mobile">{activeTab === 'print' ? '戻る' : '完成'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* しおり印刷ビュー */}
      {activeTab === 'print' ? (
        <main className="main-content">
          <PrintView 
            tripPlan={currentTrip} 
            onBack={() => setActiveTab('timeline')} 
          />
        </main>
      ) : (
        <>
          {/* 旅行タイトル・サマリーバナー（テーマ色・柄パターン適用） */}
          <section className="trip-hero">
            {/* 背景パターン柄 */}
            <div className={`hero-pattern-overlay pattern-${currentTheme.patternType}`} />

            <div className="trip-hero-inner">
              <div className="trip-hero-content">
                <div className="trip-badge">
                  <Sparkles size={14} /> {currentTheme.name}
                </div>
                <h1 className="trip-title">{currentTrip.title}</h1>
                <div className="trip-meta-list">
                  <div className="trip-meta-item">
                    <MapPin size={16} />
                    <span>{currentTrip.destination}</span>
                  </div>
                  <div className="trip-meta-item">
                    <Calendar size={16} />
                    <span>{currentTrip.startDate} 〜 {currentTrip.endDate} ({currentTrip.totalDays}日間)</span>
                  </div>
                  {currentTrip.members && currentTrip.members.length > 0 && (
                    <div className="trip-meta-item">
                      <Users size={16} />
                      <span>{currentTrip.members.join('・')}</span>
                    </div>
                  )}
                </div>
                {currentTrip.memo && (
                  <div className="trip-memo-box">
                    {currentTrip.memo}
                  </div>
                )}
              </div>

              <div className="trip-hero-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => setIsEditModalOpen(true)}
                  title="テーマからプラン一式を自動作成"
                >
                  <Sparkles size={14} /> テーマからプランを自動作成
                </button>
                <button 
                  className="btn btn-secondary btn-sm" 
                  style={{ background: 'rgba(255, 255, 255, 0.25)', color: '#fff', border: 'none' }}
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Settings size={14} /> テーマや基本情報を変更
                </button>
              </div>
            </div>
          </section>

          {/* メインタブバー */}
          <nav className="nav-tabs-wrapper">
            <div className="nav-tabs">
              <button
                className={`nav-tab-btn ${activeTab === 'spots' ? 'active' : ''}`}
                onClick={() => setActiveTab('spots')}
              >
                <Compass size={18} />
                <span className="tab-text-full">どこ行く？（スポット）</span>
                <span className="tab-text-short">スポット</span>
                <span className="nav-tab-badge">{currentTrip.savedSpots?.length || 0}</span>
              </button>

              <button
                className={`nav-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
                onClick={() => setActiveTab('timeline')}
              >
                <Calendar size={18} />
                <span className="tab-text-full">旅程タイムライン</span>
                <span className="tab-text-short">旅程</span>
                <span className="nav-tab-badge">{currentTrip.schedules?.length || 0}</span>
              </button>

              <button
                className={`nav-tab-btn ${activeTab === 'checklist' ? 'active' : ''}`}
                onClick={() => setActiveTab('checklist')}
              >
                <CheckSquare size={18} />
                <span className="tab-text-full">持ち物・準備ToDo</span>
                <span className="tab-text-short">持ち物</span>
                <span className="nav-tab-badge">
                  {currentTrip.checklists?.filter((c) => c.isDone).length || 0}/{currentTrip.checklists?.length || 0}
                </span>
              </button>

              <button
                className={`nav-tab-btn ${activeTab === 'budget' ? 'active' : ''}`}
                onClick={() => setActiveTab('budget')}
              >
                <Coins size={18} />
                <span className="tab-text-full">費用・予算管理</span>
                <span className="tab-text-short">予算</span>
                <span className="nav-tab-badge">
                  ¥{(currentTrip.expenses || []).reduce((s, e) => s + e.amount, 0).toLocaleString()}
                </span>
              </button>
            </div>
          </nav>

          {/* メインコンテンツ切り替え */}
          <main className="main-content">
            {activeTab === 'spots' && (
              <SpotExplorer
                savedSpots={currentTrip.savedSpots || []}
                members={currentTrip.members || ['自分']}
                onToggleSaveSpot={handleToggleSaveSpot}
                onAddCustomSpot={handleAddCustomSpot}
                onAddToSchedule={handleAddToSchedule}
                onToggleMemberVote={handleToggleMemberVote}
                totalDays={currentTrip.totalDays}
              />
            )}

            {activeTab === 'timeline' && (
              <TimelineView
                schedules={currentTrip.schedules || []}
                savedSpots={currentTrip.savedSpots || []}
                totalDays={currentTrip.totalDays}
                onAddScheduleItem={handleAddScheduleItem}
                onUpdateScheduleItem={handleUpdateScheduleItem}
                onDeleteScheduleItem={handleDeleteScheduleItem}
                onAddDay={handleAddDay}
              />
            )}

            {activeTab === 'checklist' && (
              <ChecklistView
                checklists={currentTrip.checklists || []}
                onToggleItem={handleToggleCheckItem}
                onAddItem={handleAddCheckItem}
                onDeleteItem={handleDeleteCheckItem}
                onAddPresets={handleAddPresets}
                onResetChecks={handleResetChecks}
              />
            )}

            {activeTab === 'budget' && (
              <BudgetView
                expenses={currentTrip.expenses || []}
                totalBudget={currentTrip.totalBudget || 50000}
                onUpdateTotalBudget={handleUpdateTotalBudget}
                onAddExpense={handleAddExpense}
                onTogglePaid={handleTogglePaid}
                onDeleteExpense={handleDeleteExpense}
              />
            )}
          </main>

          {/* スマホ専用 固定ボトムナビゲーションバー（ワンタップ切り替え・横スクロール不要） */}
          <nav className="mobile-bottom-nav no-print">
            <button
              className={`bottom-nav-item ${activeTab === 'spots' ? 'active' : ''}`}
              onClick={() => { setActiveTab('spots'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              title="おすすめスポット"
            >
              <div className="bottom-nav-icon-wrap">
                <Compass size={21} />
                {(currentTrip.savedSpots?.length || 0) > 0 && (
                  <span className="bottom-nav-badge">{currentTrip.savedSpots?.length}</span>
                )}
              </div>
              <span className="bottom-nav-label">スポット</span>
            </button>

            <button
              className={`bottom-nav-item ${activeTab === 'timeline' ? 'active' : ''}`}
              onClick={() => { setActiveTab('timeline'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              title="旅程タイムライン"
            >
              <div className="bottom-nav-icon-wrap">
                <Calendar size={21} />
                {(currentTrip.schedules?.length || 0) > 0 && (
                  <span className="bottom-nav-badge">{currentTrip.schedules?.length}</span>
                )}
              </div>
              <span className="bottom-nav-label">旅程</span>
            </button>

            <button
              className={`bottom-nav-item ${activeTab === 'checklist' ? 'active' : ''}`}
              onClick={() => { setActiveTab('checklist'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              title="持ち物・準備ToDo"
            >
              <div className="bottom-nav-icon-wrap">
                <CheckSquare size={21} />
                <span className="bottom-nav-badge">
                  {currentTrip.checklists?.filter((c) => c.isDone).length || 0}/{currentTrip.checklists?.length || 0}
                </span>
              </div>
              <span className="bottom-nav-label">持ち物</span>
            </button>

            <button
              className={`bottom-nav-item ${activeTab === 'budget' ? 'active' : ''}`}
              onClick={() => { setActiveTab('budget'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              title="費用・予算管理"
            >
              <div className="bottom-nav-icon-wrap">
                <Coins size={21} />
                {(currentTrip.expenses?.length || 0) > 0 && (
                  <span className="bottom-nav-badge">
                    ¥{Math.round((currentTrip.expenses || []).reduce((s, e) => s + e.amount, 0) / 1000)}k
                  </span>
                )}
              </div>
              <span className="bottom-nav-label">予算</span>
            </button>
          </nav>
        </>
      )}

      {/* 1. マイしおりアルバム一覧モーダル */}
      <TripListModal
        trips={trips}
        currentTripId={currentTripId}
        isOpen={isTripListOpen}
        onClose={() => setIsTripListOpen(false)}
        onSelectTrip={handleSelectTrip}
        onCreateNewTrip={handleCreateNewTrip}
        onDuplicateTrip={handleDuplicateTrip}
        onDeleteTrip={handleDeleteTrip}
      />

      {/* 2. スマホQRコード＆グループ共有モーダル */}
      <ShareModal
        tripPlan={currentTrip}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onImportPlan={handleImportPlan}
      />

      {/* 3. 旅行設定・テーマカスタマイズモーダル */}
      <EditTripModal
        tripPlan={currentTrip}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveTripInfo}
      />

      {/* 4. アカウント設定・ユーザー切り替えモーダル */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={handleUserChange}
      />
    </div>
  );
}
