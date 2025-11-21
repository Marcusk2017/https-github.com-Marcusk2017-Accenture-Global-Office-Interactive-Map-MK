import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

export function LiveFeedModal() {
  const liveFeedOffice = useAppStore((s) => s.liveFeedOffice);
  const openLiveFeed = useAppStore((s) => s.openLiveFeed);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamError, setStreamError] = React.useState<string | null>(null);

  useEffect(() => {
    setStreamError(null);
    if (liveFeedOffice?.cameraUrl && videoRef.current) {
      // For Foscam cameras, the URL format is typically:
      // http://username:password@ip:port/video.cgi or
      // rtsp://username:password@ip:port/video.h264
      // Note: For security, you should proxy this through your backend
      const video = videoRef.current;
      
      // If it's an HTTP stream, we can use directly
      if (liveFeedOffice.cameraUrl.startsWith('http')) {
        video.src = liveFeedOffice.cameraUrl;
        video.play().catch((err) => {
          console.error('Error playing video:', err);
          setStreamError('Unable to load camera feed. Please check the camera URL and network connection.');
        });
      } else if (liveFeedOffice.cameraUrl.startsWith('rtsp')) {
        // RTSP streams need to be converted to HLS or WebRTC
        setStreamError('RTSP streams require backend conversion to HLS/WebRTC. Please configure a proxy endpoint.');
      }
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.src = '';
        videoRef.current.load();
      }
    };
  }, [liveFeedOffice]);

  if (!liveFeedOffice) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="live-feed-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => openLiveFeed(null)}
      >
        <motion.div
          className="live-feed-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="live-feed-header">
            <h3>Live Feed - {liveFeedOffice.name}</h3>
            <button
              className="live-feed-close"
              onClick={() => openLiveFeed(null)}
              aria-label="Close live feed"
            >
              ✕
            </button>
          </div>
          <div className="live-feed-content">
            {liveFeedOffice.cameraUrl ? (
              <>
                {streamError ? (
                  <div className="live-feed-placeholder">
                    <p style={{ color: '#ff4444' }}>⚠️ {streamError}</p>
                    <p className="live-feed-hint">
                      For RTSP streams, set up a backend proxy to convert to HLS or WebRTC.
                    </p>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    className="live-feed-video"
                    controls
                    autoPlay
                    muted
                    playsInline
                    onError={(e) => {
                      console.error('Video error:', e);
                      setStreamError('Failed to load video stream. Check camera URL and network connection.');
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </>
            ) : (
              <div className="live-feed-placeholder">
                <p>No camera feed available for this office.</p>
                <p className="live-feed-hint">
                  Camera URL not configured. Please contact your administrator.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

