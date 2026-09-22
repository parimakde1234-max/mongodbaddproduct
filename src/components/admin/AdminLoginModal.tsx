import React, { useState } from 'react';
import { X, Lock, ShieldCheck, Eye, EyeOff, Key, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  if (!isOpen) return null;

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.adminLogin(username.trim(), password.trim());
      if (res.success) {
        localStorage.setItem('aura_admin_token', res.token || 'valid-admin-token');
        onLoginSuccess();
        onClose();
      } else {
        setError(res.message || 'Galat username ya password. Kripya check karein.');
      }
    } catch {
      setError('Login fail ho gaya. Kripya dobara try karein.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-400 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Staff Only
                </span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white mt-1">
                Admin Security Portal
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
            Backend inventory, customer orders, and cloud database access are restricted to verified administrators.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Internship Teacher Demo Credentials Pill */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-700 block">
                Default Credentials:
              </span>
              <span className="font-mono text-slate-600 text-[11px]">
                User: <strong className="text-slate-900">admin</strong> | Pass: <strong className="text-slate-900">admin123</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="px-2.5 py-1 text-[11px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Auto Fill</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Admin Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Key className="w-4 h-4" />
              <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate & Open Backend'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-center text-[11px] text-slate-600 pt-1">
            Protected endpoint for store managers and system administrators.
          </p>
        </form>

      </div>
    </div>
  );
};
