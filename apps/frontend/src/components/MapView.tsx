import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useAppStore } from '@/store/useAppStore';

const ACCENTURE_PURPLE = '#A100FF';
const ACCENTURE_PURPLE_HOVER = '#B333FF';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

export function MapView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const offices = useAppStore((s) => s.offices);
  const selectOffice = useAppStore((s) => s.selectOffice);

  // initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [0, 20],
      zoom: 1.3,
      projection: 'globe'
    });

    mapRef.current = map;

    map.on('style.load', () => {
      map.setFog({});
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // render markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers stored on map instance
    (map as any)._customMarkers?.forEach((m: mapboxgl.Marker) => m.remove());
    (map as any)._customMarkers = [];

    offices.forEach((office) => {
      const isPrimary = office.type === 'Primary';
      const size = isPrimary ? 40 : 24;

      const el = document.createElement('div');
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.cursor = 'pointer';
      el.innerHTML = getPinSvg(size, ACCENTURE_PURPLE);

      el.onmouseenter = () => {
        el.innerHTML = getPinSvg(size, ACCENTURE_PURPLE_HOVER, 1.1);
      };
      el.onmouseleave = () => {
        el.innerHTML = getPinSvg(size, ACCENTURE_PURPLE, 1);
      };
      el.onclick = () => {
        selectOffice(office);
        map.flyTo({ center: [office.coordinates.lng, office.coordinates.lat], zoom: 10, duration: 1200 });
      };

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([office.coordinates.lng, office.coordinates.lat])
        .addTo(map);

      (map as any)._customMarkers.push(marker);
    });
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


