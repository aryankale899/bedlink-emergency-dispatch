import React, { useState } from 'react';
import { useBedLink } from '../context/BedLinkContext';
import { RealWorldMap } from './RealWorldMap';
import { BedType } from '../types';
import { BED_LABELS } from '../data/mockData';
import { 
  Building2, 
  Activity, 
  Wind, 
  Gauge, 
  Clock, 
  ShieldAlert, 
  MapPin, 
  Layers, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export const LiveMapSummary: React.FC = () => {
  const { 
    hospitals, 
    patientRequest, 
    setPatientRequest,
    activeHolds, 
    currentTime, 
    requestBedHold,
    setSelectedHospitalIdForDetail, 
    setActiveView 
  } = useBedLink();
  const [selectedRegion, setSelectedRegion] = useState<string>('All Regions');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('hosp-1');

  // Aggregated regional figures
  const totalHospitals = hospitals.length;
  const totalIcuAvail = hospitals.reduce((sum, h) => sum + h.beds.icu.available, 0);
  const totalVentAvail = hospitals.reduce((sum, h) => sum + h.beds.ventilator.available, 0);
  const totalOxygenAvail = hospitals.reduce((sum, h) => sum + h.beds.oxygen.available, 0);
  
  const staleHospitals = hospitals.filter((h) => {
    const ageMins = Math.floor((currentTime - h.lastUpdated) / 60000);
    return ageMins > 15;
  });

  const regions = ['All Regions', 'Central Metro', 'North Metro', 'East Metro', 'South Metro', 'West Metro'];

  const filteredByRegion = selectedRegion === 'All Regions' 
    ? hospitals 
    : hospitals.filter((h) => h.region === selectedRegion);

  const regionTotalCapacity = filteredByRegion.reduce((sum, h) => sum + h.totalBeds, 0);
  const regionAvailableBeds = filteredByRegion.reduce((sum, h) => sum + h.availableBeds, 0);
  const regionAvgLoad = Math.round(
    filteredByRegion.reduce((sum, h) => sum + h.currentLoad, 0) / (filteredByRegion.length || 1)
  );

  const oldestUpdateMins = Math.max(
    ...filteredByRegion.map((h) => Math.floor((currentTime - h.lastUpdated) / 60000))
  );
  const freshestUpdateMins = Math.min(
    ...filteredByRegion.map((h) => Math.floor((currentTime - h.lastUpdated) / 60000))
  );

  return (
    <div className="py-4 px-3 sm:px-6 max-w-[1720px] mx-auto space-y-5">
      {/* Top Regional Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Hospitals Online</span>
          <div className="flex items-baseline justify-between mt-1">
            <strong className="text-2xl font-black text-slate-900 tabular-nums">{totalHospitals}</strong>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">100% Mesh</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Central District</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total ICU Available</span>
          <div className="flex items-baseline justify-between mt-1">
            <strong className="text-2xl font-black text-blue-700 tabular-nums">{totalIcuAvail}</strong>
            <span className="text-[10px] text-slate-400">beds</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Level 1-3 Facilities</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Ventilators Open</span>
          <div className="flex items-baseline justify-between mt-1">
            <strong className="text-2xl font-black text-emerald-700 tabular-nums">{totalVentAvail}</strong>
            <span className="text-[10px] text-slate-400">beds</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Invasive Respiratory</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Oxygen HFNC Beds</span>
          <div className="flex items-baseline justify-between mt-1">
            <strong className="text-2xl font-black text-sky-700 tabular-nums">{totalOxygenAvail}</strong>
            <span className="text-[10px] text-slate-400">beds</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">High-Flow Titration</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Stale Data Warning</span>
          <div className="flex items-baseline justify-between mt-1">
            <strong className={`text-2xl font-black tabular-nums ${staleHospitals.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {staleHospitals.length}
            </strong>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">&gt;15 min old</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Needs Verification</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Bed Holds</span>
          <div className="flex items-baseline justify-between mt-1">
            <strong className="text-2xl font-black text-purple-700 tabular-nums">{activeHolds.length}</strong>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">Guaranteed</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Locked for Ambulances</span>
        </div>
      </div>

      {/* Main Map & Regional Analytics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left 8 Cols: Map Canvas */}
        <div className="lg:col-span-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Metropolitan Utilization & Bed Availability Map
              </h2>
              <p className="text-xs text-slate-500">
                Click any hospital marker to inspect capacity, bed availability, and transit routing.
              </p>
            </div>

            {/* Region Selector Pills */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-full">
              {regions.map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedRegion === reg
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          {/* Real-World Leaflet Map */}
          <RealWorldMap
            hospitals={filteredByRegion}
            patientRequest={patientRequest}
            selectedHospitalId={selectedHospitalId}
            onSelectHospital={(h) => setSelectedHospitalId(h.id)}
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
            heightClass="h-[600px]"
            interactiveRelocate={true}
          />
        </div>

        {/* Right 4 Cols: Regional Inspector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{selectedRegion} Overview</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-400 font-mono">
                {filteredByRegion.length} Hospitals
              </span>
            </div>

            {/* Regional Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Capacity</span>
                <strong className="text-base font-black text-slate-900 tabular-nums">{regionTotalCapacity} Beds</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Beds</span>
                <strong className="text-base font-black text-emerald-700 tabular-nums">{regionAvailableBeds} Open</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Average Utilization</span>
                <strong className="text-base font-black text-slate-900 tabular-nums">{regionAvgLoad}%</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Telemetry Freshness</span>
                <strong className="text-xs font-bold text-slate-800 block truncate">
                  {freshestUpdateMins}m to {oldestUpdateMins}m
                </strong>
              </div>
            </div>

            {/* Hospitals in this region */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Facilities in Selected Region (Click to Route):
              </span>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filteredByRegion.map((hosp) => {
                  const age = Math.floor((currentTime - hosp.lastUpdated) / 60000);
                  const isStale = age > 15;
                  const isHighLoad = hosp.currentLoad >= 85;
                  const isSelected = selectedHospitalId === hosp.id;

                  return (
                    <div
                      key={hosp.id}
                      onClick={() => setSelectedHospitalId(hosp.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer text-xs ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <strong className="font-extrabold text-slate-900 block">{hosp.name}</strong>
                          <span className="text-[11px] text-slate-500">{hosp.traumaLevel}</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isStale ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {age}m ago
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                        <span className="text-emerald-700 font-bold">
                          {hosp.availableBeds} beds open
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={isHighLoad ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                            {hosp.currentLoad}% Load
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              requestBedHold(hosp.id);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] cursor-pointer"
                          >
                            Hold Bed
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
