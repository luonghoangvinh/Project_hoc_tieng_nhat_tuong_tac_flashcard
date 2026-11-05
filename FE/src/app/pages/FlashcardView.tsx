import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Gamepad2, Shuffle, Star } from 'lucide-react';
import { Flashcard } from '../components/Flashcard';
import { getDeckById } from '../utils/deckStorage';
import { Deck } from '../types';


export function FlashcardView() {
  const { deckId } = useParams<{ deckId: string }>();
  const [deck, setDeck] = useState<Deck>();
  const [loading, setLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  useEffect(() => {
    const getDeck = async () => {
      try {
        const deckData = await getDeckById(deckId || '');
        setDeck(deckData);
      } finally {
        setLoading(false);
      }
    };

    getDeck();
  }, [deckId]);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!deck||deck.cards.length===0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📄</div>
        <p className="text-gray-600">Không tìm thấy thẻ nào</p>
        <Link to="/decks" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Quay lại danh sách deck
        </Link>
      </div>
    );
  }
  const currentCard = deck.cards[currentCardIndex];

  const handleNext = () => {
    if (currentCardIndex < deck.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleShuffle = () => {
    const randomIndex = Math.floor(Math.random() * deck.cards.length);
    setCurrentCardIndex(randomIndex);
  };

  return (

    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/decks"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="size-5 text-gray-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{deck.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{deck.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <Shuffle className="size-4" />
            Xáo trộn
          </button>
          {/*
          <button className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-300 text-yellow-700 rounded-lg font-medium hover:bg-yellow-100 transition-colors">
            <Star className="size-4" />
            Lưu thẻ
          </button>*/}
        </div>
      </div>

      {/* Flashcard */}
      <div className="py-8">
        <Flashcard
          card={currentCard}
          currentIndex={currentCardIndex}
          totalCards={deck.cards.length}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      </div>

      {/* Study options */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Chế độ học tập</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <Link
            to={`/decks/${deckId}/study`}
            className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <Gamepad2 className="size-5" />
            <div>
              <p className="font-semibold">Học tương tác</p>
              <p className="text-xs text-blue-500 font-normal">Trắc nghiệm, nối cặp, ôn tập thông minh</p>
            </div>
          </Link>
          <Link
            to={`/decks/${deckId}/smart-review`}
            className="flex items-center gap-3 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg font-medium hover:bg-purple-100 transition-colors border border-purple-200"
          >
            <BookOpen className="size-5" />
            <div>
              <p className="font-semibold">Ôn tập thông minh</p>
              <p className="text-xs text-purple-500 font-normal">Ưu tiên thẻ hay sai và thẻ mới</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
