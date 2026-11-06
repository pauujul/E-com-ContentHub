import React, { createContext, useContext, useState, useCallback } from 'react';
import UpgradeModal from '../components/UpgradeModal';

const UpgradeModalContext = createContext(null);

export function UpgradeModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    step: 'limit', // 'limit' | 'pricing' | 'checkout' | 'success'
    reason: 'agenda_limit', // 'agenda_limit' | 'drag_drop' | 'premium_template' | 'notification'
    templateTitle: '',
    currentCount: 3,
    maxLimit: 3,
    selectedPlan: null,
    onSuccessCallback: null,
  });

  const openUpgradeModal = useCallback((options = {}) => {
    setModalConfig({
      step: options.step || 'limit',
      reason: options.reason || 'agenda_limit',
      templateTitle: options.templateTitle || '',
      currentCount: options.currentCount !== undefined ? options.currentCount : 3,
      maxLimit: options.maxLimit !== undefined ? options.maxLimit : 3,
      selectedPlan: options.selectedPlan || null,
      onSuccessCallback: options.onSuccess || null,
    });
    setIsOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setStep = useCallback((step, extra = {}) => {
    setModalConfig((prev) => ({ ...prev, step, ...extra }));
  }, []);

  return (
    <UpgradeModalContext.Provider
      value={{
        isOpen,
        openUpgradeModal,
        closeUpgradeModal,
        modalConfig,
        setStep,
      }}
    >
      {children}
      {isOpen && (
        <UpgradeModal
          isOpen={isOpen}
          onClose={closeUpgradeModal}
          config={modalConfig}
          setStep={setStep}
        />
      )}
    </UpgradeModalContext.Provider>
  );
}

export function useUpgradeModal() {
  const context = useContext(UpgradeModalContext);
  if (!context) {
    throw new Error('useUpgradeModal harus digunakan di dalam UpgradeModalProvider');
  }
  return context;
}

export default UpgradeModalContext;
