import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Hospital, 
  PatientRequest, 
  RankedHospitalResult, 
  BedHold, 
  ActivityEvent, 
  NavView, 
  UserRole,
  ConnectivityStatus,
  BedType,
  NurseAuditRecord,
  HoldStatus,
  RejectionReason
} from '../types';
import { INITIAL_HOSPITALS, MOCK_CASES } from '../data/mockData';
import { rankHospitals } from '../utils/ranking';
import { 
  playTapTone, 
  playHoldAlertTone, 
  playAcceptedFanfare, 
  playWarningDivertTone,
  setAudioMuted as setGlobalAudioMuted
} from '../utils/audio';

interface MapFilterState {
  bedType: BedType | 'all';
  showTraffic: boolean;
  showTravelTime: boolean;
  showHospitalLoad: boolean;
  showDataFreshness: boolean;
  searchQuery: string;
}

interface BedLinkContextType {
  hospitals: Hospital[];
  patientRequest: PatientRequest;
  setPatientRequest: React.Dispatch<React.SetStateAction<PatientRequest>>;
  loadMockCase: (index: number) => void;
  rankedHospitals: RankedHospitalResult[];
  
  // Navigation & Views
  activeView: NavView;
  setActiveView: (view: NavView) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  selectedHospitalIdForDetail: string;
  setSelectedHospitalIdForDetail: (id: string) => void;
  selectedHospitalForNurseId: string;
  setSelectedHospitalForNurseId: (id: string) => void;
  
  // Map settings
  mapFilters: MapFilterState;
  setMapFilters: React.Dispatch<React.SetStateAction<MapFilterState>>;
  
  // Hold & Confirmations
  activeHolds: BedHold[];
  currentPendingHold: BedHold | null;
  pendingSecondsRemaining: number;
  requestBedHold: (hospitalId: string, notes?: string) => void;
  acceptBedHold: (holdId: string) => void;
  rejectBedHold: (holdId: string, reason: RejectionReason | string) => void;
  cancelPendingHold: () => void;
  releaseActiveHold: (holdId: string) => void;
  updateHoldStatus: (holdId: string, status: HoldStatus) => void;
  proceedToNextBestHospital: () => void;
  
  // Nurse Experience
  updateNurseBedCount: (hospitalId: string, bedType: BedType, newCount: number) => void;
  executeNurseQuickAction: (action: 'all_unchanged' | 'mark_icu_full' | 'emergency_opening' | 'sync_now') => void;
  nurseAuditHistory: NurseAuditRecord[];
  connectivity: ConnectivityStatus;
  setConnectivity: (status: ConnectivityStatus) => void;
  
  // Audits, Clock & System
  activityLogs: ActivityEvent[];
  addActivityLog: (action: ActivityEvent['action'], result: string, hospitalId?: string, caseId?: string) => void;
  currentTime: number;
  lastSystemSyncTime: number;
  isMuted: boolean;
  toggleMute: () => void;
  resetAllDemoData: () => void;
  notifications: { id: string; title: string; time: string; type: 'info' | 'warning' | 'alert' }[];
  clearNotification: (id: string) => void;
}

const BedLinkContext = createContext<BedLinkContextType | undefined>(undefined);

const STORAGE_KEY = 'bedlink_v2_state';

export const BedLinkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [lastSystemSyncTime, setLastSystemSyncTime] = useState<number>(Date.now());

  // Hospitals state
  const [hospitals, setHospitals] = useState<Hospital[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.hospitals && Array.isArray(parsed.hospitals) && parsed.hospitals.length >= 8) {
          return parsed.hospitals;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_HOSPITALS;
  });

  // Current Patient Request
  const [patientRequest, setPatientRequest] = useState<PatientRequest>(MOCK_CASES[0].request);

  // Active View and Roles
  const [activeView, setActiveView] = useState<NavView>('dispatch');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);
  const [userRole, setUserRole] = useState<UserRole>('Dispatcher');
  const [selectedHospitalIdForDetail, setSelectedHospitalIdForDetail] = useState<string>('hosp-1');
  const [selectedHospitalForNurseId, setSelectedHospitalForNurseId] = useState<string>('hosp-1');

  // Map Filter Options
  const [mapFilters, setMapFilters] = useState<MapFilterState>({
    bedType: 'all',
    showTraffic: true,
    showTravelTime: true,
    showHospitalLoad: true,
    showDataFreshness: true,
    searchQuery: '',
  });

  // Connectivity
  const [connectivity, setConnectivity] = useState<ConnectivityStatus>('online');

  // Nurse Audit records
  const [nurseAuditHistory, setNurseAuditHistory] = useState<NurseAuditRecord[]>([
    {
      id: 'aud-1',
      hospitalId: 'hosp-1',
      updatedBy: 'Nurse Sarah Chen, RN',
      updatedTime: Date.now() - 2 * 60 * 1000,
      bedType: 'icu',
      previousCount: 3,
      newCount: 4,
    },
    {
      id: 'aud-2',
      hospitalId: 'hosp-1',
      updatedBy: 'Nurse Sarah Chen, RN',
      updatedTime: Date.now() - 2 * 60 * 1000,
      bedType: 'ventilator',
      previousCount: 2,
      newCount: 3,
    },
  ]);

  // Active Holds
  const [activeHolds, setActiveHolds] = useState<BedHold[]>([
    {
      id: 'HLD-6102',
      caseId: 'CASE-4420',
      hospitalId: 'hosp-3',
      hospitalName: 'Northside Trauma Center',
      bedType: 'icu',
      specialty: 'trauma',
      ambulanceUnit: 'Rescue-02',
      requestedAt: Date.now() - 14 * 60 * 1000,
      expiresAt: Date.now() + 16 * 60 * 1000,
      status: 'ambulance_en_route' as HoldStatus,
      holdToken: '#HLD-6102-ICU',
      assignedBay: 'Resus Bay 2',
      travelMinutes: 6,
      patientSummary: 'Pediatric fall with subdural hematoma, intubated',
      lastHospitalUpdate: Date.now() - 1 * 60 * 1000,
      notesFromDispatch: 'Trauma team activated. Blood products pre-thawed.',
    },
    {
      id: 'HLD-5901',
      caseId: 'CASE-3912',
      hospitalId: 'hosp-4',
      hospitalName: 'Riverside Cardiac Institute',
      bedType: 'cardiac',
      specialty: 'cardiac',
      ambulanceUnit: 'Medic-07',
      requestedAt: Date.now() - 28 * 60 * 1000,
      expiresAt: Date.now() + 2 * 60 * 1000,
      status: 'expiring_soon' as HoldStatus,
      holdToken: '#HLD-5901-CCU',
      assignedBay: 'Cath Lab Suite A',
      travelMinutes: 2,
      patientSummary: 'Inferior STEMI with complete heart block',
      lastHospitalUpdate: Date.now() - 3 * 60 * 1000,
      notesFromDispatch: 'Dr. Kim awaiting at Ambulance Gate C.',
    },
  ]);

  // Current Pending Hold (2-Minute Countdown)
  const [currentPendingHold, setCurrentPendingHold] = useState<BedHold | null>(null);
  const [pendingSecondsRemaining, setPendingSecondsRemaining] = useState<number>(0);

  // Audio state
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Notifications
  const [notifications, setNotifications] = useState<{ id: string; title: string; time: string; type: 'info' | 'warning' | 'alert' }[]>([
    {
      id: 'notif-1',
      title: 'Northside Trauma Center verified ICU availability',
      time: '1m ago',
      type: 'info' as const,
    },
    {
      id: 'notif-2',
      title: 'Lakeside Community Hospital data is 38 min old',
      time: '4m ago',
      type: 'warning' as const,
    },
  ]);

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Activity Logs
  const [activityLogs, setActivityLogs] = useState<ActivityEvent[]>([
    {
      id: 'log-1',
      timestamp: Date.now() - 14 * 60 * 1000,
      actor: 'Northside ED Desk',
      hospitalId: 'hosp-3',
      hospitalName: 'Northside Trauma Center',
      caseId: 'CASE-4420',
      action: 'hospital_accepted',
      result: 'Bed held successfully: #HLD-6102-ICU assigned to Rescue-02',
    },
    {
      id: 'log-2',
      timestamp: Date.now() - 4 * 60 * 1000,
      actor: 'Nurse Marcus Vance, BSN',
      hospitalId: 'hosp-2',
      hospitalName: 'City General Hospital',
      action: 'bed_updated',
      result: 'Updated ICU (2 available) and Oxygen (5 available) via mobile',
    },
    {
      id: 'log-3',
      timestamp: Date.now() - 1 * 60 * 1000,
      actor: 'Nurse Elena Gomez, RN',
      hospitalId: 'hosp-3',
      hospitalName: 'Northside Trauma Center',
      action: 'bed_updated',
      result: '10-second rapid ward sync broadcast to central dispatch',
    },
  ]);

  const addActivityLog = useCallback(
    (action: ActivityEvent['action'], result: string, hospitalId?: string, caseId?: string) => {
      const hosp = hospitals.find((h) => h.id === hospitalId);
      const newEvent: ActivityEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        actor: userRole,
        hospitalId,
        hospitalName: hosp?.name,
        caseId: caseId || patientRequest.caseId,
        action,
        result,
      };
      setActivityLogs((prev) => [newEvent, ...prev.slice(0, 49)]);
    },
    [hospitals, userRole, patientRequest.caseId]
  );

  // Clock tick every 5 seconds for freshness minutes recalculation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ hospitals }));
    } catch {
      // Ignore
    }
  }, [hospitals]);

  // Compute Ranked Hospitals
  const rankedHospitals = useMemo(() => {
    return rankHospitals(hospitals, patientRequest, currentTime);
  }, [hospitals, patientRequest, currentTime]);

  // Load Mock Case
  const loadMockCase = useCallback((index: number) => {
    const preset = MOCK_CASES[index];
    if (preset) {
      setPatientRequest(preset.request);
      playTapTone();
      addActivityLog('system_alert', `Loaded demo case: ${preset.label}`, undefined, preset.request.caseId);
    }
  }, [addActivityLog]);

  // 1-Second Timer for Pending Hold
  useEffect(() => {
    if (!currentPendingHold || currentPendingHold.status !== 'pending') return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diffMs = currentPendingHold.expiresAt - now;
      const secRemaining = Math.max(0, Math.ceil(diffMs / 1000));
      setPendingSecondsRemaining(secRemaining);

      if (secRemaining <= 0) {
        // TIMEOUT OCCURRED (2-Minute SLA reached)
        clearInterval(interval);
        handleTimeout(currentPendingHold);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPendingHold]);

  const handleTimeout = useCallback((hold: BedHold) => {
    playWarningDivertTone();
    setCurrentPendingHold((prev) =>
      prev ? { ...prev, status: 'timed_out', rejectionReason: '2-Minute window elapsed without hospital response' } : null
    );

    addActivityLog(
      'request_timed_out',
      `Hold request timed out at ${hold.hospitalName}. Releasing offer and auto-escalating.`,
      hold.hospitalId,
      hold.caseId
    );

    // Add alert notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Hold timed out at ${hold.hospitalName}. Next-best hospital offered.`,
        time: 'Just now',
        type: 'alert',
      },
      ...prev,
    ]);
  }, [addActivityLog]);

  // Request Bed Hold
  const requestBedHold = useCallback((hospitalId: string, notes?: string) => {
    const target = hospitals.find((h) => h.id === hospitalId);
    if (!target) return;

    // Determine the next-best hospital
    const rankedTargetIdx = rankedHospitals.findIndex((r) => r.hospital.id === hospitalId);
    let nextBestHosp: Hospital | undefined;
    for (let i = 0; i < rankedHospitals.length; i++) {
      if (i !== rankedTargetIdx && rankedHospitals[i].score.availableMatchingBeds > 0) {
        nextBestHosp = rankedHospitals[i].hospital;
        break;
      }
    }
    if (!nextBestHosp && rankedHospitals.length > 1) {
      nextBestHosp = rankedHospitals.find((r) => r.hospital.id !== hospitalId)?.hospital;
    }

    const currentRanked = rankedHospitals.find((r) => r.hospital.id === hospitalId);
    const eta = currentRanked?.score.travelMinutes || 8;

    const newHold: BedHold = {
      id: `HLD-${Math.floor(1000 + Math.random() * 9000)}`,
      caseId: patientRequest.caseId,
      hospitalId,
      hospitalName: target.name,
      bedType: patientRequest.requiredBedType,
      specialty: patientRequest.requiredSpecialty,
      ambulanceUnit: patientRequest.ambulanceUnit,
      requestedAt: Date.now(),
      expiresAt: Date.now() + 120 * 1000, // 2 minutes
      status: 'pending',
      travelMinutes: eta,
      nextBestHospitalId: nextBestHosp?.id,
      patientSummary: `${patientRequest.patientAge}yo ${patientRequest.patientGender}, ${patientRequest.chiefComplaint}`,
      lastHospitalUpdate: target.lastUpdated,
      notesFromDispatch: notes || patientRequest.notes,
    };

    setCurrentPendingHold(newHold);
    setPendingSecondsRemaining(120);
    playHoldAlertTone();

    addActivityLog(
      'hold_requested',
      `Sent 2-minute hold request for ${patientRequest.requiredBedType.toUpperCase()} bed to ${target.name}.`,
      hospitalId,
      patientRequest.caseId
    );
  }, [hospitals, patientRequest, rankedHospitals, addActivityLog]);

  // Accept Hold
  const acceptBedHold = useCallback((holdId: string) => {
    if (!currentPendingHold || currentPendingHold.id !== holdId) return;

    const token = `#HLD-${Math.floor(1000 + Math.random() * 9000)}-${currentPendingHold.bedType.toUpperCase()}`;

    // Decrement available count and increment held count
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === currentPendingHold.hospitalId) {
          const bedObj = h.beds[currentPendingHold.bedType];
          const newAvail = Math.max(0, bedObj.available - 1);
          const newHeld = bedObj.held + 1;
          return {
            ...h,
            availableBeds: Math.max(0, h.availableBeds - 1),
            beds: {
              ...h.beds,
              [currentPendingHold.bedType]: {
                ...bedObj,
                available: newAvail,
                held: newHeld,
                lastUpdated: Date.now(),
              },
            },
            lastUpdated: Date.now(),
          };
        }
        return h;
      })
    );

    const acceptedHold: BedHold = {
      ...currentPendingHold,
      status: 'held',
      holdToken: token,
      assignedBay: 'Trauma Resus Bay 1',
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 min hold window for arrival
    };

    setCurrentPendingHold(acceptedHold);
    setActiveHolds((prev) => [acceptedHold, ...prev]);
    playAcceptedFanfare();

    addActivityLog(
      'hospital_accepted',
      `Bed held successfully: ${token} at ${currentPendingHold.hospitalName}. Inventory locked.`,
      currentPendingHold.hospitalId,
      currentPendingHold.caseId
    );
  }, [currentPendingHold, addActivityLog]);

  // Reject Hold
  const rejectBedHold = useCallback((holdId: string, reason: RejectionReason | string) => {
    if (!currentPendingHold || currentPendingHold.id !== holdId) return;

    playWarningDivertTone();
    setCurrentPendingHold((prev) =>
      prev
        ? {
            ...prev,
            status: 'rejected',
            rejectionReason: reason,
          }
        : null
    );

    addActivityLog(
      'hospital_rejected',
      `${currentPendingHold.hospitalName} rejected hold request: "${reason}". Offering next-best hospital.`,
      currentPendingHold.hospitalId,
      currentPendingHold.caseId
    );
  }, [currentPendingHold, addActivityLog]);

  // Proceed to Next Best
  const proceedToNextBestHospital = useCallback(() => {
    if (!currentPendingHold || !currentPendingHold.nextBestHospitalId) {
      setCurrentPendingHold(null);
      return;
    }
    const nextHospId = currentPendingHold.nextBestHospitalId;
    const nextHosp = hospitals.find((h) => h.id === nextHospId);
    setCurrentPendingHold(null);

    addActivityLog(
      'next_best_offered',
      `Auto-escalated hold request to next-best hospital: ${nextHosp?.name || nextHospId}.`,
      nextHospId,
      patientRequest.caseId
    );

    requestBedHold(nextHospId);
  }, [currentPendingHold, hospitals, patientRequest.caseId, addActivityLog, requestBedHold]);

  // Cancel Pending Hold
  const cancelPendingHold = useCallback(() => {
    if (currentPendingHold) {
      addActivityLog(
        'hold_released',
        `Hold request cancelled by dispatcher for ${currentPendingHold.hospitalName}.`,
        currentPendingHold.hospitalId,
        currentPendingHold.caseId
      );
    }
    setCurrentPendingHold(null);
    setPendingSecondsRemaining(0);
  }, [currentPendingHold, addActivityLog]);

  // Release Active Hold
  const releaseActiveHold = useCallback((holdId: string) => {
    const targetHold = activeHolds.find((h) => h.id === holdId);
    if (!targetHold) return;

    // Restore available bed count
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === targetHold.hospitalId) {
          const bedObj = h.beds[targetHold.bedType];
          const newAvail = bedObj.available + 1;
          const newHeld = Math.max(0, bedObj.held - 1);
          return {
            ...h,
            availableBeds: h.availableBeds + 1,
            beds: {
              ...h.beds,
              [targetHold.bedType]: {
                ...bedObj,
                available: newAvail,
                held: newHeld,
                lastUpdated: Date.now(),
              },
            },
            lastUpdated: Date.now(),
          };
        }
        return h;
      })
    );

    setActiveHolds((prev) => prev.filter((h) => h.id !== holdId));
    if (currentPendingHold?.id === holdId) {
      setCurrentPendingHold(null);
    }
    playTapTone();

    addActivityLog(
      'hold_released',
      `Active hold ${targetHold.holdToken || holdId} released at ${targetHold.hospitalName}. Bed restored to inventory.`,
      targetHold.hospitalId,
      targetHold.caseId
    );
  }, [activeHolds, currentPendingHold, addActivityLog]);

  // Update Hold Status
  const updateHoldStatus = useCallback((holdId: string, status: HoldStatus) => {
    setActiveHolds((prev) =>
      prev.map((h) => (h.id === holdId ? { ...h, status } : h))
    );
    if (status === 'arrived') {
      addActivityLog('ambulance_arrived', `Ambulance arrived at receiving hospital for case ${holdId}.`);
    }
  }, [addActivityLog]);

  // Nurse update bed count
  const updateNurseBedCount = useCallback((hospitalId: string, bedType: BedType, newCount: number) => {
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === hospitalId) {
          const prevDetail = h.beds[bedType];
          const oldCount = prevDetail.available;
          const delta = newCount - oldCount;
          const updatedDetail = {
            ...prevDetail,
            available: newCount,
            occupied: Math.max(0, prevDetail.total - newCount - prevDetail.held),
            lastUpdated: Date.now(),
          };

          // Record audit
          setNurseAuditHistory((aPrev) => [
            {
              id: `aud-${Date.now()}`,
              hospitalId,
              updatedBy: h.updatedByNurse,
              updatedTime: Date.now(),
              bedType,
              previousCount: oldCount,
              newCount,
            },
            ...aPrev.slice(0, 19),
          ]);

          return {
            ...h,
            availableBeds: Math.max(0, h.availableBeds + delta),
            beds: {
              ...h.beds,
              [bedType]: updatedDetail,
            },
            lastUpdated: Date.now(),
          };
        }
        return h;
      })
    );

    playTapTone();
    setLastSystemSyncTime(Date.now());
  }, []);

  // Execute quick nurse action
  const executeNurseQuickAction = useCallback((action: 'all_unchanged' | 'mark_icu_full' | 'emergency_opening' | 'sync_now') => {
    const hosp = hospitals.find((h) => h.id === selectedHospitalForNurseId) || hospitals[0];
    if (action === 'all_unchanged') {
      setHospitals((prev) =>
        prev.map((h) => (h.id === hosp.id ? { ...h, lastUpdated: Date.now() } : h))
      );
      addActivityLog('bed_updated', `All bed availability confirmed unchanged at ${hosp.name}.`, hosp.id);
    } else if (action === 'mark_icu_full') {
      updateNurseBedCount(hosp.id, 'icu', 0);
      addActivityLog('bed_updated', `ICU marked FULL (0 available) at ${hosp.name}.`, hosp.id);
    } else if (action === 'emergency_opening') {
      const current = hosp.beds.icu.available;
      updateNurseBedCount(hosp.id, 'icu', current + 1);
      addActivityLog('bed_updated', `Emergency ICU bed opening reported (+1) at ${hosp.name}.`, hosp.id);
    } else if (action === 'sync_now') {
      setConnectivity('syncing');
      setTimeout(() => {
        setConnectivity('online');
        setLastSystemSyncTime(Date.now());
        addActivityLog('sync_completed', `Real-time bed telemetry synchronized for ${hosp.name}.`, hosp.id);
      }, 700);
    }
  }, [hospitals, selectedHospitalForNurseId, addActivityLog, updateNurseBedCount]);

  // Audio Toggle
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      setGlobalAudioMuted(next);
      return next;
    });
  }, []);

  // Reset Demo
  const resetAllDemoData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setHospitals(INITIAL_HOSPITALS);
    setPatientRequest(MOCK_CASES[0].request);
    setCurrentPendingHold(null);
    setPendingSecondsRemaining(0);
    setActiveView('dispatch');
    addActivityLog('system_alert', 'System state reset to initial demo parameters.');
  }, [addActivityLog]);

  return (
    <BedLinkContext.Provider
      value={{
        hospitals,
        patientRequest,
        setPatientRequest,
        loadMockCase,
        rankedHospitals,
        activeView,
        setActiveView,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        userRole,
        setUserRole,
        selectedHospitalIdForDetail,
        setSelectedHospitalIdForDetail,
        selectedHospitalForNurseId,
        setSelectedHospitalForNurseId,
        mapFilters,
        setMapFilters,
        activeHolds,
        currentPendingHold,
        pendingSecondsRemaining,
        requestBedHold,
        acceptBedHold,
        rejectBedHold,
        cancelPendingHold,
        releaseActiveHold,
        updateHoldStatus,
        proceedToNextBestHospital,
        updateNurseBedCount,
        executeNurseQuickAction,
        nurseAuditHistory,
        connectivity,
        setConnectivity,
        activityLogs,
        addActivityLog,
        currentTime,
        lastSystemSyncTime,
        isMuted,
        toggleMute,
        resetAllDemoData,
        notifications,
        clearNotification,
      }}
    >
      {children}
    </BedLinkContext.Provider>
  );
};

export function useBedLink() {
  const context = useContext(BedLinkContext);
  if (!context) {
    throw new Error('useBedLink must be used within BedLinkProvider');
  }
  return context;
}
