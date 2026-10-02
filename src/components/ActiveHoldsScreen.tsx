import React, { useState } from 'react';
import { useBedLink } from '../context/BedLinkContext';
import { BedHold, HoldStatus } from '../types';
import { BED_LABELS, SPECIALTY_LABELS } from '../data/mockData';
import { 
  Clock, 
  Building2, 
  Ambulance, 
  Phone, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  ArrowRight,
  Filter,
  Check,
  RotateCcw
} from 'lucide-react';

export const ActiveHoldsScreen: React.FC = () => {
  const { activeHolds, releaseActiveHold, updateHoldStatus, currentTime, hospitals } = useBedLink();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [holdingToRelease, setHoldingToRelease] = useState<BedHold | null>(null);
  const [contactModalHospital, setContactModalHospital] = useState<{ name: string; phone: string; radio: string } | null>(null);

  const filteredHolds = activeHolds.filter((hold) => {
    if (filterStatus === 'all') return true;
    return hold.status === filterStatus;
  });

  const getStatusBadge = (status: HoldStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending Confirmation', class: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'held':
        return { label: 'Bed Held', class: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'en_route':
      case 'ambulance_en_route':
        return { label: 'Ambulance En Route', class: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'arrived':
        return { label: 'Arrived at ED', class: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'completed':
        return { label: 'Completed', class: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'expiring_soon':
        return { label: 'Expiring Soon', class: 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse' };
      case 'rejected':
        return { label: 'Rejected / Diverted', class: 'bg-rose-100 text-rose-900 border-rose-200' };
      case 'timed_out':
        return { label: 'Timed Out', class: 'bg-slate-100 text-slate-800 border-slate-300' };
      default:
        return { label: 'Active Hold', class: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const getRemainingMinutes = (expiresAt: number) => {
    const diff = expiresAt - currentTime;
    return Math.max(0, Math.ceil(diff / 60000));
  };

  return (
    <div className="py-4 px-3 sm:px-6 max-w-7xl mx-auto space-y-5">
      {/* Top Title Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Emergency Coordination
            </span>
            <span className="text-xs text-slate-500">
              Active Regional Queue: <strong className="text-slate-900">{activeHolds.length} cases</strong>
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Active Bed Holds
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time tracking of reserved trauma, ICU, ventilator, and specialty beds for inbound EMS units.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
          {['all', 'held', 'ambulance_en_route', 'arrived', 'expiring_soon'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === st ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'all' && 'All Active'}
              {st === 'held' && 'Held'}
              {st === 'ambulance_en_route' && 'En Route'}
              {st === 'arrived' && 'Arrived'}
              {st === 'expiring_soon' && 'Expiring Soon'}
            </button>
          ))}
        </div>
      </div>

      {/* Holds Cards List */}
      <div className="space-y-4">
        {filteredHolds.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No Active Bed Holds in this filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Request a bed hold from the Dispatch screen to track live countdowns and ambulance transit here.
            </p>
          </div>
        ) : (
          filteredHolds.map((hold) => {
            const badge = getStatusBadge(hold.status);
            const remainingMins = getRemainingMinutes(hold.expiresAt);
            const targetHosp = hospitals.find((h) => h.id === hold.hospitalId);
            const isExpiringSoon = remainingMins <= 15;
            const dataAge = Math.max(0, Math.floor((currentTime - hold.lastHospitalUpdate) / 60000));

            return (
              <div
                key={hold.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all ${
                  isExpiringSoon ? 'border-amber-300 ring-1 ring-amber-300/40' : 'border-slate-200'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Ambulance className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-slate-900">{hold.caseId}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-mono text-xs font-bold text-blue-700">{hold.holdToken || hold.id}</span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.class}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Unit: <strong className="text-slate-800">{hold.ambulanceUnit}</strong> · {hold.patientSummary}
                      </div>
                    </div>
                  </div>

                  {/* Countdown Timer */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right">
                      <div className={`text-lg font-black font-mono tabular-nums ${
                        isExpiringSoon ? 'text-amber-600' : 'text-slate-900'
                      }`}>
                        {remainingMins} min remaining
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Hold Window
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expiry / ETA Alert if < 15 mins */}
                {isExpiringSoon && (
                  <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Alert: Hold window expires in less than {remainingMins} minutes. Contact ambulance crew to confirm ETA.
                    </span>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Receiving Facility</span>
                    <strong className="text-slate-900 font-bold block truncate">{hold.hospitalName}</strong>
                    <span className="text-[10px] text-slate-500">{hold.assignedBay || 'Trauma Bay 1'}</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Bed Reserved</span>
                    <strong className="text-slate-900 font-bold block">{BED_LABELS[hold.bedType].label}</strong>
                    <span className="text-[10px] text-purple-700 font-semibold">{SPECIALTY_LABELS[hold.specialty]}</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Ambulance ETA</span>
                    <strong className="text-blue-700 font-black text-sm block">~{hold.travelMinutes} mins</strong>
                    <span className="text-[10px] text-slate-500">Inbound via sirens</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Last Hospital Update</span>
                    <strong className="text-slate-800 font-bold block">{dataAge} min ago</strong>
                    <span className="text-[10px] text-emerald-700 font-semibold">Mesh synced</span>
                  </div>
                </div>

                {/* Bottom Row Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Ambulance Status:</span>
                    <button
                      onClick={() => updateHoldStatus(hold.id, 'ambulance_en_route')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        hold.status === 'ambulance_en_route' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      En Route
                    </button>
                    <button
                      onClick={() => updateHoldStatus(hold.id, 'arrived')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        hold.status === 'arrived' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Arrived
                    </button>
                    <button
                      onClick={() => updateHoldStatus(hold.id, 'completed')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        hold.status === 'completed' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Completed
                    </button>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() =>
                        setContactModalHospital({
                          name: hold.hospitalName,
                          phone: targetHosp?.phone || '(555) 234-1000',
                          radio: targetHosp?.emergencyRadioChannel || 'MED-TAC-1',
                        })
                      }
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>Contact Hospital</span>
                    </button>

                    <button
                      onClick={() => setHoldingToRelease(hold)}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Release Hold</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Release Hold Confirmation Modal */}
      {holdingToRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Release Active Bed Hold?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to release the hold on <strong>{holdingToRelease.hospitalName}</strong> for case <strong>{holdingToRelease.caseId}</strong>? The locked bed will immediately return to public regional inventory.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setHoldingToRelease(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Keep Hold
              </button>
              <button
                onClick={() => {
                  releaseActiveHold(holdingToRelease.id);
                  setHoldingToRelease(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Yes, Release Bed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Hospital Modal */}
      {contactModalHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4 text-center">
            <Building2 className="w-10 h-10 text-blue-600 mx-auto" />
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{contactModalHospital.name}</h3>
              <p className="text-xs text-slate-500">Emergency Department Direct Line</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 font-mono text-sm">
              <div className="flex items-center justify-between text-slate-800">
                <span>Phone:</span>
                <strong className="text-blue-700 font-bold">{contactModalHospital.phone}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-800">
                <span>Radio Channel:</span>
                <strong className="text-emerald-700 font-bold">{contactModalHospital.radio}</strong>
              </div>
            </div>
            <button
              onClick={() => setContactModalHospital(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
