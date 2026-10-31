import { CommunityDeck, DeckRating, JLPTLevel, DeckTopic } from '../types';

const AUTHORS = [
  { id: 'user1', name: 'Nguyễn Minh Tú', avatar: undefined },
  { id: 'user2', name: 'Trần Thị Lan', avatar: undefined },
  { id: 'user3', name: 'Lê Văn Đức', avatar: undefined },
  { id: 'user4', name: 'Phạm Thị Hoa', avatar: undefined },
  { id: 'user5', name: 'Hoàng Minh', avatar: undefined },
  { id: 'user6', name: 'Vũ Thị Mai', avatar: undefined },
  { id: 'user7', name: 'Đặng Quốc Tuấn', avatar: undefined },
  { id: 'user8', name: 'Bùi Thị Thu', avatar: undefined }
];

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#EF4444', '#6366F1', '#14B8A6'];
const ICONS = ['📚', '📖', '📝', '✏️', '📕', '📗', '📘', '📙', '🎯', '⭐', '🌟', '💡', '🔥', '🎓'];

interface DeckSpec {
  name: string;
  description: string;
  level: JLPTLevel;
  topic: DeckTopic;
  cardCount: number;
  rating: number;
  ratingCount: number;
  downloadCount: number;
  saveCount: number;
  daysAgo: number;
  tags: string[];
  cards: Array<{ front: string; back: string; example?: string }>;
}

const DECK_SPECS: DeckSpec[] = [
  {
    name: 'N5 Từ vựng thiết yếu 1000 từ',
    description: 'Bộ 1000 từ vựng N5 được chọn lọc kỹ lưỡng, có ví dụ thực tế',
    level: 'N5', topic: 'vocabulary', cardCount: 48, rating: 4.8, ratingCount: 234,
    downloadCount: 1892, saveCount: 445, daysAgo: 5, tags: ['n5', 'từ-vựng', 'cơ-bản'],
    cards: [
      { front: '水', back: 'みず (mizu) - Nước', example: '水を飲みます。' },
      { front: '食べる', back: 'たべる (taberu) - Ăn', example: '朝ごはんを食べます。' },
      { front: '見る', back: 'みる (miru) - Nhìn / Xem', example: 'テレビを見ます。' },
      { front: '大きい', back: 'おおきい (ookii) - To, Lớn', example: '大きい犬がいます。' },
      { front: '小さい', back: 'ちいさい (chiisai) - Nhỏ, Bé', example: '小さい猫です。' }
    ]
  },
  {
    name: 'N4 Ngữ pháp tổng hợp',
    description: 'Tổng hợp 80 cấu trúc ngữ pháp N4 thường xuất hiện trong đề thi',
    level: 'N4', topic: 'grammar', cardCount: 80, rating: 4.9, ratingCount: 189,
    downloadCount: 2341, saveCount: 678, daysAgo: 12, tags: ['n4', 'ngữ-pháp', 'đề-thi'],
    cards: [
      { front: '〜てしまう', back: 'Diễn tả hành động đã hoàn thành (thường có sắc thái tiếc nuối)', example: '財布を忘れてしまった。' },
      { front: '〜ために', back: 'Vì..., Để..., Mục đích', example: '日本語を勉強するために、毎日練習します。' },
      { front: '〜ておく', back: 'Làm trước để chuẩn bị', example: '旅行の前に、ホテルを予約しておきます。' }
    ]
  },
  {
    name: 'N3 Kanji thường gặp 500 chữ',
    description: 'Bộ 500 Kanji quan trọng cho N3, kèm âm đọc và ví dụ',
    level: 'N3', topic: 'kanji', cardCount: 95, rating: 4.7, ratingCount: 312,
    downloadCount: 3120, saveCount: 890, daysAgo: 20, tags: ['n3', 'kanji', 'chữ-hán'],
    cards: [
      { front: '経済', back: 'けいざい (keizai) - Kinh tế', example: '日本の経済は発展しています。' },
      { front: '政治', back: 'せいじ (seiji) - Chính trị', example: '政治に興味があります。' },
      { front: '科学', back: 'かがく (kagaku) - Khoa học', example: '科学の進歩が速い。' }
    ]
  },
  {
    name: 'N2 Từ vựng nâng cao Business',
    description: 'Từ vựng công việc và kinh doanh cho N2, phù hợp làm việc tại Nhật',
    level: 'N2', topic: 'vocabulary', cardCount: 120, rating: 4.6, ratingCount: 98,
    downloadCount: 987, saveCount: 234, daysAgo: 8, tags: ['n2', 'business', 'công-việc'],
    cards: [
      { front: '交渉', back: 'こうしょう (koushou) - Đàm phán, Thương lượng', example: '取引先と交渉しました。' },
      { front: '提案', back: 'ていあん (teian) - Đề xuất, Đề nghị', example: '新しい提案を出しました。' }
    ]
  },
  {
    name: 'N1 Thành ngữ và Tục ngữ',
    description: 'Tuyển tập thành ngữ, tục ngữ Nhật Bản cho N1 với giải thích chi tiết',
    level: 'N1', topic: 'vocabulary', cardCount: 65, rating: 4.5, ratingCount: 67,
    downloadCount: 542, saveCount: 123, daysAgo: 35, tags: ['n1', 'thành-ngữ', 'tục-ngữ'],
    cards: [
      { front: '七転び八起き', back: 'ななころびやおき - Thất bại 7 lần, đứng dậy 8 lần (Kiên trì)', example: '七転び八起きの精神で頑張れ。' },
      { front: '一石二鳥', back: 'いっせきにちょう - Nhất cử lưỡng tiện (Một công đôi việc)', example: 'それは一石二鳥のアイデアだ。' }
    ]
  },
  {
    name: 'N5 Hội thoại cơ bản hàng ngày',
    description: 'Các mẫu câu hội thoại hàng ngày cho người mới bắt đầu học tiếng Nhật',
    level: 'N5', topic: 'conversation', cardCount: 50, rating: 4.9, ratingCount: 456,
    downloadCount: 5678, saveCount: 1234, daysAgo: 2, tags: ['n5', 'hội-thoại', 'mới-bắt-đầu'],
    cards: [
      { front: 'はじめまして', back: 'Xin chào (lần đầu gặp)', example: 'はじめまして、田中です。よろしくお願いします。' },
      { front: 'ありがとうございます', back: 'Cảm ơn bạn (lịch sự)', example: 'ありがとうございます！助かりました。' },
      { front: 'すみません', back: 'Xin lỗi / Xin phép', example: 'すみません、駅はどこですか？' }
    ]
  },
  {
    name: 'N4 Kanji Jouyou cơ bản',
    description: 'Kanji thường dùng trong cuộc sống N4, học theo chủ đề',
    level: 'N4', topic: 'kanji', cardCount: 75, rating: 4.4, ratingCount: 143,
    downloadCount: 1456, saveCount: 345, daysAgo: 18, tags: ['n4', 'kanji', 'jouyou'],
    cards: [
      { front: '病院', back: 'びょういん (byouin) - Bệnh viện', example: '病院に行きました。' },
      { front: '駅', back: 'えき (eki) - Ga tàu', example: '駅まで歩きます。' }
    ]
  },
  {
    name: 'N3 Ngữ pháp điểm cao',
    description: 'Các điểm ngữ pháp N3 thường ra trong thi, có bài tập luyện',
    level: 'N3', topic: 'grammar', cardCount: 60, rating: 4.8, ratingCount: 201,
    downloadCount: 2100, saveCount: 567, daysAgo: 25, tags: ['n3', 'ngữ-pháp', 'thi-cử'],
    cards: [
      { front: '〜にとって', back: 'Đối với..., Từ góc nhìn của...', example: '私にとって日本語は難しいです。' },
      { front: '〜ことになっている', back: 'Đã được quyết định rằng..., Theo quy định', example: '明日会議があることになっています。' }
    ]
  },
  {
    name: 'N2 Ngữ pháp nâng cao',
    description: 'Tổng hợp ngữ pháp N2 phức tạp với ví dụ văn học và báo chí',
    level: 'N2', topic: 'grammar', cardCount: 90, rating: 4.7, ratingCount: 134,
    downloadCount: 1234, saveCount: 289, daysAgo: 42, tags: ['n2', 'ngữ-pháp', 'văn-học'],
    cards: [
      { front: '〜に反して', back: 'Trái với..., Ngược với kỳ vọng', example: '予想に反して、試験は簡単だった。' },
      { front: '〜を踏まえて', back: 'Dựa trên..., Căn cứ vào...', example: '調査結果を踏まえて、計画を立てた。' }
    ]
  },
  {
    name: 'N1 Kanji khó - Biên soạn chuyên sâu',
    description: 'Các Kanji hiếm gặp và phức tạp cho N1, dành cho học viên nâng cao',
    level: 'N1', topic: 'kanji', cardCount: 100, rating: 4.3, ratingCount: 45,
    downloadCount: 321, saveCount: 78, daysAgo: 60, tags: ['n1', 'kanji', 'nâng-cao'],
    cards: [
      { front: '憂鬱', back: 'ゆううつ (yuuutsu) - Buồn bã, Ủ rũ', example: '雨の日は憂鬱な気分になる。' },
      { front: '薔薇', back: 'ばら (bara) - Hoa hồng', example: '薔薇の香りが好きです。' }
    ]
  },
  {
    name: 'N5 Số đếm và Thời gian',
    description: 'Cách đếm số, ngày tháng, giờ giấc trong tiếng Nhật',
    level: 'N5', topic: 'vocabulary', cardCount: 40, rating: 4.6, ratingCount: 178,
    downloadCount: 2345, saveCount: 512, daysAgo: 14, tags: ['n5', 'số-đếm', 'thời-gian'],
    cards: [
      { front: '一時', back: 'いちじ (ichiji) - 1 giờ', example: '今、一時です。' },
      { front: '月曜日', back: 'げつようび (getsuyoubi) - Thứ Hai', example: '月曜日は会議があります。' }
    ]
  },
  {
    name: 'N4 Hội thoại văn phòng',
    description: 'Các mẫu câu dùng trong môi trường làm việc Nhật Bản',
    level: 'N4', topic: 'conversation', cardCount: 55, rating: 4.5, ratingCount: 89,
    downloadCount: 876, saveCount: 198, daysAgo: 30, tags: ['n4', 'văn-phòng', 'công-việc'],
    cards: [
      { front: 'お疲れ様でした', back: 'Bạn đã vất vả rồi (cuối ngày làm việc)', example: 'お疲れ様でした。また明日。' },
      { front: 'よろしくお願いします', back: 'Nhờ anh/chị giúp đỡ / Xin hãy quan tâm', example: '来月から担当します。よろしくお願いします。' }
    ]
  },
  {
    name: 'N3 Từ vựng chủ đề Thiên nhiên',
    description: 'Từ vựng về thiên nhiên, thời tiết, môi trường cho N3',
    level: 'N3', topic: 'vocabulary', cardCount: 48, rating: 4.4, ratingCount: 67,
    downloadCount: 654, saveCount: 145, daysAgo: 50, tags: ['n3', 'thiên-nhiên', 'thời-tiết'],
    cards: [
      { front: '台風', back: 'たいふう (taifu) - Bão nhiệt đới', example: '台風が来るので外出を控えた。' },
      { front: '地震', back: 'じしん (jishin) - Động đất', example: '地震が起きたら、机の下に隠れる。' }
    ]
  },
  {
    name: 'N2 Từ vựng học thuật',
    description: 'Từ vựng trong văn bản học thuật, báo khoa học cho N2',
    level: 'N2', topic: 'vocabulary', cardCount: 85, rating: 4.6, ratingCount: 112,
    downloadCount: 987, saveCount: 267, daysAgo: 22, tags: ['n2', 'học-thuật', 'nghiên-cứu'],
    cards: [
      { front: '仮説', back: 'かせつ (kasetsu) - Giả thuyết', example: '仮説を立てて実験を行った。' },
      { front: '分析', back: 'ぶんせき (bunseki) - Phân tích', example: 'データを分析した結果...' }
    ]
  },
  {
    name: 'N1 Ngữ pháp văn viết',
    description: 'Các cấu trúc ngữ pháp văn viết trang trọng trong N1',
    level: 'N1', topic: 'grammar', cardCount: 70, rating: 4.7, ratingCount: 78,
    downloadCount: 678, saveCount: 167, daysAgo: 45, tags: ['n1', 'văn-viết', 'trang-trọng'],
    cards: [
      { front: '〜ならではの', back: 'Chỉ có thể có ở..., Đặc trưng của...', example: 'これは日本ならではの文化だ。' },
      { front: '〜に至って', back: 'Đến mức..., Đến khi...', example: '危機に至って、ようやく対策を取った。' }
    ]
  }
];

export function generateCommunityDecks(): CommunityDeck[] {
  return DECK_SPECS.map((spec, index) => {
    const author = AUTHORS[index % AUTHORS.length];
    const publishedDate = new Date();
    publishedDate.setDate(publishedDate.getDate() - spec.daysAgo);

    return {
      _id: `community-${index + 1}`,
      name: spec.name,
      description: spec.description,
      cardCount: spec.cardCount,
      cards: spec.cards.map((c, ci) => ({
        id: `community-${index + 1}-card-${ci + 1}`,
        front: c.front,
        back: c.back,
        type: spec.topic === 'grammar' ? 'grammar' : 'vocabulary',
        level: spec.level,
        example: c.example
      })),
      createdAt: publishedDate,
      color: COLORS[index % COLORS.length],
      icon: ICONS[index % ICONS.length],
      visibility: 'community',
      viewCount: spec.downloadCount + spec.saveCount * 2,
      // Community-specific
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatar,
      jlptLevel: spec.level,
      topic: spec.topic,
      rating: spec.rating,
      ratingCount: spec.ratingCount,
      downloadCount: spec.downloadCount,
      saveCount: spec.saveCount,
      publishedAt: publishedDate,
      isPublic: true,
      tags: spec.tags
    };
  });
}

export function generateMockRatings(deckId: string): DeckRating[] {
  const reviewers = [
    { name: 'Minh Khang', comment: 'Bộ thẻ rất hữu ích! Tôi học được nhiều từ mới.' },
    { name: 'Thu Hương', comment: 'Ví dụ rõ ràng, dễ nhớ. Cảm ơn tác giả nhiều lắm!' },
    { name: 'Quốc Bảo', comment: 'Nội dung tốt nhưng cần thêm ví dụ cho một số thẻ.' },
    { name: 'Lan Anh', comment: 'Tuyệt vời! Đây là bộ thẻ tốt nhất tôi từng dùng.' },
    { name: 'Việt Anh', comment: 'Phù hợp với người mới học. Sắp xếp hợp lý.' }
  ];

  const ratings = [5, 5, 4, 5, 4];
  const daysAgo = [1, 3, 5, 8, 12];

  return reviewers.map((reviewer, i) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo[i]);
    return {
      id: `rating-${deckId}-${i + 1}`,
      deckId,
      userId: `reviewer-${i + 1}`,
      userName: reviewer.name,
      rating: ratings[i],
      comment: reviewer.comment,
      createdAt: date
    };
  });
}

export const mockCommunityDecks: CommunityDeck[] = generateCommunityDecks();
