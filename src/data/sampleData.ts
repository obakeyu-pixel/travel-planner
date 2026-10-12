/**
 * おすすめスポットのマスターデータおよび初期旅行プラン
 */
import type { Spot, TripPlan, ThemeStyle } from '../types/travel';

// テーマプリセット集（テーマキーワード、色、柄パターン）
export const THEME_PRESETS: ThemeStyle[] = [
  {
    id: 'trad-kyoto',
    name: '和風・古都の雅（京都・金沢・寺社）',
    keywords: ['京都', '金沢', '和風', '寺', '神社', '歴史', '古都', '抹茶', '着物'],
    primaryColor: '#0d9488', // 抹茶深緑〜ティール
    primaryLight: '#ccfbf1',
    primaryHover: '#0f766e',
    accentColor: '#e11d48', // 茜色・朱色
    heroGradient: 'linear-gradient(135deg, #0f766e 0%, #134e4a 50%, #042f2e 100%)',
    patternType: 'seigaiha',
    patternDescription: '伝統の青海波（せいがいは）和柄パターン',
  },
  {
    id: 'resort-sea',
    name: '南国リゾート・美ら海（沖縄・ビーチ・島）',
    keywords: ['沖縄', '海', 'ビーチ', 'リゾート', '島', 'ダイビング', 'ハワイ', '夏'],
    primaryColor: '#0284c7', // ターコイズブルー
    primaryLight: '#e0f2fe',
    primaryHover: '#0369a1',
    accentColor: '#f59e0b', // サンシャインゴールド
    heroGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0c4a6e 100%)',
    patternType: 'waves',
    patternDescription: '爽やかな海の波打ち際パターン',
  },
  {
    id: 'nature-green',
    name: '大自然・高原リフレッシュ（北海道・山・キャンプ）',
    keywords: ['北海道', '自然', '山', '高原', 'キャンプ', '緑', '森林', '富良野', 'ハイキング'],
    primaryColor: '#16a34a', // フレッシュフォレストグリーン
    primaryLight: '#dcfce7',
    primaryHover: '#15803d',
    accentColor: '#ca8a04', // アースイエロー
    heroGradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #14532d 100%)',
    patternType: 'leaves',
    patternDescription: '木漏れ日と若葉のグリーンパターン',
  },
  {
    id: 'onsen-warm',
    name: '湯けむり・温泉癒やし旅（箱根・草津・別府）',
    keywords: ['温泉', '癒やし', '旅館', '箱根', '草津', '別府', '湯布院', '宿'],
    primaryColor: '#d97706', // ぬくもりアンバー
    primaryLight: '#fef3c7',
    primaryHover: '#b45309',
    accentColor: '#e11d48', // 湯のれん紅
    heroGradient: 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #78350f 100%)',
    patternType: 'warmDots',
    patternDescription: 'あたたかな湯けむりドットパターン',
  },
  {
    id: 'sakura-spring',
    name: '桜花・はんなり春爛漫（花見・スイーツ・女子旅）',
    keywords: ['桜', '春', 'かわいい', 'スイーツ', '女子旅', '花見', 'ピンク'],
    primaryColor: '#db2777', // 桜ローズピンク
    primaryLight: '#fce7f3',
    primaryHover: '#be185d',
    accentColor: '#8b5cf6', // すみれパープル
    heroGradient: 'linear-gradient(135deg, #db2777 0%, #be185d 50%, #831843 100%)',
    patternType: 'cherry',
    patternDescription: '舞い散る可憐な桜の花びらパターン',
  },
  {
    id: 'urban-night',
    name: '都会・スタイリッシュモダン（東京・夜景・アート）',
    keywords: ['東京', '都会', '夜景', 'アート', 'スタイリッシュ', 'ショッピング', 'モダン'],
    primaryColor: '#6366f1', // ネオンインディゴ
    primaryLight: '#e0e7ff',
    primaryHover: '#4f46e5',
    accentColor: '#ec4899', // ネオンピンク
    heroGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0f172a 100%)',
    patternType: 'grid',
    patternDescription: '洗練された都会のサイバーグリッド柄',
  },
];

// キーワードから最もマッチするテーマを判定する関数
export function detectThemeByKeyword(keyword: string): ThemeStyle {
  const normalized = keyword.toLowerCase();
  for (const preset of THEME_PRESETS) {
    if (preset.keywords.some((k) => normalized.includes(k.toLowerCase()))) {
      return preset;
    }
  }
  return THEME_PRESETS[0]; // デフォルト: 和風・古都
}
// おすすめスポット一覧（初期状態は完全白紙・ユーザーの手動登録のみ）
export const RECOMMENDED_SPOTS: Spot[] = [];

// 初期旅行データ（固定サンプルは全廃、まっさらな白紙のしおり1件のみ）
export const INITIAL_TRIPS: TripPlan[] = [
  {
    id: `trip-init-${Date.now()}`,
    title: '新しい旅行のしおり',
    destination: '目的地を設定してください',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    totalDays: 2,
    coverImage: undefined, // デフォルト写真なし（美しい和柄・テーマグラデーション背景）
    themeId: 'trad-kyoto',
    themeKeyword: '',
    members: ['自分'],
    memo: '旅の目的や合流場所、持ち物メモなど自由に書き込みましょう！',
    totalBudget: 0,
    savedSpots: [],
    schedules: [],
    checklists: [
      { id: `chk-init-1`, category: 'valuable', title: '財布・身分証・チケット', isDone: false },
      { id: `chk-init-2`, category: 'gadget', title: 'スマホ充電器・モバイルバッテリー', isDone: false },
      { id: `chk-init-3`, category: 'clothes', title: '着替え・下着', isDone: false },
    ],
    expenses: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// 定番持ち物プリセット
export const DEFAULT_CHECKLIST_PRESETS = [
  { category: 'valuable' as const, title: '現金・クレジットカード・交通系ICカード' },
  { category: 'valuable' as const, title: '身分証明書・運転免許証・保険証' },
  { category: 'valuable' as const, title: '新幹線・飛行機・宿泊の予約確認画面' },
  { category: 'gadget' as const, title: 'スマホ充電器・ACアダプタ' },
  { category: 'gadget' as const, title: '大容量モバイルバッテリー' },
  { category: 'gadget' as const, title: 'イヤホン・ヘッドホン' },
  { category: 'clothes' as const, title: '着替え・下着・靴下（日数分）' },
  { category: 'clothes' as const, title: '歩きやすい靴・スニーカー' },
  { category: 'clothes' as const, title: '体温調節用の羽織りもの・上着' },
  { category: 'daily' as const, title: '洗面用具・スキンケア・歯ブラシ' },
  { category: 'daily' as const, title: '常備薬・頭痛薬・絆創膏・目薬' },
  { category: 'daily' as const, title: '折りたたみ傘・雨具' },
  { category: 'daily' as const, title: 'ハンカチ・ティッシュ・ウェットティッシュ' },
  { category: 'daily' as const, title: 'お土産を入れるエコバッグ・サブバッグ' },
  { category: 'todo' as const, title: 'ゴミ出し・自宅の戸締まり・消灯確認' },
  { category: 'todo' as const, title: '現地の天気予報と気温の確認' },
];
