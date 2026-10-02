import React, { useState } from 'react';
import { useBedLink } from '../context/BedLinkContext';
import { ActivityEvent } from '../types';
import { 
  FileText, 
  Search, 
  Filter, 
  Clock, 
  Building2, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';

export const ActivityLogScreen: React.FC = () => {
  const { activityLogs, currentTime, resetAllDemoData } = useBedLink();
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = activityLogs.filter((log) => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchHospital = log.hospitalName?.toLowerCase().includes(q);
      const matchCase = log.caseId?.toLowerCase().includes(q);
      const matchResult = log.result.toLowerCase().includes(q);
      const matchActor = log.actor.toLowerCase().includes(q);
      return matchHospital || matchCase || matchResult || matchActor;
    }
    return true;
  });

  const getActionBadge = (action: ActivityEvent['action']) => {
    switch (action) {
      case 'hospital_accepted':
        return { label: 'Hold Accepted', class: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'hospital_rejected':
        return { label: 'Hold Rejected', class: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'request_timed_out':
        return { label: 'Timed Out', class: 'bg-amber-50 text-amber-800 border-amber-300' };
      case 'next_best_offered':
        return { label: 'Auto-Escalation', class: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'hold_requested':
        return { label: 'Hold Requested', class: 'bg-sky-50 text-sky-800 border-sky-200' };
      case 'bed_updated':
        return { label: 'Bed Updated', class: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'hold_released':
        return { label: 'Hold Released', class: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'ambulance_arrived':
        return { label: 'Arrived at ED', class: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'sync_completed':
        return { label: 'Data Synced', class: 'bg-slate-100 text-slate-600 border-slate-200' };
      default:
        return { label: 'System Alert', class: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="py-4 px-3 sm:px-6 max-w-7xl mx-auto space-y-5">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Audit & Compliance
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Events: <strong className="text-slate-900">{activityLogs.length} logged</strong>
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            System Activity Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Immutable chronological audit stream of bed updates, 2-minute hold requests, hospital responses, and auto-escalations.
          </p>
        </div>

        {/* Search & Reset */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search case, hospital, or actor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-slate-800 placeholder:text-slate-400 w-56 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Action Filter Pills */}
      <div className="flex items-center gap-1.5 bg-white p-2 rounded-2xl border border-slate-200 overflow-x-auto text-xs">
        <span className="text-[11px] font-bold text-slate-400 px-2">Filter Action:</span>
        {[
          { key: 'all', label: 'All Actions' },
          { key: 'hold_requested', label: 'Hold Requests' },
          { key: 'hospital_accepted', label: 'Accepted Holds' },
          { key: 'hospital_rejected', label: 'Rejections' },
          { key: 'request_timed_out', label: 'Timeouts' },
          { key: 'next_best_offered', label: 'Auto-Escalations' },
          { key: 'bed_updated', label: 'Bed Updates' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActionFilter(key)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
              actionFilter === key
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chronological Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No matching activity events found.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const badge = getActionBadge(log.action);
              const elapsedSec = Math.max(0, Math.floor((currentTime - log.timestamp) / 1000));
              const timeFormatted = new Date(log.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  {/* Left: Time, Action Badge, Hospital & Case */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-16 font-mono text-[11px] text-slate-400 font-semibold shrink-0">
                      {timeFormatted}
                    </div>

                    <span className={`px-2.5 py-1 rounded-lg font-bold border text-[11px] shrink-0 ${badge.class}`}>
                      {badge.label}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {log.hospitalName && (
                          <span className="font-extrabold text-slate-900 truncate">
                            {log.hospitalName}
                          </span>
                        )}
                        {log.caseId && (
                          <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                            {log.caseId}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 mt-0.5 break-words">
                        {log.result}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actor & Elapsed */}
                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {log.actor}
                    </span>
                    <span>·</span>
                    <span className="font-mono">
                      {elapsedSec < 60 ? `${elapsedSec}s ago` : `${Math.floor(elapsedSec / 60)}m ago`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
