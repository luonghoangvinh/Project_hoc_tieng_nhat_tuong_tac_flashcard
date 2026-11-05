import { X, Globe, Lock, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Deck, JLPTLevel, DeckTopic, PublishConfig } from '../types';

interface PublishDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: PublishConfig) => Promise<void>;
  decks: Deck[];
  preselectedDeckId?: string;
}

const JLPT_LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

const TOPIC_OPTIONS: { value: DeckTopic; label: string; icon: string }[] = [
  { value: 'vocabulary', label: 'Từ vựng', icon: '📚' },
  { value: 'grammar', label: 'Ngữ pháp', icon: '✏️' },
  { value: 'kanji', label: 'Kanji', icon: '漢' },
  { value: 'conversation', label: 'Hội thoại', icon: '💬' },
  { value: 'other', label: 'Khác', icon: '📌' }
];

type Step = 'select' | 'configure' | 'preview';

export function PublishDeckModal({
  isOpen,
  onClose,
  onConfirm,
  decks,
  preselectedDeckId
}: PublishDeckModalProps) {
  const [step, setStep] = useState<Step>('select');
  const [selectedDeckId, setSelectedDeckId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [jlptLevel, setJlptLevel] = useState<JLPTLevel>('N5');
  const [topic, setTopic] = useState<DeckTopic>('vocabulary');
  const [tagsInput, setTagsInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const selectedDeck = decks.find(d => d._id === selectedDeckId);

  useEffect(() => {
    if (isOpen) {
      setStep(preselectedDeckId ? 'configure' : 'select');
      setSelectedDeckId(preselectedDeckId || '');
      setErrors({});
      setSubmitting(false);

      if (preselectedDeckId) {
        const deck = decks.find(d => d._id === preselectedDeckId);
        if (deck) {
          setTitle(deck.name);
          setDescription(deck.description);
        }
      } else {
        setTitle('');
        setDescription('');
        setTagsInput('');
        setJlptLevel('N5');
        setTopic('vocabulary');
      }
    }
  }, [isOpen, preselectedDeckId, decks]);

  useEffect(() => {
    if (selectedDeck && step === 'configure') {
      setTitle(prev => prev || selectedDeck.name);
      setDescription(prev => prev || selectedDeck.description);
    }
  }, [selectedDeck, step]);

  const validateConfig = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề công khai';
    if (!description.trim()) newErrors.description = 'Vui lòng nhập mô tả';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectDeck = (deckId: string) => {
    const deck = decks.find(d => d._id === deckId);
    if (deck) {
      setSelectedDeckId(deckId);
      setTitle(deck.name);
      setDescription(deck.description);
      setStep('configure');
    }
  };

  const handleGoToPreview = () => {
    if (validateConfig()) setStep('preview');
  };

  const handlePublish = async () => {
    if (!selectedDeckId || submitting) return;
    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map(t => t.trim().toLowerCase().replace(/\s+/g, '-'))
        .filter(Boolean);

      await onConfirm({
        deckId: selectedDeckId,
        title: title.trim(),
        description: description.trim(),
        jlptLevel,
        topic,
        tags
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="size-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="size-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Đăng tải Flashcard</h2>
              <p className="text-xs text-gray-500">
                {step === 'select' && 'Bước 1: Chọn bộ thẻ'}
                {step === 'configure' && 'Bước 2: Cấu hình thông tin công khai'}
                {step === 'preview' && 'Bước 3: Xem trước và xác nhận'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex px-6 pt-4 gap-2">
          {(['select', 'configure', 'preview'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`size-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                step === s ? 'bg-blue-600 text-white' :
                (['select', 'configure', 'preview'].indexOf(step) > i)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {(['select', 'configure', 'preview'].indexOf(step) > i) ? '✓' : i + 1}
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 ${(['select', 'configure', 'preview'].indexOf(step) > i) ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Select deck */}
          {step === 'select' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Chọn bộ thẻ bạn muốn chia sẻ với cộng đồng:</p>
              {decks.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="text-4xl mb-2">📚</div>
                  <p className="text-gray-600 font-medium">Bạn chưa có bộ thẻ nào</p>
                  <p className="text-sm text-gray-500 mt-1">Hãy tạo bộ thẻ trước khi đăng tải</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {decks.map(deck => (
                    <button
                      key={deck._id}
                      onClick={() => handleSelectDeck(deck._id)}
                      className="w-full flex items-center gap-4 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                    >
                      <div
                        className="size-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: deck.color || '#3B82F6' }}
                      >
                        {deck.icon || '📚'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{deck.name}</div>
                        <div className="text-sm text-gray-500">{deck.cards.length} thẻ</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Configure */}
          {step === 'configure' && (
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="pub-title">
                  Tiêu đề công khai <span className="text-red-500">*</span>
                </label>
                <input
                  id="pub-title"
                  type="text"
                  value={title}
                  onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: '' })); }}
                  className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.title ? 'border-red-400' : 'border-gray-200'}`}
                  placeholder="Tên hiển thị trên cộng đồng"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="pub-desc">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="pub-desc"
                  value={description}
                  onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: '' })); }}
                  rows={3}
                  className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
                  placeholder="Mô tả ngắn cho người dùng cộng đồng"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              {/* JLPT Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cấp độ JLPT</label>
                <div className="flex gap-2">
                  {JLPT_LEVELS.map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setJlptLevel(l)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                        jlptLevel === l
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Chủ đề</label>
                <div className="grid grid-cols-5 gap-2">
                  {TOPIC_OPTIONS.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTopic(t.value)}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all text-xs font-semibold ${
                        topic === t.value
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="pub-tags">
                  Tags <span className="text-gray-400 font-normal text-xs">(tuỳ chọn, phân cách bằng dấu phẩy)</span>
                </label>
                <input
                  id="pub-tags"
                  type="text"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="n5, từ-vựng, cơ-bản"
                />
              </div>

              {/* Privacy notice */}
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <Lock className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Bộ thẻ gốc của bạn vẫn là riêng tư. Cộng đồng chỉ thấy bản sao công khai này.
                  Bạn có thể gỡ bỏ bất kỳ lúc nào.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Xem trước thông tin sẽ hiển thị trong cộng đồng:</p>
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                {/* Preview card */}
                <div
                  className="px-5 py-4"
                  style={{ backgroundColor: `${selectedDeck?.color || '#3B82F6'}15` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="size-11 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: selectedDeck?.color || '#3B82F6' }}
                    >
                      {selectedDeck?.icon || '📚'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{title}</div>
                      <div className="text-xs text-gray-500">{selectedDeck?.cards.length} thẻ</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 text-xs font-bold bg-white border border-gray-200 text-gray-700 rounded-full">
                      {jlptLevel}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                      {TOPIC_OPTIONS.find(t => t.value === topic)?.label}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-sm text-gray-700">{description}</p>
                  {tagsInput && (
                    <div className="flex flex-wrap gap-1">
                      {tagsInput.split(',').filter(Boolean).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Eye className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Sau khi đăng tải, bộ thẻ sẽ xuất hiện trong trang cộng đồng.
                  Người dùng khác có thể xem, lưu và tải bộ thẻ của bạn.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-5 flex gap-3">
          {step === 'select' && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
            >
              Hủy
            </button>
          )}

          {step === 'configure' && (
            <>
              {!preselectedDeckId && (
                <button
                  onClick={() => setStep('select')}
                  className="px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  ← Quay lại
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleGoToPreview}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
              >
                Xem trước →
              </button>
            </>
          )}

          {step === 'preview' && (
            <>
              <button
                onClick={() => setStep('configure')}
                className="px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                ← Sửa lại
              </button>
              <button
                onClick={handlePublish}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-wait transition-colors text-sm flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang đăng tải...
                  </>
                ) : (
                  <>
                    <Globe className="size-4" />
                    Đăng tải lên cộng đồng
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
