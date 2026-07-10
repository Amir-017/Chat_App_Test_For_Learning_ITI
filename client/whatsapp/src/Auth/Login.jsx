import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    const {data} = await axios.post('http://localhost:3000/api/users/login', {
      email: email,
      password: password
    });
    console.log('data', data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.id));
    navigate('/chat');
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_30%),linear-gradient(180deg,#02040d_0%,#070b18_100%)]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.12),transparent_25%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.14),transparent_22%)]" />
      <div className="relative w-full max-w-sm rounded-[28px] border border-white/10 bg-white/6 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.55)] p-8 text-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.42 0-2.75-.37-3.9-1.02l-.28-.16-2.9.78.78-2.9-.16-.28C4.99 15.25 4 13.72 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">تسجيل الدخول</h1>
          <p className="text-slate-400 text-sm mt-1">اهلاً بيك تاني</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="text"
              placeholder="اكتب البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-slate-950/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/80 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-slate-950/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/80 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 active:scale-[0.98] text-white font-semibold py-3 rounded-2xl transition shadow-lg shadow-emerald-500/20"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          معندكش حساب؟{' '}
          <a href="/register" className="text-emerald-400 font-medium hover:underline">
            سجل دلوقتي
          </a>
        </p>
      </div>
    </div>
  );
};
