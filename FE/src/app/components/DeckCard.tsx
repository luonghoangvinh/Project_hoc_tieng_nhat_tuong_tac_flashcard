import { Link } from 'react-router-dom';
import { Calendar, Clock, MoreVertical, Edit, Trash2, Copy, Download, Eye, Globe, EyeOff } from 'lucide-react';
import { Deck } from '../types';
import { useState, useRef, useEffect } from 'react';

interface DeckCardProps {
  deck: Deck;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onExport?: () => void;
  isCustom?: boolean;
  onPublish?: () => void;
  onUnpublish?: () => void;
  isPublished?: boolean;
}

export function DeckCard({ deck, onEdit, onDelete, onDuplicate, onExport, onPublish, onUnpublish,isCustom = false , isPublished = false}: Readonly<DeckCardProps>) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Ensure createdAt is a Date object
  const createdDate = deck.createdAt instanceof Date 
    ? deck.createdAt 
    : new Date(deck.createdAt);
  
  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(createdDate);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleMenuClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    action();
  };
  
  const bgColor = deck.color || '#3B82F6';
  const isCommunity = deck.visibility === 'community';
  
  // Format view count
  const formatViewCount = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };
  
  return (
    
    <div className="group block bg-white rounded-2xl shadow-sm border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-105 relative">
      {/* Published badge */}
      {isPublished && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full shadow-sm">
          <Globe className="size-3" />
          Công khai
        </div>
      )}
      {/* Menu button - only show for custom decks */}
      {isCustom && (onEdit || onDelete || onDuplicate || onExport) && (
        <div className="absolute top-3 right-3 z-10" ref={menuRef}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white shadow-sm transition-all"
          >
            <MoreVertical className="size-4 text-gray-700" />
          </button>
          
          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20">
              {onEdit && (
                <button
                  onClick={(e) => handleMenuClick(e, onEdit)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit className="size-4" />
                  Chỉnh sửa
                </button>
              )}
              {onDuplicate && (
                <button
                  onClick={(e) => handleMenuClick(e, onDuplicate)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Copy className="size-4" />
                  Nhân bản
                </button>
              )}
              {onExport && (
                <button
                  onClick={(e) => handleMenuClick(e, onExport)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Download className="size-4" />
                  Xuất file
                </button>
              )}
              {onPublish && (
                <button
                  onClick={(e) => handleMenuClick(e, onPublish)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                >
                  <Globe className="size-4" />
                  Đăng lên cộng đồng
                </button>
              )}
              {onUnpublish && (
                <button
                  onClick={(e) => handleMenuClick(e, onUnpublish)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                >
                  <EyeOff className="size-4" />
                  Gỡ khỏi cộng đồng
                </button>
              )}
              {onDelete && (
                <>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={(e) => handleMenuClick(e, onDelete)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="size-4" />
                    Xóa
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
      
      <Link to={`/decks/${deck._id}`}>
        {/* Card header with gradient */}
        <div 
          className="p-6 group-hover:brightness-110 transition-all duration-300"
          style={{ backgroundColor: bgColor }}
        >
          <div className="flex items-center justify-between text-white">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-2xl">
              {deck.icon || '📚'}
            </div>
            <div className="text-right translate-y-5">
              <div className="text-3xl font-bold">{deck.cards.length}</div>
              <div className="text-xs opacity-90">thẻ</div>
            </div>
          </div>
        </div>
        
        {/* Card body */}
        <div className="p-6">
          <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-blue-600 transition-colors">
            {deck.name}
          </h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
            {deck.description}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="size-3" />
              <span>{formattedDate}</span>
            </div>
            {isCommunity && (
              <div className="flex items-center gap-1">
                <Eye className="size-3" />
                <span>{formatViewCount(deck.viewCount)}</span>
              </div>
            )}
          </div>
          
          
          {/* Progress bar */}
          
          <div className="space-y-2">
            {/*<div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">Tiến độ học tập</span>
              <span className="text-blue-600 font-semibold">45%</span>
            </div>*/}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: '100%',
                  backgroundColor: bgColor
                }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Card footer */}
        {!isCommunity && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 group-hover:bg-blue-50 transition-colors duration-300">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 group-hover:text-blue-700 font-medium transition-colors">
                Tiếp tục học →
              </span>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="size-3" />
                <span className="text-xs">~15 phút</span>
              </div>
            </div>
          </div>
        )}
        
        {isCommunity && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 border-t border-gray-100 group-hover:from-blue-100 group-hover:to-purple-100 transition-colors duration-300">
            <div className="flex items-center justify-center gap-2 text-sm">
              <Eye className="size-4 text-blue-600" />
              <span className="font-semibold text-gray-900">{formatViewCount(deck.viewCount)}</span>
              <span className="text-gray-600">lượt xem</span>
            </div>
          </div>
        )}
      </Link>
    </div>
  );
}