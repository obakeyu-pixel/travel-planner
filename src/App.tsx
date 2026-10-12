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
  Users,
  BookOpen,
  Share2
} from 'lucide-react';
import type { 
  TripPlan, 
  ScheduleItem, 
  ChecklistCategory, 
  ExpenseItem, 
  ThemeStyle
} from './types/travel';
import type { UserAccount } from './types/auth';
import { INITIAL_TRIPS, THEME_PRESETS, DEFAULT_CHECKLIST_PRESETS } from './data/sampleData';
import { getStoredCurrentUser, getPendingInvitationsForUser, addStoredFriend } from './utils/authStorage';

import { TimelineView } from './components/TimelineView';
import { ChecklistView } from './components/ChecklistView';
import { BudgetView } from './components/BudgetView';
import { PrintView } from './components/PrintView';
import { EditTripModal } from './components/EditTripModal';
import { TripListModal } from './components/TripListModal';
import { ShareModal } from './components/ShareModal';
import { AuthModal } from './components/AuthModal';
import { GroupManageModal } from './components/GroupManageModal';
import { WelcomeGate } from './components/WelcomeGate';

import './components/TimelineView.css';
import './components/ChecklistView.css';
import './components/BudgetView.css';
import './components/PrintView.css';
import './components/Modals.css';

import { 
  APP_VERSION, 
  CURRENT_TRIPS_STORAGE_KEY, 
  CURRENT_TRIP_ID_STORAGE_KEY, 
  checkAndPurgeLegacyData, 
  forceResetToLatestData 
} from './utils/versionManager';

type ActiveTab = 'timeline' | 'checklist' | 'budget' | 'print';

export default function App() {
  // アプリ起動時のバージョン検証＆古いデータの自動パージ
  const [initResult] = useState(() => checkAndPurgeLegacyData());

  // 全旅行しおりリストの初期化（最新データ）
  const [trips, setTrips] = useState<TripPlan[]>(() => initResult.trips);

  // 現在選択中の旅行ID
  const [currentTripId, setCurrentTripId] = useState<string>(() => initResult.initialTripId);

  // アップデート通知バナー
  const [updateBannerMessage, setUpdateBannerMessage] = useState<string | null>(() => 
    initResult.isUpdated 
      ? `🎉 最新バージョン（v${APP_VERSION}）へアップデートしました！古いデータを消去し、最新の旅行しおりと最新スポット情報に更新しました。`
      : null
  );

  const [activeTab, setActiveTab] = useState<ActiveTab>('timeline');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTripListOpen, setIsTripListOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // ユーザーアカウント管理
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getStoredCurrentUser());

  // 未承認の招待リクエスト数
  const myPendingInvitesCount = currentUser ? getPendingInvitationsForUser(currentUser.id).length : 0;

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

  // グループメンバー情報の更新
  const handleUpdateTripMembers = (newMembers: string[], newPendingMembers?: string[]) => {
    updateCurrentTrip((prev) => ({
      ...prev,
      members: newMembers,
      pendingMembers: newPendingMembers,
    }));
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

  // 2. 旅行データの永続化（バージョン紐付けキーで安全に保存）
  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_TRIPS_STORAGE_KEY, JSON.stringify(trips));
      localStorage.setItem(CURRENT_TRIP_ID_STORAGE_KEY, currentTripId);
    } catch (e) {
      console.error('LocalStorage書き込みエラー:', e);
    }
  }, [trips, currentTripId]);

  // 手動で古いデータを完全消去して最新データにリフレッシュする処理
  const handleForceResetData = () => {
    if (window.confirm('端末に保存されている古い旅行データを消去し、公式の最新しおり・最新スポット情報にリフレッシュしますか？')) {
      const reset = forceResetToLatestData();
      setTrips(reset.trips);
      setCurrentTripId(reset.initialTripId);
      setUpdateBannerMessage('古い旅行データをすべて消去し、最新データにリフレッシュしました！');
      setTimeout(() => setUpdateBannerMessage(null), 4500);
    }
  };

  // 3. URLハッシュからの共有プラン・友達追加の自動読み込み
  useEffect(() => {
    // A. 旅行しおりプランの共有インポート
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

    // B. QRコードからの友達追加
    if (window.location.hash.startsWith('#add_friend=')) {
      try {
        const base64 = window.location.hash.replace('#add_friend=', '');
        const jsonStr = decodeURIComponent(atob(base64));
        const friendData = JSON.parse(jsonStr);

        if (friendData && friendData.username) {
          addStoredFriend({
            id: friendData.id || `friend-${Date.now()}`,
            username: friendData.username,
            avatarColor: friendData.avatarColor || '#0284c7',
          });

          const shouldAddToTrip = window.confirm(
            `🤝「${friendData.username}」さんを友達に追加しました！\n\n現在選択中の旅行「${currentTrip.title}」のメンバー（旅行グループ）にも追加しますか？`
          );

          if (shouldAddToTrip) {
            updateCurrentTrip((prev) => {
              if (!prev.members.includes(friendData.username)) {
                return {
                  ...prev,
                  members: [...prev.members, friendData.username],
                };
              }
              return prev;
            });
          }

          window.location.hash = '';
          setIsGroupModalOpen(true);
        }
      } catch (e) {
        console.error('友達追加リンクの解析エラー:', e);
      }
    }
  }, [currentTrip.title]);

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
      coverImage: undefined, // デフォルト写真なし（伝統柄・テーマグラデーション背景）
      themeId: 'trad-kyoto',
      themeKeyword: '',
      members: currentUser ? [currentUser.username] : ['自分'],
      memo: 'どんな旅行にするかメモを書きましょう！',
      totalBudget: 0,
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

  // 未ログイン時：起動時「ログイン / 新規登録」ウェルカムゲート画面を表示
  if (!currentUser) {
    return (
      <WelcomeGate 
        onLoginSuccess={(user) => {
          handleUserChange(user);
        }} 
      />
    );
  }

  return (
    <div className="app-container">
      {/* アップデート・データ刷新お知らせバナー */}
      {updateBannerMessage && (
        <div 
          className="update-notification-banner"
          style={{
            background: 'linear-gradient(135deg, #0d9488, #059669)',
            color: '#fff',
            padding: '10px 16px',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 101,
            position: 'sticky',
            top: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} />
            <span>{updateBannerMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setUpdateBannerMessage(null)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontWeight: 800,
            }}
          >
            ×
          </button>
        </div>
      )}

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
            {/* 1. マイしおりアルバム一覧ボタン（スマホ＆PC最重要） */}
            <button 
              className="btn btn-secondary btn-sm header-action-btn header-btn-bookmark"
              onClick={() => setIsTripListOpen(true)}
              title="保存された旅行のしおり一覧を開く"
            >
              <BookOpen size={16} />
              <span className="btn-label-desktop">マイしおり ({trips.length})</span>
              <span className="btn-label-mobile">しおり ({trips.length})</span>
            </button>

            {/* 2. アカウント設定・切り替えボタン（スマホ＆PC最重要） */}
            <button 
              className="btn btn-secondary btn-sm header-action-btn header-btn-account"
              onClick={() => setIsAuthModalOpen(true)}
              title="アカウント設定・ユーザー切り替え"
              style={{ position: 'relative' }}
            >
              {currentUser ? (
                <>
                  <span 
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: currentUser.avatarColor,
                      color: '#fff',
                      fontSize: '0.74rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                    }}
                  >
                    {currentUser.username.slice(0, 1)}
                  </span>
                  <span className="btn-label-desktop">{currentUser.username}</span>
                  <span className="btn-label-mobile">{currentUser.username}</span>
                </>
              ) : (
                <>
                  <Users size={16} />
                  <span className="btn-label-desktop">アカウント</span>
                  <span className="btn-label-mobile">アカウント</span>
                </>
              )}
              {/* 未承認の招待通知バッジ */}
              {myPendingInvitesCount > 0 && (
                <span className="account-notification-badge" title={`${myPendingInvitesCount}件のグループ招待が届いています`}>
                  {myPendingInvitesCount}
                </span>
              )}
            </button>

            {/* 3. スマホで開く＆共有ボタン */}
            <button 
              className="btn btn-secondary btn-sm header-action-btn"
              onClick={() => setIsShareModalOpen(true)}
              title="共有リンク・QRコード"
            >
              <Share2 size={16} />
              <span className="btn-label-desktop">スマホで開く</span>
              <span className="btn-label-mobile">共有</span>
            </button>

            {/* 4. テーマから自動作成ボタン（PC優先・スマホではヒーローからワンタップ） */}
            <button 
              className="btn btn-primary btn-sm header-action-btn header-btn-primary header-desktop-only"
              onClick={() => setIsEditModalOpen(true)}
              title="テーマを入力してプラン・旅程・持ち物・スポットを一括自動作成"
            >
              <Sparkles size={15} />
              <span className="btn-label-desktop">テーマ自動作成</span>
            </button>

            {/* 5. グループ管理・友達招待ボタン（PC優先・スマホではボトムナビ＆ヒーローからワンタップ） */}
            <button
              className="btn btn-secondary btn-sm header-action-btn header-desktop-only"
              onClick={() => setIsGroupModalOpen(true)}
              title="LINE風旅行グループ管理＆友達検索・招待"
            >
              <Users size={15} />
              <span className="btn-label-desktop">グループ ({currentTrip.members.length})</span>
              {(currentTrip.pendingMembers?.length || 0) > 0 && (
                <span className="badge-mini-dot" title="承認待ちの招待があります" />
              )}
            </button>

            {/* 6. 旅の設定ボタン（PC優先・スマホではヒーローからワンタップ） */}
            <button 
              className="btn btn-secondary btn-sm header-action-btn header-desktop-only"
              onClick={() => setIsEditModalOpen(true)}
              title="テーマカラー・柄や旅行情報の編集"
            >
              <Settings size={15} />
              <span className="btn-label-desktop">設定</span>
            </button>

            {/* 7. しおり印刷ビュー切替（PC優先） */}
            <button 
              className="btn btn-outline btn-sm no-print header-action-btn header-desktop-only"
              onClick={() => setActiveTab(activeTab === 'print' ? 'timeline' : 'print')}
            >
              <Printer size={15} />
              <span className="btn-label-desktop">{activeTab === 'print' ? '編集に戻る' : '完成しおり'}</span>
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
                  <div 
                    className="trip-meta-item trip-meta-clickable"
                    onClick={() => setIsGroupModalOpen(true)}
                    title="クリックしてグループメンバーを管理・友達を招待"
                    style={{ cursor: 'pointer' }}
                  >
                    <Users size={16} />
                    <span>
                      {currentTrip.members && currentTrip.members.length > 0 
                        ? currentTrip.members.join('・') 
                        : 'メンバー未登録'}
                    </span>
                    {(currentTrip.pendingMembers?.length || 0) > 0 && (
                      <span className="badge-pending-pill" style={{ marginLeft: '6px', fontSize: '0.72rem', background: 'rgba(255, 193, 7, 0.3)', color: '#ffd54f', padding: '2px 8px', borderRadius: '12px' }}>
                        {currentTrip.pendingMembers?.length}名承認待ち
                      </span>
                    )}
                  </div>
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
                  <Sparkles size={14} /> テーマ自動作成
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  style={{ background: 'rgba(255, 255, 255, 0.25)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => setIsGroupModalOpen(true)}
                  title="LINE風旅行グループ管理＆友達招待"
                >
                  <Users size={14} /> グループ・友達招待
                </button>
                <button 
                  className="btn btn-secondary btn-sm" 
                  style={{ background: 'rgba(255, 255, 255, 0.18)', color: '#fff', border: 'none' }}
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Settings size={14} /> 基本設定
                </button>
              </div>
            </div>
          </section>

          {/* メインタブバー */}
          <nav className="nav-tabs-wrapper">
            <div className="nav-tabs">
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

          {/* スマホ専用 固定ボトムナビゲーションバー（ワンタップ切り替え・横スクロール不要・親指で全機能にアクセス） */}
          <nav className="mobile-bottom-nav no-print">
            <button
              className="bottom-nav-item"
              onClick={() => setIsTripListOpen(true)}
              title="保存されたしおり一覧"
            >
              <div className="bottom-nav-icon-wrap">
                <BookOpen size={20} />
                <span className="bottom-nav-badge">{trips.length}</span>
              </div>
              <span className="bottom-nav-label">しおり</span>
            </button>

            <button
              className={`bottom-nav-item ${activeTab === 'timeline' ? 'active' : ''}`}
              onClick={() => { setActiveTab('timeline'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              title="旅程タイムライン"
            >
              <div className="bottom-nav-icon-wrap">
                <Calendar size={20} />
                {(currentTrip.schedules?.length || 0) > 0 && (
                  <span className="bottom-nav-badge">{currentTrip.schedules?.length}</span>
                )}
              </div>
              <span className="bottom-nav-label">旅程</span>
            </button>

            <button
              className="bottom-nav-item"
              onClick={() => setIsGroupModalOpen(true)}
              title="LINE風グループ管理・友達招待"
            >
              <div className="bottom-nav-icon-wrap">
                <Users size={20} />
                {(myPendingInvitesCount > 0 || (currentTrip.pendingMembers?.length || 0) > 0) && (
                  <span className="bottom-nav-badge badge-alert">
                    {myPendingInvitesCount || currentTrip.pendingMembers?.length}
                  </span>
                )}
              </div>
              <span className="bottom-nav-label">グループ</span>
            </button>

            <button
              className={`bottom-nav-item ${activeTab === 'checklist' ? 'active' : ''}`}
              onClick={() => { setActiveTab('checklist'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              title="持ち物・準備ToDo"
            >
              <div className="bottom-nav-icon-wrap">
                <CheckSquare size={20} />
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
                <Coins size={20} />
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
        onResetToLatest={handleForceResetData}
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
        onResetToSample={handleForceResetData}
      />

      {/* 4. アカウント設定・ユーザー切り替えモーダル */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={handleUserChange}
      />

      {/* 5. 旅行グループ管理＆友達QRコード交換モーダル */}
      <GroupManageModal
        tripPlan={currentTrip}
        currentUser={currentUser}
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onUpdateTripMembers={(newMembers) => handleUpdateTripMembers(newMembers)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />
    </div>
  );
}
