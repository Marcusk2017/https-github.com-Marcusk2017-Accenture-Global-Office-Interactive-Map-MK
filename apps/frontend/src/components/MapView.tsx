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
  const darkMode = useAppStore((s: { darkMode: boolean }) => s.darkMode);

  // initialize map (only once)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: darkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
      center: [0, 20],
      zoom: 1.3,
      projection: 'globe'
    });

    mapRef.current = map;

    map.on('style.load', () => {
      map.setFog({});
      map.resize(); // Ensure map is properly sized on initial load
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
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map style when dark mode changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(darkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11');
    map.once('style.load', () => {
      map.setFog({});
    });
  }, [darkMode]);

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


