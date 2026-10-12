import type { TripPlan } from '../types/travel';
import { INITIAL_TRIPS } from '../data/sampleData';

// 現在のアプリバージョン（更新のたびにインクリメントすることで自動で古いデータを消去）
export const APP_VERSION = '2.3.0';

// バージョン管理用キー
export const APP_VERSION_KEY = 'tabi_planner_app_version';

// 最新版のデータストレージキー（バージョン紐付け）
export const CURRENT_TRIPS_STORAGE_KEY = `tabi_planner_all_trips_v${APP_VERSION.replace(/\./g, '_')}`;
export const CURRENT_TRIP_ID_STORAGE_KEY = `tabi_planner_current_trip_id_v${APP_VERSION.replace(/\./g, '_')}`;

// 過去の古いストレージキー一覧（アップデート時に消去対象）
const LEGACY_STORAGE_KEYS = [
  'tabi_planner_all_trips',
  'tabi_planner_all_trips_v1',
  'tabi_planner_all_trips_v2',
  'tabi_planner_all_trips_v2_1_0',
  'tabi_planner_all_trips_v2_2_0',
  'tabi_planner_current_trip_id',
  'tabi_planner_current_trip_id_v1',
  'tabi_planner_current_trip_id_v2',
  'tabi_planner_current_trip_id_v2_1_0',
  'tabi_planner_current_trip_id_v2_2_0',
  'tabi_planner_cached_spots',
  'tabi_planner_legacy_cache',
];

/**
 * 起動時にアプリバージョンを検証し、
 * アプリがアップデートされた場合は過去の古いデータをLocalStorageから完全消去して
 * 最新のデータにリフレッシュする。
 */
export const checkAndPurgeLegacyData = (): { isUpdated: boolean; trips: TripPlan[]; initialTripId: string } => {
  try {
    const storedVersion = localStorage.getItem(APP_VERSION_KEY);

    // バージョンが異なる（アプリが新しくアップデートされた）場合
    if (!storedVersion || storedVersion !== APP_VERSION) {
      console.log(`[VersionManager] アプリ更新を検知: ${storedVersion || '未設定'} -> ${APP_VERSION}`);
      console.log('[VersionManager] 古いバージョンの旅行データを消去し、最新データへ刷新します...');

      // 既存のユーザー保存データを探索して安全に引き継ぎ（マイグレーション）
      let existingUserTrips: TripPlan[] | null = null;
      let existingTripId: string | null = null;

      // 現在のキーまたは過去のキーから既存データを回収
      const possibleKeys = [CURRENT_TRIPS_STORAGE_KEY, ...LEGACY_STORAGE_KEYS.filter(k => k.includes('all_trips'))];
      for (const k of possibleKeys) {
        try {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              existingUserTrips = parsed;
              break;
            }
          }
        } catch (e) {}
      }

      const possibleIdKeys = [CURRENT_TRIP_ID_STORAGE_KEY, ...LEGACY_STORAGE_KEYS.filter(k => k.includes('current_trip_id'))];
      for (const k of possibleIdKeys) {
        try {
          const rawId = localStorage.getItem(k);
          if (rawId) {
            existingTripId = rawId;
            break;
          }
        } catch (e) {}
      }

      // 1. 過去の古いストレージキーを一括削除
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        localStorage.removeItem(legacyKey);
      }

      // 2. 過去のサンプルユーザー（けんた・さくら）が残っていたら除外して保存
      try {
        const usersJson = localStorage.getItem('tabi_planner_users_v1');
        if (usersJson) {
          const parsedUsers = JSON.parse(usersJson);
          if (Array.isArray(parsedUsers)) {
            const filteredUsers = parsedUsers.filter((u: any) => u.id !== 'user-kenta' && u.id !== 'user-sakura');
            localStorage.setItem('tabi_planner_users_v1', JSON.stringify(filteredUsers));
            const curId = localStorage.getItem('tabi_planner_current_user_id_v1');
            if (curId === 'user-kenta' || curId === 'user-sakura') {
              localStorage.removeItem('tabi_planner_current_user_id_v1');
            }
          }
        }
      } catch (e) {}

      // 3. データ保存: 既存データがあればそれを保持、なければ初期データをセット
      const tripsToPersist = (existingUserTrips && existingUserTrips.length > 0) ? existingUserTrips : INITIAL_TRIPS;
      const initialId = (existingTripId && tripsToPersist.some(t => t.id === existingTripId)) 
        ? existingTripId 
        : (tripsToPersist[0]?.id || 'trip-1');

      localStorage.setItem(CURRENT_TRIPS_STORAGE_KEY, JSON.stringify(tripsToPersist));
      localStorage.setItem(CURRENT_TRIP_ID_STORAGE_KEY, initialId);

      // 4. 最新バージョンを記録
      localStorage.setItem(APP_VERSION_KEY, APP_VERSION);

      return {
        isUpdated: true,
        trips: tripsToPersist,
        initialTripId: initialId,
      };
    }

    // 既に最新バージョンの場合は保存済みデータを読み込む
    const saved = localStorage.getItem(CURRENT_TRIPS_STORAGE_KEY);
    const savedId = localStorage.getItem(CURRENT_TRIP_ID_STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validId = parsed.some((t: TripPlan) => t.id === savedId) ? savedId! : parsed[0].id;
        return {
          isUpdated: false,
          trips: parsed,
          initialTripId: validId,
        };
      }
    }

    // 保存データがない場合は初期データで設定
    localStorage.setItem(CURRENT_TRIPS_STORAGE_KEY, JSON.stringify(INITIAL_TRIPS));
    localStorage.setItem(CURRENT_TRIP_ID_STORAGE_KEY, INITIAL_TRIPS[0].id);
    localStorage.setItem(APP_VERSION_KEY, APP_VERSION);

    return {
      isUpdated: false,
      trips: INITIAL_TRIPS,
      initialTripId: INITIAL_TRIPS[0].id,
    };
  } catch (e) {
    console.error('[VersionManager] バージョンチェック・データ初期化エラー:', e);
    return {
      isUpdated: false,
      trips: INITIAL_TRIPS,
      initialTripId: INITIAL_TRIPS[0].id,
    };
  }
};

/**
 * ユーザーの手動操作により、古いデータを完全消去して最新の公式データに強制リセットする。
 */
export const forceResetToLatestData = (): { trips: TripPlan[]; initialTripId: string } => {
  try {
    // 古いキーを全て消去
    for (const key of LEGACY_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('tabi_planner_all_trips_')) {
        localStorage.removeItem(key);
      }
      if (key && key.startsWith('tabi_planner_current_trip_id_')) {
        localStorage.removeItem(key);
      }
    }

    // 最新データを再保存
    const freshTrips = INITIAL_TRIPS;
    const initialId = freshTrips[0]?.id || 'trip-1';

    localStorage.setItem(CURRENT_TRIPS_STORAGE_KEY, JSON.stringify(freshTrips));
    localStorage.setItem(CURRENT_TRIP_ID_STORAGE_KEY, initialId);
    localStorage.setItem(APP_VERSION_KEY, APP_VERSION);

    return {
      trips: freshTrips,
      initialTripId: initialId,
    };
  } catch (e) {
    console.error('[VersionManager] 手動リセットエラー:', e);
    return {
      trips: INITIAL_TRIPS,
      initialTripId: INITIAL_TRIPS[0].id,
    };
  }
};
