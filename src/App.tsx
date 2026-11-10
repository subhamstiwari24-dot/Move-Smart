import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { IncidentProvider, useIncidents } from './context/IncidentContext';
import { Navbar } from './components/common/Navbar';
import { Toast } from './components/common/Toast';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { CitizenPortal } from './features/citizen/CitizenPortal';
import { AdminLayout } from './features/admin/AdminLayout';
import { MultiStepComplaintForm } from './features/citizen/MultiStepComplaintForm';
import { AuthModal } from './features/auth/AuthModal';
import { PlusCircle, X } from 'lucide-react';

const MainApp: React.FC = () => {
  const { activeRole, resetDemoData } = useIncidents();
  const [isNavbarReportModalOpen, setIsNavbarReportModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const handleResetConfirm = () => {
    resetDemoData();
    setIsResetConfirmOpen(false);
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar
        onOpenReportModal={() => setIsNavbarReportModalOpen(true)}
        onOpenResetConfirm={() => setIsResetConfirmOpen(true)}
        onOpenAuthModal={handleOpenAuth}
      />

      {/* Main Role View Container */}
      <div className="flex-1">
        {activeRole === 'citizen' ? <CitizenPortal /> : <AdminLayout />}
      </div>

      {/* Toast Notification Container */}
      <Toast />

      {/* Authentication Modal */}
      <AuthModal />

      {/* Report Modal Triggered from Top Navbar */}
      {isNavbarReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-4 sm:p-5 bg-[#0B192C] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Report Urban Road Hazard</h3>
                  <p className="text-xs text-slate-300">Submit a traffic obstruction directly to the Mumbai Operations Center</p>
                </div>
              </div>
              <button
                onClick={() => setIsNavbarReportModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <MultiStepComplaintForm
                onCancel={() => setIsNavbarReportModalOpen(false)}
                onSuccess={() => {
                  // Keep modal open to show generated tracking ID card
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Global Reset Demo Data Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset Entire Demonstration Environment?"
        message="This will restore all default 12 Mumbai incidents, clear user edits, and return the operations queue to the initial demonstration state."
        confirmLabel="Reset Demonstration Data"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleResetConfirm}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <IncidentProvider>
        <MainApp />
      </IncidentProvider>
    </AuthProvider>
  );
}

export default App;
