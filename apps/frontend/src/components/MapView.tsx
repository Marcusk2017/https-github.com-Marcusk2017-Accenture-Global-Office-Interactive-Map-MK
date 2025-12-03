import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useAppStore, Office } from '../store/useAppStore';

const ACCENTURE_PURPLE = '#A100FF';
const ACCENTURE_PURPLE_HOVER = '#B333FF';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFyY3VzLWtuaWdodG9uIiwiYSI6ImNtaGNnMnB3YTBveW0ya29hdGRsdzJobTkifQ.uDXcTedLbJOFJcFfPxIYNA';

export function MapView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const offices = useAppStore((s: { offices: Office[] }) => s.offices);
  const selectOffice = useAppStore((s: { selectOffice: (office: Office | null) => void }) => s.selectOffice);

  // initialize map (only once)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/marcus-knighton/cmhnwgx3v004y01ql0uk9fl5q',
      center: [0, 20],
      zoom: 1.3,
      projection: 'globe'
    });

    mapRef.current = map;

    map.on('style.load', () => {
      map.setFog({});
      map.resize(); // Ensure map is properly sized on initial load
    });

    // Auto-rotate globe slowly
    let userInteracting = false;
    let rotationInterval: number | null = null;
    let resetTimeout: number | null = null;
    const originalCenter = { lng: 0, lat: 20 }; // Store original position

    const rotateCamera = (timestamp: number) => {
      if (!userInteracting && map) {
        const center = map.getCenter();
        center.lng += 0.03; // Rotate 0.03 degrees per frame (slower, smoother rotation)
        map.setCenter(center);
      }
      rotationInterval = requestAnimationFrame(rotateCamera);
    };

    // Start rotation after map loads
    map.on('load', () => {
      rotationInterval = requestAnimationFrame(rotateCamera);
    });

    // Function to reset and resume rotation
    const resetAndResume = () => {
      if (map) {
        console.log('Resetting globe to original position...');
        
        // Smoothly fly back to original position
        map.flyTo({ 
          center: [originalCenter.lng, originalCenter.lat], 
          zoom: 1.3,
          duration: 2000, // 2 second animation back to center
          essential: true
        });
        
        // Resume rotation after flying back
        setTimeout(() => {
          userInteracting = false;
          console.log('Rotation resumed');
        }, 2100); // Wait for flyTo animation to complete
      }
    };

    // Pause rotation when user interacts
    map.on('mousedown', () => { 
      userInteracting = true;
      if (resetTimeout) clearTimeout(resetTimeout);
      console.log('User started interacting');
    });
    map.on('touchstart', () => { 
      userInteracting = true;
      if (resetTimeout) clearTimeout(resetTimeout);
      console.log('User started interacting (touch)');
    });
    
    // Also stop when user is dragging
    map.on('drag', () => {
      userInteracting = true;
      if (resetTimeout) clearTimeout(resetTimeout);
    });
    
    // Schedule reset after user stops interacting
    map.on('mouseup', () => { 
      if (resetTimeout) clearTimeout(resetTimeout);
      console.log('User stopped interacting, will reset in 7 seconds...');
      resetTimeout = window.setTimeout(resetAndResume, 7000); // Reset after 7 seconds
    });
    map.on('touchend', () => { 
      if (resetTimeout) clearTimeout(resetTimeout);
      console.log('User stopped interacting (touch), will reset in 7 seconds...');
      resetTimeout = window.setTimeout(resetAndResume, 7000); // Reset after 7 seconds
    });

    // Handle window resize
    const handleResize = () => {
      map.resize();
    };
    window.addEventListener('resize', handleResize);

    // Handle container resize (for responsive layout changes)
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      if (rotationInterval !== null) {
        cancelAnimationFrame(rotationInterval);
      }
      if (resetTimeout !== null) {
        clearTimeout(resetTimeout);
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);


  // render markers with Mapbox interactions
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Wait for map to be ready
    if (!map.loaded()) {
      map.once('load', () => {
        setupMarkersAndInteractions();
      });
    } else {
      setupMarkersAndInteractions();
    }

    function setupMarkersAndInteractions() {
      if (!map) return;
      
      // Clear existing markers and popups
      (map as any)._customMarkers?.forEach((m: mapboxgl.Marker) => m.remove());
      (map as any)._customMarkers = [];
      (map as any)._customPopups?.forEach((p: mapboxgl.Popup) => p.remove());
      (map as any)._customPopups = [];

      offices.forEach((office: Office) => {
        const isPrimary = office.type === 'Primary';
        const size = isPrimary ? 40 : 24;

        const el = document.createElement('div');
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.cursor = 'pointer';
        el.innerHTML = getPinSvg(size, ACCENTURE_PURPLE);

        // Mouse enter interaction
        el.onmouseenter = () => {
          el.innerHTML = getPinSvg(size, ACCENTURE_PURPLE_HOVER, 1.1);
          if (map) map.getCanvas().style.cursor = 'pointer';
        };

        // Mouse leave interaction
        el.onmouseleave = () => {
          el.innerHTML = getPinSvg(size, ACCENTURE_PURPLE, 1);
          if (map) map.getCanvas().style.cursor = '';
        };

        // Click interaction with popup
        el.onclick = () => {
          selectOffice(office);
          if (map) {
            map.flyTo({ center: [office.coordinates.lng, office.coordinates.lat], zoom: 10, duration: 1200 });

            // Create popup with office information
            const popup = new mapboxgl.Popup({ offset: [0, -15], closeOnClick: true })
              .setLngLat([office.coordinates.lng, office.coordinates.lat])
              .setHTML(`
                <div class="map-popup">
                  <h3>${office.name}</h3>
                  <p><strong>Type:</strong> ${office.type}</p>
                  ${office.address?.city ? `<p><strong>Location:</strong> ${office.address.city}, ${office.address.country || ''}</p>` : ''}
                  ${office.address?.line1 ? `<p><strong>Address:</strong> ${office.address.line1}</p>` : ''}
                  ${office.metadata?.employees ? `<p><strong>Employees:</strong> ${office.metadata.employees}</p>` : ''}
                </div>
              `)
              .addTo(map);

            if (!(map as any)._customPopups) {
              (map as any)._customPopups = [];
            }
            (map as any)._customPopups.push(popup);
          }
        };

        if (map) {
          const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([office.coordinates.lng, office.coordinates.lat])
            .addTo(map);

          if (!(map as any)._customMarkers) {
            (map as any)._customMarkers = [];
          }
          (map as any)._customMarkers.push(marker);
        }
      });
    }
  }, [offices, selectOffice]);

  return <div ref={containerRef} className="map-container" role="region" aria-label="World map" />;
}

function getPinSvg(size: number, color: string, scale = 1) {
  const s = size * scale;
  return `
  <svg width="${s}" height="${s}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style="transform: translateZ(0);">
    <defs>
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.2" />
      </filter>
    </defs>
    <g filter="url(#shadow)">
      <path d="M32 2c-12.15 0-22 9.26-22 20.69 0 13.28 17.57 33.7 21.38 38.01a1 1 0 0 0 1.25 0C36.43 56.39 54 35.97 54 22.69 54 11.26 44.15 2 32 2z" fill="${color}"/>
      <circle cx="32" cy="24" r="8" fill="#fff"/>
    </g>
  </svg>`;
}


