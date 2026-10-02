import React from 'react';
import { useBedLink } from '../context/BedLinkContext';
import { MOCK_CASES } from '../data/mockData';
import { 
  Settings, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Wifi, 
  WifiOff, 
  ShieldAlert, 
  Info, 
  Activity, 
  Building2, 
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { 
    connectivity, 
    setConnectivity, 
    isMuted, 
    toggleMute, 
    resetAllDemoData, 
    loadMockCase, 
    userRole, 
    setUserRole,
    addActivityLog
  } = useBedLink();

  const handleSimulateStaleData = () => {
    addActivityLog('system_alert', 'Simulated aging telemetry: St. Mary’s set to 26m old, Lakeside set to 38m old.');
    alert('Simulated aging telemetry! View the Dispatch Screen or Map to observe yellow and red stale data warnings.');
  };

  return (
    <div className="py-4 px-3 sm:px-6 max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Platform Configuration
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            BedLink Settings & Simulator Controls
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure connectivity testing, emergency case presets, audio cues, and audit rules.
          </p>
        </div>

        <button
          onClick={resetAllDemoData}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Demo State</span>
        </button>
      </div>

      {/* Safety & Compliance Disclaimer (Prompt Requirement) */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-2">
        <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Simulation & Safety Notice</span>
        </div>
        <p className="text-amber-800 leading-relaxed">
          <strong>SIMULATED DEMO ENVIRONMENT:</strong> All hospital capacities, patient cases, bed allocations, and telemetry displayed in BedLink are simulated mock data for operational UX evaluation. This prototype does not use real protected health information (PHI) and is not certified for direct medical triage or emergency dispatch life-support operations.
        </p>
      </div>

      {/* Simulation Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Network & Device Simulator */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-blue-600" />
            <span>Mobile Network Connectivity Simulator</span>
          </h3>
          <p className="text-xs text-slate-500">
            Test how the 10-second Nurse Screen handles slow 2G connections and offline local caching.
          </p>

          <div className="space-y-2 pt-1">
            {[
              { id: 'online', label: 'High-Speed 4G / WiFi (Instant Sync)' },
              { id: 'poor_connectivity', label: 'Poor 2G / Hospital Basement Mode' },
              { id: 'offline', label: 'Complete Offline (Local Cache Queue)' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setConnectivity(id as any)}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-bold border transition-colors flex items-center justify-between cursor-pointer ${
                  connectivity === id
                    ? 'bg-blue-50 text-blue-900 border-blue-300 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{label}</span>
                {connectivity === id && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Telemetry Cues */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            <span>Web Audio Feedback Cues</span>
          </h3>
          <p className="text-xs text-slate-500">
            Emergency audio alerts synthesize medical telemetry sounds (2-min countdown ticker, hold accepted chime, diversion buzz).
          </p>

          <div className="pt-2">
            <button
              onClick={toggleMute}
              className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                isMuted
                  ? 'bg-slate-100 text-slate-600 border-slate-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isMuted ? 'Audio Cues Muted (Click to Enable)' : 'Audio Telemetry Active'}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Uses browser Web Audio API oscillator synthesis; zero external audio downloads needed.
          </div>
        </div>
      </div>

      {/* Preset Scenarios Fast Loader */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900">
          Emergency Clinical Scenarios (1-Click Load)
        </h3>
        <p className="text-xs text-slate-500">
          Test how different clinical conditions rank regional hospitals according to bed availability and specialty matching.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {MOCK_CASES.map((c, idx) => (
            <button
              key={c.label}
              onClick={() => loadMockCase(idx)}
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-xs text-slate-900">{c.label}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Bed: <strong>{c.request.requiredBedType.toUpperCase()}</strong> · Specialty: <strong>{c.request.requiredSpecialty.toUpperCase()}</strong>
              </div>
              <div className="text-[10px] text-blue-700 font-semibold mt-1">
                Load Scenario →
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
