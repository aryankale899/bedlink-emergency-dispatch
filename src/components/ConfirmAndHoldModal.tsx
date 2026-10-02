import React, { useState, useEffect } from 'react';
import { useBedLink } from '../context/BedLinkContext';
import { BED_LABELS, SPECIALTY_LABELS } from '../data/mockData';
import { RejectionReason } from '../types';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Building2, 
  Ambulance, 
  ArrowRight, 
  ShieldCheck, 
  Phone, 
  Radio, 
  FastForward, 
  HelpCircle,
  MessageSquare,
  Lock,
  Sparkles
} from 'lucide-react';

export const ConfirmAndHoldModal: React.FC = () => {
  const { 
    currentPendingHold, 
    pendingSecondsRemaining, 
    acceptBedHold, 
    rejectBedHold, 
    cancelPendingHold, 
    proceedToNextBestHospital,
    hospitals,
    rankedHospitals,
    currentTime
  } = useBedLink();

  const [selectedRejectReason, setSelectedRejectReason] = useState<RejectionReason>('Bed no longer available');
  const [showRejectForm, setShowRejectForm] = useState<boolean>(false);
  const [showDispatcherInquiry, setShowDispatcherInquiry] = useState<boolean>(false);
  const [inquiryText, setInquiryText] = useState<string>('Is respiratory therapist already on bedside?');
  const [inquirySent, setInquirySent] = useState<boolean>(false);
  const [autoEscalateCountdown, setAutoEscalateCountdown] = useState<number>(6);

  // Auto escalate timer when rejected or timed out
  useEffect(() => {
    if (!currentPendingHold) return;
    if (currentPendingHold.status === 'rejected' || currentPendingHold.status === 'timed_out') {
      setAutoEscalateCountdown(6);
      const timer = setInterval(() => {
        setAutoEscalateCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            proceedToNextBestHospital();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentPendingHold?.status, proceedToNextBestHospital]);

  if (!currentPendingHold) return null;

  const targetHospital = hospitals.find((h) => h.id === currentPendingHold.hospitalId);
  const nextBest = currentPendingHold.nextBestHospitalId 
    ? hospitals.find((h) => h.id === currentPendingHold.nextBestHospitalId)
    : null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sentTimeStr = new Date(currentPendingHold.requestedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const percentLeft = Math.round((pendingSecondsRemaining / 120) * 100);
  const bedInfo = BED_LABELS[currentPendingHold.bedType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto">
        
        {/* ================= STATE 1: PENDING CONFIRMATION ================= */}
        {currentPendingHold.status === 'pending' && (
          <div>
            {/* Header: Countdown Banner */}
            <div className={`p-4 sm:p-5 rounded-t-3xl border-b transition-colors ${
              pendingSecondsRemaining < 30 ? 'bg-rose-50 border-rose-200 text-rose-950' : 'bg-blue-50 border-blue-200 text-blue-950'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                    pendingSecondsRemaining < 30 ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
                  }`}>
                    <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                      Confirm Bed Hold Protocol
                    </span>
                    <h2 className="text-lg sm:text-xl font-black tracking-tight">
                      Waiting for Hospital Confirmation
                    </h2>
                  </div>
                </div>

                {/* Visible Countdown Timer */}
                <div className="text-right">
                  <div className={`text-2xl sm:text-3xl font-black font-mono tabular-nums ${
                    pendingSecondsRemaining < 30 ? 'text-rose-600 animate-pulse' : 'text-blue-600'
                  }`}>
                    {formatTimer(pendingSecondsRemaining)}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">
                    Remaining
                  </div>
                </div>
              </div>

              {/* Linear Progress Bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full transition-all duration-1000 ${
                    pendingSecondsRemaining < 30 ? 'bg-rose-600' : 'bg-blue-600'
                  }`}
                  style={{ width: `${percentLeft}%` }}
                />
              </div>

              {/* Status Message */}
              <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
                <span>Bed hold request sent at {sentTimeStr}</span>
                <span className="font-mono font-bold">Expires in {formatTimer(pendingSecondsRemaining)}</span>
              </div>
            </div>

            {/* Warning Message */}
            <div className="px-4 sm:px-6 pt-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold">
                  The hospital has 2 minutes to accept or reject this request. If unanswered, BedLink will automatically escalate to the next-best facility.
                </span>
              </div>
            </div>

            {/* Request Summary Cards */}
            <div className="p-4 sm:p-6 space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected Facility</span>
                    <h3 className="text-base font-extrabold text-slate-900">{currentPendingHold.hospitalName}</h3>
                    <div className="text-xs text-slate-500">{targetHospital?.address}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800">
                      ETA ~{currentPendingHold.travelMinutes} mins
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Case ID</span>
                    <strong className="text-slate-900 font-mono">{currentPendingHold.caseId}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Required Bed</span>
                    <strong className="text-slate-900">{bedInfo.short} Bed</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Specialty</span>
                    <strong className="text-slate-900">{SPECIALTY_LABELS[currentPendingHold.specialty]}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Ambulance</span>
                    <strong className="text-slate-900">{currentPendingHold.ambulanceUnit}</strong>
                  </div>
                </div>
              </div>

              {/* Hospital Side Perspective (Simulation Actions) */}
              <div className="p-4 bg-white rounded-2xl border-2 border-blue-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900 uppercase">
                      Hospital ED Confirmation Station
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Receiving Desk Simulation</span>
                </div>

                <p className="text-xs text-slate-600">
                  Notes from dispatch: &quot;{currentPendingHold.notesFromDispatch || currentPendingHold.patientSummary}&quot;
                </p>

                {/* Hospital Actions: Accept, Reject, Ask Dispatcher */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => acceptBedHold(currentPendingHold.id)}
                    className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Accept & Hold Bed</span>
                  </button>

                  <button
                    onClick={() => setShowRejectForm(!showRejectForm)}
                    className="h-11 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span>Reject Request</span>
                  </button>

                  <button
                    onClick={() => setShowDispatcherInquiry(!showDispatcherInquiry)}
                    className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ask Dispatcher</span>
                  </button>
                </div>

                {/* Inquiry drawer */}
                {showDispatcherInquiry && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-fadeIn text-xs">
                    <span className="font-bold text-slate-700">Quick question to ambulance crew:</span>
                    <input
                      type="text"
                      value={inquiryText}
                      onChange={(e) => setInquiryText(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setInquirySent(true);
                          setTimeout(() => setInquirySent(false), 3000);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs cursor-pointer"
                      >
                        Transmit Question
                      </button>
                      {inquirySent && <span className="text-emerald-700 font-bold">Transmitted to Crew CAD</span>}
                    </div>
                  </div>
                )}

                {/* Rejection reason drawer */}
                {showRejectForm && (
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-2 animate-fadeIn text-xs">
                    <span className="font-bold text-rose-950 block">Select Rejection Reason:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {([
                        'Bed no longer available',
                        'Patient needs cannot be supported',
                        'Staffing unavailable',
                        'Specialty unavailable',
                        'Critical ED saturation',
                        'Other',
                      ] as RejectionReason[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => setSelectedRejectReason(r)}
                          className={`p-2 rounded-lg text-left font-semibold border transition-all cursor-pointer ${
                            selectedRejectReason === r
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white text-rose-900 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => rejectBedHold(currentPendingHold.id, selectedRejectReason)}
                      className="w-full py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs cursor-pointer mt-1"
                    >
                      Confirm Rejection & Trigger Auto-Escalation
                    </button>
                  </div>
                )}
              </div>

              {/* Cancel Request Footer Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={cancelPendingHold}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium underline cursor-pointer"
                >
                  Cancel Hold Request
                </button>

                {/* Fast-forward button for quick testing */}
                <button
                  onClick={() => rejectBedHold(currentPendingHold.id, '2-Minute window elapsed without response')}
                  className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>Simulate 2-Min Timeout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STATE 2: ACCEPTED & HELD ================= */}
        {currentPendingHold.status === 'held' && (
          <div className="p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto shadow-sm shadow-emerald-500/10">
                <Lock className="w-8 h-8 text-emerald-600" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Bed Held Successfully
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Hold Confirmed at {currentPendingHold.hospitalName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Selected bed locked from other cases. Ambulance crew cleared for direct priority transport.
              </p>
            </div>

            {/* Confirmed Details Grid */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Hold ID</span>
                  <strong className="text-sm font-black font-mono text-emerald-700">{currentPendingHold.holdToken}</strong>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Bed Reserved</span>
                  <strong className="text-sm font-bold text-slate-900">{bedInfo.short}</strong>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Hold Expiry</span>
                  <strong className="text-sm font-bold text-slate-900">30 min window</strong>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Ambulance ETA</span>
                  <strong className="text-sm font-bold text-blue-700">~{currentPendingHold.travelMinutes} mins</strong>
                </div>
              </div>

              {/* Entrance & Direct Radio Instructions */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>Ambulance Entrance:</span>
                  <span className="font-mono text-emerald-800">Radio: {targetHospital?.emergencyRadioChannel}</span>
                </div>
                <p className="text-slate-600">{targetHospital?.ambulanceEntrance}</p>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                  <span>Hospital Direct: {targetHospital?.phone}</span>
                  <span className="font-semibold text-emerald-700">Trauma Bay Assigned</span>
                </div>
              </div>
            </div>

            {/* Dismiss & View Active Holds */}
            <button
              onClick={cancelPendingHold}
              className="w-full h-13 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <span>Acknowledge & View Active Holds</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================= STATE 3: REJECTED OR TIMED OUT ================= */}
        {(currentPendingHold.status === 'rejected' || currentPendingHold.status === 'timed_out') && (
          <div className="p-6 sm:p-8 space-y-5 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-rose-600" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                {currentPendingHold.status === 'timed_out' ? 'Hold Request Timed Out' : 'Hospital Rejected Request'}
              </span>
              <h2 className="text-2xl font-black text-rose-950 tracking-tight">
                {currentPendingHold.hospitalName} {currentPendingHold.status === 'timed_out' ? 'Did Not Respond' : 'Rejected the Request'}
              </h2>
              <p className="text-xs sm:text-sm text-rose-800 max-w-md mx-auto bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                Reason: <strong>{currentPendingHold.rejectionReason || 'No confirmation within 2 minutes'}</strong>
              </p>
            </div>

            {/* Prompt requirement: "...the next-best hospital is offered automatically on rejection or timeout." */}
            <div className="bg-slate-50 rounded-2xl p-5 border-2 border-blue-500/40 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    Next-Best Hospital Match Available:
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  Auto-routing in {autoEscalateCountdown}s...
                </span>
              </div>

              {nextBest ? (
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900">{nextBest.name}</h4>
                      <div className="text-xs text-slate-500">{nextBest.address} · {nextBest.traumaLevel}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800">
                        {nextBest.beds[currentPendingHold.bedType]?.available || 0} {bedInfo.short} Available
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <span>ED Load: {nextBest.currentLoad}%</span>
                    <span>Radio: {nextBest.emergencyRadioChannel}</span>
                    <span className="font-semibold text-emerald-700">Verified Ready</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-600">
                  Scanning remaining regional facilities...
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  onClick={proceedToNextBestHospital}
                  className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Request Hold at Next-Best ({nextBest?.shortName || 'Next Hospital'})</span>
                </button>
                <button
                  onClick={cancelPendingHold}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Return to Dispatch Results
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
