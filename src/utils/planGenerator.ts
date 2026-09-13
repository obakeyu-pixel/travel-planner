import type { 
  TripPlan, 
  ScheduleItem, 
  ChecklistItem, 
  ExpenseItem, 
  Spot 
} from '../types/travel';
import { detectThemeByKeyword, RECOMMENDED_SPOTS } from '../data/sampleData';

export interface ThemePresetOption {
  id: string;
  themeTitle: string;
  themeKeyword: string;
  destination: string;
  badge: string;
  description: string;
}

export const POPULAR_THEMES: ThemePresetOption[] = [
  {
    id: 'onsen',
    themeTitle: '名湯と美食で心ほぐれる 温泉癒やし旅',
    themeKeyword: '温泉 旅館 癒やし 露天風呂',
    destination: '箱根・熱海',
    badge: '♨️ 人気No.1',
    description: '源泉かけ流しの露天風呂と季節の会席料理をゆっくり愉しむプラン',
  },
  {
    id: 'kyoto',
    themeTitle: '古都の風情と抹茶スイーツに出逢う 京都散策旅',
    themeKeyword: '京都 神社 寺 抹茶 歴史',
    destination: '京都・祇園・嵐山',
    badge: '⛩️ 王道定番',
    description: '清水寺や竹林の小径、老舗甘味処を着物でめぐる雅な旅',
  },
  {
    id: 'okinawa',
    themeTitle: '青い海と島時間を満喫！沖縄リゾートトリップ',
    themeKeyword: '沖縄 海 カフェ ドライブ ビーチ',
    destination: '沖縄（那覇・恩納村・美ら海）',
    badge: '🏝️ リゾート',
    description: '絶景オーシャンビューカフェと美ら海水族館、マリン体験プラン',
  },
  {
    id: 'hokkaido',
    themeTitle: '北の大地が育む絶品海鮮＆大自然ドライブ',
    themeKeyword: '北海道 グルメ 海鮮 ラーメン 自然',
    destination: '北海道（札幌・小樽・富良野）',
    badge: '🦀 グルメ特化',
    description: '市場の海鮮丼、味噌ラーメン、小樽運河の夜景を楽しむ満腹プラン',
  },
  {
    id: 'tokyo',
    themeTitle: '最旬アートとSNS映えカフェを巡る 東京トレンド旅',
    themeKeyword: '東京 カフェ アート ショッピング 夜景',
    destination: '東京（渋谷・表参道・銀座）',
    badge: '☕ 女子旅・デート',
    description: '最新の没入型ミュージアムと人気ベーカリー、夜景ディナーの洗練プラン',
  },
  {
    id: 'camp',
    themeTitle: '星空の下で焚き火とBBQ！爽快アウトドアキャンプ',
    themeKeyword: 'キャンプ アウトドア BBQ 富士山 自然',
    destination: '富士五湖・山中湖',
    badge: '⛺ アウトドア',
    description: '湖畔のグランピング、手ぶらBBQ、満天の星空を眺めるリフレッシュ旅',
  },
];

/**
 * ユーザーが入力したキーワードから旅行プラン全体を自動生成する
 */
export function generateTripPlanFromTheme(
  themeInput: string,
  existingMembers: string[] = ['けんた', 'さくら']
): Omit<TripPlan, 'id'> {
  const keyword = themeInput.trim();
  const lower = keyword.toLowerCase();

  // 今日の日付と翌日の日付を計算（YYYY-MM-DD）
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  const startDate = formatDate(today);
  const endDate = formatDate(tomorrow);
  const totalDays = 2;

  // テーマスタイルの自動判定
  const themeStyle = detectThemeByKeyword(keyword);

  // 1. 温泉・リフレッシュ系
  if (lower.includes('温泉') || lower.includes('箱根') || lower.includes('熱海') || lower.includes('草津') || lower.includes('癒やし') || lower.includes('旅館')) {
    const spots: Spot[] = [
      {
        id: `gen-spot-${Date.now()}-1`,
        name: '箱根湯本 温泉街散策 & 湯もち本舗',
        area: '箱根',
        category: 'gourmet',
        description: '名物のちもと「湯もち」や揚げかまぼこを食べ歩きできる温泉街。',
        imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
        recommendedDuration: '約1.5時間',
        estimatedBudget: '約1,000円',
        address: '神奈川県足柄下郡箱根町湯本',
        phoneNumber: '0460-85-7751',
        officialUrl: 'https://www.hakone.or.jp/',
        tips: '出来立ての温泉まんじゅうを食べ比べするのが最高のおすすめ！',
        isSaved: true,
        wantedMembers: [...existingMembers],
      },
      {
        id: `gen-spot-${Date.now()}-2`,
        name: '大涌谷（名物 黒たまご）',
        area: '箱根',
        category: 'sightseeing',
        description: '3000年前の火山活動の名残を今に伝える、湯けむり立ち上る名勝。',
        imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80',
        recommendedDuration: '約1時間',
        estimatedBudget: '約500円（黒たまご）',
        address: '神奈川県足柄下郡箱根町仙石原1251',
        phoneNumber: '0460-84-9605',
        officialUrl: 'http://www.owakudani.com/',
        tips: '1つ食べると7年寿命が延びると言われる名物「黒たまご」は必食！',
        isSaved: true,
        wantedMembers: [existingMembers[0] || '自分'],
      },
      {
        id: `gen-spot-${Date.now()}-3`,
        name: '彫刻の森美術館',
        area: '箱根',
        category: 'activity',
        description: '広大な庭園に近代・現代の名作彫刻が展示された日本初の野外美術館。',
        imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&q=80',
        recommendedDuration: '約2時間',
        estimatedBudget: '入場料 1,600円',
        address: '神奈川県足柄下郡箱根町二ノ平1121',
        phoneNumber: '0460-82-1161',
        officialUrl: 'https://www.hakone-oam.or.jp/',
        tips: 'ステンドグラスの塔「幸せをよぶシンフォニー彫刻」は映え写真スポット！',
        isSaved: true,
        wantedMembers: [...existingMembers],
      },
    ];

    const schedules: ScheduleItem[] = [
      {
        id: `gen-sch-${Date.now()}-1`,
        dayNumber: 1,
        time: '10:00',
        category: 'transport',
        title: '特急ロマンスカーで箱根湯本駅に到着',
        location: '箱根湯本駅',
        memo: '改札を出て観光案内所でマップをゲット。荷物を宿へ配送サービス利用',
        cost: 2500,
        transportMode: 'train',
        transportDuration: '電車90分',
      },
      {
        id: `gen-sch-${Date.now()}-2`,
        dayNumber: 1,
        time: '11:30',
        category: 'meal',
        title: '名物 はつ花そばで自然薯そばランチ',
        location: '箱根湯本',
        memo: '水を使わず卵と自然薯だけで打った極上そばを堪能！',
        cost: 1500,
      },
      {
        id: `gen-sch-${Date.now()}-3`,
        dayNumber: 1,
        time: '13:30',
        category: 'spot',
        title: '箱根登山鉄道＆ケーブルカーで大涌谷へ',
        location: '大涌谷',
        memo: '名物の黒たまごを食べて長寿祈願。ロープウェイからの富士山も絶景！',
        cost: 1800,
        transportMode: 'car',
        transportDuration: 'ロープウェイ30分',
      },
      {
        id: `gen-sch-${Date.now()}-4`,
        dayNumber: 1,
        time: '16:00',
        category: 'hotel',
        title: '温泉旅館にチェックイン＆露天風呂で癒やしタイム',
        location: '強羅温泉の宿',
        memo: 'まずは一番風呂！浴衣に着替えてのんびり寛ぐ',
        cost: 22000,
      },
      {
        id: `gen-sch-${Date.now()}-5`,
        dayNumber: 1,
        time: '19:00',
        category: 'meal',
        title: '季節の会席料理ディナー＆地酒乾杯',
        location: '旅館お食事処',
        memo: '相模湾の新鮮魚介と旬の山の幸を満喫',
        cost: 0,
      },
      {
        id: `gen-sch-${Date.now()}-6`,
        dayNumber: 2,
        time: '08:30',
        category: 'meal',
        title: '朝風呂のあとの豪華和朝食',
        location: '旅館お食事処',
        memo: '朝の澄んだ空気で温泉に入ってからの朝ごはん',
        cost: 0,
      },
      {
        id: `gen-sch-${Date.now()}-7`,
        dayNumber: 2,
        time: '10:30',
        category: 'spot',
        title: '彫刻の森美術館でアート散策＆足湯カフェ',
        location: '彫刻の森美術館',
        memo: '天然温泉の足湯に浸かりながら彫刻を眺められる癒やし空間',
        cost: 1600,
      },
      {
        id: `gen-sch-${Date.now()}-8`,
        dayNumber: 2,
        time: '14:00',
        category: 'meal',
        title: '温泉街カフェでお土産購入＆お茶休憩',
        location: '箱根湯本駅前',
        memo: '温泉まんじゅう、寄木細工、干物のお土産を購入して帰路へ',
        cost: 3000,
      },
    ];

    const checklists: ChecklistItem[] = [
      { id: `gen-chk-1`, category: 'valuable', title: '財布・現金（温泉街の小銭用）', isDone: false },
      { id: `gen-chk-2`, category: 'valuable', title: '健康保険証・身分証', isDone: false },
      { id: `gen-chk-3`, category: 'clothes', title: '着替え（1泊2日分）', isDone: false },
      { id: `gen-chk-4`, category: 'clothes', title: '脱ぎ履きしやすい靴', isDone: false },
      { id: `gen-chk-5`, category: 'daily', title: 'マイ温泉タオル＆スキンケア用品', isDone: false },
      { id: `gen-chk-6`, category: 'daily', title: '入浴用ヘアゴム・クリップ', isDone: false },
      { id: `gen-chk-7`, category: 'gadget', title: 'スマホ充電器＆モバイルバッテリー', isDone: false },
      { id: `gen-chk-8`, category: 'todo', title: '旅館のチェックイン時間事前連絡', isDone: false },
    ];

    const expenses: ExpenseItem[] = [
      { id: `gen-exp-1`, category: 'hotel', title: '温泉旅館宿泊費（1泊2食付）', amount: 44000, isPaid: false, paidBy: existingMembers[0] },
      { id: `gen-exp-2`, category: 'transport', title: '特急ロマンスカー往復チケット', amount: 6000, isPaid: true, paidBy: existingMembers[0] },
      { id: `gen-exp-3`, category: 'transport', title: '箱根フリーパス（2日券）', amount: 10000, isPaid: false },
      { id: `gen-exp-4`, category: 'food', title: 'ランチ＆食べ歩き代', amount: 8000, isPaid: false },
      { id: `gen-exp-5`, category: 'souvenir', title: 'お土産代（温泉まんじゅう他）', amount: 5000, isPaid: false },
    ];

    return {
      title: keyword ? `${keyword}満喫！名湯と美食の極上癒やし旅` : '名湯と美食で心ほぐれる 温泉癒やし旅',
      destination: '箱根・強羅温泉',
      startDate,
      endDate,
      totalDays,
      coverImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80',
      themeId: 'onsen-warm',
      themeKeyword: keyword || '温泉 旅館 癒やし',
      members: existingMembers,
      memo: '源泉かけ流しの温泉と美味しいご飯を思いっきり楽しんで、日頃の疲れをリセットする旅！',
      savedSpots: spots,
      schedules,
      checklists,
      expenses,
      totalBudget: 75000,
    };
  }

  // 2. 沖縄・海・リゾート系
  if (lower.includes('沖縄') || lower.includes('海') || lower.includes('ビーチ') || lower.includes('リゾート') || lower.includes('夏') || lower.includes('島')) {
    const spots: Spot[] = [
      {
        id: `gen-spot-${Date.now()}-1`,
        name: '沖縄美ら海水族館',
        area: '沖縄・本部',
        category: 'sightseeing',
        description: '世界最大級の巨大水槽「黒潮の海」を泳ぐジンベエザメやナンヨウマンタが大迫力！',
        imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
        recommendedDuration: '約2.5時間',
        estimatedBudget: '入館料 2,180円',
        address: '沖縄県国頭郡本部町字石川424',
        phoneNumber: '0980-48-3748',
        officialUrl: 'https://churaumi.okinawa/',
        tips: '午後からの給餌タイムは大迫力で必見！夕方のトワイライトもおすすめ。',
        isSaved: true,
        wantedMembers: [...existingMembers],
      },
      {
        id: `gen-spot-${Date.now()}-2`,
        name: '古宇利大橋＆古宇利島',
        area: '沖縄・今帰仁',
        category: 'nature',
        description: 'エメラルドグリーンの海上を約2km一直線に渡る爽快絶景ドライブウェイ。',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
        recommendedDuration: '約1.5時間',
        estimatedBudget: '通行無料',
        address: '沖縄県国頭郡今帰仁村古宇利',
        tips: 'ハートロックでの写真撮影と、橋の手前展望台からのパノラマビューが最高！',
        isSaved: true,
        wantedMembers: [...existingMembers],
      },
    ];

    const schedules: ScheduleItem[] = [
      {
        id: `gen-sch-${Date.now()}-1`,
        dayNumber: 1,
        time: '11:00',
        category: 'transport',
        title: '那覇空港到着＆レンタカー手続き',
        location: '那覇空港',
        memo: 'オープンカーまたはSUVレンタカーを借りていざ出発！',
        cost: 15000,
        transportMode: 'car',
      },
      {
        id: `gen-sch-${Date.now()}-2`,
        dayNumber: 1,
        time: '12:30',
        category: 'meal',
        title: '海沿いカフェで沖縄そば＆タコライスランチ',
        location: '恩納村シーサイドカフェ',
        memo: 'エメラルドグリーンの海を目の前にテラスランチ！',
        cost: 3000,
      },
      {
        id: `gen-sch-${Date.now()}-3`,
        dayNumber: 1,
        time: '15:00',
        category: 'spot',
        title: '古宇利大橋爽快ドライブ＆ハートロック散策',
        location: '古宇利島',
        memo: '青い海の中を走る感動ドライブ！写真いっぱい撮る',
        cost: 500,
        transportMode: 'car',
        transportDuration: '車40分',
      },
      {
        id: `gen-sch-${Date.now()}-4`,
        dayNumber: 1,
        time: '17:30',
        category: 'hotel',
        title: 'オーシャンビューリゾートホテル チェックイン',
        location: '恩納村リゾート',
        memo: 'サンセットを眺めながらプライベートビーチをお散歩',
        cost: 35000,
      },
      {
        id: `gen-sch-${Date.now()}-5`,
        dayNumber: 1,
        time: '19:30',
        category: 'meal',
        title: 'アグー豚しゃぶしゃぶ＆泡盛ディナー',
        location: '名護市内人気店',
        memo: '三線ライブ付きの沖縄民謡酒場で乾杯！',
        cost: 8000,
      },
      {
        id: `gen-sch-${Date.now()}-6`,
        dayNumber: 2,
        time: '09:00',
        category: 'spot',
        title: '美ら海水族館でジンベエザメ鑑賞',
        location: '本部町',
        memo: '朝イチの空いている時間帯に巨大水槽をゆっくり見学',
        cost: 4360,
      },
      {
        id: `gen-sch-${Date.now()}-7`,
        dayNumber: 2,
        time: '13:00',
        category: 'meal',
        title: '国際通り散策＆紅いもタルトお土産探し',
        location: '那覇・国際通り',
        memo: 'ちんすこう、琉球ガラス、シーサーの置物などショッピング',
        cost: 5000,
      },
    ];

    const checklists: ChecklistItem[] = [
      { id: `gen-chk-1`, category: 'valuable', title: '運転免許証（レンタカー用）', isDone: false },
      { id: `gen-chk-2`, category: 'clothes', title: 'リゾートウェア・水着・サンダル', isDone: false },
      { id: `gen-chk-3`, category: 'daily', title: '日焼け止め（SPF50+）・サングラス', isDone: false },
      { id: `gen-chk-4`, category: 'gadget', title: '防水スマホケース＆自撮り棒', isDone: false },
      { id: `gen-chk-5`, category: 'todo', title: '美ら海水族館チケット事前予約確認', isDone: false },
    ];

    const expenses: ExpenseItem[] = [
      { id: `gen-exp-1`, category: 'transport', title: 'レンタカー代（保険込）', amount: 15000, isPaid: false },
      { id: `gen-exp-2`, category: 'hotel', title: 'リゾートホテル宿泊代', amount: 35000, isPaid: false },
      { id: `gen-exp-3`, category: 'activity', title: '水族館入場料', amount: 4360, isPaid: false },
      { id: `gen-exp-4`, category: 'food', title: 'アグー豚ディナー＆カフェ代', amount: 12000, isPaid: false },
    ];

    return {
      title: keyword ? `${keyword}！青い海と美ら島リゾート満喫の旅` : '青い海と島時間を満喫！沖縄リゾートトリップ',
      destination: '沖縄（恩納村・美ら海・那覇）',
      startDate,
      endDate,
      totalDays,
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
      themeId: 'ocean-blue',
      themeKeyword: keyword || '沖縄 海 リゾート ドライブ',
      members: existingMembers,
      memo: '南国の心地よい風を感じながら、エメラルドグリーンの海と極上グルメを満喫！',
      savedSpots: spots,
      schedules,
      checklists,
      expenses,
      totalBudget: 85000,
    };
  }

  // 3. 北海道・大自然・グルメ系
  if (lower.includes('北海道') || lower.includes('札幌') || lower.includes('小樽') || lower.includes('ラーメン') || lower.includes('海鮮') || lower.includes('雪')) {
    const spots: Spot[] = [
      {
        id: `gen-spot-${Date.now()}-1`,
        name: '小樽運河＆ルタオ本店',
        area: '小樽',
        category: 'sightseeing',
        description: 'レトロなガス灯と石造り倉庫が並ぶロマンチックな小樽運河と絶品ドゥーブルフロマージュ。',
        imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
        recommendedDuration: '約2時間',
        estimatedBudget: '約1,500円（スイーツ）',
        address: '北海道小樽市港町5',
        phoneNumber: '0134-32-4111',
        tips: '夕暮れ時にガス灯が灯る瞬間が息をのむほど綺麗です！',
        isSaved: true,
        wantedMembers: [...existingMembers],
      },
      {
        id: `gen-spot-${Date.now()}-2`,
        name: '二条市場 絶品海鮮丼',
        area: '札幌',
        category: 'gourmet',
        description: 'ウニ・イクラ・ホタテ・カニがこぼれんばかりに盛られた贅沢海鮮丼！',
        imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
        recommendedDuration: '約1時間',
        estimatedBudget: '約3,000円',
        address: '北海道札幌市中央区南3条東1丁目',
        tips: '朝8時〜9時の開店直後に行くと並ばずに極上ネタがいただけます。',
        isSaved: true,
        wantedMembers: [...existingMembers],
      },
    ];

    const schedules: ScheduleItem[] = [
      {
        id: `gen-sch-${Date.now()}-1`,
        dayNumber: 1,
        time: '10:30',
        category: 'transport',
        title: '新千歳空港到着＆快速エアポートで札幌へ',
        location: '新千歳空港',
        memo: 'まずは空港でソフトクリームを食べ比べ！',
        cost: 2000,
        transportMode: 'train',
      },
      {
        id: `gen-sch-${Date.now()}-2`,
        dayNumber: 1,
        time: '12:30',
        category: 'meal',
        title: '札幌味噌ラーメンの名店めぐりランチ',
        location: '札幌すすきの',
        memo: '濃厚味噌スープと香ばしいチャーシューでエネルギー補給',
        cost: 2400,
      },
      {
        id: `gen-sch-${Date.now()}-3`,
        dayNumber: 1,
        time: '14:30',
        category: 'spot',
        title: '小樽へ移動＆レトロ運河散策＆ガラス館',
        location: '小樽運河',
        memo: 'オルゴール堂や北一硝子で可愛いお土産を探す',
        cost: 1500,
        transportMode: 'train',
        transportDuration: 'JR35分',
      },
      {
        id: `gen-sch-${Date.now()}-4`,
        dayNumber: 1,
        time: '18:30',
        category: 'meal',
        title: '新鮮ジンギスカン＆サッポロクラシック生ビール',
        location: '札幌すすきの名店',
        memo: '臭みのない生ラム肉と甘辛ダレが最高！',
        cost: 8000,
      },
      {
        id: `gen-sch-${Date.now()}-5`,
        dayNumber: 2,
        time: '08:30',
        category: 'meal',
        title: '二条市場でこぼれイクラ海鮮丼の朝食',
        location: '二条市場',
        memo: '朝から贅沢！カニ汁と一緒にいただく至福の朝ごはん',
        cost: 6000,
      },
      {
        id: `gen-sch-${Date.now()}-6`,
        dayNumber: 2,
        time: '11:00',
        category: 'spot',
        title: 'もいわ山ロープウェイで札幌パノラマ絶景',
        location: '藻岩山',
        memo: '日本新三大夜景にも選ばれた圧巻のパノラマを楽しむ',
        cost: 4200,
      },
    ];

    const checklists: ChecklistItem[] = [
      { id: `gen-chk-1`, category: 'clothes', title: '脱ぎ着しやすい上着・羽織りもの', isDone: false },
      { id: `gen-chk-2`, category: 'clothes', title: '歩きやすいスニーカー', isDone: false },
      { id: `gen-chk-3`, category: 'gadget', title: '胃腸薬・常備薬（満腹対策）', isDone: false },
      { id: `gen-chk-4`, category: 'todo', title: 'ジンギスカン有名店の席予約', isDone: false },
    ];

    const expenses: ExpenseItem[] = [
      { id: `gen-exp-1`, category: 'food', title: '海鮮丼・ジンギスカン・ラーメン代', amount: 20000, isPaid: false },
      { id: `gen-exp-2`, category: 'hotel', title: '札幌駅前ホテル宿泊費', amount: 24000, isPaid: false },
      { id: `gen-exp-3`, category: 'transport', title: 'JR快速・地下鉄フリーパス代', amount: 6000, isPaid: false },
      { id: `gen-exp-4`, category: 'souvenir', title: '白い恋人・生チョコ・海鮮お土産代', amount: 8000, isPaid: false },
    ];

    return {
      title: keyword ? `${keyword}！絶品海鮮と大自然満喫の旅` : '北の大地が育む絶品海鮮＆大自然ドライブ',
      destination: '北海道（札幌・小樽）',
      startDate,
      endDate,
      totalDays,
      coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80',
      themeId: 'nature-forest',
      themeKeyword: keyword || '北海道 海鮮 グルメ 自然',
      members: existingMembers,
      memo: '獲れたてのウニ・イクラにジンギスカン！美味しいものを心ゆくまで味わう贅沢グルメ旅。',
      savedSpots: spots,
      schedules,
      checklists,
      expenses,
      totalBudget: 70000,
    };
  }

  // 4. デフォルト（京都・歴史・カフェ・自由指定）
  // ユーザーの自由入力に対応したインテリジェント生成
  const primarySpots = RECOMMENDED_SPOTS.slice(0, 3);
  
  return {
    title: keyword 
      ? `【${keyword}】をめぐる特別旅行しおり`
      : '古都の風情と抹茶スイーツに出逢う 京都散策旅',
    destination: keyword.length > 0 ? `${keyword}周辺` : '京都（東山・嵐山）',
    startDate,
    endDate,
    totalDays,
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80',
    themeId: themeStyle.id,
    themeKeyword: keyword || '京都 和風 伝統 散策',
    members: existingMembers,
    memo: `「${keyword || '古都の歴史と伝統'}」をテーマに、ゆったりとした時間を楽しむ旅行プランです。`,
    savedSpots: primarySpots.map(s => ({ ...s, wantedMembers: [...existingMembers] })),
    schedules: [
      {
        id: `gen-sch-def-1`,
        dayNumber: 1,
        time: '09:30',
        category: 'transport',
        title: `集合＆${keyword || '観光'}エリアへ出発`,
        location: 'ターミナル駅',
        memo: '荷物を預けて身軽にスタート！',
        cost: 1200,
        transportMode: 'train',
      },
      {
        id: `gen-sch-def-2`,
        dayNumber: 1,
        time: '11:00',
        category: 'spot',
        title: `メイン観光スポット見学＆記念撮影`,
        location: primarySpots[0]?.name || '観光名所',
        memo: `${keyword}にまつわる名所をゆっくり満喫`,
        cost: 800,
      },
      {
        id: `gen-sch-def-3`,
        dayNumber: 1,
        time: '12:45',
        category: 'meal',
        title: '地元で大人気の名物グルメランチ',
        location: '地元料理店',
        memo: '名物料理を堪能しながら午後の作戦会議',
        cost: 2500,
      },
      {
        id: `gen-sch-def-4`,
        dayNumber: 1,
        time: '15:00',
        category: 'spot',
        title: 'おしゃれカフェでティータイム＆スイーツ',
        location: '人気カフェ',
        memo: 'SNS映えする絶品スイーツと美味しいドリンクで休憩',
        cost: 1500,
      },
      {
        id: `gen-sch-def-5`,
        dayNumber: 1,
        time: '18:30',
        category: 'meal',
        title: 'ディナー＆夜の街並み散策',
        location: '予約レストラン',
        memo: '美味しいお酒と料理で乾杯！',
        cost: 6000,
      },
      {
        id: `gen-sch-def-6`,
        dayNumber: 2,
        time: '09:00',
        category: 'meal',
        title: 'ホテルのモーニング＆チェックアウト',
        location: '宿泊ホテル',
        memo: '2日目も元気に出発！',
        cost: 0,
      },
      {
        id: `gen-sch-def-7`,
        dayNumber: 2,
        time: '10:30',
        category: 'spot',
        title: 'お土産選び＆体験アクティビティ',
        location: '商店街・お土産処',
        memo: '思い出になるお土産やクラフト体験を楽しむ',
        cost: 3500,
      },
      {
        id: `gen-sch-def-8`,
        dayNumber: 2,
        time: '14:30',
        category: 'transport',
        title: '楽しかった思い出とともに帰路へ',
        location: '駅・空港',
        memo: '写真を見返しながら解散！',
        cost: 1200,
      },
    ],
    checklists: [
      { id: `gen-chk-d1`, category: 'valuable', title: '財布・身分証・キャッシュカード', isDone: false },
      { id: `gen-chk-d2`, category: 'clothes', title: '着替え・羽織りもの・靴下', isDone: false },
      { id: `gen-chk-d3`, category: 'daily', title: 'スキンケア・常備薬・ハンカチ', isDone: false },
      { id: `gen-chk-d4`, category: 'gadget', title: 'スマホ充電器＆モバイルバッテリー', isDone: false },
      { id: `gen-chk-d5`, category: 'todo', title: 'ホテルのチェックイン時間確認', isDone: false },
    ],
    expenses: [
      { id: `gen-exp-d1`, category: 'hotel', title: '宿泊代（1泊）', amount: 28000, isPaid: false, paidBy: existingMembers[0] },
      { id: `gen-exp-d2`, category: 'transport', title: '往復交通費', amount: 8000, isPaid: false },
      { id: `gen-exp-d3`, category: 'food', title: '食事代・カフェ代', amount: 15000, isPaid: false },
      { id: `gen-exp-d4`, category: 'souvenir', title: 'お土産・雑貨代', amount: 5000, isPaid: false },
    ],
    totalBudget: 60000,
  };
}
