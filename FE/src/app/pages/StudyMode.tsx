import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Brain, Zap, Puzzle, Flame, BarChart2, BookOpen } from 'lucide-react';
import { QUIZ_MIN_CARDS, MATCHING_MIN_CARDS, getDeckStudyStats } from '../services/gameService';
import { useEffect, useState } from 'react';
import { getDeckById } from '../utils/deckStorage';
import { Deck } from '../types';

interface GameOption {
  id: string;
  path: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  minCards: number;
  badge?: string;
}

export function StudyMode() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<Deck | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      let cancelled = false;
  
      async function fetchDeck() {
        try {
          const result = await getDeckById(deckId || '');
          if (!cancelled) {
            setDeck(result);
          }
        } catch (error) {
          console.error('Không thể lấy deck:', error);
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      }
  
      fetchDeck();
  
      return () => {
        cancelled = true;
      };
    }, [deckId]);

  if (!deck) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">😢</div>
          <p className="text-gray-600 mb-4">Không tìm thấy bộ thẻ</p>
          <Link to="/decks" className="text-blue-600 hover:underline">← Quay lại</Link>
        </div>
      </div>
    );
  }

  const stats = getDeckStudyStats(deck._id, deck.cards);
  const cardCount = deck.cards.length;

  const games: GameOption[] = [
    {
      id: 'quiz',
      path: `/decks/${deckId}/quiz`,
      label: 'Trắc nghiệm',
      description: 'Trả lời câu hỏi nhiều lựa chọn. Luyện nhận biết từ vựng nhanh chóng.',
      icon: <Brain className="size-7" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      minCards: QUIZ_MIN_CARDS,
      badge: 'Phổ biến'
    },
    {
      id: 'matching',
      path: `/decks/${deckId}/matching`,
      label: 'Nối cặp',
      description: 'Ghép từ tiếng Nhật với nghĩa tiếng Việt tương ứng trong thời gian giới hạn.',
      icon: <Puzzle className="size-7" />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      minCards: MATCHING_MIN_CARDS
    },
    {
      id: 'smart-review',
      path: `/decks/${deckId}/smart-review`,
      label: 'Ôn tập thông minh',
      description: 'Hệ thống ưu tiên thẻ bạn hay sai và thẻ chưa học. Hiệu quả nhất.',
      icon: <BarChart2 className="size-7" />,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      minCards: 1,
      badge: 'Thông minh'
    },
    {
      id: 'speed',
      path: `/decks/${deckId}/speed`,
      label: 'Tốc chiến',
      description: 'Trả lời nhanh nhất có thể trong 60 giây. Chuỗi combo nhân điểm.',
      icon: <Flame className="size-7" />,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      minCards: QUIZ_MIN_CARDS,
      badge: 'Mới'
    }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to={`/decks/${deckId}`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="size-5 text-gray-600" />
        </Link>
        <div>
          <p className="text-sm text-gray-500">Chọn chế độ học</p>
          <h1 className="text-2xl font-bold text-gray-900">{deck.name}</h1>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-gray-400" />
          <span className="text-gray-600">{cardCount} thẻ</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block size-2 rounded-full bg-green-500" />
          <span className="text-gray-600">{stats.totalStudied} đã học</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block size-2 rounded-full bg-gray-300" />
          <span className="text-gray-600">{stats.totalNew} chưa học</span>
        </div>
        {stats.totalStudied > 0 && (
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-yellow-500" />
            <span className="text-gray-600">{stats.overallAccuracy}% chính xác</span>
          </div>
        )}
      </div>

      {/* Game list */}
      <div className="space-y-3">
        {games.map(game => {
          const available = cardCount >= game.minCards;
          return (
            <div
              key={game.id}
              className={`relative rounded-xl border-2 transition-all ${
                available
                  ? `${game.border} bg-white hover:shadow-md cursor-pointer`
                  : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
              }`}
              onClick={() => available && navigate(game.path)}
            >
              <div className="flex items-center gap-4 p-5">
                <div className={`flex-shrink-0 p-3 rounded-xl ${game.bg} ${game.color}`}>
                  {game.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{game.label}</h3>
                    {game.badge && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${game.bg} ${game.color}`}>
                        {game.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{game.description}</p>
                  {!available && (
                    <p className="text-xs text-red-500 mt-1">
                      Cần ít nhất {game.minCards} thẻ (hiện tại có {cardCount})
                    </p>
                  )}
                </div>
                {available && (
                  <div className={`flex-shrink-0 ${game.color} opacity-50`}>
                    <ArrowLeft className="size-5 rotate-180" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* High-error highlight */}
      {stats.highErrorCards.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-medium text-red-700">
            {stats.highErrorCards.length} thẻ cần ôn thêm
          </p>
          <p className="text-xs text-red-500 mt-1">
            Thử "Ôn tập thông minh" để tập trung vào những thẻ hay sai.
          </p>
        </div>
      )}
    </div>
  );
}
