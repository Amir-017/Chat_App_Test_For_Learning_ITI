import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const handleRegister = async(e) => {
        e.preventDefault();
        await axios.post('http://localhost:3000/api/users', {
            name: username,
            email: email,
            password: password
        });
             navigate('/');
    }
  return (
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 px-4">
  <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.42 0-2.75-.37-3.9-1.02l-.28-.16-2.9.78.78-2.9-.16-.28C4.99 15.25 4 13.72 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-800">تسجيل الدخول</h1>
      <p className="text-gray-400 text-sm mt-1">اهلاً بيك تاني</p>
    </div>

    <form onSubmit={handleRegister} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Username
        </label>
        <input
          type="text"
          placeholder="اكتب اليوزر نيم بتاعك"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
        />
      </div>
       <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
            Email
        </label>
        <input
          type="text"
          placeholder="اكتب البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
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
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-emerald-200"
      >
        Register
      </button>
    </form>

 
  </div>
</div>
  );
};
