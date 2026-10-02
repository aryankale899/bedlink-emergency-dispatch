import React, { useState } from 'react';
import { useBedLink } from '../context/BedLinkContext';
import { useAuth } from '../context/AuthContext';
import { NavView, UserRole } from '../types';
import { 
  Activity, 
  Map as MapIcon, 
  Smartphone, 
  Clock, 
  Building2, 
  FileText, 
  Settings, 
  Bell, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  User,
  Radio,
  ChevronDown,
  LogOut,
  LogIn,
  ShieldCheck
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    setIsSidebarOpen,
    userRole, 
    setUserRole, 
    lastSystemSyncTime, 
    currentPendingHold, 
    pendingSecondsRemaining, 
    activeHolds,
    notifications, 
    clearNotification,
    isMuted, 
    toggleMute,
    resetAllDemoData,
    currentTime
  } = useBedLink();

  const { 
    user, 
    profile, 
    loading: authLoading, 
    signInWithGoogle, 
    signOut, 
    updateRole, 
    error: authError 
  } = useAuth();

  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);

  // Sync profile role when signed in
  React.useEffect(() => {
    if (profile?.role) {
      setUserRole(profile.role);
    }
  }, [profile?.role, setUserRole]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const syncAgeSeconds = Math.max(0, Math.floor((currentTime - lastSystemSyncTime) / 1000));

  const navItems: { view: NavView; label: string; icon: React.ReactNode; badge?: string }[] = [
    { view: 'dispatch', label: 'Dispatch', icon: <Activity className="w-4 h-4" /> },
    { view: 'map', label: 'Live Map', icon: <MapIcon className="w-4 h-4" /> },
    { view: 'nurse', label: 'Bed Updates', icon: <Smartphone className="w-4 h-4" /> },
    { 
      view: 'holds', 
      label: 'Active Holds', 
      icon: <Clock className="w-4 h-4" />,
      badge: activeHolds.length > 0 ? String(activeHolds.length) : undefined
    },
    { view: 'hospitals', label: 'Hospitals', icon: <Building2 className="w-4 h-4" /> },
    { view: 'logs', label: 'Activity Log', icon: <FileText className="w-4 h-4" /> },
    { view: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const roles: UserRole[] = ['Dispatcher', 'Charge Nurse', 'Hospital Coordinator', 'Medical Director'];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Top Utility Strip */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-white font-medium">Region: <strong className="text-blue-400">Metropolitan Central Health District</strong></span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400 font-mono">
            Mesh Sync: {syncAgeSeconds === 0 ? 'Live' : `${syncAgeSeconds}s ago`}
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-300">
            Emergency Care Grid Protocol v2.4 (Simulated)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Hold Live Alert Ticker in Top Bar */}
          {currentPendingHold && currentPendingHold.status === 'pending' && (
            <div className="flex items-center gap-1.5 bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="font-bold font-mono">HOLD SLA: {formatTimer(pendingSecondsRemaining)}</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute alerts' : 'Mute alerts'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Audio On'}</span>
          </button>
        </div>
      </div>

      {/* Main Top Bar */}
      <div className="max-w-[1720px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & 3-Slash Menu Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          {/* 3 Slash Button to open component drawer */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:border-blue-300 text-slate-800 border border-slate-200 transition-all cursor-pointer shadow-2xs group"
            title="Open Component Navigation (3 Slashes)"
            aria-label="Open Components Drawer"
          >
            {/* 3 Slashes / Bars */}
            <div className="flex flex-col gap-1 w-4">
              <span className="w-full h-0.5 bg-slate-800 group-hover:bg-blue-600 rounded-full transition-colors" />
              <span className="w-3/4 h-0.5 bg-slate-800 group-hover:bg-blue-600 rounded-full transition-colors group-hover:w-full" />
              <span className="w-full h-0.5 bg-slate-800 group-hover:bg-blue-600 rounded-full transition-colors" />
            </div>
            <span className="hidden sm:inline text-xs font-black text-slate-700 group-hover:text-blue-600">
              Components
            </span>
          </button>

          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">
                BedLink
              </span>
              <span className="hidden lg:inline text-[11px] font-semibold text-slate-500 border-l border-slate-200 pl-2">
                Find the right bed before the ambulance arrives.
              </span>
            </div>
          </div>
        </div>

        {/* Global Navigation Items */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
          {navItems.map((item) => {
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-blue-100 text-blue-800">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Actions, Notifications & Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-3 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-900">
                  <span>System Notifications</span>
                  <span className="text-[11px] text-slate-500">{notifications.length} alerts</span>
                </div>
                <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-xs text-slate-400 py-4 text-center">No unread notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-2 rounded-xl bg-slate-50 text-xs flex items-start justify-between gap-2">
                        <div>
                          <div className="text-slate-800 font-medium">{n.title}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{n.time}</div>
                        </div>
                        <button
                          onClick={() => clearNotification(n.id)}
                          className="text-slate-400 hover:text-slate-600 text-[10px] cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Firebase Authentication & User Profile */}
          {!user ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={signInWithGoogle}
                disabled={authLoading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50/50 hover:border-blue-300 text-slate-800 transition-all cursor-pointer text-xs font-bold shadow-2xs group"
                title="Sign in with Google via Firebase Auth"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{authLoading ? 'Signing in...' : 'Sign In'}</span>
              </button>

              {/* Demo Role Switcher button */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                  title="Switch Demo Role"
                >
                  <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                    {userRole[0]}
                  </span>
                  <span className="hidden md:inline font-bold text-slate-800 text-[11px]">{userRole}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-2 animate-fadeIn text-xs">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Simulation Role
                    </div>
                    {roles.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setUserRole(r);
                          setShowRoleMenu(false);
                          if (r === 'Charge Nurse') setActiveView('nurse');
                          if (r === 'Dispatcher') setActiveView('dispatch');
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                          userRole === r ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{r}</span>
                        {userRole === r && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50 transition-colors cursor-pointer text-xs"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-lg object-cover ring-1 ring-blue-400"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <div className="font-bold text-slate-900 leading-tight truncate max-w-[100px]">
                    {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-blue-600 font-semibold leading-tight flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{userRole}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-3 animate-fadeIn text-xs space-y-2">
                  {/* Account Header */}
                  <div className="pb-2 border-b border-slate-100 flex items-center gap-2.5">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-8 h-8 rounded-xl object-cover ring-1 ring-blue-300"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 truncate">
                        {user.displayName || 'Authenticated Operator'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Firebase Auth Verified
                    </span>
                    <span className="font-mono text-[9px]">Google</span>
                  </div>

                  {/* Switch Role in Firestore */}
                  <div className="pt-1">
                    <div className="px-1 py-0.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Assigned Role
                    </div>
                    <div className="space-y-0.5 mt-1">
                      {roles.map((r) => (
                        <button
                          key={r}
                          onClick={async () => {
                            await updateRole(r);
                            setUserRole(r);
                            setShowRoleMenu(false);
                            if (r === 'Charge Nurse') setActiveView('nurse');
                            if (r === 'Dispatcher') setActiveView('dispatch');
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                            userRole === r ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{r}</span>
                          {userRole === r && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sign Out */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        signOut();
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center justify-between transition-colors cursor-pointer font-bold"
                    >
                      <span>Sign Out</span>
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Reset Demo button */}
          <button
            onClick={resetAllDemoData}
            title="Reset to demo baseline"
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Horizontal Navigation Scroll */}
      <div className="xl:hidden flex items-center gap-1 px-4 py-2 bg-slate-50 border-t border-slate-200 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setActiveView(item.view)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-blue-100 text-blue-800">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
