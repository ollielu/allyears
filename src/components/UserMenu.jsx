import { useState, useRef, useEffect } from 'react';

export function UserMenu({ session, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  
  // 從 session 取得使用者資訊
  const user = session?.user;
  const avatarUrl = user?.user_metadata?.avatar_url;
  const email = user?.email;
  // Google 提供的名字
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || '使用者';

  // 點擊外面自動關閉選單
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* 頭像按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1 transition-shadow hover:shadow-md focus:outline-none dark:border-gray-700 dark:bg-gray-800"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="User Avatar"
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
            {name.charAt(0)}
          </div>
        )}
        {/* 手機版隱藏名字，只顯示頭像 */}
        <span className="hidden text-sm font-medium text-gray-700 sm:block dark:text-gray-200 pr-2">
          {name}
        </span>
      </button>

      {/* 下拉選單 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700 z-50">
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">登入帳號</p>
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {email}
            </p>
          </div>
          
          
        </div>
      )}
    </div>
  );
}