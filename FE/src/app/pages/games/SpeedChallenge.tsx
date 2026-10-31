import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Flame, Trophy, RotateCcw, Zap } from 'lucide-react';
import {
  generateQuizQuestions,
  QUIZ_MIN_CARDS,
  saveGameSession,
  updateCardStudyRecord
} from '../../services/gameService';
import { QuizQuestion, GameSession, Deck } from '../../types';
import { getDeckById } from '../../utils/deckStorage';

type Phase = 'setup' | 'countdown' | 'playing' | 'completed';

const GAME_DURATION = 60;

export function SpeedChallenge() {
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
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (feedbackRef.current) clearTimeout(feedbackRef.current);
  };

  const endGame = useCallback((questions: QuizQuestion[], correct: number, answered: number, startTime: Date) => {
    clearTimers();
    if (deck) {
      const session: GameSession = {
        id: `speed-${Date.now()}`,
        deckId: deck._id,
        deckName: deck.name,
        gameType: 'speed',
        startedAt: startTime,
        completedAt: new Date(),
        totalQuestions: answered,
        correctAnswers: correct,
        timeSpent: GAME_DURATION,
        wrongCardIds: []
      };
      saveGameSession(session);
    }
    setPhase('completed');
  }, [deck]);

  const handleStart = useCallback(() => {
    if (!deck) return;
    const qs = generateQuizQuestions(deck.cards, 200, 'jp-to-vn');
    setQuestions(qs);
    setQuestionIndex(0);
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTotalAnswered(0);
    setCorrectCount(0);
    setFeedback(null);
    setCountdown(3);
    setStartTime(new Date());
    setPhase('countdown');
  }, [deck]);

  // Countdown before game
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('playing');
      // Start main timer
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setPhase('completed');
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return;
    }
    const t = setTimeout(() => setCountdown(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  useEffect(() => () => clearTimers(), []);

  const handleAnswer = useCallback((optionIndex: number) => {
    if (phase !== 'playing' || !deck) return;
    const q = questions[questionIndex];
    if (!q) return;
    const isCorrect = optionIndex === q.correctIndex;
    updateCardStudyRecord(deck._id, q.cardId, isCorrect);

    setTotalAnswered(prev => {
      const newTotal = prev + 1;
      return newTotal;
    });

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setCombo(prev => {
        const newCombo = prev + 1;
        setMaxCombo(max => Math.max(max, newCombo));
        const multiplier = Math.min(newCombo, 5);
        const points = 100 * multiplier;
        setScore(s => s + points);
        return newCombo;
      });
      setFeedback('correct');
    } else {
      setCombo(0);
      setFeedback('wrong');
    }

    setQuestionIndex(prev => {
      if (prev + 1 >= questions.length) {
        return 0;
      }
      return prev + 1;
    });

    if (feedbackRef.current) clearTimeout(feedbackRef.current);
    feedbackRef.current = setTimeout(() => setFeedback(null), 350);
  }, [phase, questions, questionIndex, deck]);

  if (!deck) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Không tìm thấy bộ thẻ. <Link to="/decks" className="text-blue-600">Quay lại</Link></p>
      </div>
    );
  }

  if (deck.cards.length < QUIZ_MIN_CARDS) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm p-6">
          <div className="text-5xl mb-4">😅</div>
          <h2 className="text-xl font-bold mb-2">Chưa đủ thẻ</h2>
          <p className="text-gray-500 mb-6">Tốc chiến cần ít nhất {QUIZ_MIN_CARDS} thẻ.</p>
          <Link to={`/decks/${deckId}/study`} className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium">Quay lại</Link>
        </div>
      </div>
    );
  }

  // ── Setup ─────────────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-sm space-y-6 text-center">
          <Flame className="size-16 text-orange-400 mx-auto" />
          <div>
            <h1 className="text-3xl font-bold">Tốc Chiến</h1>
            <p className="text-gray-400 mt-1">{deck.name}</p>
          </div>
          <div className="bg-gray-700 rounded-xl p-4 space-y-2 text-sm text-left">
            <div className="flex items-center gap-2 text-orange-300">
              <Zap className="size-4" /> <span>60 giây, trả lời càng nhiều càng tốt</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-300">
              <Flame className="size-4" /> <span>Combo liên tiếp nhân điểm (tối đa ×5)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="size-4 text-center">✗</span> <span>Sai sẽ mất chuỗi combo</span>
            </div>
          </div>
          <button
            onClick={handleStart}
            className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold text-xl hover:bg-orange-600 transition-colors"
          >
            Bắt đầu!
          </button>
          <Link to={`/decks/${deckId}/study`} className="block text-sm text-gray-500 hover:text-gray-300">
            ← Chọn chế độ khác
          </Link>
        </div>
      </div>
    );
  }

  // ── Countdown ─────────────────────────────────────────────────────────────
  if (phase === 'countdown') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-2xl mb-4">Chuẩn bị...</p>
          <div className="text-9xl font-black text-orange-400 animate-pulse">{countdown}</div>
        </div>
      </div>
    );
  }

  // ── Completed ─────────────────────────────────────────────────────────────
  if (phase === 'completed') {
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-sm space-y-6 text-center">
          <Trophy className={`size-16 mx-auto ${score > 2000 ? 'text-yellow-400' : 'text-gray-400'}`} />
          <div>
            <p className="text-gray-400 text-sm uppercase tracking-wider">Điểm số</p>
            <p className="text-5xl font-black text-orange-400">{score.toLocaleString()}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-gray-700 rounded-xl p-3">
              <p className="text-xl font-bold text-white">{totalAnswered}</p>
              <p className="text-xs text-gray-400 mt-1">Đã trả lời</p>
            </div>
            <div className="bg-gray-700 rounded-xl p-3">
              <p className="text-xl font-bold text-green-400">{accuracy}%</p>
              <p className="text-xs text-gray-400 mt-1">Chính xác</p>
            </div>
            <div className="bg-gray-700 rounded-xl p-3">
              <p className="text-xl font-bold text-orange-400">×{Math.min(maxCombo, 5)}</p>
              <p className="text-xs text-gray-400 mt-1">Combo cao</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleStart}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600"
            >
              <RotateCcw className="size-4" />
              Lại
            </button>
            <Link
              to={`/decks/${deckId}/study`}
              className="flex-1 flex items-center justify-center py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600"
            >
              Chế độ khác
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Playing ───────────────────────────────────────────────────────────────
  const q = questions[questionIndex % questions.length];
  const urgentTime = timeLeft <= 10;
  const comboMultiplier = Math.min(combo, 5);

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${
      feedback === 'correct' ? 'bg-green-900' : feedback === 'wrong' ? 'bg-red-900' : 'bg-gray-900'
    }`}>
      {/* HUD */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="text-center">
          <p className="text-xs text-gray-400">Điểm</p>
          <p className="text-2xl font-black text-white">{score.toLocaleString()}</p>
        </div>
        {/* Timer */}
        <div className="text-center">
          <div className={`text-5xl font-black ${urgentTime ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {timeLeft}
          </div>
          <div className="w-24 h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${urgentTime ? 'bg-red-500' : 'bg-orange-500'}`}
              style={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}
            />
          </div>
        </div>
        {/* Combo */}
        <div className="text-center">
          <p className="text-xs text-gray-400">Combo</p>
          <p className={`text-2xl font-black ${combo > 0 ? 'text-orange-400' : 'text-gray-600'}`}>
            {combo > 0 ? `×${comboMultiplier}` : '—'}
          </p>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md text-center">
          <p className="text-5xl font-bold text-white" style={{ fontFamily: 'serif' }}>{q.question}</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className="py-4 px-4 bg-gray-800 text-white rounded-xl font-medium text-sm hover:bg-gray-700 active:scale-95 transition-all border border-gray-700 hover:border-orange-500"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
