import React, { useState } from 'react';
import { UserAccount, UserRole, ShopSettings } from '../types';
import {
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  Bike,
  KeyRound,
  ArrowRight,
  Sparkles,
  MapPin,
  Phone,
  AlertCircle,
} from 'lucide-react';

interface LoginViewProps {
  users: UserAccount[];
  settings: ShopSettings;
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  users,
  settings,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim().toLowerCase();
    const found = users.find(
      (u) =>
        (u.username.toLowerCase() === cleanUser || u.phone.includes(cleanUser)) &&
        u.active
    );

    if (!found) {
      setErrorMsg('User not found or account is deactivated. Please check username.');
      return;
    }

    if (found.password !== password) {
      setErrorMsg('Incorrect password. Please try again or use Quick Demo Login.');
      return;
    }

    const updatedUser: UserAccount = {
      ...found,
      lastLogin: new Date().toISOString(),
    };
    onLoginSuccess(updatedUser);
  };

  const handleQuickLogin = (role: UserRole) => {
    setErrorMsg('');
    const targetUser = users.find((u) => u.role === role && u.active);
    if (targetUser) {
      setUsername(targetUser.username);
      setPassword(targetUser.password);
      const updatedUser: UserAccount = {
        ...targetUser,
        lastLogin: new Date().toISOString(),
      };
      onLoginSuccess(updatedUser);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center px-4 py-8 selection:bg-amber-400 selection:text-neutral-950">
      {/* Container */}
      <div className="w-full max-w-md space-y-6">
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-400 text-neutral-950 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-400/20 font-bold text-xl">
            <Bike className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white font-sans">
            {settings.shopName}
          </h1>
          <p className="text-xs font-medium text-neutral-400">
            {settings.banglaTitle} · Netrokona, Bangladesh
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="space-y-1 text-center pb-2 border-b border-neutral-800/80">
            <h2 className="text-base font-bold text-neutral-100 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Sign In to System</span>
            </h2>
            <p className="text-xs text-neutral-400">
              Enter your credentials or click any demo role below
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Username or Phone Number:
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. superadmin, admin, salesman, customer"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Password:</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (default: password123)"
                  className="w-full pl-9 pr-10 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-400 font-medium font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl transition-all shadow-md active:scale-99 flex items-center justify-center gap-2 cursor-pointer mt-2 text-sm"
            >
              <span>Login to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Role Logins */}
          <div className="pt-4 border-t border-neutral-800/80 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span className="font-semibold uppercase tracking-wider text-neutral-500">
                1-Click Quick Demo Login:
              </span>
              <span className="font-mono text-[10px] text-amber-400/90">Pass: password123</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('super_admin')}
                className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-400/60 hover:bg-neutral-850 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-100 group-hover:text-amber-300">
                    Super Admin
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded">
                    Owner
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                  Tahomid (Full Control)
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-sky-400/60 hover:bg-neutral-850 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-100 group-hover:text-sky-300">
                    Admin
                  </span>
                  <span className="text-[10px] font-mono text-sky-400 bg-sky-400/10 px-1.5 py-0.2 rounded">
                    Manager
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                  Biplob (Accounts &amp; Ops)
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('salesman')}
                className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-emerald-400/60 hover:bg-neutral-850 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-100 group-hover:text-emerald-300">
                    Salesman
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.2 rounded">
                    Counter
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                  Zahidul (POS &amp; Catalog)
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('customer')}
                className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-purple-400/60 hover:bg-neutral-850 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-100 group-hover:text-purple-300">
                    Customer
                  </span>
                  <span className="text-[10px] font-mono text-purple-400 bg-purple-400/10 px-1.5 py-0.2 rounded">
                    Rider
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                  Kamrul (Pulsar 150)
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Shop Footer Information */}
        <div className="text-center text-[11px] text-neutral-500 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3 text-neutral-400" />
            {settings.address}, {settings.city}
          </p>
          <p className="flex items-center justify-center gap-1">
            <Phone className="w-3 h-3 text-neutral-400" />
            Shop Helpline: {settings.phonePrimary} / {settings.phoneSecondary}
          </p>
        </div>
      </div>
    </div>
  );
};
