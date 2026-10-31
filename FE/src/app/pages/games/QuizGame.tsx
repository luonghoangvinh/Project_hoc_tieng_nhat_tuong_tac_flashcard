import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';
import {
  generateQuizQuestions,
  QUIZ_MIN_CARDS,
  saveGameSession,
  updateCardStudyRecord
} from '../../services/gameService';
import { QuizQuestion, QuizDirection, GameSession, Deck } from '../../types';
import { getDeckById } from '../../utils/deckStorage';

type Phase = 'setup' | 'playing' | 'completed';

const QUESTION_COUNTS = [5, 10, 15, 20];

export async function QuizGame() {
  const { deckId } = useParams<{ deckId: string }>();
  const [deck, setDeck] = useState<Deck | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
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
  const [direction, setDirection] = useState<QuizDirection>('jp-to-vn');
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongCardIds, setWrongCardIds] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<Date>(new Date());

  const handleStart = useCallback(() => {
    if (loading) {
    return <div>Đang tải bộ thẻ...</div>;
  }

    if (!deck) return;
    const count = Math.min(questionCount, deck.cards.length);
    const qs = generateQuizQuestions(deck.cards, count, direction);
    setQuestions(qs);
    setCurrentIndex(0);
    setSelectedOption(null);
    setCorrectAnswers(0);
    setWrongCardIds([]);
    setStartTime(new Date());
    setPhase('playing');
  }, [deck, questionCount, direction]);

  const handleSelectOption = useCallback((optionIndex: number) => {
    if (selectedOption !== null || !deck) return;
    setSelectedOption(optionIndex);
    const q = questions[currentIndex];
    const correct = optionIndex === q.correctIndex;
    updateCardStudyRecord(deck._id, q.cardId, correct);
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    } else {
      setWrongCardIds(prev => [...prev, q.cardId]);
    }
  }, [selectedOption, questions, currentIndex, deck]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      // Save session
      const session: GameSession = {
        id: `quiz-${Date.now()}`,
        deckId: deck!._id,
        deckName: deck!.name,
        gameType: 'quiz',
        startedAt: startTime,
        completedAt: new Date(),
        totalQuestions: questions.length,
        correctAnswers,
        timeSpent: Math.round((Date.now() - startTime.getTime()) / 1000),
        wrongCardIds
      };
      saveGameSession(session);
      setPhase('completed');
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
    }
  }, [currentIndex, questions.length, deck, startTime, correctAnswers, wrongCardIds]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (phase !== 'playing') return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 4 && selectedOption === null) {
        handleSelectOption(num - 1);
      } else if (e.key === 'Enter' && selectedOption !== null) {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, selectedOption, handleSelectOption, handleNext]);

  if (!deck) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Không tìm thấy bộ thẻ. <Link to="/decks" className="text-blue-600 hover:underline">Quay lại</Link></p>
      </div>
    );
  }

  if (deck.cards.length < QUIZ_MIN_CARDS) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">😅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa đủ thẻ</h2>
          <p className="text-gray-500 mb-6">Trắc nghiệm cần ít nhất {QUIZ_MIN_CARDS} thẻ (bộ này có {deck.cards.length}).</p>
          <Link to={`/decks/${deckId}/study`} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Quay lại chọn chế độ
          </Link>
        </div>
      </div>
    );
  }

  // ── Setup ─────────────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md space-y-6">
          <div className="flex items-center gap-3">
            <Link to={`/decks/${deckId}/study`} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="size-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Trắc nghiệm</h1>
              <p className="text-sm text-gray-500">{deck.name}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Chiều hỏi</p>
            <div className="grid grid-cols-2 gap-2">
              {(['jp-to-vn', 'vn-to-jp'] as QuizDirection[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDirection(d)}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-colors ${
                    direction === d
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {d === 'jp-to-vn' ? '🇯🇵 → 🇻🇳 Nhật → Việt' : '🇻🇳 → 🇯🇵 Việt → Nhật'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Số câu hỏi</p>
            <div className="grid grid-cols-4 gap-2">
              {QUESTION_COUNTS.map(n => {
                const available = n <= deck.cards.length;
                return (
                  <button
                    key={n}
                    disabled={!available}
                    onClick={() => setQuestionCount(n)}
                    className={`py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
                      questionCount === n
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : available
                        ? 'border-gray-200 text-gray-600 hover:border-gray-300'
                        : 'border-gray-100 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Bắt đầu
          </button>
        </div>
      </div>
    );
  }

  // ── Playing ───────────────────────────────────────────────────────────────
  if (phase === 'playing') {
    const q = questions[currentIndex];
    const progress = ((currentIndex + (selectedOption !== null ? 1 : 0)) / questions.length) * 100;
    const isAnswered = selectedOption !== null;
    const isCorrect = isAnswered && selectedOption === q.correctIndex;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
          <Link to={`/decks/${deckId}/study`} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="size-5 text-gray-600" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>{currentIndex + 1}/{questions.length}</span>
              <span>{correctAnswers} đúng</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
          <p className="text-xs text-gray-400 mb-4 uppercase tracking-wider">
            {q.direction === 'jp-to-vn' ? 'Nghĩa tiếng Việt của từ này là gì?' : 'Từ tiếng Nhật nào tương ứng?'}
          </p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 w-full text-center">
            <p className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'serif' }}>
              {q.question}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3 w-full">
            {q.options.map((opt, i) => {
              let cls = 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50';
              if (isAnswered) {
                if (i === q.correctIndex) cls = 'border-green-500 bg-green-50 text-green-800';
                else if (i === selectedOption) cls = 'border-red-400 bg-red-50 text-red-700';
                else cls = 'border-gray-100 text-gray-400';
              }
              return (
                <button
                  key={i}
                  onClick={() => handleSelectOption(i)}
                  disabled={isAnswered}
                  className={`flex items-center gap-3 w-full px-5 py-4 rounded-xl border-2 text-left font-medium transition-colors ${cls}`}
                >
                  <span className="flex-shrink-0 size-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span>{opt}</span>
                  {isAnswered && i === q.correctIndex && (
                    <CheckCircle className="size-5 text-green-600 ml-auto flex-shrink-0" />
                  )}
                  {isAnswered && i === selectedOption && i !== q.correctIndex && (
                    <XCircle className="size-5 text-red-500 ml-auto flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback + next */}
          {isAnswered && (
            <div className={`mt-6 w-full rounded-xl p-4 flex items-center justify-between ${
              isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? '✓ Chính xác!' : `✗ Đáp án: ${q.correctAnswer}`}
              </p>
              <button
                onClick={handleNext}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                {currentIndex + 1 < questions.length ? 'Câu tiếp →' : 'Xem kết quả'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Completed ─────────────────────────────────────────────────────────────
  const accuracy = Math.round((correctAnswers / questions.length) * 100);
  const wrongCards = deck.cards.filter(c => wrongCardIds.includes(c._id??""));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md mt-12 space-y-6">
        <div className="text-center">
          <Trophy className={`size-16 mx-auto mb-4 ${accuracy >= 70 ? 'text-yellow-400' : 'text-gray-300'}`} />
          <h2 className="text-2xl font-bold text-gray-900">Hoàn thành!</h2>
          <p className="text-gray-500 mt-1">{deck.name}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-700">{correctAnswers}</p>
            <p className="text-xs text-blue-500 mt-1">Đúng</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-red-600">{questions.length - correctAnswers}</p>
            <p className="text-xs text-red-500 mt-1">Sai</p>
          </div>
          <div className={`rounded-xl p-4 ${accuracy >= 70 ? 'bg-green-50' : 'bg-orange-50'}`}>
            <p className={`text-2xl font-bold ${accuracy >= 70 ? 'text-green-700' : 'text-orange-600'}`}>{accuracy}%</p>
            <p className={`text-xs mt-1 ${accuracy >= 70 ? 'text-green-500' : 'text-orange-400'}`}>Chính xác</p>
          </div>
        </div>

        {wrongCards.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Cần ôn lại ({wrongCards.length} thẻ)</p>
            <div className="space-y-2 max-h-44 overflow-y-auto">
              {wrongCards.map(c => (
                <div key={c._id??""} className="flex items-center gap-3 bg-red-50 rounded-lg px-3 py-2">
                  <XCircle className="size-4 text-red-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-800">{c.front}</span>
                  <span className="text-xs text-gray-500 ml-auto">{c.back}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleStart}
            className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-blue-200 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors"
          >
            <RotateCcw className="size-4" />
            Làm lại
          </button>
          <Link
            to={`/decks/${deckId}/study`}
            className="flex-1 flex items-center justify-center py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Chế độ khác
          </Link>
        </div>
      </div>
    </div>
  );
}
