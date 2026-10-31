import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, RotateCcw, Trophy, RefreshCw } from 'lucide-react';
import {
  getCardsForSmartReview,
  saveGameSession,
  updateCardStudyRecord,
  getCardStudyRecord
} from '../../services/gameService';
import { Deck, Flashcard, GameSession } from '../../types';
import { getDeckById } from '../../utils/deckStorage';

type Phase = 'playing' | 'completed';

export function SmartReview() {
  const { deckId } = useParams<{ deckId: string }>();
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

  const buildQueue = useCallback((): Flashcard[] => {
    if (!deck) return [];
    return getCardsForSmartReview(deck._id, deck.cards);
  }, [deck]);

  const [queue, setQueue] = useState<Flashcard[]>(() => buildQueue());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [phase, setPhase] = useState<Phase>('playing');
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [startTime] = useState<Date>(new Date());

  const handleAnswer = useCallback((knew: boolean) => {
    if (!deck) return;
    const card = queue[currentIndex];
    updateCardStudyRecord(deck._id, card._id??"", knew);
    if (knew) setCorrect(p => p + 1); else setWrong(p => p + 1);

    if (currentIndex + 1 >= queue.length) {
      const session: GameSession = {
        id: `smart-${Date.now()}`,
        deckId: deck._id,
        deckName: deck.name,
        gameType: 'smart-review',
        startedAt: startTime,
        completedAt: new Date(),
        totalQuestions: queue.length,
        correctAnswers: correct + (knew ? 1 : 0),
        timeSpent: Math.round((Date.now() - startTime.getTime()) / 1000),
        wrongCardIds: queue.filter((c, i) => i <= currentIndex && !knew && i === currentIndex).map(c => c._id??"")
      };
      saveGameSession(session);
      setPhase('completed');
    } else {
      setCurrentIndex(p => p + 1);
      setFlipped(false);
    }
  }, [deck, queue, currentIndex, startTime, correct]);

  const handleRestart = () => {
    const newQueue = buildQueue();
    setQueue(newQueue);
    setCurrentIndex(0);
    setFlipped(false);
    setCorrect(0);
    setWrong(0);
    setPhase('playing');
  };

  if (!deck) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Không tìm thấy bộ thẻ. <Link to="/decks" className="text-blue-600">Quay lại</Link></p>
      </div>
    );
  }

  if (deck.cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Bộ thẻ này chưa có thẻ nào.</p>
          <Link to={`/decks/${deckId}/study`} className="px-6 py-2 bg-purple-600 text-white rounded-lg">Quay lại</Link>
        </div>
      </div>
    );
  }

  // ── Completed ─────────────────────────────────────────────────────────────
  if (phase === 'completed') {
    const total = correct + wrong;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm space-y-6 text-center">
          <Trophy className={`size-16 mx-auto ${accuracy >= 70 ? 'text-yellow-400' : 'text-gray-300'}`} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Xong rồi!</h2>
            <p className="text-gray-500 mt-1">Ôn tập thông minh hoàn tất</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-green-700">{correct}</p>
              <p className="text-xs text-green-500">Biết</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-red-600">{wrong}</p>
              <p className="text-xs text-red-500">Chưa biết</p>
            </div>
            <div className={`rounded-xl p-3 ${accuracy >= 70 ? 'bg-purple-50' : 'bg-orange-50'}`}>
              <p className={`text-2xl font-bold ${accuracy >= 70 ? 'text-purple-700' : 'text-orange-600'}`}>{accuracy}%</p>
              <p className={`text-xs ${accuracy >= 70 ? 'text-purple-500' : 'text-orange-400'}`}>Chính xác</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRestart}
              className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-purple-200 text-purple-600 rounded-xl font-medium hover:bg-purple-50"
            >
              <RotateCcw className="size-4" />
              Làm lại
            </button>
            <Link
              to={`/decks/${deckId}/study`}
              className="flex-1 flex items-center justify-center py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700"
            >
              Chế độ khác
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Playing ───────────────────────────────────────────────────────────────
  const card = queue[currentIndex];
  const studyRecord = getCardStudyRecord(deck._id, card._id??"");
  const progress = (currentIndex / queue.length) * 100;
  const isNew = !studyRecord || studyRecord.timesStudied === 0;
  const errorRate = studyRecord && studyRecord.timesStudied > 0
    ? Math.round((studyRecord.timesWrong / studyRecord.timesStudied) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <Link to={`/decks/${deckId}/study`} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="size-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{currentIndex + 1}/{queue.length}</span>
            <span className="flex items-center gap-2">
              <span className="text-green-600">{correct} biết</span>
              <span className="text-red-500">{wrong} chưa</span>
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Priority indicator */}
        <div className="flex items-center gap-2 mb-4">
          {isNew && (
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">Thẻ mới</span>
          )}
          {!isNew && errorRate >= 40 && (
            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
              Hay sai ({errorRate}%)
            </span>
          )}
          {!isNew && errorRate < 40 && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
              Ôn tập
            </span>
          )}
        </div>

        {/* Flashcard */}
        <div
          className="w-full max-w-lg cursor-pointer"
          onClick={() => setFlipped(f => !f)}
          style={{ perspective: '1000px' }}
        >
          <div
            className="relative w-full transition-transform duration-500"
            style={{
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              minHeight: '220px'
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 bg-white rounded-2xl shadow-md border border-gray-200 flex flex-col items-center justify-center p-8"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">Tiếng Nhật</p>
              <p className="text-5xl font-bold text-gray-900 text-center" style={{ fontFamily: 'serif' }}>{card.front}</p>
              <p className="text-xs text-gray-400 mt-6">Nhấn để xem nghĩa</p>
            </div>
            {/* Back */}
            <div
              className="absolute inset-0 bg-purple-50 rounded-2xl shadow-md border border-purple-200 flex flex-col items-center justify-center p-8"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-xs text-purple-400 uppercase tracking-wider mb-4">Nghĩa</p>
              <p className="text-3xl font-bold text-purple-900 text-center">{card.back}</p>
              {card.example && (
                <p className="text-sm text-purple-600 mt-4 text-center italic">{card.example}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {flipped ? (
          <div className="flex gap-4 mt-8 w-full max-w-lg">
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 py-4 rounded-xl bg-red-50 border-2 border-red-300 text-red-700 font-semibold text-lg hover:bg-red-100 transition-colors"
            >
              ✗ Chưa biết
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 py-4 rounded-xl bg-green-50 border-2 border-green-400 text-green-700 font-semibold text-lg hover:bg-green-100 transition-colors"
            >
              ✓ Biết rồi
            </button>
          </div>
        ) : (
          <button
            onClick={() => setFlipped(true)}
            className="mt-8 flex items-center gap-2 px-8 py-3 bg-white border-2 border-purple-200 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-colors"
          >
            <RefreshCw className="size-4" />
            Lật thẻ
          </button>
        )}
      </div>
    </div>
  );
}
