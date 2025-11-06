import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

export function OfficePanel() {
  const office = useAppStore((s) => s.selectedOffice);
  const selectOffice = useAppStore((s) => s.selectOffice);

  return (
    <AnimatePresence>
      {office && (
        <motion.div
          className="office-panel"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-label="Office details"
        >
          <div className="panel-header">
            <div>
              <h2>{office.name}</h2>
              <p>
                {office.address?.line1} {office.address?.city} {office.address?.country}
              </p>
            </div>
            <button className="close" aria-label="Close" onClick={() => selectOffice(null)}>
              ✕
            </button>
          </div>
          <div className="panel-content">
            <div className="hero-placeholder" aria-hidden>
              <span>Hero image</span>
            </div>
            <div className="quick-stats">
              <div>
                <div className="label">Employees</div>
                <div className="value">{office.metadata?.employees ?? '—'}</div>
              </div>
              <div>
                <div className="label">Established</div>
                <div className="value">{office.metadata?.established ?? '—'}</div>
              </div>
              <div>
                <div className="label">Sq Ft</div>
                <div className="value">{office.metadata?.sqft ?? '—'}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


