import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function WelcomeSplash() {
  const [isVisible, setIsVisible] = useState(true);

  const handleInteraction = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="welcome-splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          onClick={handleInteraction}
          onTouchStart={handleInteraction}
        >
          <div className="stars-background"></div>
          <motion.div
            className="welcome-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
          >
            <motion.div
              className="welcome-text"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              Welcome to the
            </motion.div>
            <motion.div
              className="innovation-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              Accenture Atlanta<br />
              Connected Innovation Center
            </motion.div>
            <motion.div
              className="touch-prompt"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 2,
                duration: 0.8,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 0.5
              }}
            >
              Touch Me!
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

