import React, { useState, useEffect } from 'react';
import { useBedLink } from '../context/BedLinkContext';
import { BedType, SpecialtyType } from '../types';
import { BED_LABELS, SPECIALTY_LABELS } from '../data/mockData';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Clock, 
  Plus, 
  Minus, 
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Activity,
  UserCheck
} from 'lucide-react';

export const NurseQuickUpdate: React.FC = () => {
  const { 
    hospitals, 
    selectedHospitalForNurseId, 
    setSelectedHospitalForNurseId,
    updateNurseBedCount,
    executeNurseQuickAction,
    nurseAuditHistory,
    connectivity,
    setConnectivity,
    currentTime
  } = useBedLink();

  const currentHospital = hospitals.find((h) => h.id === selectedHospitalForNurseId) || hospitals[0];

  // Local draft state for quick 1-hand updates
  const [draftCounts, setDraftCounts] = useState<Record<BedType, number>>({
    icu: currentHospital.beds.icu.available,
    ventilator: currentHospital.beds.ventilator.available,
    oxygen: currentHospital.beds.oxygen.available,
    general: currentHospital.beds.general.available,
    cardiac: currentHospital.beds.cardiac.available,
    burn: currentHospital.beds.burn.available,
    stroke: currentHospital.beds.stroke.available,
    pediatric: currentHospital.beds.pediatric.available,
  });

  const [selectedSpecialtyType, setSelectedSpecialtyType] = useState<BedType>('cardiac');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<{ time: string; msg: string } | null>(null);
  const [isCheapPhoneFrame, setIsCheapPhoneFrame] = useState<boolean>(true);

  // Sync draft when hospital changes
  useEffect(() => {
    setDraftCounts({
      icu: currentHospital.beds.icu.available,
      ventilator: currentHospital.beds.ventilator.available,
      oxygen: currentHospital.beds.oxygen.available,
      general: currentHospital.beds.general.available,
      cardiac: currentHospital.beds.cardiac.available,
      burn: currentHospital.beds.burn.available,
      stroke: currentHospital.beds.stroke.available,
      pediatric: currentHospital.beds.pediatric.available,
    });
  }, [currentHospital.id, currentHospital.beds]);

  const handleAdjust = (type: BedType, delta: number) => {
    const total = currentHospital.beds[type].total;
    const current = draftCounts[type];
    const next = Math.max(0, Math.min(total, current + delta));
    setDraftCounts((prev) => ({ ...prev, [type]: next }));
  };

  const handleSaveUpdate = () => {
    // Save draft counts to global state
    (['icu', 'ventilator', 'oxygen', selectedSpecialtyType] as BedType[]).forEach((type) => {
      if (draftCounts[type] !== currentHospital.beds[type].available) {
        updateNurseBedCount(currentHospital.id, type, draftCounts[type]);
      }
    });

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSaveSuccessNotice({
      time: nowStr,
      msg: 'Your availability data is now visible to dispatch.',
    });

    setTimeout(() => {
      setSaveSuccessNotice(null);
    }, 4000);
  };

  const dataAgeMins = Math.max(0, Math.floor((currentTime - currentHospital.lastUpdated) / 60000));

  // 4 Core Bed Cards requested: ICU, Ventilator, Oxygen, Specialty
  const coreCards: { type: BedType; isSpecialty?: boolean }[] = [
    { type: 'icu' },
    { type: 'ventilator' },
    { type: 'oxygen' },
    { type: selectedSpecialtyType, isSpecialty: true },
  ];

  return (
    <div className="py-4 px-2 sm:px-4 max-w-4xl mx-auto space-y-4">
      {/* Top Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Reporting Facility:</div>
            <select
              value={selectedHospitalForNurseId}
              onChange={(e) => setSelectedHospitalForNurseId(e.target.value)}
              className="font-bold text-sm text-slate-900 bg-transparent border-0 cursor-pointer p-0 focus:ring-0"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.traumaLevel})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Connectivity Mode Simulator (Online, Poor Connectivity, Offline) */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Network:</span>
          <select
            value={connectivity}
            onChange={(e) => setConnectivity(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-semibold text-slate-700 cursor-pointer"
          >
            <option value="online">Online (4G/WiFi)</option>
            <option value="poor_connectivity">Poor Connectivity (2G)</option>
            <option value="offline">Offline Mode (Local Cache)</option>
            <option value="syncing">Syncing...</option>
          </select>

          {/* Phone Frame Toggle */}
          <button
            onClick={() => setIsCheapPhoneFrame(!isCheapPhoneFrame)}
            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer ${
              isCheapPhoneFrame ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'
            }`}
            title="Toggle cheap phone frame"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isCheapPhoneFrame ? 'Phone View' : 'Wide View'}</span>
          </button>
        </div>
      </div>

      {/* Screen Frame Container */}
      <div className={`mx-auto transition-all ${isCheapPhoneFrame ? 'max-w-[420px]' : 'max-w-full'}`}>
        <div className={`bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden ${
          isCheapPhoneFrame ? 'ring-8 ring-slate-900/10' : ''
        }`}>
          
          {/* Simulated Cheap Android Status Bar */}
          {isCheapPhoneFrame && (
            <div className="bg-slate-900 text-white px-4 py-1.5 flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold">BedLink Mobile</span>
              <div className="flex items-center gap-2">
                <span>SIM 1: H+</span>
                <span className="text-emerald-400">92%</span>
              </div>
            </div>
          )}

          {/* Screen Title & Header */}
          <div className="bg-slate-50 border-b border-slate-200 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-lg font-black text-slate-900 tracking-tight">
                  Update Bed Availability
                </h1>
                <div className="text-xs font-bold text-slate-800 mt-0.5">
                  {currentHospital.name}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Logged in: <strong className="text-slate-700">{currentHospital.updatedByNurse}</strong>
                </div>
              </div>

              {/* Status and Freshness Indicator */}
              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-white border border-slate-200 shadow-xs">
                  {connectivity === 'online' && (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-emerald-800">Online</span>
                    </>
                  )}
                  {connectivity === 'poor_connectivity' && (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-amber-800">Slow 2G</span>
                    </>
                  )}
                  {connectivity === 'offline' && (
                    <>
                      <WifiOff className="w-3 h-3 text-rose-500" />
                      <span className="text-rose-800">Offline</span>
                    </>
                  )}
                  {connectivity === 'syncing' && (
                    <>
                      <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
                      <span className="text-blue-800">Syncing...</span>
                    </>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">
                  Last updated {dataAgeMins === 0 ? 'just now' : `${dataAgeMins} minutes ago`}
                </div>
              </div>
            </div>

            {/* Save Success Banner */}
            {saveSuccessNotice && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-start gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Updated successfully at {saveSuccessNotice.time}</div>
                  <div className="text-emerald-800 text-[11px]">{saveSuccessNotice.msg}</div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Bar */}
          <div className="p-3 bg-white border-b border-slate-100 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider w-full mb-0.5">
              Quick Actions (1-Tap):
            </span>
            <button
              onClick={() => executeNurseQuickAction('all_unchanged')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
            >
              All beds unchanged
            </button>
            <button
              onClick={() => executeNurseQuickAction('mark_icu_full')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors cursor-pointer"
            >
              Mark ICU full
            </button>
            <button
              onClick={() => executeNurseQuickAction('emergency_opening')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
            >
              Report emergency opening
            </button>
            <button
              onClick={() => executeNurseQuickAction('sync_now')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition-colors cursor-pointer"
            >
              Sync now
            </button>
          </div>

          {/* 4 Large Bed Cards List */}
          <div className="p-3 space-y-3">
            {coreCards.map(({ type, isSpecialty }) => {
              const bedDetail = currentHospital.beds[type];
              const draftAvail = draftCounts[type];
              const total = bedDetail.total;
              const occupied = Math.max(0, total - draftAvail - bedDetail.held);
              const info = BED_LABELS[type];

              // Bed Status indicator
              let statusLabel = 'Open';
              let statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
              if (draftAvail === 0) {
                statusLabel = 'Full';
                statusColor = 'text-rose-700 bg-rose-50 border-rose-200';
              } else if (draftAvail <= 2) {
                statusLabel = 'Limited';
                statusColor = 'text-amber-800 bg-amber-50 border-amber-200';
              }

              return (
                <div 
                  key={type}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    draftAvail === 0 
                      ? 'bg-rose-50/30 border-rose-200' 
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-900 truncate">
                          {isSpecialty ? (
                            <span className="text-purple-900">Specialty ({info.short})</span>
                          ) : (
                            info.label
                          )}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {info.description}
                      </div>
                    </div>

                    {/* Specialty Switcher if specialty card */}
                    {isSpecialty && (
                      <select
                        value={selectedSpecialtyType}
                        onChange={(e) => setSelectedSpecialtyType(e.target.value as BedType)}
                        className="text-[11px] bg-purple-50 text-purple-900 border border-purple-200 rounded-lg p-1 font-bold cursor-pointer"
                      >
                        <option value="cardiac">Cardiac</option>
                        <option value="burn">Burns</option>
                        <option value="stroke">Stroke</option>
                        <option value="pediatric">Pediatric</option>
                      </select>
                    )}
                  </div>

                  {/* Bed Counts Breakdown: Available, Occupied, Total */}
                  <div className="grid grid-cols-3 gap-2 py-2 text-center bg-slate-50 rounded-xl mb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Available</span>
                      <strong className={`text-xl font-black tabular-nums ${
                        draftAvail === 0 ? 'text-rose-600' : 'text-emerald-700'
                      }`}>
                        {draftAvail}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Occupied</span>
                      <strong className="text-xl font-bold text-slate-800 tabular-nums">
                        {occupied}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Capacity</span>
                      <strong className="text-xl font-bold text-slate-600 tabular-nums">
                        {total}
                      </strong>
                    </div>
                  </div>

                  {/* Ergonomic 1-Hand Plus/Minus Buttons & Quick Presets */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAdjust(type, -1)}
                      disabled={draftAvail <= 0}
                      className="w-14 h-13 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-30 disabled:pointer-events-none text-slate-800 font-black text-2xl flex items-center justify-center transition-colors cursor-pointer select-none"
                      aria-label={`Decrease ${info.short}`}
                    >
                      <Minus className="w-5 h-5" />
                    </button>

                    {/* Quick tap direct presets */}
                    <div className="grid grid-cols-4 gap-1 flex-1">
                      {[0, 1, 2, 4].map((presetVal) => (
                        <button
                          key={presetVal}
                          onClick={() => setDraftCounts((prev) => ({ ...prev, [type]: presetVal }))}
                          className={`h-13 rounded-xl font-extrabold text-sm transition-all cursor-pointer ${
                            draftAvail === presetVal
                              ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-600'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {presetVal}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handleAdjust(type, 1)}
                      disabled={draftAvail >= total}
                      className="w-14 h-13 rounded-2xl bg-blue-100 hover:bg-blue-200 active:bg-blue-300 disabled:opacity-30 disabled:pointer-events-none text-blue-800 font-black text-2xl flex items-center justify-center transition-colors cursor-pointer select-none"
                      aria-label={`Increase ${info.short}`}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Bottom Save Update CTA */}
          <div className="p-3 bg-gradient-to-t from-white via-white to-white/95 border-t border-slate-200">
            <button
              onClick={handleSaveUpdate}
              className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5 text-blue-200" />
              <span>Save Update</span>
            </button>
            <div className="text-center mt-2 text-[11px] text-slate-500">
              Immediate broadcast to regional 911 dispatch CAD console
            </div>
          </div>

          {/* Audit History Section */}
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span>Ward Audit History</span>
              <span className="text-[11px] text-slate-400 font-normal">Recent Updates</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {nurseAuditHistory.map((rec) => (
                <div key={rec.id} className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 uppercase">{BED_LABELS[rec.bedType].short}</span>: 
                    <span className="text-slate-500 ml-1">{rec.previousCount} → <strong className="text-slate-900">{rec.newCount}</strong></span>
                    <div className="text-[10px] text-slate-400">{rec.updatedBy}</div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {Math.round((currentTime - rec.updatedTime) / 60000)}m ago
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
