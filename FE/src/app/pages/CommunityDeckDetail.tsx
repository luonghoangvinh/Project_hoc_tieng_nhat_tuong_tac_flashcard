import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import {
  ArrowLeft, Star, Download, Bookmark, BookmarkCheck,
  FileDown, Users, TrendingUp, ChevronLeft, ChevronRight,
  Send, Globe, AlertCircle
} from 'lucide-react';
import {
  fetchCommunityDeckById,
  fetchDeckRatings,
  fetchRelatedDecks,
  isDeckSaved,
  saveDeck,
  unsaveDeck,
  downloadDeck,
  getUserRating,
  submitRating
} from '../services/communityService';
import { CommunityDeck, DeckRating, DeckTopic } from '../types';
import { ExportPDFModal } from '../components/ExportPDFModal';
import { CommunityDeckCard } from '../components/CommunityDeckCard';

const TOPIC_LABELS: Record<DeckTopic, string> = {
  vocabulary: 'Từ vựng',
  grammar: 'Ngữ pháp',
  kanji: 'Kanji',
  conversation: 'Hội thoại',
  other: 'Khác'
};

function StarRating({ rating, large = false }: { rating: number; large?: boolean }) {
  const cls = large ? 'size-5' : 'size-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={`${cls} ${s <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}`}
        />
      ))}
    </div>
  );
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${s} sao`}
          className="focus:outline-none"
        >
          <Star
            className={`size-8 transition-all hover:scale-110 ${
              s <= (hover || value)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 fill-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function getAuthorInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function FlashcardPreview({ deck }: { deck: CommunityDeck }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const previewCards = deck.cards.slice(0, 5);
  const card = previewCards[currentIndex];

  if (!card) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <p className="text-gray-500">Bộ thẻ này chưa có thẻ nào để xem trước</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 text-center">
        Xem trước {currentIndex + 1}/{previewCards.length} thẻ
        {deck.cards.length > 5 && <span> · Còn {deck.cards.length - 5} thẻ khác</span>}
      </p>

      {/* Card */}
      <div
        className="relative cursor-pointer select-none"
        onClick={() => setFlipped(v => !v)}
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative transition-all duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '200px'
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-white rounded-2xl border-2 border-blue-200 shadow-md flex flex-col items-center justify-center p-8 gap-3"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-4xl font-bold text-gray-900 text-center" style={{ fontFamily: '"Noto Sans JP", sans-serif' }}>
              {card.front}
            </p>
            <p className="text-xs text-gray-400">Nhấn để xem mặt sau</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-green-50 rounded-2xl border-2 border-green-300 shadow-md flex flex-col items-center justify-center p-8 gap-3"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-xl font-semibold text-green-900 text-center">{card.back}</p>
            {card.example && (
              <p className="text-sm text-green-700 text-center italic bg-green-100 px-4 py-2 rounded-lg" style={{ fontFamily: '"Noto Sans JP", sans-serif' }}>
                {card.example}
              </p>
            )}
            <p className="text-xs text-gray-400">Nhấn để xem mặt trước</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => { setCurrentIndex(i => Math.max(0, i - 1)); setFlipped(false); }}
          disabled={currentIndex === 0}
          className="p-2 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          aria-label="Thẻ trước"
        >
          <ChevronLeft className="size-5 text-gray-600" />
        </button>
        <div className="flex gap-1.5">
          {previewCards.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentIndex(i); setFlipped(false); }}
              className={`size-2 rounded-full transition-all ${i === currentIndex ? 'bg-blue-600 w-4' : 'bg-gray-300'}`}
              aria-label={`Thẻ ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={() => { setCurrentIndex(i => Math.min(previewCards.length - 1, i + 1)); setFlipped(false); }}
          disabled={currentIndex === previewCards.length - 1}
          className="p-2 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          aria-label="Thẻ sau"
        >
          <ChevronRight className="size-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}

function RatingSection({ deckId }: { deckId: string }) {
  const [ratings, setRatings] = useState<DeckRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchDeckRatings(deckId)
      .then(setRatings)
      .finally(() => setLoading(false));

    const existing = getUserRating(deckId);
    if (existing) {
      setUserRating(existing.rating);
      setComment(existing.comment || '');
      setSubmitted(true);
    }
  }, [deckId]);

  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  const ratingDist = [5, 4, 3, 2, 1].map(s => ({
    star: s,
    count: ratings.filter(r => r.rating === s).length
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRating === 0) { setSubmitError('Vui lòng chọn số sao'); return; }
    setSubmitting(true);
    setSubmitError('');
    try {
      await submitRating(deckId, userRating, comment.trim() || undefined);
      setSubmitted(true);
      const fresh = await fetchDeckRatings(deckId);
      setRatings(fresh);
    } catch {
      setSubmitError('Gửi đánh giá thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Rating summary */}
      {!loading && ratings.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Big number */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="text-5xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
              <StarRating rating={avgRating} large />
              <div className="text-sm text-gray-500 mt-1">{ratings.length} đánh giá</div>
            </div>
            {/* Distribution */}
            <div className="flex-1 space-y-1.5 w-full">
              {ratingDist.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 w-4 text-right">{star}</span>
                  <Star className="size-3 text-yellow-400 fill-yellow-400 shrink-0" />
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: ratings.length > 0 ? `${(count / ratings.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-gray-400 w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Submit rating */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">
          {submitted ? 'Đánh giá của bạn' : 'Đánh giá bộ thẻ này'}
        </h4>
        {submitted ? (
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
            <span className="text-green-500 text-xl">✓</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StarRating rating={userRating} />
                <span className="text-sm font-semibold text-green-700">Đã đánh giá</span>
              </div>
              {comment && <p className="text-sm text-green-800">{comment}</p>}
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs text-green-600 underline mt-1 hover:text-green-800"
              >
                Sửa đánh giá
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Chọn số sao</label>
              <StarInput value={userRating} onChange={setUserRating} />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5" htmlFor="review-comment">
                Nhận xét <span className="text-gray-400">(tuỳ chọn)</span>
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Chia sẻ cảm nhận của bạn về bộ thẻ này..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              />
              <div className="text-xs text-gray-400 text-right mt-1">{comment.length}/500</div>
            </div>

            {submitError && (
              <p className="text-sm text-red-500 flex items-center gap-1.5">
                <AlertCircle className="size-4" />
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || userRating === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {submitting ? (
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </form>
        )}
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="size-9 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : ratings.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          Chưa có đánh giá nào. Hãy là người đầu tiên!
        </div>
      ) : (
        <div className="space-y-3">
          {ratings.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-start gap-3">
                <div className="size-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                  {getAuthorInitials(r.userName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{r.userName}</span>
                    <div className="flex items-center gap-2">
                      <StarRating rating={r.rating} />
                      <span className="text-xs text-gray-400">
                        {new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long' }).format(r.createdAt)}
                      </span>
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">{r.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CommunityDeckDetail() {
  const { deckId } = useParams<{ deckId: string }>();
  const [deck, setDeck] = useState<CommunityDeck | null>(null);
  const [related, setRelated] = useState<CommunityDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'reviews'>('preview');
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success' | 'duplicate'>('idle');
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [relatedSaved, setRelatedSaved] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!deckId) return;
    setLoading(true);
    setError('');

    fetchCommunityDeckById(deckId)
      .then(d => {
        if (!d) { setError('Không tìm thấy bộ thẻ này'); return; }
        setDeck(d);
        setIsSaved(isDeckSaved(deckId));
        return fetchRelatedDecks(d).then(setRelated);
      })
      .catch(() => setError('Không thể tải bộ thẻ. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, [deckId]);

  const handleToggleSave = async () => {
    if (saving || !deck) return;
    setSaving(true);
    const was = isSaved;
    setIsSaved(!was);
    try {
      if (was) await unsaveDeck(deck._id);
      else await saveDeck(deck._id);
    } catch {
      setIsSaved(was);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (downloading || !deck) return;
    setDownloading(true);
    try {
      const success = await downloadDeck(deck);
      setDownloadStatus(success ? 'success' : 'duplicate');
      setTimeout(() => setDownloadStatus('idle'), 3000);
    } finally {
      setDownloading(false);
    }
  };

  const handleToggleRelatedSave = async (d: CommunityDeck) => {
    const was = relatedSaved.has(d._id);
    setRelatedSaved(prev => {
      const next = new Set(prev);
      if (was) next.delete(d._id);
      else next.add(d._id);
      return next;
    });
    try {
      if (was) await unsaveDeck(d._id);
      else await saveDeck(d._id);
    } catch {
      setRelatedSaved(prev => {
        const next = new Set(prev);
        if (was) next.add(d._id);
        else next.delete(d._id);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-48 bg-gray-100 rounded-2xl" />
        <div className="h-96 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-gray-700 font-semibold">{error || 'Không tìm thấy bộ thẻ'}</p>
        <Link to="/community" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm">
          <ArrowLeft className="size-4" />
          Quay lại cộng đồng
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Link
        to="/community"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
      >
        <ArrowLeft className="size-4" />
        Quay lại cộng đồng
      </Link>

      {/* Deck header */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
        {/* Banner */}
        <div className="px-6 pt-6 pb-5" style={{ backgroundColor: `${deck.color || '#3B82F6'}15` }}>
          <div className="flex items-start gap-5 flex-wrap">
            <div
              className="size-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm flex-shrink-0"
              style={{ backgroundColor: deck.color || '#3B82F6' }}
            >
              {deck.icon || '📚'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-2">
                {deck.jlptLevel && (
                  <span className="px-3 py-1 text-xs font-bold bg-white border border-gray-200 text-gray-700 rounded-full shadow-sm">
                    {deck.jlptLevel}
                  </span>
                )}
                <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                  {TOPIC_LABELS[deck.topic]}
                </span>
                <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-white border border-gray-200 text-gray-600 rounded-full">
                  <Globe className="size-3" />
                  Công khai
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 leading-snug">{deck.name}</h1>
              <p className="text-gray-600 mt-1 text-sm leading-relaxed">{deck.description}</p>
            </div>
          </div>
        </div>

        {/* Stats + Author */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-6 items-center">
            {/* Author */}
            <div className="flex items-center gap-2">
              <div
                className="size-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: deck.color || '#3B82F6' }}
              >
                {getAuthorInitials(deck.authorName)}
              </div>
              <div>
                <div className="text-xs text-gray-500">Tác giả</div>
                <div className="text-sm font-semibold text-gray-900">{deck.authorName}</div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-5 text-sm flex-wrap">
              <div className="flex items-center gap-1.5">
                <Star className="size-4 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-gray-900">{deck.rating.toFixed(1)}</span>
                <span className="text-gray-500">({formatCount(deck.ratingCount)})</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Download className="size-4" />
                <span>{formatCount(deck.downloadCount)} lượt tải</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Users className="size-4" />
                <span>{formatCount(deck.saveCount)} lượt lưu</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <TrendingUp className="size-4" />
                <span>{deck.cards.length} thẻ</span>
              </div>
            </div>

            <div className="text-xs text-gray-400 ml-auto">
              Đăng {new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }).format(deck.publishedAt)}
            </div>
          </div>
        </div>

        {/* Tags */}
        {deck.tags && deck.tags.length > 0 && (
          <div className="px-6 pb-4 flex flex-wrap gap-1.5">
            {deck.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap gap-3">
        {/* Save */}
        <button
          onClick={handleToggleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all ${
            isSaved
              ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
              : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600'
          } ${saving ? 'opacity-60 cursor-wait' : ''}`}
        >
          {isSaved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
          {isSaved ? 'Đã lưu' : 'Lưu bộ thẻ'}
        </button>

        {/* Download */}
        <button
          onClick={handleDownload}
          disabled={downloading || downloadStatus === 'success'}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all ${
            downloadStatus === 'success'
              ? 'bg-green-50 text-green-700 border-green-300'
              : downloadStatus === 'duplicate'
              ? 'bg-amber-50 text-amber-700 border-amber-300'
              : 'bg-white text-gray-700 border-gray-200 hover:border-green-400 hover:text-green-600'
          } ${downloading ? 'opacity-60 cursor-wait' : ''}`}
        >
          {downloading ? (
            <span className="size-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          {downloading ? 'Đang tải...' :
          downloadStatus === 'success' ? '✓ Đã tải về' :
          downloadStatus === 'duplicate' ? 'Đã có bản sao' :
          'Tải về tài khoản'}
        </button>

        {/* Export PDF */}
        <button
          onClick={() => setShowPDFModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border-2 bg-white text-gray-700 border-gray-200 hover:border-red-400 hover:text-red-600 transition-all"
        >
          <FileDown className="size-4" />
          Xuất PDF
        </button>
      </div>

      {/* Download status messages */}
      {downloadStatus === 'success' && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          <span className="text-green-500">✓</span>
          Bộ thẻ đã được tải về mục "Deck của tôi". Bản gốc của tác giả không bị ảnh hưởng.
        </div>
      )}
      {downloadStatus === 'duplicate' && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          <span>⚠️</span>
          Bạn đã tải bộ thẻ này về trước đây. Kiểm tra trong "Deck của tôi".
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {(['preview', 'reviews'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-semibold transition-all relative ${
                activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'preview' ? '👁 Xem trước thẻ' : `⭐ Đánh giá (${deck.ratingCount})`}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === 'preview' && <FlashcardPreview deck={deck} />}
          {activeTab === 'reviews' && <RatingSection deckId={deck._id} />}
        </div>
      </div>

      {/* Related decks */}
      {related.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-4">Bộ thẻ liên quan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map(d => (
              <CommunityDeckCard
                key={d._id}
                deck={d}
                compact
                isSaved={relatedSaved.has(d._id)}
                onSave={() => handleToggleRelatedSave(d)}
                onUnsave={() => handleToggleRelatedSave(d)}
              />
            ))}
          </div>
        </div>
      )}

      {/* PDF Modal */}
      <ExportPDFModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        deck={deck}
      />
    </div>
  );
}
