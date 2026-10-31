import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, RotateCcw, Trophy, Timer } from 'lucide-react';
import {
  generateMatchingColumns,
  MATCHING_MIN_CARDS,
  saveGameSession
} from '../../services/gameService';
import { MatchingItem, GameSession, Deck } from '../../types';
import { getDeckById } from '../../utils/deckStorage';

type Phase = 'setup' | 'playing' | 'completed';

export async function MatchingGame() {
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

  const [phase, setPhase] = useState<Phase>('setup');
  const [pairCount, setPairCount] = useState(6);
  const [leftItems, setLeftItems] = useState<MatchingItem[]>([]);
  const [rightItems, setRightItems] = useState<MatchingItem[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const matchedCount = leftItems.filter(i => i.state === 'matched').length;
  const totalPairs = leftItems.length;

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStart = useCallback(() => {
    if (!deck) return;
    const { leftItems: l, rightItems: r } = generateMatchingColumns(deck.cards, pairCount);
    setLeftItems(l);
    setRightItems(r);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMoves(0);
    setElapsed(0);
    const now = new Date();
    setStartTime(now);
    setPhase('playing');
    clearTimer();
    timerRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000);
  }, [deck, pairCount]);

  // Check for completion
  useEffect(() => {
    if (phase !== 'playing' || totalPairs === 0) return;
    if (matchedCount === totalPairs) {
      clearTimer();
      const session: GameSession = {
        id: `matching-${Date.now()}`,
        deckId: deck!._id,
        deckName: deck!.name,
        gameType: 'matching',
        startedAt: startTime,
        completedAt: new Date(),
        totalQuestions: totalPairs,
        correctAnswers: totalPairs,
        timeSpent: elapsed,
        wrongCardIds: []
      };
      saveGameSession(session);
      setTimeout(() => setPhase('completed'), 600);
    }
  }, [matchedCount, totalPairs, phase]);

  useEffect(() => () => clearTimer(), []);

  // Handle match logic after both sides selected
  useEffect(() => {
    if (!selectedLeft || !selectedRight) return;

    const lItem = leftItems.find(i => i.id === selectedLeft);
    const rItem = rightItems.find(i => i.id === selectedRight);
    if (!lItem || !rItem) return;

    setMoves(prev => prev + 1);

    const matched = lItem.pairId === rItem.pairId;

    const updateState = (item: MatchingItem, id: string) =>
      item.id === id ? { ...item, state: (matched ? 'matched' : 'wrong') as MatchingItem['state'] } : item;

    setLeftItems(prev => prev.map(i => updateState(i, selectedLeft)));
    setRightItems(prev => prev.map(i => updateState(i, selectedRight)));

    if (!matched) {
      setTimeout(() => {
        const reset = (item: MatchingItem) =>
          item.state === 'wrong' ? { ...item, state: 'idle' as MatchingItem['state'] } : item;
        setLeftItems(prev => prev.map(reset));
        setRightItems(prev => prev.map(reset));
      }, 700);
    }

    setSelectedLeft(null);
    setSelectedRight(null);
  }, [selectedLeft, selectedRight]);

  const handleSelectLeft = (id: string) => {
    const item = leftItems.find(i => i.id === id);
    if (!item || item.state === 'matched') return;
    setSelectedLeft(prev => (prev === id ? null : id));
  };

  const handleSelectRight = (id: string) => {
    const item = rightItems.find(i => i.id === id);
    if (!item || item.state === 'matched') return;
    setSelectedRight(prev => (prev === id ? null : id));
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const itemClass = (item: MatchingItem, selected: boolean) => {
    if (item.state === 'matched') return 'border-green-400 bg-green-50 text-green-800 opacity-60 cursor-default';
    if (item.state === 'wrong') return 'border-red-400 bg-red-50 text-red-700 animate-pulse';
    if (selected) return 'border-blue-500 bg-blue-50 text-blue-800 shadow-md';
    return 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 cursor-pointer';
  };

  if (!deck) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Không tìm thấy bộ thẻ. <Link to="/decks" className="text-blue-600">Quay lại</Link></p>
      </div>
    );
  }

  if (deck.cards.length < MATCHING_MIN_CARDS) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm p-6">
          <div className="text-5xl mb-4">😅</div>
          <h2 className="text-xl font-bold mb-2">Chưa đủ thẻ</h2>
          <p className="text-gray-500 mb-6">Nối cặp cần ít nhất {MATCHING_MIN_CARDS} thẻ.</p>
          <Link to={`/decks/${deckId}/study`} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium">
            Quay lại
          </Link>
        </div>
      </div>
    );
  }

  // ── Setup ─────────────────────────────────────────────────────────────────
  if (phase === 'setup') {
    const maxPairs = Math.min(8, deck.cards.length);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm space-y-6">
          <div className="flex items-center gap-3">
            <Link to={`/decks/${deckId}/study`} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="size-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nối cặp</h1>
              <p className="text-sm text-gray-500">{deck.name}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Số cặp</p>
            <div className="grid grid-cols-3 gap-2">
              {[4, 6, 8].filter(n => n <= maxPairs).map(n => (
                <button
                  key={n}
                  onClick={() => setPairCount(n)}
                  className={`py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
                    pairCount === n
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {n} cặp
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            Bắt đầu
          </button>
        </div>
      </div>
    );
  }

  // ── Completed ─────────────────────────────────────────────────────────────
  if (phase === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm space-y-6 text-center">
          <Trophy className="size-16 text-yellow-400 mx-auto" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Xuất sắc!</h2>
            <p className="text-gray-500 mt-1">Hoàn thành tất cả {totalPairs} cặp</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-emerald-700">{formatTime(elapsed)}</p>
              <p className="text-xs text-emerald-500 mt-1">Thời gian</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-blue-700">{moves}</p>
              <p className="text-xs text-blue-500 mt-1">Lần chọn</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleStart}
              className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-emerald-200 text-emerald-600 rounded-xl font-medium hover:bg-emerald-50"
            >
              <RotateCcw className="size-4" />
              Làm lại
            </button>
            <Link
              to={`/decks/${deckId}/study`}
              className="flex-1 flex items-center justify-center py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700"
            >
              Chế độ khác
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Playing ───────────────────────────────────────────────────────────────
  const progress = (matchedCount / totalPairs) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <Link to={`/decks/${deckId}/study`} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="size-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{matchedCount}/{totalPairs} cặp</span>
            <span className="flex items-center gap-1"><Timer className="size-3" />{formatTime(elapsed)}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <span className="text-sm text-gray-500">{moves} lần</span>
      </div>

      {/* Grid */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl grid grid-cols-2 gap-4">
          {/* Left column - Japanese */}
          <div className="space-y-2">
            <p className="text-xs text-gray-400 text-center mb-3 uppercase tracking-wider">Tiếng Nhật</p>
            {leftItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleSelectLeft(item.id)}
                className={`w-full px-4 py-3 rounded-xl border-2 text-center font-medium text-lg transition-all ${itemClass(item, selectedLeft === item.id)}`}
                style={{ fontFamily: 'serif' }}
              >
                {item.text}
              </button>
            ))}
          </div>
          {/* Right column - Vietnamese */}
          <div className="space-y-2">
            <p className="text-xs text-gray-400 text-center mb-3 uppercase tracking-wider">Tiếng Việt</p>
            {rightItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleSelectRight(item.id)}
                className={`w-full px-4 py-3 rounded-xl border-2 text-center font-medium text-sm transition-all ${itemClass(item, selectedRight === item.id)}`}
              >
                {item.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
