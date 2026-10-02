/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { BedLinkProvider, useBedLink } from './context/BedLinkContext';
import { Header } from './components/Header';
import { AmbulanceDispatch } from './components/AmbulanceDispatch';
import { NurseQuickUpdate } from './components/NurseQuickUpdate';
import { ConfirmAndHoldModal } from './components/ConfirmAndHoldModal';
import { ActiveHoldsScreen } from './components/ActiveHoldsScreen';
import { HospitalDetailsScreen } from './components/HospitalDetailsScreen';
import { LiveMapSummary } from './components/LiveMapSummary';
import { ActivityLogScreen } from './components/ActivityLogScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { SidebarDrawer } from './components/SidebarDrawer';

const MainContent: React.FC = () => {
  const { activeView } = useBedLink();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] antialiased">
      {/* 3-Slash Side Navigation Drawer & Floating Side Trigger */}
      <SidebarDrawer />

      {/* Top Application Bar */}
      <Header />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {activeView === 'dispatch' && <AmbulanceDispatch />}
        {activeView === 'map' && <LiveMapSummary />}
        {activeView === 'nurse' && <NurseQuickUpdate />}
        {activeView === 'holds' && <ActiveHoldsScreen />}
        {activeView === 'hospitals' && <HospitalDetailsScreen />}
        {activeView === 'logs' && <ActivityLogScreen />}
        {activeView === 'settings' && <SettingsScreen />}
      </main>

      {/* 2-Minute Confirm and Hold Modal (Accessible from any screen) */}
      <ConfirmAndHoldModal />

      {/* Operational Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 px-4 text-xs text-slate-500">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            <strong className="text-slate-900 font-bold">BedLink</strong>
            <span>·</span>
            <span>Emergency Hospital Bed Coordination Platform</span>
            <span>·</span>
            <span className="text-slate-400">Find the right bed before the ambulance arrives.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Metropolitan EMS Mesh</span>
            <span>·</span>
            <span className="font-semibold text-emerald-700">Sub-10s Nurse Updates</span>
            <span>·</span>
            <span className="font-semibold text-blue-700">2-Minute Hold SLA</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BedLinkProvider>
        <MainContent />
      </BedLinkProvider>
    </AuthProvider>
  );
}
