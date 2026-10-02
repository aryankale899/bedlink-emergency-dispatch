import React, { useEffect } from 'react';
import { useBedLink } from '../context/BedLinkContext';
import { useAuth } from '../context/AuthContext';
import { NavView } from '../types';
import { 
  Activity, 
  Map as MapIcon, 
  Smartphone, 
  Clock, 
  Building2, 
  FileText, 
  Settings, 
  X, 
  CheckCircle2, 
  Radio, 
  ShieldCheck, 
  Layers, 
  ChevronRight,
  Ambulance,
  Compass,
  ArrowUpRight,
  Heart,
  Volume2,
  VolumeX,
  RotateCcw,
  LogOut,
  LogIn
} from 'lucide-react';

interface ComponentDefinition {
  view: NavView;
  title: string;
  shortLabel: string;
  badge?: string;
  tagline: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  description: string;
}

export const SidebarDrawer: React.FC = () => {
  const { 
    isSidebarOpen, 
    setIsSidebarOpen, 
    activeView, 
    setActiveView,
    activeHolds,
    currentPendingHold,
    pendingSecondsRemaining,
    hospitals,
    patientRequest,
    userRole,
    setUserRole,
    isMuted,
    toggleMute,
    resetAllDemoData,
    lastSystemSyncTime,
    currentTime
  } = useBedLink();

  const { 
    user, 
    loading: authLoading, 
    signInWithGoogle, 
    signOut, 
    updateRole 
  } = useAuth();

  // Close with Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, setIsSidebarOpen]);

  const componentsList: ComponentDefinition[] = [
    {
      view: 'dispatch',
      title: 'Ambulance CAD Dispatch',
      shortLabel: 'Dispatch',
      tagline: 'Patient Triage & 3-Step Bed Matcher',
      icon: <Activity className="w-5 h-5" />,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      description: 'Intake patient acuity, calculate driving ETA and match verified ICU/Ventilator beds.'
    },
    {
      view: 'map',
      title: 'Real-World Navigation Map',
      shortLabel: 'Live Map',
      tagline: 'Regional GPS & Hospital Pins',
      icon: <Compass className="w-5 h-5" />,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-700',
      description: 'Interactive street map with real OpenStreetMap tiles, live routing, and hospital capacity markers.'
    },
    {
      view: 'nurse',
      title: 'Nurse 10-Second Bed Updates',
      shortLabel: 'Bed Updates',
      tagline: 'One-Tap Mobile Inventory Counters',
      icon: <Smartphone className="w-5 h-5" />,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-700',
      description: 'Fast tactile ergonomics for nurses on cheap phones to increment and sync beds in under 10 seconds.'
    },
    {
      view: 'holds',
      title: 'Active Holds & 2-Min SLA Queue',
      shortLabel: 'Active Holds',
      badge: activeHolds.length > 0 ? `${activeHolds.length} Active` : undefined,
      tagline: 'Reservation Timers & Dispatch Escalation',
      icon: <Clock className="w-5 h-5" />,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-700',
      description: 'Live 2-minute confirmation timers, hospital acceptance queue, and automatic next-best rerouting.'
    },
    {
      view: 'hospitals',
      title: 'Hospitals Directory & Capacity',
      shortLabel: 'Hospitals',
      tagline: '8 Regional Trauma & Specialty Centers',
      icon: <Building2 className="w-5 h-5" />,
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-700',
      description: 'Full facility directory with live trauma levels, ICU/Ventilator availability, and contact lines.'
    },
    {
      view: 'logs',
      title: 'Activity & Audit Trail Stream',
      shortLabel: 'Activity Log',
      tagline: 'Immutable Event Telemetry',
      icon: <FileText className="w-5 h-5" />,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-700',
      description: 'Complete chronological audit log of all nurse updates, hold requests, accepted beds, and diversions.'
    },
    {
      view: 'settings',
      title: 'Platform System Settings',
      shortLabel: 'Settings',
      tagline: 'Emergency Audio Tones & Mesh Sync',
      icon: <Settings className="w-5 h-5" />,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700',
      description: 'Operational SLA thresholds, Web Audio alerts, notification preferences, and demo reset.'
    }
  ];

  const currentComponent = componentsList.find((c) => c.view === activeView) || componentsList[0];

  const handleSelectComponent = (view: NavView) => {
    setActiveView(view);
    // Smoothly close drawer upon selection
    setIsSidebarOpen(false);
  };

  const syncAgeSeconds = Math.max(0, Math.floor((currentTime - lastSystemSyncTime) / 1000));

  return (
    <>
      {/* Floating Side Toggle Button ("3 slash thing") on left edge of screen */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-slate-900 hover:bg-blue-600 text-white pl-2.5 pr-3 py-3 rounded-r-2xl shadow-xl border-y border-r border-slate-700/50 flex items-center gap-2 group transition-all duration-200 cursor-pointer hover:translate-x-0.5"
        title="Open Component Navigation (3 Slashes)"
        aria-label="Open Component Navigation"
      >
        {/* 3 Slash / 3 Bar Icon */}
        <div className="flex flex-col gap-1 w-4">
          <span className="w-full h-0.5 bg-white rounded-full transition-all group-hover:bg-blue-200" />
          <span className="w-3/4 h-0.5 bg-white rounded-full transition-all group-hover:w-full group-hover:bg-blue-200" />
          <span className="w-full h-0.5 bg-white rounded-full transition-all group-hover:bg-blue-200" />
        </div>
        <div className="hidden sm:flex flex-col items-start leading-none">
          <span className="text-[10px] font-black tracking-wider uppercase text-blue-400 group-hover:text-white">
            Components
          </span>
          <span className="text-[9px] text-slate-400 font-mono">
            {currentComponent.shortLabel}
          </span>
        </div>
      </button>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        />
      )}

      {/* Slide-out Side Drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-full sm:w-[420px] bg-white border-r border-slate-200 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              {/* 3 Slash / Bars Brand Icon */}
              <div className="flex flex-col gap-1 w-4">
                <span className="w-full h-0.5 bg-white rounded-full" />
                <span className="w-full h-0.5 bg-white rounded-full" />
                <span className="w-full h-0.5 bg-white rounded-full" />
              </div>
            </div>
            <div>
              <div className="text-base font-black tracking-tight font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                <span>BedLink</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                  Components
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Select and view any system component
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close menu (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* ================= CURRENTLY SELECTED COMPONENT CARD ================= */}
          <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-200/80 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
              <span className="text-[9px] font-black uppercase tracking-wider bg-blue-600 text-white px-2.5 py-1 rounded-bl-xl shadow-xs">
                In View Now
              </span>
            </div>

            <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Currently Selected Component</span>
            </div>

            <div className="flex items-start gap-3 mt-2">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${currentComponent.iconBg} ${currentComponent.iconColor} shadow-xs`}>
                {currentComponent.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug">
                  {currentComponent.title}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  {currentComponent.tagline}
                </p>
                <div className="text-[11px] text-slate-500 mt-1">
                  {currentComponent.description}
                </div>
              </div>
            </div>

            {/* Live Contextual Snippet for current view */}
            <div className="mt-3 pt-3 border-t border-blue-200/60 flex items-center justify-between text-[11px]">
              <div className="text-slate-600 font-medium">
                {activeView === 'dispatch' && `Unit: ${patientRequest.ambulanceUnit} · Acuity: ${patientRequest.condition.toUpperCase()}`}
                {activeView === 'map' && `8 Hospitals mapped with driving routing`}
                {activeView === 'nurse' && `Nurse Rapid Update Mode active`}
                {activeView === 'holds' && `${activeHolds.length} Active Bed Hold(s)`}
                {activeView === 'hospitals' && `8 Regional Trauma Facilities registered`}
                {activeView === 'logs' && `Continuous EMS event auditing enabled`}
                {activeView === 'settings' && `Standard Metro CAD Protocol v2.4`}
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-lg border border-blue-200">
                Active View
              </span>
            </div>
          </div>

          {/* Active Hold Alert in Drawer if pending */}
          {currentPendingHold && currentPendingHold.status === 'pending' && (
            <div 
              onClick={() => handleSelectComponent('holds')}
              className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-rose-100/70 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-rose-900">
                    2-Minute Bed Hold SLA Active!
                  </div>
                  <div className="text-[11px] text-rose-700">
                    Time Remaining: <strong className="font-mono font-bold">{Math.floor(pendingSecondsRemaining / 60)}:{(pendingSecondsRemaining % 60).toString().padStart(2, '0')}</strong>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-600" />
            </div>
          )}

          {/* ================= COMPONENT SELECTION LIST ================= */}
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                All Available Components ({componentsList.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Tap to view
              </span>
            </div>

            <div className="space-y-2">
              {componentsList.map((item) => {
                const isSelected = activeView === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => handleSelectComponent(item.view)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all duration-150 flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 ring-2 ring-blue-600/20'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : `${item.iconBg} ${item.iconColor}`
                      }`}
                    >
                      {item.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0 ${
                            isSelected ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <div className={`text-xs mt-0.5 line-clamp-1 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                        {item.tagline}
                      </div>
                    </div>

                    {/* Status indicator on right */}
                    <div className="shrink-0 self-center">
                      {isSelected ? (
                        <div className="flex items-center gap-1 bg-white/25 text-white px-2 py-0.8 rounded-lg text-[10px] font-extrabold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Selected</span>
                        </div>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Firebase Authentication Status Card in Drawer */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Firebase Identity
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Auth Ready
              </span>
            </div>

            {!user ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  Authenticate with your Google account to tie bed holds and nurse logs to your verified UID.
                </p>
                <button
                  onClick={signInWithGoogle}
                  disabled={authLoading}
                  className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>{authLoading ? 'Signing In...' : 'Sign in with Google'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 bg-white p-2 rounded-xl border border-slate-200">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Avatar"
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-blue-300"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-xs truncate">
                      {user.displayName || 'Authorized EMS Operator'}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Role: <strong className="text-blue-700">{userRole}</strong>
                  </span>
                  <button
                    onClick={signOut}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Simulation Role Selection inside Drawer */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              Active Coordination Role
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(['Dispatcher', 'Charge Nurse', 'Hospital Coordinator', 'Medical Director'] as const).map((role) => (
                <button
                  key={role}
                  onClick={async () => {
                    if (user) {
                      await updateRole(role);
                    }
                    setUserRole(role);
                    if (role === 'Charge Nurse') setActiveView('nurse');
                    if (role === 'Dispatcher') setActiveView('dispatch');
                  }}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer border ${
                    userRole === role
                      ? 'bg-white text-blue-700 border-blue-300 shadow-xs'
                      : 'bg-transparent text-slate-600 border-transparent hover:bg-white/60'
                  }`}
                >
                  <div className="truncate">{role}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer Utility */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer flex items-center gap-1.5"
              title="Toggle Audio"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
              <span className="text-[11px] font-semibold">{isMuted ? 'Muted' : 'Audio On'}</span>
            </button>

            <button
              onClick={resetAllDemoData}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer flex items-center gap-1.5"
              title="Reset Demo Baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold">Reset</span>
            </button>
          </div>

          <div className="text-[10px] text-slate-400 font-mono">
            Mesh: {syncAgeSeconds}s ago
          </div>
        </div>
      </div>
    </>
  );
};
