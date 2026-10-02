import React from 'react';
import { useBedLink } from '../context/BedLinkContext';
import { BedType } from '../types';
import { BED_LABELS, SPECIALTY_LABELS } from '../data/mockData';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Radio, 
  Clock, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Navigation, 
  ShieldCheck, 
  Flame, 
  Wind, 
  Heart,
  ChevronRight,
  PhoneCall
} from 'lucide-react';

export const HospitalDetailsScreen: React.FC = () => {
  const { 
    hospitals, 
    selectedHospitalIdForDetail, 
    setSelectedHospitalIdForDetail, 
    currentTime,
    requestBedHold,
    activeHolds
  } = useBedLink();

  const hospital = hospitals.find((h) => h.id === selectedHospitalIdForDetail) || hospitals[0];
  const dataAgeMins = Math.max(0, Math.floor((currentTime - hospital.lastUpdated) / 60000));

  const hospitalHolds = activeHolds.filter((h) => h.hospitalId === hospital.id && h.status !== 'rejected');

  const bedSections: BedType[] = [
    'icu',
    'ventilator',
    'oxygen',
    'general',
    'cardiac',
    'burn',
    'stroke',
    'pediatric',
  ];

  return (
    <div className="py-4 px-3 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Hospital Selector */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Hospital Capacity Profile
              </span>
              <span className="text-xs text-slate-500">{hospital.traumaLevel}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {hospital.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {hospital.address}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {hospital.phone}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-mono text-emerald-800 font-bold">
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
                Radio: {hospital.emergencyRadioChannel}
              </span>
            </div>
          </div>

          {/* Switcher Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Select Facility:</span>
            <select
              value={selectedHospitalIdForDetail}
              onChange={(e) => setSelectedHospitalIdForDetail(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 p-2 cursor-pointer focus:ring-1 focus:ring-blue-500"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${
                hospital.edBypassStatus === 'open' ? 'bg-emerald-500' : hospital.edBypassStatus === 'caution' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
              <span className="font-bold text-slate-800">
                ED Status: {hospital.edBypassStatus.toUpperCase()}
              </span>
            </div>
            <span>·</span>
            <span className="text-slate-500">
              Hours: <strong className="text-slate-700">{hospital.operatingHours}</strong>
            </span>
          </div>

          <div className="text-slate-500">
            Last Ward Sync: <strong className="text-slate-800">{dataAgeMins === 0 ? 'Just now' : `${dataAgeMins} minutes ago`}</strong> ({hospital.updatedByNurse})
          </div>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Beds</span>
          <strong className="text-2xl font-black text-slate-900 tabular-nums">{hospital.totalBeds}</strong>
          <span className="text-[10px] text-slate-500 block">Licensed Inpatient</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Beds</span>
          <strong className="text-2xl font-black text-emerald-700 tabular-nums">{hospital.availableBeds}</strong>
          <span className="text-[10px] text-emerald-700 font-semibold block">Immediate Intake</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Current ED Load</span>
          <strong className={`text-2xl font-black tabular-nums ${
            hospital.currentLoad >= 85 ? 'text-rose-600' : hospital.currentLoad >= 70 ? 'text-amber-600' : 'text-slate-900'
          }`}>
            {hospital.currentLoad}%
          </strong>
          <span className="text-[10px] text-slate-500 block">{hospital.edDoctorsOnDuty} Attending MDs</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Bed Holds</span>
          <strong className="text-2xl font-black text-blue-700 tabular-nums">{hospitalHolds.length}</strong>
          <span className="text-[10px] text-blue-700 font-semibold block">Locked for EMS</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Data Freshness</span>
          <strong className={`text-2xl font-black tabular-nums ${
            dataAgeMins <= 5 ? 'text-emerald-700' : dataAgeMins > 20 ? 'text-amber-600' : 'text-slate-800'
          }`}>
            {dataAgeMins}m
          </strong>
          <span className="text-[10px] text-slate-500 block">{dataAgeMins <= 5 ? 'Fresh verified' : 'Requires verification'}</span>
        </div>
      </div>

      {/* Bed Utilization Sections with Horizontal Bars */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Departmental Bed Utilization Breakdown
            </h2>
            <p className="text-xs text-slate-500">
              Detailed tracking by care acuity level. Color legend: Green (Available), Blue (Held), Gray (Occupied).
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 hidden sm:flex">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Available
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-blue-600" /> Held for EMS
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-slate-400" /> Occupied
            </span>
          </div>
        </div>

        {/* Bed Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bedSections.map((type) => {
            const bed = hospital.beds[type];
            const info = BED_LABELS[type];
            const total = bed.total;
            const available = bed.available;
            const held = bed.held;
            const occupied = Math.max(0, total - available - held);
            const utilPercent = total > 0 ? Math.round(((occupied + held) / total) * 100) : 0;
            const bedAge = Math.max(0, Math.floor((currentTime - bed.lastUpdated) / 60000));

            const availWidth = total > 0 ? (available / total) * 100 : 0;
            const heldWidth = total > 0 ? (held / total) * 100 : 0;
            const occWidth = total > 0 ? (occupied / total) * 100 : 0;

            let badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            if (total === 0) {
              badgeColor = 'bg-slate-100 text-slate-400 border-slate-200';
            } else if (available === 0) {
              badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
            } else if (available <= 2) {
              badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
            }

            return (
              <div key={type} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900">{info.label}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}>
                        {total === 0 ? 'Not Offered' : available === 0 ? 'Full' : `${available} Open`}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{info.description}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {total === 0 ? 'N/A' : `${utilPercent}% Utilized`}
                    </span>
                  </div>
                </div>

                {/* Horizontal Multi-Segment Utilization Bar */}
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                  {/* Occupied */}
                  <div className="bg-slate-400 h-full" style={{ width: `${occWidth}%` }} title={`Occupied: ${occupied}`} />
                  {/* Held */}
                  <div className="bg-blue-600 h-full" style={{ width: `${heldWidth}%` }} title={`Held: ${held}`} />
                  {/* Available */}
                  <div className="bg-emerald-500 h-full" style={{ width: `${availWidth}%` }} title={`Available: ${available}`} />
                </div>

                {/* Quantitative Figures */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Capacity</span>
                    <strong className="text-slate-800 tabular-nums">{total}</strong>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Occupied</span>
                    <strong className="text-slate-800 tabular-nums">{occupied}</strong>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-blue-700 uppercase font-bold block">Held</span>
                    <strong className="text-blue-700 tabular-nums">{held}</strong>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-emerald-700 uppercase font-bold block">Available</span>
                    <strong className="text-emerald-700 font-extrabold tabular-nums">{available}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Last synced: {bedAge}m ago</span>
                  {available > 0 && (
                    <button
                      onClick={() => requestBedHold(hospital.id)}
                      className="text-blue-700 hover:text-blue-800 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Request Hold</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operational Infrastructure Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Logistics & Access */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900">Emergency Logistics & Arrival Access</h3>
          
          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Ambulance Entrance</span>
                <span className="text-slate-600">{hospital.ambulanceEntrance}</span>
              </div>
              <Navigation className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Helipad Capability</span>
                <span className="text-slate-600">{hospital.helipad ? 'Active Level 1 Rooftop Deck (Ready)' : 'No Helipad Facility'}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                hospital.helipad ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {hospital.helipad ? 'Available' : 'None'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Emergency Blood Bank</span>
                <span className="text-slate-600">{hospital.bloodBank ? 'O-Neg Massive Transfusion Protocol Ready' : 'Limited Stock'}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Specialty Services */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Verified Specialty Services</h3>
            <span className="text-[10px] text-slate-400 font-mono">Accredited Centers</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {hospital.specialtyLabels.map((lbl, idx) => (
              <span key={idx} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-900 border border-purple-200">
                ✦ {lbl}
              </span>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Isolation Rooms:</span>
              <strong className="text-slate-900 font-bold">{hospital.isolationRooms} Negative Pressure Bays</strong>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>ED Charge Nurse Station:</span>
              <strong className="text-slate-900 font-mono">{hospital.phone} (Ext 401)</strong>
            </div>
          </div>

          <button
            onClick={() => alert(`Calling ${hospital.name} Emergency Desk: ${hospital.phone}`)}
            className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Contact Nurse Station Directly</span>
          </button>
        </div>
      </div>
    </div>
  );
};
