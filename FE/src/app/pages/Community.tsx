import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { Search, SlidersHorizontal, TrendingUp, Clock, Star, Download, X } from 'lucide-react';
import { CommunityDeckCard } from '../components/CommunityDeckCard';
import {
  fetchCommunityDecks,
  fetchFeaturedSections,
  isDeckSaved,
  saveDeck,
  unsaveDeck,
  CommunityFilters
} from '../services/communityService';
import { CommunityDeck, JLPTLevel, DeckTopic, CommunitySortOption } from '../types';

const JLPT_LEVELS: Array<JLPTLevel | 'all'> = ['all', 'N5', 'N4', 'N3', 'N2', 'N1'];
const TOPICS: Array<{ value: DeckTopic | 'all'; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'vocabulary', label: 'Từ vựng' },
  { value: 'grammar', label: 'Ngữ pháp' },
  { value: 'kanji', label: 'Kanji' },
  { value: 'conversation', label: 'Hội thoại' },
  { value: 'other', label: 'Khác' }
];
const SORT_OPTIONS: Array<{ value: CommunitySortOption; label: string; icon: React.ReactNode }> = [
  { value: 'popular', label: 'Phổ biến nhất', icon: <TrendingUp className="size-4" /> },
  { value: 'newest', label: 'Mới nhất', icon: <Clock className="size-4" /> },
  { value: 'top-rated', label: 'Đánh giá cao', icon: <Star className="size-4" /> },
  { value: 'most-downloaded', label: 'Tải nhiều nhất', icon: <Download className="size-4" /> }
];

interface FeaturedSection {
  newest: CommunityDeck[];
  topRated: CommunityDeck[];
  mostDownloaded: CommunityDeck[];
}

function FeaturedRow({
  title,
  icon,
  decks,
  savedIds,
  onToggleSave
}: {
  title: string;
  icon: React.ReactNode;
  decks: CommunityDeck[];
  savedIds: Set<string>;
  onToggleSave: (deck: CommunityDeck) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-blue-600">{icon}</span>
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {decks.map(deck => (
          <CommunityDeckCard
            key={deck._id}
            deck={deck}
            compact
            isSaved={savedIds.has(deck._id)}
            onSave={() => onToggleSave(deck)}
            onUnsave={() => onToggleSave(deck)}
          />
        ))}
      </div>
    </div>
  );
}

export function Community() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<JLPTLevel | 'all'>('all');
  const [topicFilter, setTopicFilter] = useState<DeckTopic | 'all'>('all');
  const [sortBy, setSortBy] = useState<CommunitySortOption>('popular');
  const [showFilters, setShowFilters] = useState(false);

  const [decks, setDecks] = useState<CommunityDeck[]>([]);
  const [featured, setFeatured] = useState<FeaturedSection | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const isFiltering = activeSearch || levelFilter !== 'all' || topicFilter !== 'all';

  // Init saved state
  useEffect(() => {
    const allDecks = [...(featured?.newest || []), ...(featured?.topRated || []), ...(featured?.mostDownloaded || []), ...decks];
    const ids = new Set(allDecks.map(d => d._id).filter(id => isDeckSaved(id)));
    setSavedIds(ids);
  }, [decks, featured]);

  // Load featured sections on mount
  useEffect(() => {
    setFeaturedLoading(true);
    fetchFeaturedSections()
      .then(setFeatured)
      .catch(() => setFeatured(null))
      .finally(() => setFeaturedLoading(false));
  }, []);

  const loadDecks = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const filters: CommunityFilters = {
        search: activeSearch || undefined,
        level: levelFilter,
        topic: topicFilter,
        sort: sortBy
      };
      const result = await fetchCommunityDecks(filters, p);
      setDecks(result.items);
      setPage(result.page);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [activeSearch, levelFilter, topicFilter, sortBy]);

  // Reload when filters change
  useEffect(() => {
    loadDecks(1);
  }, [loadDecks]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
  };

  const handleToggleSave = async (deck: CommunityDeck) => {
    const wasSaved = savedIds.has(deck._id);
    setSavedIds(prev => {
      const next = new Set(prev);
      if (wasSaved) next.delete(deck._id);
      else next.add(deck._id);
      return next;
    });
    try {
      if (wasSaved) {
        await unsaveDeck(deck._id);
      } else {
        await saveDeck(deck._id);
      }
    } catch {
      // Revert optimistic update
      setSavedIds(prev => {
        const next = new Set(prev);
        if (wasSaved) next.add(deck._id);
        else next.delete(deck._id);
        return next;
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Khám phá Flashcard Cộng đồng</h2>
        <p className="text-sm text-gray-600 mt-1">
          Tìm và chia sẻ bộ thẻ học tiếng Nhật cùng cộng đồng Rakun JLPT
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm bộ thẻ theo tên, từ khóa, tác giả..."
            aria-label="Tìm kiếm bộ thẻ cộng đồng"
            className="w-full pl-12 pr-10 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              aria-label="Xóa tìm kiếm"
            >
              <X className="size-4 text-gray-400" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          Tìm
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(v => !v)}
          className={`px-4 py-3 rounded-xl border-2 font-semibold transition-all flex items-center gap-2 ${
            showFilters || levelFilter !== 'all' || topicFilter !== 'all'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
          }`}
          aria-label="Lọc"
        >
          <SlidersHorizontal className="size-5" />
          <span className="hidden sm:inline">Lọc</span>
          {(levelFilter !== 'all' || topicFilter !== 'all') && (
            <span className="size-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {(levelFilter !== 'all' ? 1 : 0) + (topicFilter !== 'all' ? 1 : 0)}
            </span>
          )}
        </button>
      </form>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border-2 border-blue-100 rounded-2xl p-5 space-y-4">
          {/* Level filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cấp độ JLPT</label>
            <div className="flex flex-wrap gap-2">
              {JLPT_LEVELS.map(l => (
                <button
                  key={l}
                  onClick={() => setLevelFilter(l)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold border-2 transition-all ${
                    levelFilter === l
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {l === 'all' ? 'Tất cả' : l}
                </button>
              ))}
            </div>
          </div>

          {/* Topic filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Chủ đề</label>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTopicFilter(t.value as DeckTopic | 'all')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                    topicFilter === t.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sắp xếp theo</label>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSortBy(s.value)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                    sortBy === s.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {(levelFilter !== 'all' || topicFilter !== 'all') && (
            <button
              onClick={() => { setLevelFilter('all'); setTopicFilter('all'); }}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {/* Active filter tags */}
      {(activeSearch || levelFilter !== 'all' || topicFilter !== 'all') && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500">Đang lọc:</span>
          {activeSearch && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              "{activeSearch}"
              <button onClick={clearSearch} aria-label="Xóa tìm kiếm"><X className="size-3.5" /></button>
            </span>
          )}
          {levelFilter !== 'all' && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {levelFilter}
              <button onClick={() => setLevelFilter('all')} aria-label="Xóa lọc cấp độ"><X className="size-3.5" /></button>
            </span>
          )}
          {topicFilter !== 'all' && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {TOPICS.find(t => t.value === topicFilter)?.label}
              <button onClick={() => setTopicFilter('all')} aria-label="Xóa lọc chủ đề"><X className="size-3.5" /></button>
            </span>
          )}
          <span className="text-sm text-gray-500">· {total} kết quả</span>
        </div>
      )}

      {/* Featured sections (only when not filtering) */}
      {!isFiltering && !featuredLoading && featured && (
        <div className="space-y-8">
          <FeaturedRow
            title="Phổ biến nhất"
            icon={<TrendingUp className="size-5" />}
            decks={featured.mostDownloaded}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
          />
          <FeaturedRow
            title="Đánh giá cao nhất"
            icon={<Star className="size-5" />}
            decks={featured.topRated}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
          />
          <FeaturedRow
            title="Mới nhất"
            icon={<Clock className="size-5" />}
            decks={featured.newest}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
          />
        </div>
      )}

      {featuredLoading && !isFiltering && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden animate-pulse">
              <div className="h-24 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded-full w-3/4" />
                <div className="h-3 bg-gray-100 rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All decks grid - show when filtering or as full browse */}
      {(isFiltering || !featuredLoading) && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">
              {isFiltering ? `Kết quả tìm kiếm (${total})` : 'Tất cả bộ thẻ'}
            </h3>
            {!showFilters && (
              <div className="flex items-center gap-2">
                {SORT_OPTIONS.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setSortBy(s.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      sortBy === s.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {s.icon}
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-24 bg-gray-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded-full w-3/4" />
                    <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-red-200">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-gray-700 font-medium">{error}</p>
              <button
                onClick={() => loadDecks(1)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                Thử lại
              </button>
            </div>
          ) : decks.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-200">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-700 font-semibold text-lg">Không tìm thấy bộ thẻ nào</p>
              <p className="text-sm text-gray-500 mt-2">Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {decks.map(deck => (
                  <CommunityDeckCard
                    key={deck._id}
                    deck={deck}
                    isSaved={savedIds.has(deck._id)}
                    onSave={() => handleToggleSave(deck)}
                    onUnsave={() => handleToggleSave(deck)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-8">
                  <button
                    onClick={() => loadDecks(page - 1)}
                    disabled={page <= 1}
                    className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-700 font-medium hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
                  >
                    ← Trước
                  </button>
                  <span className="text-sm text-gray-600">
                    Trang <span className="font-bold text-gray-900">{page}</span> / {totalPages}
                  </span>
                  <button
                    onClick={() => loadDecks(page + 1)}
                    disabled={page >= totalPages}
                    className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-700 font-medium hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
                  >
                    Sau →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
