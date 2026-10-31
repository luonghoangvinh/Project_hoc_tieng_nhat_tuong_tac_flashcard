import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, BarChart3, Menu, Bell, Settings, User, LogOut, Target, BookMarked, PenTool, Headphones, Globe } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { JLPTLevel } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  selectedLevel?: JLPTLevel;
  onLevelChange?: (level: JLPTLevel) => void;
}

export function Layout({ children, selectedLevel, onLevelChange }: Readonly<LayoutProps>) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ userName: string; gmail: string }>({ userName: '', gmail: '' });
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Kiểm tra nếu đang ở trang luyện tập để hiển thị selector cấp độ
  const isPracticePage = location.pathname.startsWith('/practice/');
  
  //tải thông tin user từ localStorage khi component mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
    }
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  const getInitials = (userName: string) => {
    if (!userName) return "";
    return userName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const navItems = [
    { path: '/', label: 'Trang chủ', icon: Home },
    { path: '/decks', label: 'Flashcard Decks', icon: BookOpen },
    { path: '/community', label: 'Cộng đồng', icon: Globe },
    { path: '/progress', label: 'Tiến độ học tập', icon: BarChart3 }
  ];
  
  const practiceItems = [
    { path: '/practice/vocabulary', label: 'Từ vựng', icon: BookMarked },
    { path: '/practice/grammar', label: 'Ngữ pháp', icon: PenTool },
    { path: '/practice/listening', label: 'Nghe hiểu', icon: Headphones },
    { path: '/practice/reading', label: 'Đọc hiểu', icon: Target }
  ];
  
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-50 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            {sidebarOpen ? (
              <>
                <Link to="/" className="flex items-center gap-2">
                  
                  <span className="font-bold text-gray-900">Rakun JLPT</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <Menu className="size-5 text-gray-600" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1 hover:bg-gray-100 rounded-lg mx-auto"
              >
                <Menu className="size-5 text-gray-600" />
              </button>
            )}
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <Icon className="size-5 flex-shrink-0" />
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
            
            {/* Practice section */}
            <div className="mt-6">
              {sidebarOpen && (
                <div className="px-6 mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Chế độ luyện tập
                  </h3>
                </div>
              )}
              <div className="px-3 space-y-1">
                {practiceItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <Icon className="size-5 flex-shrink-0" />
                      {sidebarOpen && <span className="font-medium">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
          
          {/* User section */}
          <div className="border-t border-gray-200 p-3">
            {sidebarOpen ? (
              <div className="space-y-1">
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 w-full transition-colors"
                >
                  <Settings className="size-5" />
                  <span className="font-medium">Cài đặt</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="size-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user.userName ? getInitials(user.userName) : 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {user?.userName || 'Học viên'}
                    </div>
                    {/*<div className="text-xs text-gray-500">JLPT N4</div>*/}
                  </div>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Link to="/settings" className="p-2 hover:bg-gray-100 rounded-lg">
                  <Settings className="size-5 text-gray-600" />
                </Link>
                <Link to="/profile" className="size-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.userName ? getInitials(user.userName) : 'A'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-20'
      }`}>
        {/* Top header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {location.pathname === '/' && 'Dashboard'}
              {location.pathname === '/decks' && 'Flashcard Decks'}
              {location.pathname === '/progress' && 'Tiến độ học tập'}
              {location.pathname.startsWith('/practice') && 'Luyện tập'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Level selector - only show on practice pages */}
            {isPracticePage && onLevelChange && (
              <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
                {(['N5', 'N4', 'N3', 'N2', 'N1'] as JLPTLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => onLevelChange(level)}
                    className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                      selectedLevel === level
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-white hover:text-gray-900'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            )}
            
            {/* Search */}
            {/*<div className="hidden lg:block relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>*/}
            
            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <Bell className="size-5 text-gray-600" />
              <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* Profile with dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="size-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.userName ? getInitials(user.userName) : 'A'}
                </div>
              </button>
              
              {/* Dropdown menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user?.userName ? getInitials(user.userName) : 'A'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">
                          {user?.userName || 'Học viên'}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {user?.gmail || 'user@example.com'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <User className="size-4" />
                      <span className="text-sm font-medium">Hồ sơ cá nhân</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <Settings className="size-4" />
                      <span className="text-sm font-medium">Cài đặt</span>
                    </Link>
                  </div>
                  
                  {/* Logout */}
                  <div className="border-t border-gray-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full"
                    >
                      <LogOut className="size-4" />
                      <span className="text-sm font-medium">Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}