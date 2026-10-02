import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Hospital, PatientRequest } from '../types';
import { BED_LABELS } from '../data/mockData';
import { 
  Layers, 
  Navigation, 
  Maximize2, 
  MapPin, 
  Ambulance, 
  Building2, 
  Phone, 
  Clock, 
  Crosshair, 
  ShieldAlert,
  Compass,
  Eye,
  Activity
} from 'lucide-react';

interface RealWorldMapProps {
  hospitals: Hospital[];
  patientRequest: PatientRequest;
  selectedHospitalId?: string;
  onSelectHospital?: (hospital: Hospital) => void;
  onRequestHold?: (hospitalId: string) => void;
  onUpdateAmbulanceLocation?: (lat: number, lng: number, addressName: string) => void;
  heightClass?: string;
  interactiveRelocate?: boolean;
}

type MapTileStyle = 'streets' | 'satellite' | 'clean' | 'dark';

export const RealWorldMap: React.FC<RealWorldMapProps> = ({
  hospitals,
  patientRequest,
  selectedHospitalId,
  onSelectHospital,
  onRequestHold,
  onUpdateAmbulanceLocation,
  heightClass = 'h-[580px]',
  interactiveRelocate = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const labelLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const trafficLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeTileStyle, setActiveTileStyle] = useState<MapTileStyle>('streets');
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [isRelocatingMode, setIsRelocatingMode] = useState<boolean>(false);
  const [hoveredHospital, setHoveredHospital] = useState<Hospital | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [patientRequest.location.lat, patientRequest.location.lng],
      zoom: 13,
      zoomControl: false, // We'll add custom positioned zoom control
      attributionControl: true,
    });

    // Custom top-right zoom control
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    markersLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    trafficLayerRef.current = L.layerGroup().addTo(map);

    // Initial resize invalidation to prevent grey tile rendering
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    // ResizeObserver for reliable responsive tab switches
    let resizeObserver: ResizeObserver | null = null;
    if (window.ResizeObserver && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timer);
      if (resizeObserver) resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layers when activeTileStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
      baseTileLayerRef.current = null;
    }
    if (labelLayerRef.current) {
      map.removeLayer(labelLayerRef.current);
      labelLayerRef.current = null;
    }

    if (activeTileStyle === 'streets') {
      // OpenStreetMap Real-World Standard Street Map
      baseTileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
    } else if (activeTileStyle === 'satellite') {
      // Real Satellite Imagery from Esri World Imagery + Labels
      baseTileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 18,
        }
      ).addTo(map);

      // Add high-contrast road and label overlay over satellite
      labelLayerRef.current = L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          opacity: 0.85,
        }
      ).addTo(map);
    } else if (activeTileStyle === 'clean') {
      // Carto Voyager clean clinical view
      baseTileLayerRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);
    } else if (activeTileStyle === 'dark') {
      // Dark Matter tactical night dispatch view
      baseTileLayerRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);
    }
  }, [activeTileStyle]);

  // Click handler on map to set ambulance incident pickup location
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!isRelocatingMode) return;
      const { lat, lng } = e.latlng;
      const addressName = `Incident Scene (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      if (onUpdateAmbulanceLocation) {
        onUpdateAmbulanceLocation(lat, lng, addressName);
      }
      setIsRelocatingMode(false);
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isRelocatingMode, onUpdateAmbulanceLocation]);

  // Update Markers, Route & Traffic
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const routeLayer = routeLayerRef.current;
    const trafficLayer = trafficLayerRef.current;
    if (!map || !markersLayer || !routeLayer || !trafficLayer) return;

    markersLayer.clearLayers();
    routeLayer.clearLayers();
    trafficLayer.clearLayers();

    const reqType = patientRequest.requiredBedType;

    // 1. Ambulance Marker with pulsating ring and drag support
    const ambHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute -inset-2.5 rounded-full bg-blue-500/30 animate-ping"></div>
        <div style="
          background: #1d4ed8;
          color: white;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          border: 3px solid white;
          box-shadow: 0 4px 16px rgba(29, 78, 216, 0.5);
          cursor: grab;
        ">
          🚑
        </div>
      </div>
    `;

    const ambulanceIcon = L.divIcon({
      html: ambHtml,
      className: 'custom-ambulance-div-icon',
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    });

    const ambMarker = L.marker([patientRequest.location.lat, patientRequest.location.lng], {
      icon: ambulanceIcon,
      draggable: true,
      title: `${patientRequest.ambulanceUnit} - Drag to reposition`,
    }).addTo(markersLayer);

    ambMarker.on('dragend', (e) => {
      const marker = e.target as L.Marker;
      const pos = marker.getLatLng();
      if (onUpdateAmbulanceLocation) {
        onUpdateAmbulanceLocation(pos.lat, pos.lng, `Pickup: ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`);
      }
    });

    ambMarker.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px; min-width: 180px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 16px;">🚑</span>
          <strong style="color: #0f172a; font-size: 13px;">${patientRequest.ambulanceUnit}</strong>
        </div>
        <div style="font-size: 11px; color: #64748b; margin-top: 3px;">
          ${patientRequest.location.name}
        </div>
        <div style="font-size: 10px; font-family: monospace; color: #94a3b8; margin-top: 2px;">
          ${patientRequest.location.lat.toFixed(4)}, ${patientRequest.location.lng.toFixed(4)}
        </div>
        <div style="background: #eff6ff; color: #1d4ed8; font-weight: bold; font-size: 11px; padding: 4px 8px; border-radius: 6px; margin-top: 6px;">
          Acuity: ${patientRequest.condition.toUpperCase()} · Needs ${BED_LABELS[reqType].short}
        </div>
      </div>
    `);

    // 2. Hospital Markers
    let targetHospitalForRoute: Hospital | undefined;

    hospitals.forEach((hospital) => {
      const avail = hospital.beds[reqType]?.available || 0;
      const isSelected = selectedHospitalId === hospital.id;
      if (isSelected) {
        targetHospitalForRoute = hospital;
      }

      // Real-World Stoplight Pin Coloring
      let pinBg = '#16a34a'; // Green - Available
      let statusText = 'Available';
      if (avail === 0 || hospital.edBypassStatus === 'diverting') {
        pinBg = '#dc2626'; // Red - Diverting / Full
        statusText = hospital.edBypassStatus === 'diverting' ? 'Diverting' : 'Full';
      } else if (avail === 1 || hospital.currentLoad > 80) {
        pinBg = '#d97706'; // Amber - Limited / High Load
        statusText = 'Limited';
      }

      const hospHtml = `
        <div style="
          position: relative;
          background: ${pinBg};
          color: white;
          width: ${isSelected ? '46px' : '38px'};
          height: ${isSelected ? '46px' : '38px'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: ${isSelected ? '16px' : '14px'};
          border: 3px solid white;
          box-shadow: ${isSelected ? '0 0 0 4px rgba(37,99,235,0.4), 0 8px 20px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.25)'};
          transition: transform 0.15s ease-out;
          cursor: pointer;
        ">
          H
          <span style="
            position: absolute;
            top: -6px;
            right: -6px;
            background: #0f172a;
            color: white;
            font-size: 10px;
            font-weight: 800;
            padding: 1px 5px;
            border-radius: 9999px;
            border: 1.5px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">
            ${avail}
          </span>
        </div>
      `;

      const hospIcon = L.divIcon({
        html: hospHtml,
        className: 'custom-hospital-marker-icon',
        iconSize: [isSelected ? 46 : 38, isSelected ? 46 : 38],
        iconAnchor: [isSelected ? 23 : 19, isSelected ? 23 : 19],
      });

      const marker = L.marker([hospital.coordinates.lat, hospital.coordinates.lng], {
        icon: hospIcon,
        title: hospital.name,
      }).addTo(markersLayer);

      // Create rich real-world popup
      const popupDiv = document.createElement('div');
      popupDiv.style.fontFamily = 'Plus Jakarta Sans, sans-serif';
      popupDiv.style.minWidth = '240px';
      popupDiv.style.padding = '4px';

      popupDiv.innerHTML = `
        <div style="display: flex; align-items: start; justify-content: space-between; gap: 8px;">
          <div>
            <div style="font-weight: 800; font-size: 14px; color: #0f172a; line-height: 1.2;">
              ${hospital.name}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
              ${hospital.address}
            </div>
          </div>
          <span style="font-size: 9px; font-weight: bold; background: #e2e8f0; color: #334155; padding: 2px 6px; rounded-md: 4px; white-space: nowrap;">
            ${hospital.traumaLevel}
          </span>
        </div>

        <div style="margin-top: 8px; padding: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
            <span style="color: #475569; font-weight: 600;">${BED_LABELS[reqType].short} Status:</span>
            <strong style="color: ${avail > 0 ? '#16a34a' : '#dc2626'};">
              ${avail} bed${avail !== 1 ? 's' : ''} (${statusText})
            </strong>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b; margin-top: 4px;">
            <span>ED Load: <strong>${hospital.currentLoad}%</strong></span>
            <span>Radio: <strong>${hospital.emergencyRadioChannel}</strong></span>
          </div>
          <div style="font-size: 11px; color: #0369a1; margin-top: 4px;">
            📞 Direct Line: <strong>${hospital.phone}</strong>
          </div>
        </div>

        <div style="display: flex; gap: 6px; margin-top: 10px;">
          <button id="select-btn-${hospital.id}" style="
            flex: 1;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            color: #334155;
            padding: 7px 10px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
          ">
            Highlight Route
          </button>
          <button id="hold-btn-${hospital.id}" style="
            flex: 1.4;
            background: #2563eb;
            border: none;
            color: white;
            padding: 7px 12px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(37,99,235,0.3);
          ">
            Request Hold
          </button>
        </div>
      `;

      marker.bindPopup(popupDiv);

      marker.on('click', () => {
        if (onSelectHospital) {
          onSelectHospital(hospital);
        }
      });

      marker.on('mouseover', () => setHoveredHospital(hospital));
      marker.on('mouseout', () => setHoveredHospital(null));

      marker.on('popupopen', () => {
        const holdBtn = document.getElementById(`hold-btn-${hospital.id}`);
        if (holdBtn) {
          holdBtn.onclick = () => {
            if (onRequestHold) onRequestHold(hospital.id);
          };
        }
        const selectBtn = document.getElementById(`select-btn-${hospital.id}`);
        if (selectBtn) {
          selectBtn.onclick = () => {
            if (onSelectHospital) onSelectHospital(hospital);
            marker.closePopup();
          };
        }
      });
    });

    // Default target for route
    if (!targetHospitalForRoute) {
      targetHospitalForRoute = hospitals.find((h) => (h.beds[reqType]?.available || 0) > 0) || hospitals[0];
    }

    // 3. Draw Realistic Multi-segment Emergency Transit Route
    if (targetHospitalForRoute) {
      const start: [number, number] = [patientRequest.location.lat, patientRequest.location.lng];
      const end: [number, number] = [targetHospitalForRoute.coordinates.lat, targetHospitalForRoute.coordinates.lng];

      // Realistic highway route waypoints following street grid
      const mid1Lat = start[0] + (end[0] - start[0]) * 0.4 + 0.002;
      const mid1Lng = start[1] + (end[1] - start[1]) * 0.2 - 0.003;
      const mid2Lat = start[0] + (end[0] - start[0]) * 0.75 - 0.001;
      const mid2Lng = start[1] + (end[1] - start[1]) * 0.85 + 0.002;

      const routePoints: [number, number][] = [start, [mid1Lat, mid1Lng], [mid2Lat, mid2Lng], end];

      // Route Shadow Layer
      L.polyline(routePoints, {
        color: '#1e3a8a',
        weight: 8,
        opacity: 0.35,
      }).addTo(routeLayer);

      // Main Emergency Transit Line
      L.polyline(routePoints, {
        color: '#2563eb',
        weight: 4.5,
        opacity: 0.95,
        dashArray: '10, 8',
      }).addTo(routeLayer);

      // 4. Simulated Live Traffic Congestion on highway sections
      if (showTraffic) {
        // Section 1: Normal Green
        L.polyline([start, [mid1Lat, mid1Lng]], {
          color: '#22c55e',
          weight: 3,
          opacity: 0.8,
        }).addTo(trafficLayer);

        // Section 2: Moderate Amber
        L.polyline([[mid1Lat, mid1Lng], [mid2Lat, mid2Lng]], {
          color: '#f59e0b',
          weight: 3,
          opacity: 0.8,
        }).addTo(trafficLayer);

        // Section 3: Priority Hospital Approach Green
        L.polyline([[mid2Lat, mid2Lng], end], {
          color: '#22c55e',
          weight: 3,
          opacity: 0.8,
        }).addTo(trafficLayer);
      }
    }
  }, [hospitals, patientRequest, selectedHospitalId, onSelectHospital, onRequestHold, showTraffic, onUpdateAmbulanceLocation]);

  // Center on Ambulance
  const handleCenterAmbulance = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [patientRequest.location.lat, patientRequest.location.lng],
        14,
        { duration: 0.8 }
      );
    }
  };

  // Fit all hospitals and ambulance
  const handleFitAllBounds = () => {
    if (mapInstanceRef.current && hospitals.length > 0) {
      const bounds = L.latLngBounds(
        [patientRequest.location.lat, patientRequest.location.lng],
        [patientRequest.location.lat, patientRequest.location.lng]
      );
      hospitals.forEach((h) => bounds.extend([h.coordinates.lat, h.coordinates.lng]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-3xl overflow-hidden border border-slate-200/80 shadow-md`}>
      {/* Real Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Relocate Mode Notice Banner */}
      {isRelocatingMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-blue-600 text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <MapPin className="w-4 h-4 text-amber-300" />
          <span>Click anywhere on the map to set Ambulance Pickup Location</span>
          <button
            onClick={() => setIsRelocatingMode(false)}
            className="ml-2 text-blue-200 hover:text-white underline text-[11px] cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Top Left: Map Style & Layer Switcher */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-md border border-slate-200/80 text-xs">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1.5 flex items-center gap-1">
          <Layers className="w-3 h-3 text-blue-600" />
          <span className="hidden sm:inline">Map:</span>
        </span>

        <button
          onClick={() => setActiveTileStyle('streets')}
          className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
            activeTileStyle === 'streets'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="OpenStreetMap Real-World Streets"
        >
          Streets
        </button>

        <button
          onClick={() => setActiveTileStyle('satellite')}
          className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
            activeTileStyle === 'satellite'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="High-Resolution Satellite Aerial View"
        >
          Satellite
        </button>

        <button
          onClick={() => setActiveTileStyle('clean')}
          className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer hidden sm:block ${
            activeTileStyle === 'clean'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Clean Light Vector Tiles"
        >
          Clean
        </button>

        <button
          onClick={() => setActiveTileStyle('dark')}
          className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer hidden md:block ${
            activeTileStyle === 'dark'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Tactical Dark Dispatch Mode"
        >
          Night
        </button>

        <span className="h-4 w-px bg-slate-200 mx-0.5" />

        {/* Traffic Toggle */}
        <button
          onClick={() => setShowTraffic(!showTraffic)}
          className={`px-2 py-1 rounded-xl font-semibold flex items-center gap-1 transition-all cursor-pointer ${
            showTraffic
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
          title="Toggle Traffic Congestion Overlay"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${showTraffic ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          <span className="text-[11px]">Traffic</span>
        </button>
      </div>

      {/* Top Right Quick Controls */}
      <div className="absolute top-16 right-3 z-20 flex flex-col gap-1.5">
        <button
          onClick={handleCenterAmbulance}
          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md hover:bg-slate-50 text-blue-600 flex items-center justify-center cursor-pointer transition-colors"
          title="Center on Ambulance Location"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        <button
          onClick={handleFitAllBounds}
          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md hover:bg-slate-50 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
          title="Fit All Regional Hospitals in View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {interactiveRelocate && (
          <button
            onClick={() => setIsRelocatingMode(!isRelocatingMode)}
            className={`w-9 h-9 rounded-xl backdrop-blur-md border shadow-md flex items-center justify-center cursor-pointer transition-colors ${
              isRelocatingMode
                ? 'bg-blue-600 text-white border-blue-600 animate-pulse'
                : 'bg-white/95 hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Click to Reposition Ambulance on Real Map"
          >
            <MapPin className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Bottom Floating Legend & Telemetry Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-lg border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Stoplight Legend */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Status:
          </span>
          <div className="flex items-center gap-1.5 font-bold text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            <span className="text-[11px]">Available</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
            <span className="text-[11px]">Limited</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200" />
            <span className="text-[11px]">Diverting / Full</span>
          </div>
        </div>

        {/* Hovered / Target Info */}
        <div className="flex items-center gap-2 text-slate-700">
          <span className="text-slate-400 hidden md:inline">|</span>
          <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
            <Ambulance className="w-3.5 h-3.5 text-blue-600" />
            <span>Unit: <strong className="text-slate-900">{patientRequest.ambulanceUnit}</strong></span>
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-[11px] font-semibold text-slate-600">
            Target: <strong className="text-slate-900">{hospitals.find((h) => h.id === selectedHospitalId)?.name || 'Nearest Open Facility'}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
