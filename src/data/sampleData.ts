/**
 * おすすめスポットのマスターデータおよびサンプル旅行プラン
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

// おすすめスポット一覧（住所、電話番号、予約・公式URL付き）
export const RECOMMENDED_SPOTS: Spot[] = [
  // --- 京都 ---
  {
    id: 'spot-kyoto-1',
    name: '伏見稲荷大社（千本鳥居）',
    area: '京都',
    category: 'sightseeing',
    description: '朱色の鳥居がどこまでも連なる神秘的な光景。全国に約3万社ある稲荷神社の総本宮。',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
    recommendedDuration: '約1.5〜2時間',
    estimatedBudget: '無料（境内自由）',
    address: '京都府京都市伏見区深草藪之内町68',
    phoneNumber: '075-641-7331',
    officialUrl: 'http://inari.jp/',
    tips: '早朝（7時〜8時頃）に行くと混雑を避けて幻想的な写真が撮れます！奥社奉拝所の「おもかる石」で願掛けもおすすめ。',
    wantedMembers: ['自分'],
  },
  {
    id: 'spot-kyoto-2',
    name: '嵐山 竹林の小径',
    area: '京都',
    category: 'nature',
    description: '天に向かって伸びる緑の竹がサラサラと音を立てる風情ある散策道。野宮神社から大河内山荘へ続く小道。',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80',
    recommendedDuration: '約45分',
    estimatedBudget: '無料',
    address: '京都府京都市右京区嵯峨野',
    phoneNumber: '075-861-0012',
    officialUrl: 'https://kyoto.travel/ja/sightseeing/spot/076.html',
    tips: '渡月橋からのお散歩ルートが定番。渡月橋近くのカフェ「アラビカ京都 嵐山」のカフェラテを片手に歩くのが人気！',
    wantedMembers: ['自分', '友人'],
  },
  {
    id: 'spot-kyoto-3',
    name: '錦市場（京の台所）',
    area: '京都',
    category: 'gourmet',
    description: '約400mのアーケードに約130の店舗がずらりと並ぶ、京都の食文化を体感できる活気あふれる市場。',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    recommendedDuration: '約1時間',
    estimatedBudget: '1,500円〜3,000円',
    address: '京都府京都市中京区錦小路通',
    phoneNumber: '075-211-3882',
    officialUrl: 'https://www.kyoto-nishiki.or.jp/',
    tips: 'だし巻き卵串、湯葉コロッケ、抹茶スイーツなど食べ歩き（各店舗の飲食スペースで楽しむルール）を満喫できます。',
    wantedMembers: ['自分', '友人'],
  },
  {
    id: 'spot-kyoto-4',
    name: '清水寺＆産寧坂',
    area: '京都',
    category: 'sightseeing',
    description: '「清水の舞台」で知られる世界遺産。本堂からの京都市街の眺望と、風情ある石畳の参道散策が魅力。',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80',
    recommendedDuration: '約2時間',
    estimatedBudget: '拝観料 400円',
    address: '京都府京都市東山区清水1-294',
    phoneNumber: '075-551-1234',
    officialUrl: 'https://www.kiyomizudera.or.jp/',
    bookingUrl: 'https://www.jalan.net/kankou/spt_26105ag2130014264/',
    tips: '音羽の滝の3筋の水（学業・恋愛・健康）を一口いただくのが定番。夕暮れ時の舞台からの景色も絶景。',
    wantedMembers: ['自分'],
  },
  {
    id: 'spot-kyoto-5',
    name: '祇園 辻利＆茶寮都路里 本店',
    area: '京都',
    category: 'gourmet',
    description: '濃厚な宇治抹茶を贅沢に使った特製抹茶パフェが名物の老舗甘味処。京都ならではの上品な甘味。',
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80',
    recommendedDuration: '約1時間',
    estimatedBudget: '1,200円〜2,000円',
    address: '京都府京都市東山区四条通祇園町南側 573-3',
    phoneNumber: '075-561-2257',
    officialUrl: 'https://www.giontsujiri.co.jp/saryo/',
    bookingUrl: 'https://tabelog.com/kyoto/A2601/A260301/26000965/',
    tips: '「都路里パフェ」はボリューム満点！行列ができるので開店直後か午後遅めの時間が狙い目。',
    wantedMembers: ['友人'],
  },

  // --- 沖縄 ---
  {
    id: 'spot-okinawa-1',
    name: '沖縄美ら海水族館',
    area: '沖縄',
    category: 'activity',
    description: '世界最大級の大水槽「黒潮の海」を悠々と泳ぐ巨大なジンベエザメやナンヨウマンタに圧倒される人気スポット。',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    recommendedDuration: '約2〜3時間',
    estimatedBudget: '入館料 大人2,180円',
    address: '沖縄県国頭郡本部町字石川424',
    phoneNumber: '0980-48-3748',
    officialUrl: 'https://churaumi.okinawa/',
    bookingUrl: 'https://churaumi.okinawa/guide/ticket/',
    tips: '15:00と17:00の「黒潮の海」給餌解説は大迫力で見逃せません。大水槽横のカフェ「オーシャンブルー」の特等席もおすすめ。',
    wantedMembers: ['自分'],
  },
  {
    id: 'spot-okinawa-2',
    name: '古宇利島＆古宇利大橋',
    area: '沖縄',
    category: 'nature',
    description: 'エメラルドグリーンの海上を約2kmまっすぐに伸びる大橋。まるで海の上を走っているかのような爽快ドライブコース。',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    recommendedDuration: '約1〜2時間',
    estimatedBudget: '無料（橋通行無料）',
    address: '沖縄県国頭郡今帰仁村古宇利',
    phoneNumber: '0980-56-2256',
    officialUrl: 'https://kourijima.info/',
    tips: '島北部のティーヌ浜にある「ハートロック」は恋のパワースポット。名物ガーリックシュリンプも絶品！',
    wantedMembers: ['友人'],
  },
  {
    id: 'spot-okinawa-3',
    name: '国際通り屋台村',
    area: '沖縄',
    category: 'gourmet',
    description: '沖縄県産の新鮮食材を使った郷土料理や泡盛が楽しめる約20軒の個性豊かな屋台が集う夜の活気スポット。',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    recommendedDuration: '約1.5〜2.5時間',
    estimatedBudget: '2,500円〜4,500円',
    address: '沖縄県那覇市牧志3-11-17',
    phoneNumber: '098-866-6163',
    officialUrl: 'http://www.okinawa-yatai.jp/',
    bookingUrl: 'https://tabelog.com/okinawa/A4701/A470101/47016024/',
    tips: 'ゴーヤーチャンプルー、アグー豚、海ぶどう、ラフテーをつまみながらの「はしご酒」が最高の楽しみ方です。',
    wantedMembers: ['自分', '友人'],
  },

  // --- 北海道 ---
  {
    id: 'spot-hokkaido-1',
    name: '小樽運河＆レトロ街並み散策',
    area: '北海道',
    category: 'sightseeing',
    description: '石造りの倉庫群が連なるノスタルジックな運河。夕暮れ時にはガス灯が灯り、ロマンチックな雰囲気に包まれます。',
    imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80',
    recommendedDuration: '約2時間',
    estimatedBudget: '無料（クルーズ等は別）',
    address: '北海道小樽市港町',
    phoneNumber: '0134-32-4111',
    officialUrl: 'https://otaru.gr.jp/destination/otaru-canal',
    bookingUrl: 'https://otaru.cc/',
    tips: '北一硝子やオルゴール堂巡り、ルタオ本店での限定ドゥーブルフロマージュのカフェタイムとセットがおすすめ。',
    wantedMembers: ['自分'],
  },
  {
    id: 'spot-hokkaido-2',
    name: '富良野 ファーム富田（ラベンダー畑）',
    area: '北海道',
    category: 'nature',
    description: '見渡す限りの紫の絨毯と十勝岳連峰の雄大なパノラマ。色鮮やかな七色の花畑「彩りの畑」は息をのむ美しさ。',
    imageUrl: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?w=800&q=80',
    recommendedDuration: '約1.5時間',
    estimatedBudget: '入場無料',
    address: '北海道空知郡中富良野町基線北15号',
    phoneNumber: '0167-39-3939',
    officialUrl: 'https://www.farm-tomita.co.jp/',
    tips: '見頃は7月中旬〜下旬。名物のラベンダーソフトクリームは香りと爽やかさが抜群です。',
    wantedMembers: ['友人'],
  }
];

// 初期サンプル旅行データ1（京都2泊3日モデルプラン）
export const SAMPLE_TRIP_KYOTO: TripPlan = {
  id: 'trip-kyoto-autumn',
  title: '京都 2泊3日 風情とグルメを巡る癒やし旅',
  destination: '京都府（嵐山・祇園・東山）',
  startDate: '2026-10-10',
  endDate: '2026-10-12',
  totalDays: 3,
  coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80',
  themeId: 'trad-kyoto',
  themeKeyword: '京都',
  members: ['自分', 'さくら', 'けんじ'],
  memo: '秋の京都を満喫する旅！着物をレンタルして東山散策、嵐山の竹林と渡月橋、美味しい抹茶スイーツを堪能する。',
  totalBudget: 65000,
  createdAt: '2026-09-10',
  updatedAt: '2026-09-12',
  savedSpots: [
    RECOMMENDED_SPOTS[0], // 伏見稲荷
    RECOMMENDED_SPOTS[1], // 嵐山
    RECOMMENDED_SPOTS[2], // 錦市場
    RECOMMENDED_SPOTS[3], // 清水寺
    RECOMMENDED_SPOTS[4], // 祇園 辻利
  ],
  schedules: [
    {
      id: 'sch-1-1',
      dayNumber: 1,
      time: '09:00',
      endTime: '10:00',
      category: 'transport',
      title: '京都駅に到着・荷物をコインロッカーへ預ける',
      location: 'JR京都駅 中央口',
      memo: '新幹線で到着。駅地下ポルタのロッカーかホテル配送サービスを利用。',
      transportMode: 'train',
    },
    {
      id: 'sch-1-2',
      dayNumber: 1,
      time: '10:30',
      endTime: '12:30',
      category: 'spot',
      title: '伏見稲荷大社 参拝＆千本鳥居散策',
      location: '伏見稲荷大社',
      memo: 'JR奈良線で稲荷駅へ。千本鳥居をくぐり奥社までウォーキング！',
      transportMode: 'train',
      transportDuration: 'JR約5分',
      cost: 0,
    },
    {
      id: 'sch-1-3',
      dayNumber: 1,
      time: '13:00',
      endTime: '14:30',
      category: 'meal',
      title: '錦市場で京の味覚めぐりランチ',
      location: '錦市場商店街',
      memo: 'だし巻き玉子や湯葉コロッケ、はも天などを楽しむ！',
      cost: 2000,
    },
    {
      id: 'sch-1-4',
      dayNumber: 1,
      time: '15:30',
      endTime: '16:30',
      category: 'hotel',
      title: 'ホテルにチェックイン＆休憩',
      location: '四条烏丸エリアのホテル',
      memo: 'チェックインして荷物を整理。少し足を休める。',
    },
    {
      id: 'sch-1-5',
      dayNumber: 1,
      time: '18:00',
      endTime: '20:00',
      category: 'meal',
      title: '先斗町で鴨川を眺めながら京料理ディナー',
      location: '先斗町 居酒屋',
      memo: '事前予約済み。湯豆腐とおばんざいを味わう。',
      cost: 5500,
    },
    {
      id: 'sch-2-1',
      dayNumber: 2,
      time: '08:30',
      endTime: '09:30',
      category: 'transport',
      title: '嵐山へ移動（阪急電車）',
      location: '嵐山駅',
      memo: '混雑を避けるため早めに出発。',
      transportMode: 'train',
      transportDuration: '電車約25分',
    },
    {
      id: 'sch-2-2',
      dayNumber: 2,
      time: '09:30',
      endTime: '11:30',
      category: 'spot',
      title: '嵐山 竹林の小径＆野宮神社',
      location: '嵐山 竹林',
      memo: '朝の静かな竹林の散策。渡月橋で写真撮影。',
      cost: 0,
    },
    {
      id: 'sch-2-3',
      dayNumber: 2,
      time: '12:00',
      endTime: '13:30',
      category: 'meal',
      title: '嵐山 渡月橋そばの湯豆腐ランチ',
      location: '嵐山 豆腐料理店',
      memo: '景色を眺めながら温かい湯豆腐御膳。',
      cost: 3000,
    },
    {
      id: 'sch-3-1',
      dayNumber: 3,
      time: '09:00',
      endTime: '11:30',
      category: 'spot',
      title: '清水寺 舞台拝観＆産寧坂・二年坂散策',
      location: '清水寺',
      memo: '清水の舞台からの眺めと、八坂神社へ続く風情ある石畳の坂道巡り。',
      cost: 400,
    },
    {
      id: 'sch-3-2',
      dayNumber: 3,
      time: '12:00',
      endTime: '13:30',
      category: 'meal',
      title: '祇園 茶寮都路里で特選抹茶パフェ',
      location: '祇園 辻利',
      memo: '京都旅行のシメに贅沢抹茶パフェ！',
      cost: 1600,
    },
  ],
  checklists: [
    { id: 'chk-1', category: 'valuable', title: '新幹線チケット（スマートEX確認）', isDone: true, assignedTo: '自分' },
    { id: 'chk-2', category: 'valuable', title: '財布・クレジットカード・交通系ICカード', isDone: true },
    { id: 'chk-3', category: 'valuable', title: '健康保険証・身分証', isDone: true },
    { id: 'chk-4', category: 'todo', title: 'ホテルの予約確認メール保存', isDone: true, assignedTo: 'さくら' },
    { id: 'chk-5', category: 'todo', title: '1日目ディナー店（先斗町）の席予約', isDone: true, assignedTo: 'けんじ' },
    { id: 'chk-6', category: 'gadget', title: 'スマホのモバイルバッテリー＆充電ケーブル', isDone: false },
    { id: 'chk-7', category: 'gadget', title: 'カメラ＆SDカード', isDone: false, assignedTo: 'けんじ' },
    { id: 'chk-8', category: 'clothes', title: '歩きやすいスニーカー（たくさん歩くため必須）', isDone: true },
    { id: 'chk-9', category: 'clothes', title: '着替え（2泊3日分）＆インナー', isDone: false },
    { id: 'chk-10', category: 'daily', title: '常備薬・胃腸薬・絆創膏', isDone: true, assignedTo: 'さくら' },
    { id: 'chk-11', category: 'daily', title: '折りたたみ傘（雨対策）', isDone: false },
  ],
  expenses: [
    { id: 'exp-1', category: 'transport', title: '新幹線往復チケット', amount: 27000, isPaid: true, memo: 'スマートEX早特' },
    { id: 'exp-2', category: 'hotel', title: '四条烏丸ホテル（2泊分）', amount: 16000, isPaid: true, memo: '朝食なし素泊まり' },
    { id: 'exp-3', category: 'food', title: '1日目 先斗町ディナー', amount: 5500, isPaid: false, memo: '事前予約' },
    { id: 'exp-4', category: 'food', title: '2日目 湯豆腐ランチ', amount: 3000, isPaid: false },
    { id: 'exp-5', category: 'activity', title: '清水寺拝観料', amount: 400, isPaid: false },
    { id: 'exp-6', category: 'souvenir', title: 'お土産（八つ橋・お茶など）予算', amount: 5000, isPaid: false },
  ]
};

// 初期サンプル旅行データ2（沖縄3泊4日モデルプラン）
export const SAMPLE_TRIP_OKINAWA: TripPlan = {
  id: 'trip-okinawa-resort',
  title: '沖縄 本島ドライブ＆美ら海リゾートバカンス',
  destination: '沖縄県（那覇・名護・恩納村）',
  startDate: '2026-07-15',
  endDate: '2026-07-18',
  totalDays: 4,
  coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
  themeId: 'resort-sea',
  themeKeyword: '沖縄 海',
  members: ['自分', '友人A', '友人B'],
  memo: 'エメラルドグリーンの海を満喫する夏旅！古宇利島ドライブ、美ら海水族館、夜は国際通り屋台村ではしご酒。',
  totalBudget: 80000,
  createdAt: '2026-08-01',
  updatedAt: '2026-08-05',
  savedSpots: [
    RECOMMENDED_SPOTS[5], // 美ら海
    RECOMMENDED_SPOTS[6], // 古宇利島
    RECOMMENDED_SPOTS[7], // 屋台村
  ],
  schedules: [
    {
      id: 'sch-ok-1',
      dayNumber: 1,
      time: '11:00',
      endTime: '12:30',
      category: 'transport',
      title: '那覇空港に到着・レンタカー受取',
      location: '那覇空港',
      transportMode: 'plane',
    },
    {
      id: 'sch-ok-2',
      dayNumber: 1,
      time: '13:30',
      endTime: '15:00',
      category: 'meal',
      title: '本場ソーキそばランチ',
      location: '那覇市内 沖縄そば店',
      cost: 1100,
    },
    {
      id: 'sch-ok-3',
      dayNumber: 2,
      time: '10:00',
      endTime: '13:00',
      category: 'spot',
      title: '沖縄美ら海水族館見学',
      location: '美ら海水族館',
      transportMode: 'car',
      cost: 2180,
    },
    {
      id: 'sch-ok-4',
      dayNumber: 2,
      time: '14:30',
      endTime: '16:30',
      category: 'spot',
      title: '古宇利島大橋ドライブ＆ハートロック散策',
      location: '古宇利島',
      transportMode: 'car',
    }
  ],
  checklists: [
    { id: 'chk-ok-1', category: 'valuable', title: '運転免許証（レンタカー用必須！）', isDone: true },
    { id: 'chk-ok-2', category: 'daily', title: '日焼け止め・サングラス・帽子', isDone: true },
    { id: 'chk-ok-3', category: 'clothes', title: '水着・ラッシュガード・ビーチサンダル', isDone: false },
    { id: 'chk-ok-4', category: 'gadget', title: '防水スマホケース', isDone: false },
  ],
  expenses: [
    { id: 'exp-ok-1', category: 'transport', title: '航空券往復', amount: 32000, isPaid: true },
    { id: 'exp-ok-2', category: 'hotel', title: '恩納村リゾートホテル（3泊）', amount: 28000, isPaid: true },
    { id: 'exp-ok-3', category: 'transport', title: 'レンタカー代（4日間）', amount: 9000, isPaid: true },
  ]
};

// 全初期旅行データ配列
export const INITIAL_TRIPS: TripPlan[] = [
  SAMPLE_TRIP_KYOTO,
  SAMPLE_TRIP_OKINAWA,
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
