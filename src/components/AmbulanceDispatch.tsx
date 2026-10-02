import React, { useState } from 'react';
import { useBedLink } from '../context/BedLinkContext';
import { RealWorldMap } from './RealWorldMap';
import { BedType, SpecialtyType, PatientCondition, Hospital } from '../types';
import { BED_LABELS, SPECIALTY_LABELS, MOCK_CASES } from '../data/mockData';
import { 
  Activity, 
  MapPin, 
  Clock, 
  Building2, 
  ChevronRight, 
  ShieldCheck, 
  Radio, 
  Ambulance, 
  Heart, 
  Search, 
  Map as MapIcon, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Wind,
  Navigation,
  RefreshCw,
  SlidersHorizontal,
  Compass
} from 'lucide-react';

export const AmbulanceDispatch: React.FC = () => {
  const { 
    patientRequest, 
    setPatientRequest, 
    loadMockCase, 
    rankedHospitals, 
    requestBedHold,
    currentTime
  } = useBedLink();

  // Segregated Workflow Tabs: 'intake' | 'results' | 'map'
  const [dispatchTab, setDispatchTab] = useState<'intake' | 'results' | 'map'>('intake');
  const [isSearchingAnimation, setIsSearchingAnimation] = useState<boolean>(false);
  const [selectedHospitalForMap, setSelectedHospitalForMap] = useState<Hospital | null>(null);

  const handleBedTypeChange = (type: BedType) => {
    setPatientRequest((prev) => ({ ...prev, requiredBedType: type }));
  };

  const handleConditionChange = (cond: PatientCondition) => {
    setPatientRequest((prev) => ({ ...prev, condition: cond }));
  };

  const handleSpecialtyChange = (spec: SpecialtyType) => {
    setPatientRequest((prev) => ({ ...prev, requiredSpecialty: spec }));
  };

  // Trigger searching animation then transition to results
  const handleFindMatchingHospitals = () => {
    setIsSearchingAnimation(true);
    setTimeout(() => {
      setIsSearchingAnimation(false);
      setDispatchTab('results');
    }, 1200);
  };

  const handleViewOnMap = (hospital: Hospital) => {
    setSelectedHospitalForMap(hospital);
    setDispatchTab('map');
  };

  const nowFormatted = new Date().toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="py-4 px-3 sm:px-6 max-w-5xl mx-auto space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Ambulance CAD Dispatch
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Case: <strong className="text-slate-900">{patientRequest.caseId}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Emergency Bed Navigator
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Unit: <strong className="text-slate-800">{patientRequest.ambulanceUnit}</strong></span>
            <span>·</span>
            <span>{nowFormatted}</span>
          </div>
        </div>

        {/* Quick Scenario Preset Loader */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Presets:
          </span>
          {MOCK_CASES.map((c, i) => (
            <button
              key={c.label}
              onClick={() => {
                loadMockCase(i);
                setDispatchTab('intake');
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
              title={c.label}
            >
              {c.request.requiredSpecialty === 'cardiac' && '❤️ Cardiac'}
              {c.request.requiredSpecialty === 'trauma' && '🚨 Trauma'}
              {c.request.requiredSpecialty === 'burns' && '🔥 Burns'}
              {c.request.requiredBedType === 'oxygen' && '💨 Oxygen'}
            </button>
          ))}
        </div>
      </div>

      {/* Segregated Navigation Tabs */}
      <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <div className="grid grid-cols-3 gap-1.5 w-full">
          {/* Tab 1: Patient Intake */}
          <button
            onClick={() => setDispatchTab('intake')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              dispatchTab === 'intake'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>1. Patient Intake</span>
          </button>

          {/* Tab 2: Matching Hospitals */}
          <button
            onClick={() => setDispatchTab('results')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              dispatchTab === 'results'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>2. Matching Hospitals</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-extrabold hidden sm:inline">
              {rankedHospitals.length}
            </span>
          </button>

          {/* Tab 3: Live Map Tracking */}
          <button
            onClick={() => setDispatchTab('map')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              dispatchTab === 'map'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>3. Real-World Map</span>
          </button>
        </div>
      </div>

      {/* ================= SEARCHING / SCANNING ANIMATION ================= */}
      {isSearchingAnimation && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-lg space-y-4 animate-fadeIn">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
            <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-600 flex items-center justify-center text-blue-600">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Scanning Regional Hospital Network...
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Connecting to 8 trauma centers, verifying live ICU & ventilator beds, and calculating traffic-adjusted driving routes.
            </p>
          </div>
        </div>
      )}

      {/* ================= TAB 1: PATIENT INTAKE (MOBILE APP STYLE) ================= */}
      {!isSearchingAnimation && dispatchTab === 'intake' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-5 animate-fadeIn">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Step 1</span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
              Enter Patient Requirements
            </h2>
            <p className="text-xs text-slate-500">
              Configure triage acuity and required equipment to find the nearest matching available bed.
            </p>
          </div>

          {/* Form Section 1: Patient Condition */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Patient Clinical Condition:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['critical', 'urgent', 'stable'] as PatientCondition[]).map((cond) => {
                const isSelected = patientRequest.condition === cond;
                return (
                  <button
                    key={cond}
                    onClick={() => handleConditionChange(cond)}
                    className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? cond === 'critical'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : cond === 'urgent'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {cond === 'critical' && '🚨 Critical (Code Red)'}
                    {cond === 'urgent' && '⚠️ Urgent'}
                    {cond === 'stable' && '🟢 Stable Transfer'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Section 2: Required Bed Type */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Required Bed & Equipment:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['icu', 'ventilator', 'oxygen', 'general'] as BedType[]).map((type) => {
                const isSelected = patientRequest.requiredBedType === type;
                const info = BED_LABELS[type];
                return (
                  <button
                    key={type}
                    onClick={() => handleBedTypeChange(type)}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-600/30'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="font-extrabold text-sm">{info.short}</div>
                    <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                      {type === 'icu' && '1:1 ICU Nursing'}
                      {type === 'ventilator' && 'Invasive Vent'}
                      {type === 'oxygen' && 'High-Flow O2'}
                      {type === 'general' && 'Acute Floor'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Section 3: Specialty Required */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Specialty Department Needed:
            </label>
            <select
              value={patientRequest.requiredSpecialty}
              onChange={(e) => handleSpecialtyChange(e.target.value as SpecialtyType)}
              className="w-full text-sm font-bold bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 cursor-pointer focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">None (General Critical Care)</option>
              <option value="cardiac">Cardiac STEMI / Cath Lab</option>
              <option value="trauma">Trauma Resuscitation Suite</option>
              <option value="burns">Burn Specialty Center</option>
              <option value="stroke">Stroke Interventional Unit</option>
              <option value="pediatric">Pediatric / Neonatal ICU</option>
              <option value="neurology">Neurology / Neurosurgery</option>
            </select>
          </div>

          {/* Form Section 4: Incident Location */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Ambulance Incident Pickup Location:
            </label>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-2.5">
              <MapPin className="w-5 h-5 text-rose-500 shrink-0" />
              <div className="flex-1">
                <input
                  type="text"
                  value={patientRequest.location.name}
                  onChange={(e) =>
                    setPatientRequest((prev) => ({
                      ...prev,
                      location: { ...prev.location, name: e.target.value },
                    }))
                  }
                  className="w-full text-xs sm:text-sm font-bold bg-transparent border-0 outline-none text-slate-900 p-0"
                />
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Lat: {patientRequest.location.lat.toFixed(4)}, Lng: {patientRequest.location.lng.toFixed(4)} · GPS Locked
                </div>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              onClick={handleFindMatchingHospitals}
              className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <Search className="w-5 h-5" />
              <span>FIND MATCHING HOSPITALS</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>
            <div className="text-center text-[11px] text-slate-400 mt-2">
              Queries real-time hospital mesh for verified available beds and travel times
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: CLEAN MATCHING HOSPITALS ================= */}
      {!isSearchingAnimation && dispatchTab === 'results' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Subheader */}
          <div className="flex items-center justify-between px-1">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Step 2</span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Recommended Hospitals
              </h2>
              <p className="text-xs text-slate-500">
                Sorted by travel time and matching available {BED_LABELS[patientRequest.requiredBedType].short} beds.
              </p>
            </div>

            <button
              onClick={() => setDispatchTab('intake')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Edit Needs
            </button>
          </div>

          {/* Clean Focused Hospital Cards List */}
          <div className="space-y-3">
            {rankedHospitals.map(({ hospital, score, rank }) => {
              const reqType = patientRequest.requiredBedType;
              const availCount = hospital.beds[reqType]?.available || 0;
              const hasBed = availCount > 0;
              const isFirst = rank === 1 && hasBed;
              const dataAge = Math.max(0, Math.floor((currentTime - hospital.lastUpdated) / 60000));

              return (
                <div
                  key={hospital.id}
                  className={`bg-white rounded-3xl p-5 border transition-all duration-200 hover:shadow-md ${
                    isFirst
                      ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                      : hasBed
                      ? 'border-slate-200'
                      : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Name and Bed Availability */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            isFirst ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          #{rank}
                        </span>
                        <div>
                          <h3 className="text-lg font-black text-slate-900 tracking-tight">
                            {hospital.name}
                          </h3>
                          <div className="text-xs text-slate-500">
                            {hospital.address} · <span className="font-semibold">{hospital.traumaLevel}</span>
                          </div>
                        </div>
                      </div>

                      {/* Required Simple Elements: Name, Beds Available, Travel Distance, Reaching Time */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {/* Beds Available */}
                        <div className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 ${
                          hasBed
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${hasBed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span>
                            {hasBed
                              ? `${availCount} ${BED_LABELS[reqType].short} Bed${availCount !== 1 ? 's' : ''} Available`
                              : `0 ${BED_LABELS[reqType].short} Beds Available`}
                          </span>
                        </div>

                        {/* Estimated Driving Distance */}
                        <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{score.distanceKm} km drive</span>
                        </div>

                        {/* Estimated Reaching Time (ETA) */}
                        <div className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-extrabold flex items-center gap-1.5">
                          <Ambulance className="w-3.5 h-3.5 text-blue-600" />
                          <span>~{score.travelMinutes} mins ETA</span>
                        </div>

                        {/* Data Freshness */}
                        <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 text-slate-500 border border-slate-200 text-[11px] font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Updated {dataAge === 0 ? 'just now' : `${dataAge} min ago`}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => handleViewOnMap(hospital)}
                        className="h-11 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Compass className="w-4 h-4 text-slate-500" />
                        <span>View on Map</span>
                      </button>

                      <button
                        onClick={() => requestBedHold(hospital.id)}
                        disabled={!hasBed || hospital.edBypassStatus === 'diverting'}
                        className={`h-11 px-5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          hasBed && hospital.edBypassStatus !== 'diverting'
                            ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-sm shadow-blue-600/20'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <span>Request Hold</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: DEDICATED REAL-WORLD MAP TRACKING ================= */}
      {!isSearchingAnimation && dispatchTab === 'map' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Step 3</span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Live Real-World Navigation Map
              </h2>
              <p className="text-xs text-slate-500">
                Interactive street map showing ambulance transit route, hospital pins, and live capacity.
              </p>
            </div>

            {/* Target Hospital Selector on Map */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Destination:</span>
              <select
                value={selectedHospitalForMap?.id || rankedHospitals[0]?.hospital.id}
                onChange={(e) => {
                  const match = rankedHospitals.find((r) => r.hospital.id === e.target.value);
                  if (match) setSelectedHospitalForMap(match.hospital);
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 p-2 cursor-pointer focus:ring-1 focus:ring-blue-500"
              >
                {rankedHospitals.map(({ hospital, score }) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name} ({score.travelMinutes} mins)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Leaflet Real-World Map */}
          <RealWorldMap
            hospitals={rankedHospitals.map((r) => r.hospital)}
            patientRequest={patientRequest}
            selectedHospitalId={selectedHospitalForMap?.id || rankedHospitals[0]?.hospital.id}
            onSelectHospital={(h) => setSelectedHospitalForMap(h)}
            onRequestHold={(id) => requestBedHold(id)}
            onUpdateAmbulanceLocation={(lat, lng, addressName) => {
              setPatientRequest((prev) => ({
                ...prev,
                location: {
                  ...prev.location,
                  lat,
                  lng,
                  name: addressName,
                }
              }));
            }}
            heightClass="h-[560px]"
            interactiveRelocate={true}
          />

          {/* Map Footer Bar */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 text-slate-700">
              <span className="flex items-center gap-1 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                Ambulance: {patientRequest.ambulanceUnit}
              </span>
              <span>·</span>
              <span className="font-semibold text-slate-600">
                Route: {selectedHospitalForMap?.name || rankedHospitals[0]?.hospital.name}
              </span>
            </div>

            <button
              onClick={() => requestBedHold(selectedHospitalForMap?.id || rankedHospitals[0]?.hospital.id)}
              className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Request 2-Min Bed Hold for this Route</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
