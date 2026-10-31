import { Link } from 'react-router';
import { Star, Download, Bookmark, BookmarkCheck, Users } from 'lucide-react';
import { CommunityDeck, DeckTopic } from '../types';
import { useState } from 'react';

interface CommunityDeckCardProps {
  deck: CommunityDeck;
  isSaved?: boolean;
  onSave?: () => void;
  onUnsave?: () => void;
  compact?: boolean;
}

const TOPIC_LABELS: Record<DeckTopic, string> = {
  vocabulary: 'Từ vựng',
  grammar: 'Ngữ pháp',
  kanji: 'Kanji',
  conversation: 'Hội thoại',
  other: 'Khác'
};

const TOPIC_COLORS: Record<DeckTopic, string> = {
  vocabulary: 'bg-blue-100 text-blue-700',
  grammar: 'bg-green-100 text-green-700',
  kanji: 'bg-purple-100 text-purple-700',
  conversation: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-700'
};

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const starSize = size === 'sm' ? 'size-3' : 'size-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={`${starSize} ${
            s <= Math.round(rating)
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300 fill-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

function getAuthorInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function CommunityDeckCard({
  deck,
  isSaved = false,
  onSave,
  onUnsave,
  compact = false
}: CommunityDeckCardProps) {
  const [saving, setSaving] = useState(false);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    try {
      if (isSaved) {
        await onUnsave?.();
      } else {
        await onSave?.();
      }
    } finally {
      setSaving(false);
    }
  };

  const bgColor = deck.color || '#3B82F6';

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      {/* Save button */}
      {(onSave || onUnsave) && (
        <button
          onClick={handleSaveToggle}
          disabled={saving}
          aria-label={isSaved ? 'Bỏ lưu' : 'Lưu bộ thẻ'}
          className={`absolute top-3 right-3 z-10 p-2 rounded-lg shadow-sm transition-all ${
            isSaved
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-white/90 text-gray-600 hover:bg-white hover:text-blue-600'
          } ${saving ? 'opacity-50 cursor-wait' : ''}`}
        >
          {isSaved
            ? <BookmarkCheck className="size-4" />
            : <Bookmark className="size-4" />
          }
        </button>
      )}

      <Link to={`/community/${deck._id}`} className="flex flex-col flex-1">
        {/* Header */}
        <div
          className="px-5 pt-5 pb-4"
          style={{ backgroundColor: `${bgColor}18` }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="size-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm"
              style={{ backgroundColor: bgColor }}
            >
              {deck.icon || '📚'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                {deck.name}
              </h3>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            {deck.jlptLevel && (
              <span className="px-2 py-0.5 text-xs font-bold bg-white border border-gray-200 text-gray-700 rounded-full shadow-sm">
                {deck.jlptLevel}
              </span>
            )}
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${TOPIC_COLORS[deck.topic]}`}>
              {TOPIC_LABELS[deck.topic]}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-3 flex-1 flex flex-col gap-3">
          {!compact && (
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
              {deck.description}
            </p>
          )}

          {/* Author */}
          <div className="flex items-center gap-2">
            <div
              className="size-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: bgColor }}
              aria-label={`Avatar của ${deck.authorName}`}
            >
              {getAuthorInitials(deck.authorName)}
            </div>
            <span className="text-xs text-gray-600 truncate">{deck.authorName}</span>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">{deck.cards.length} thẻ</span>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Download className="size-3" />
                <span>{formatCount(deck.downloadCount)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="size-3" />
                <span>{formatCount(deck.saveCount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Rating */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 group-hover:bg-blue-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <StarRating rating={deck.rating} />
              <span className="text-xs font-semibold text-gray-700">
                {deck.rating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400">
                ({formatCount(deck.ratingCount)})
              </span>
            </div>
            <span className="text-xs text-blue-600 font-semibold group-hover:text-blue-700">
              Xem →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
