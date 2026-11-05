import { useState, useEffect } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, Upload, Globe } from 'lucide-react';
import { DeckCard } from '../components/DeckCard';
import { DeckModal } from '../components/DeckModal';
import { mockDecks } from '../data/mockData';
import { getDecks, createDeck, updateDeck, deleteDeck, duplicateDeck, exportDeck, importDeck } from '../utils/deckStorage';
import { Deck, PublishConfig } from '../types';
import { PublishDeckModal } from '../components/PublishDeckModal copy';
import { publishDeck, unpublishDeck, isDeckPublished } from '../services/communityService';
const DECKS_PER_PAGE = 30;

export function Decks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState<'personal' | 'community'>('personal');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [personalDecks, setPersonalDecks] = useState<Deck[]>([]);

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishTargetId, setPublishTargetId] = useState<string | undefined>(undefined);
  const [publishNotice, setPublishNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const userStr = localStorage.getItem('user');
  const userData = userStr ? JSON.parse(userStr) : null;
  const userId = userData ? userData.id : null;
  // Load decks from storage
  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    const customDecks = await getDecks(userId);
    setPersonalDecks(customDecks);
  };

  // Get decks based on selected tab
  const allDecks = selectedTab === 'personal' ? personalDecks : mockDecks;

  // Sort community decks by view count
  const sortedDecks = selectedTab === 'community'
    ? [...allDecks].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    : allDecks;

  // Filter decks based on search query
  const filteredDecks = sortedDecks.filter(deck => {
    const matchesSearch = deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredDecks.length / DECKS_PER_PAGE);
  const startIndex = (currentPage - 1) * DECKS_PER_PAGE;
  const endIndex = startIndex + DECKS_PER_PAGE;
  const currentDecks = filteredDecks.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleTabChange = (tab: 'personal' | 'community') => {
    setSelectedTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCreateDeck = () => {
    setModalMode('create');
    setEditingDeck(null);
    setIsModalOpen(true);
  };

  const handleEditDeck = (deck: Deck) => {
    setModalMode('edit');
    setEditingDeck(deck);
    setIsModalOpen(true);
  };

  const handleSaveDeck = async (deckData: Partial<Deck>) => {
    if (modalMode === 'create') {
      await createDeck(
        userId,
        deckData.name!,
        deckData.description!,
        deckData.cards || [],
        deckData.color,
        deckData.icon,
        deckData.visibility
      );
    } else if (editingDeck) {
      await updateDeck(editingDeck._id, deckData);
    }
    await loadDecks();
    setIsModalOpen(false);
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bộ thẻ này?')) {
      await deleteDeck(deckId);
      await loadDecks();
    }
  };

  const handleDuplicateDeck = async (deckId: string) => {
    await duplicateDeck(deckId);
    await loadDecks();
  };

  const handleExportDeck = (deckId: string) => {
    const jsonData = exportDeck(deckId);
    if (jsonData) {
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deck-${deckId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

    const handlePublishDeck = async (config: PublishConfig) => {
    try {
      await publishDeck(config);
      setPublishNotice({ type: 'success', message: 'Bộ thẻ đã được đăng lên cộng đồng thành công!' });
      setTimeout(() => setPublishNotice(null), 4000);
    } catch {
      setPublishNotice({ type: 'error', message: 'Đăng tải thất bại. Vui lòng thử lại.' });
      setTimeout(() => setPublishNotice(null), 4000);
      throw new Error('Publish failed');
    }
  };

  const handleUnpublishDeck = async (deckId: string) => {
    if (!confirm('Gỡ bộ thẻ khỏi cộng đồng? Những người đã tải bộ thẻ sẽ vẫn giữ bản sao của họ.')) return;
    try {
      await unpublishDeck(deckId);
      setPublishNotice({ type: 'success', message: 'Đã gỡ bộ thẻ khỏi cộng đồng.' });
      setTimeout(() => setPublishNotice(null), 3000);
      loadDecks();
    } catch {
      setPublishNotice({ type: 'error', message: 'Gỡ bộ thẻ thất bại. Vui lòng thử lại.' });
      setTimeout(() => setPublishNotice(null), 3000);
    }
  };

  const handleImportDeck = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const jsonString = event.target?.result as string;
          const imported = await importDeck(userId,jsonString);
          if (imported) {
            await loadDecks();
            alert('Import thành công!');
          } else {
            alert('Import thất bại. Vui lòng kiểm tra file JSON.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

    const handleOpenPublishModal = (deckId?: string) => {
    setPublishTargetId(deckId);
    setIsPublishModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Flashcard Decks</h2>
        </div>
        {selectedTab === 'personal' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleImportDeck}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-medium hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              <Upload className="size-5" />
              Import
            </button>
            <button
                onClick={() => handleOpenPublishModal()}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-green-500 text-green-700 rounded-lg font-medium hover:bg-green-50 transition-colors"
              >
                <Globe className="size-5" />
                Đăng lên cộng đồng
              </button>
            <button
              onClick={handleCreateDeck}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              <Plus className="size-5" />
              Tạo Deck mới
            </button>
          </div>
        )}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm deck..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Tab filters */}
      <div className="flex gap-2">
        <button
          onClick={() => handleTabChange('personal')}
          className={`flex-1 px-6 py-3 rounded-xl font-semibold text-base transition-all ${selectedTab === 'personal'
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
            }`}
        >
          Deck của tôi ({personalDecks.length})
        </button>
        {/*<button
          onClick={() => handleTabChange('community')}
          className={`flex-1 px-6 py-3 rounded-xl font-semibold text-base transition-all ${selectedTab === 'community'
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
            }`}
        >
          Decks cộng đồng ({mockDecks.length})
        </button>*/}
      </div>

      {/* Decks grid - 4 columns */}
      {currentDecks.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentDecks.map((deck) => (
              <DeckCard
                key={deck._id}
                deck={deck}
                isCustom={selectedTab === 'personal'}
                onEdit={selectedTab === 'personal' ? () => handleEditDeck(deck) : undefined}
                onDelete={selectedTab === 'personal' ? () => handleDeleteDeck(deck._id) : undefined}
                onDuplicate={selectedTab === 'personal' ? () => handleDuplicateDeck(deck._id) : undefined}
                onExport={selectedTab === 'personal' ? () => handleExportDeck(deck._id) : undefined}
                onPublish={selectedTab === 'personal' && !isDeckPublished(deck._id) ? () => handleOpenPublishModal(deck._id) : undefined}
                onUnpublish={selectedTab === 'personal' && isDeckPublished(deck._id) ? () => handleUnpublishDeck(deck._id) : undefined}
                isPublished={selectedTab === 'personal' && isDeckPublished(deck._id)}
              />
            ))}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-8 pb-4">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="p-3 rounded-lg bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-700 transition-all"
                aria-label="Trang trước"
              >
                <ChevronLeft className="size-6" />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">
                  Trang
                </span>
                <div className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold min-w-[60px] text-center">
                  {currentPage}
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  / {totalPages}
                </span>
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="p-3 rounded-lg bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-700 transition-all"
                aria-label="Trang sau"
              >
                <ChevronRight className="size-6" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-200">
          <div className="text-6xl mb-4">
            {selectedTab === 'personal' ? '📚' : '🌐'}
          </div>
          <p className="text-gray-600 text-lg font-medium">
            {selectedTab === 'personal'
              ? 'Bạn chưa có deck nào'
              : 'Không tìm thấy deck nào'
            }
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {selectedTab === 'personal'
              ? 'Hãy tạo deck mới hoặc import từ file'
              : 'Thử tìm kiếm với từ khóa khác'
            }
          </p>
        </div>
      )}

      {/* Deck Modal */}
      <DeckModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDeck}
        deck={editingDeck}
        mode={modalMode}
      />

      {/* Publish Modal */}
      <PublishDeckModal
        isOpen={isPublishModalOpen}
        onClose={() => { setIsPublishModalOpen(false); setPublishTargetId(undefined); }}
        onConfirm={handlePublishDeck}
        decks={personalDecks}
        preselectedDeckId={publishTargetId}
      />
    </div>

    
  );
}
