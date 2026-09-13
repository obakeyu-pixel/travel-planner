/**
 * 旅行計画アプリ「旅ぷらん」型定義ファイル
 */

// スポットのカテゴリ分類
export type SpotCategory = 
  | 'sightseeing' // 観光・名所
  | 'gourmet'     // グルメ・カフェ
  | 'nature'      // 絶景・自然
  | 'activity'    // 体験・アクティビティ
  | 'hotspring'   // 温泉・宿
  | 'shopping';   // お買い物・お土産

// 予定アイテムの種別
export type ScheduleCategory =
  | 'spot'        // 観光・立ち寄り
  | 'meal'        // 朝食・昼食・夕食・カフェ
  | 'transport'   // 移動（電車・飛行機・バス・車）
  | 'hotel'       // チェックイン・宿泊
  | 'free';       // 自由時間

// 持ち物・ToDoのカテゴリ
export type ChecklistCategory =
  | 'valuable'    // 貴重品（財布、スマホ、チケット、身分証など）
  | 'clothes'     // 衣類・着替え
  | 'daily'       // アメニティ・日用品・常備薬
  | 'gadget'      // 充電器・カメラ・電子機器
  | 'todo';       // 事前手続き・予約確認

// 費用のカテゴリ
export type ExpenseCategory =
  | 'transport'   // 交通費
  | 'hotel'       // 宿泊費
  | 'food'        // 飲食代
  | 'activity'    // 観光・入場料・体験
  | 'souvenir'    // お土産
  | 'other';      // その他

// テーマデザイン設定
export interface ThemeStyle {
  id: string;
  name: string;
  keywords: string[];          // キーワード判定用（例: '京都', '海', '温泉'）
  primaryColor: string;
  primaryLight: string;
  primaryHover: string;
  accentColor: string;
  heroGradient: string;
  patternType: 'seigaiha' | 'waves' | 'leaves' | 'cherry' | 'grid' | 'warmDots';
  patternDescription: string;
}

// グループメンバー情報
export interface TripMember {
  id: string;
  name: string;
  avatarColor: string;
}

// スポット情報
export interface Spot {
  id: string;
  name: string;
  area: string;
  category: SpotCategory;
  description: string;
  imageUrl: string;
  recommendedDuration: string; // 例: "約1〜2時間"
  estimatedBudget: string;     // 例: "約1,000円〜"
  address?: string;            // 住所
  phoneNumber?: string;        // 電話番号
  bookingUrl?: string;         // 予約サイトURL (じゃらん、食べログ、一休等)
  officialUrl?: string;        // 公式サイトURL
  tips?: string;              // おすすめポイント・見どころ
  isSaved?: boolean;          // 行きたいリストに保存されているか
  isCustom?: boolean;         // ユーザーが手動追加したスポットか
  wantedMembers?: string[];   // このスポットに行きたいと投票したメンバーの名前一覧
}

// タイムライン予定アイテム
export interface ScheduleItem {
  id: string;
  dayNumber: number;          // 何日目か (1, 2, 3...)
  time: string;               // 開始時間 (例: "09:30")
  endTime?: string;           // 終了時間 (例: "11:00")
  category: ScheduleCategory;
  title: string;
  location?: string;
  memo?: string;
  cost?: number;
  transportMode?: 'walk' | 'train' | 'car' | 'bus' | 'plane';
  transportDuration?: string; // 例: "徒歩10分"
  assignedMembers?: string[]; // 担当・参加メンバー
}

// 持ち物・タスクアイテム
export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  title: string;
  isDone: boolean;
  memo?: string;
  assignedTo?: string;        // 誰の持ち物か
}

// 予算・支出アイテム
export interface ExpenseItem {
  id: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  isPaid: boolean;
  memo?: string;
  paidBy?: string;            // 立替・支払者
}

// 旅行全体の情報
export interface TripPlan {
  id: string;
  title: string;
  destination: string;
  startDate: string;          // YYYY-MM-DD
  endDate: string;            // YYYY-MM-DD
  totalDays: number;          // 旅行日数
  coverImage: string;
  themeId: string;            // 適用テーマID
  themeKeyword?: string;      // ユーザーが入力したテーマ
  members: string[];          // 同行者名一覧
  memo: string;
  savedSpots: Spot[];         // 行きたいリスト
  schedules: ScheduleItem[];  // 旅程タイムライン
  checklists: ChecklistItem[];// 持ち物・ToDo
  expenses: ExpenseItem[];    // 費用
  totalBudget: number;        // 総予算設定
  createdAt?: string;
  updatedAt?: string;
}
