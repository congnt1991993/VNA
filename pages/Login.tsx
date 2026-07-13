import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC<{ onLogin: () => void; onBack?: () => void }> = ({ onLogin, onBack }) => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Tự động thêm đuôi @vietnamairlines.com nếu người dùng chưa nhập
    let finalUsername = username.trim();
    if (finalUsername && !finalUsername.includes('@')) {
      finalUsername = `${finalUsername}@vietnamairlines.com`;
    }

    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1000);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('vna_esg_lang', lng);
    window.dispatchEvent(new Event('vna_language_changed'));
  };

  return (
    <div className="h-screen w-screen relative flex flex-col items-center justify-between font-sans bg-[#006070] overflow-hidden select-none">

      {/* Top Gold Wave Pattern Header */}
      <div className="absolute top-0 left-0 w-full h-[30%] sm:h-[35%] bg-[#dfb226] z-0" style={{ clipPath: 'ellipse(70% 60% at 50% 0%)' }}>
        <div className="w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
      </div>

      {/* Back to Home Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-30 flex items-center gap-1.5 text-xs font-bold text-white bg-black/20 hover:bg-black/40 px-3 py-1.5 rounded-full transition-all backdrop-blur-sm"
        >
          <span>←</span> {isEn ? 'Back to Home' : 'Quay lại Trang chủ'}
        </button>
      )}

      {/* Central Login Container */}
      <div className="w-full flex-grow flex items-center justify-center px-4 z-10 pt-12 pb-4">
        <div className="w-full max-w-[440px] bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500">

          {/* Header Panel of Login Form (Teal patterned background with Lotus & Logo) */}
          <div className="bg-gradient-to-r from-[#005566] to-[#007085] p-5 text-center relative border-b-4 border-[#dfb226]">
            {/* VNA Traditional Pattern overlay */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]"></div>

            {/* Plane Icon atop the header */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-20">
              <svg className="w-8 h-8 text-[#00a3e0]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z" />
              </svg>
            </div>

            {/* Lotus Emblem + VNA Logo */}
            <div className="relative z-10 flex items-center justify-center gap-2 text-white">
              {/* Golden Lotus SVG icon */}
              <svg className="w-8 h-8 text-[#e9c13b] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A10,10,0,0,0,2,12a9.89,9.89,0,0,0,1.8,5.62l.1.15A10,10,0,0,0,12,22a10,10,0,0,0,8.1-4.23l.1-.15A9.89,9.89,0,0,0,22,12,10,10,0,0,0,12,2Zm0,17.9A7.9,7.9,0,1,1,19.9,12,7.91,7.91,0,0,1,12,19.9Z" opacity="0.15" />
                <path d="M12,5.5S9.5,9.5,9.5,12.5s2.5,4,2.5,4,2.5-1,2.5-4S12,5.5,12,5.5Z" />
                <path d="M12,8.5s-4,1.5-4,4.5,4,2.5,4,2.5S8.5,14,8.5,12.5,12,8.5,12,8.5Z" />
                <path d="M12,8.5s4,1.5,4,4.5-4,2.5-4,2.5S15.5,14,15.5,12.5,12,8.5,12,8.5Z" />
              </svg>
              <div className="flex flex-col items-start leading-tight">
                <span className="font-bold tracking-widest text-lg">Vietnam Airlines</span>
                <span className="text-[8px] tracking-[0.25em] text-[#e9c13b] uppercase font-bold">Alliance Member</span>
              </div>
            </div>
          </div>

          {/* Form Fields & Action Area */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">

            {/* Username Input Field with @vietnamairlines.com suffix indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="sm:w-24 text-xs font-bold text-gray-700 whitespace-nowrap">
                {isEn ? 'Username' : 'Tài khoản'}
              </label>
              <div className="flex-grow flex items-center border border-gray-300 rounded-md bg-white focus-within:ring-1 focus-within:ring-[#006070] focus-within:border-[#006070] overflow-hidden pr-3">
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  placeholder={isEn ? 'Enter username' : 'Nhập tài khoản'}
                  className="w-full px-3 py-2 text-xs focus:outline-none bg-white text-gray-900 border-none"
                />
                {!username.includes('@') && (
                  <span className="text-[10px] text-gray-400 font-medium select-none pointer-events-none whitespace-nowrap">
                    @vietnamairlines.com
                  </span>
                )}
              </div>
            </div>

            {/* Password Input Field with show/hide toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="sm:w-24 text-xs font-bold text-gray-700 whitespace-nowrap">
                {isEn ? 'Password' : 'Mật khẩu'}
              </label>
              <div className="flex-grow relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#006070] focus:border-[#006070] transition-all bg-white text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Submit Button & Forgot Password link */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#004e5a] hover:bg-[#003c46] text-white px-6 py-2 rounded text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {loading ? (isEn ? 'Verifying...' : 'Đang xác thực...') : (isEn ? 'Login' : 'Đăng nhập')}
              </button>

              {/* <a 
                href="#forgot" 
                onClick={(e) => { e.preventDefault(); alert(isEn ? 'Please contact system administrator to reset password.' : 'Vui lòng liên hệ quản trị viên hệ thống để khôi phục mật khẩu.'); }}
                className="text-xs text-gray-800 hover:text-[#006070] font-bold hover:underline transition-all"
              >
                {isEn ? 'Forgot password?' : 'Quên mật khẩu?'}
              </a> */}
            </div>

            {/* Divider line */}
            <div className="border-t border-gray-100 my-4"></div>

            {/* SSO Microsoft Login Button */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); handleSubmit(e); }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-2 px-4 rounded-md text-xs shadow-sm hover:shadow transition-all active:scale-98 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 21 21">
                  <path fill="#f25022" d="M1 1h9v9H1z" />
                  <path fill="#00a4ef" d="M1 11h9v9H1z" />
                  <path fill="#7fba00" d="M11 1h9v9h-9z" />
                  <path fill="#ffb900" d="M11 11h9v9h-9z" />
                </svg>
                {isEn ? 'Sign in with Microsoft' : 'Đăng nhập với tài khoản Microsoft'}
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Slogan Statement & Runway Plane Backdrop */}
      <div className="w-full flex flex-col items-center justify-end text-center z-10 pb-0 mt-auto">

        {/* Core Slogan Text */}
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#f1c40f] tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] mb-4 select-none font-sans">
          {isEn ? 'UNITY - RESILIENCE - RISE - BREAKTHROUGH' : 'ĐOÀN KẾT - TỰ CƯỜNG - VƯƠN MÌNH - BỨT PHÁ'}
        </h2>

        {/* Combined City Skyline + Dual Airplane Runway (Using user's provided original image - object-cover and height increased to scale up and span side-to-side) */}
        <div className="w-full h-[120px] sm:h-[160px] md:h-[200px] lg:h-[240px] relative z-20 overflow-hidden flex items-end justify-center mb-1">
          <img
            src="/vna-images/plane_footer.png"
            alt="Vietnam Airlines Runway City Skyline"
            className="w-full h-full object-cover object-bottom pointer-events-none select-none"
          />
        </div>

        {/* Footer info: Copyright and Language Switcher */}
        <div className="w-full bg-[#004e5a]/80 backdrop-blur-xs border-t border-white/10 py-3 flex flex-col sm:flex-row items-center justify-between px-6 text-[10px] sm:text-xs text-white/70 relative z-30">
          <p className="mb-2 sm:mb-0">
            &copy; 2026 Vietnam Airlines. {isEn ? 'All rights reserved.' : 'Bảo lưu mọi quyền.'}
          </p>

          {/* Language / Country Selector at bottom right */}
          <div className="flex items-center gap-3">
            <span className="uppercase tracking-widest text-[9px] font-bold text-white/40">{isEn ? 'Language:' : 'Ngôn ngữ:'}</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => changeLanguage('vi')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border transition-all ${!isEn ? 'border-[#e9c13b] text-[#e9c13b] bg-white/5 font-bold' : 'border-white/10 text-white/60 hover:text-white'}`}
              >
                <span>🇻🇳</span> VI
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border transition-all ${isEn ? 'border-[#e9c13b] text-[#e9c13b] bg-white/5 font-bold' : 'border-white/10 text-white/60 hover:text-white'}`}
              >
                <span>🇺🇸</span> EN
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
