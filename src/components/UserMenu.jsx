export function UserMenu({ session, onLogout }) {
  // 從 session 取得使用者資訊
  const user = session?.user;
  const avatarUrl = user?.user_metadata?.avatar_url;
  // Google 提供的名字
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || '使用者';

  const handleClick = () => {
    // 點擊頭像直接跳出確認視窗
    if (window.confirm(`登入身分：${name}\n確定要登出嗎？`)) {
      onLogout();
    }
  };

  return (
    <button
      onClick={handleClick}
      title="點擊登出" // 滑鼠移上去會顯示提示
      className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white shadow-md transition-transform hover:scale-105 hover:shadow-lg focus:outline-none dark:border-gray-700"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        // 如果沒有照片，顯示名字第一個字
        <div className="flex h-full w-full items-center justify-center bg-blue-500 text-sm font-bold text-white">
          {name.charAt(0)}
        </div>
      )}
    </button>
  );
}