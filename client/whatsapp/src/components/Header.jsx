import axios from "axios";
import { useEffect, useState } from "react";

export const Header = () => {
  const [userInfo, setUserInfo] = useState({});

  const getUserInfo = async () => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get('http://localhost:3000/api/users/userInfo', {
      headers: {
        'Authorization': token,
      },
    });
    setUserInfo(data.user);
  }

  useEffect(() => {
    getUserInfo();
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-3 px-6 flex items-center justify-between shadow-md">

      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.42 0-2.75-.37-3.9-1.02l-.28-.16-2.9.78.78-2.9-.16-.28C4.99 15.25 4 13.72 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
          </svg>
        </div>
        <h1 className="text-lg font-bold tracking-wide">Chat App</h1>
      </div>

      <div className="flex items-center gap-2 group relative cursor-pointer">
        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm backdrop-blur-sm">
          {userInfo?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <span className="font-medium hidden sm:block">
          {userInfo?.name || 'جاري التحميل...'}
        </span>

        {/* زرار اللوج أوت - يظهر بس عند الـ hover */}
        <div className="absolute top-full right-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/';
            }}
            className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 active:scale-95 transition shadow-lg whitespace-nowrap"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};