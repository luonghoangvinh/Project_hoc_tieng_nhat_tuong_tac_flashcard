import { X, FileDown, Printer } from 'lucide-react';
import { useState } from 'react';
import { CommunityDeck, Deck, PDFExportConfig } from '../types';

interface ExportPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: Deck | CommunityDeck;
}

const PAPER_SIZES = [
  { value: 'a4' as const, label: 'A4', description: '210 × 297 mm' },
  { value: 'letter' as const, label: 'Letter', description: '216 × 279 mm' }
];

const LAYOUTS = [
  { value: 'front-only' as const, label: 'Mặt trước', description: 'Chỉ hiển thị mặt trước (từ tiếng Nhật)' },
  { value: 'front-back' as const, label: 'Hai mặt', description: 'Cả mặt trước và mặt sau' }
];

function generatePrintHTML(deck: Deck | CommunityDeck, config: PDFExportConfig): string {
  const pageSize = config.paperSize === 'a4'
    ? '@page { size: A4 portrait; margin: 20mm; }'
    : '@page { size: letter portrait; margin: 20mm; }';

  const cardsHTML = deck.cards.map((card, i) => {
    const parts: string[] = [];

    // Front (Japanese)
    parts.push(`
      <div class="card-front">
        <div class="card-number">${i + 1}</div>
        <div class="japanese">${card.front}</div>
        ${card.type ? `<span class="badge">${card.type === 'vocabulary' ? 'Từ vựng' : 'Ngữ pháp'}</span>` : ''}
      </div>
    `);

    if (config.layout === 'front-back' && config.showAnswers) {
      parts.push(`
        <div class="card-back">
          <div class="answer">${card.back}</div>
          ${config.includeReading && card.back.includes('(') ? '' : ''}
          ${config.includeExample && card.example ? `<div class="example">${card.example}</div>` : ''}
        </div>
      `);
    } else if (config.layout === 'front-back') {
      parts.push(`<div class="card-back-placeholder"></div>`);
    }

    return `<div class="card-row">${parts.join('')}</div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>${deck.name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Noto+Sans:wght@400;600&display=swap" rel="stylesheet">
<style>
  ${pageSize}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Noto Sans', 'Noto Sans JP', sans-serif;
    font-size: 12px;
    color: #1a1a2e;
    background: white;
  }
  .header {
    text-align: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid #3B82F6;
  }
  .header h1 {
    font-size: 18px;
    font-weight: 700;
    color: #1e40af;
    margin-bottom: 4px;
  }
  .header p {
    font-size: 11px;
    color: #6b7280;
  }
  .card-row {
    display: grid;
    grid-template-columns: ${config.layout === 'front-back' ? '1fr 1fr' : '1fr'};
    gap: 8px;
    margin-bottom: 8px;
    break-inside: avoid;
  }
  .card-front, .card-back, .card-back-placeholder {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 10px 12px;
    min-height: 70px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .card-front {
    background: #eff6ff;
    border-color: #bfdbfe;
  }
  .card-back {
    background: #f0fdf4;
    border-color: #bbf7d0;
  }
  .card-back-placeholder {
    background: #f9fafb;
    border-style: dashed;
  }
  .card-number {
    font-size: 9px;
    color: #9ca3af;
    margin-bottom: 4px;
  }
  .japanese {
    font-family: 'Noto Sans JP', serif;
    font-size: 16px;
    font-weight: 700;
    color: #1e3a8a;
    line-height: 1.4;
  }
  .badge {
    display: inline-block;
    margin-top: 4px;
    padding: 1px 6px;
    font-size: 9px;
    border-radius: 9999px;
    background: #dbeafe;
    color: #1d4ed8;
  }
  .answer {
    font-size: 12px;
    font-weight: 600;
    color: #14532d;
    line-height: 1.5;
  }
  .example {
    margin-top: 6px;
    font-family: 'Noto Sans JP', sans-serif;
    font-size: 10px;
    color: #6b7280;
    font-style: italic;
    border-top: 1px solid #d1fae5;
    padding-top: 5px;
  }
  .footer {
    margin-top: 20px;
    text-align: center;
    font-size: 9px;
    color: #9ca3af;
    border-top: 1px solid #e5e7eb;
    padding-top: 8px;
  }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="header">
  <h1>${deck.name}</h1>
  <p>${deck.cards.length} thẻ · ${deck.description || ''}</p>
</div>
<div class="cards">
${cardsHTML}
</div>
<div class="footer">
  Rakun JLPT · Xuất ngày ${new Date().toLocaleDateString('vi-VN')}
</div>
<script>
  window.onload = function() {
    window.print();
  };
</script>
</body>
</html>`;
}

export function ExportPDFModal({ isOpen, onClose, deck }: ExportPDFModalProps) {
  const [config, setConfig] = useState<PDFExportConfig>({
    includeReading: true,
    includeExample: true,
    showAnswers: true,
    paperSize: 'a4',
    layout: 'front-back'
  });
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const html = generatePrintHTML(deck, config);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');

      if (!printWindow) {
        alert('Vui lòng cho phép popup để xuất PDF. Kiểm tra cài đặt trình duyệt.');
      } else {
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }
    } finally {
      setExporting(false);
      onClose();
    }
  };

  const updateConfig = <K extends keyof PDFExportConfig>(key: K, value: PDFExportConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="size-9 bg-red-100 rounded-lg flex items-center justify-center">
              <FileDown className="size-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Xuất PDF</h2>
              <p className="text-xs text-gray-500 truncate max-w-[180px]">{deck.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        {/* Config */}
        <div className="p-5 space-y-5">
          {/* Layout */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Kiểu hiển thị</label>
            <div className="grid grid-cols-2 gap-2">
              {LAYOUTS.map(l => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => updateConfig('layout', l.value)}
                  className={`flex flex-col items-start gap-1 p-3 rounded-xl border-2 transition-all text-left ${
                    config.layout === l.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-semibold text-sm text-gray-900">{l.label}</span>
                  <span className="text-xs text-gray-500">{l.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Paper size */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Khổ giấy</label>
            <div className="flex gap-2">
              {PAPER_SIZES.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => updateConfig('paperSize', p.value)}
                  className={`flex-1 flex flex-col items-center py-2.5 rounded-xl border-2 transition-all ${
                    config.paperSize === p.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <span className="font-bold text-sm">{p.label}</span>
                  <span className="text-xs opacity-70">{p.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle options */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Tuỳ chọn nội dung</label>

            {[
              {
                key: 'showAnswers' as keyof PDFExportConfig,
                label: 'Hiển thị đáp án (mặt sau)',
                description: 'Bao gồm nghĩa và phiên âm',
                disabled: config.layout === 'front-only'
              },
              {
                key: 'includeExample' as keyof PDFExportConfig,
                label: 'Kèm câu ví dụ',
                description: 'Hiển thị ví dụ nếu có trong dữ liệu',
                disabled: false
              }
            ].map(opt => (
              <label
                key={opt.key}
                className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  opt.disabled
                    ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    : config[opt.key]
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="font-medium text-sm text-gray-900">{opt.label}</div>
                  <div className="text-xs text-gray-500">{opt.description}</div>
                </div>
                <input
                  type="checkbox"
                  checked={!!config[opt.key]}
                  onChange={e => !opt.disabled && updateConfig(opt.key, e.target.checked as any)}
                  disabled={opt.disabled}
                  className="size-4 text-blue-600 rounded"
                />
              </label>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Số thẻ</span>
              <span className="font-semibold text-gray-900">{deck.cards.length} thẻ</span>
            </div>
            <div className="flex justify-between">
              <span>Định dạng</span>
              <span className="font-semibold text-gray-900">{config.paperSize.toUpperCase()}, {config.layout === 'front-back' ? 'Hai mặt' : 'Một mặt'}</span>
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-lg p-3">
            ⚠️ Trình duyệt sẽ mở cửa sổ in mới. Font hỗ trợ tiếng Nhật và tiếng Việt sẽ được tải tự động nếu có kết nối internet.
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || deck.cards.length === 0}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <Printer className="size-4" />
                Xuất và In
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
