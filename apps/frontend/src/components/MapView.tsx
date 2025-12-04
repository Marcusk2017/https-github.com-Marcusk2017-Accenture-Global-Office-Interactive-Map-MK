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
    
    // Get initial zoom from CSS variable (defaults to 1.3)
    const initialZoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--globe-zoom')) || 1.3;
    
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/marcus-knighton/cmhnwgx3v004y01ql0uk9fl5q',
      center: [-95, 40], // North America (centered on USA)
      zoom: initialZoom,
      projection: 'globe'
    });

    mapRef.current = map;

    // Add zoom and navigation controls
    map.addControl(new mapboxgl.NavigationControl({
      showCompass: true,
      showZoom: true,
      visualizePitch: true
    }), 'top-right');

    // Add custom Home button control
    class HomeControl {
      private _map?: mapboxgl.Map;
      private _container?: HTMLElement;
      
      onAdd(map: mapboxgl.Map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
        
        const button = document.createElement('button');
        button.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-home';
        button.type = 'button';
        button.title = 'Reset to global view';
        button.setAttribute('aria-label', 'Reset to global view');
        
        // Home icon using Unicode
        button.innerHTML = '<span style="font-size: 20px; line-height: 29px;">🏠</span>';
        
        button.onclick = () => {
          console.log('Home button clicked - resetting to global view');
          
          // Close any open popup
          if (currentPopup) {
            currentPopup.remove();
            currentPopup = null;
          }
          
          // Reset click tracking
          lastClickedPoint = null;
          
          // Clear any pending reset timeout
          if (resetTimeout) clearTimeout(resetTimeout);
          
          // Fly to global view
          map.flyTo({
            center: [rotationView.lng, rotationView.lat],
            zoom: rotationView.zoom,
            duration: 2000,
            essential: true
          });
          
          // Resume rotation after animation
          setTimeout(() => {
            userInteracting = false;
            console.log('Rotation resumed from home button');
          }, 2100);
        };
        
        this._container.appendChild(button);
        return this._container;
      }
      
      onRemove() {
        if (this._container?.parentNode) {
          this._container.parentNode.removeChild(this._container);
        }
        this._map = undefined;
      }
    }
    
    map.addControl(new HomeControl() as any, 'top-right');

    map.on('style.load', () => {
      map.setFog({});
      map.resize(); // Ensure map is properly sized on initial load

      // Make Mapbox Studio points clickable with two-stage zoom
      // First click: Zoom to area showing nearby points
      // Second click on same point: Zoom closer and show popup
      map.on('click', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: map.getStyle().layers
            .filter(layer => layer.type === 'symbol' || layer.type === 'circle')
            .map(layer => layer.id)
        });

        if (features.length > 0) {
          const feature = features[0];
          const coordinates = feature.geometry.type === 'Point' 
            ? feature.geometry.coordinates.slice() 
            : e.lngLat.toArray();
          
          const [lng, lat] = coordinates;
          
          // Check if this is the same point as last clicked
          const isSamePoint = lastClickedPoint && 
            Math.abs(lastClickedPoint.lng - lng) < 0.0001 && 
            Math.abs(lastClickedPoint.lat - lat) < 0.0001;
          
          if (isSamePoint) {
            // SECOND CLICK: Show popup and zoom to building detail view
            const properties = feature.properties || {};
            
            // Create popup content with better styling
            let popupContent = '<div style="padding: 0; max-width: 280px; word-wrap: break-word;">';
            
            // Check if it has a title or name property
            if (properties.title || properties.name) {
              popupContent += `<h3 style="margin: 0 0 12px 0; color: #A100FF; font-size: 16px; font-weight: 600; line-height: 1.3;">${properties.title || properties.name}</h3>`;
            }
            
            // Add other properties with better formatting
            Object.keys(properties).forEach(key => {
              if (key !== 'title' && key !== 'name') {
                const value = String(properties[key]);
                popupContent += `<p style="margin: 6px 0; font-size: 13px; line-height: 1.4; word-break: break-word;"><strong style="color: #B366FF;">${key}:</strong> ${value}</p>`;
              }
            });
            
            popupContent += '</div>';

            // Close existing popup if any
            if (currentPopup) {
              currentPopup.remove();
            }

            // Create and display popup positioned ABOVE the marker
            currentPopup = new mapboxgl.Popup({ 
              closeButton: true,
              closeOnClick: false,
              anchor: 'bottom', // Anchors popup to bottom, making it appear above the marker
              offset: [0, -40], // Offset upward to clear the marker and name
              maxWidth: '300px',
              className: 'office-info-popup'
            })
              .setLngLat([lng, lat])
              .setHTML(popupContent)
              .addTo(map);

            // Clear popup reference when it's closed by user
            currentPopup.on('close', () => {
              currentPopup = null;
              lastClickedPoint = null; // Reset on popup close
            });

            // Zoom to building detail view
            map.flyTo({
              center: [lng, lat],
              zoom: 17.5, // Very close zoom to see building details clearly
              duration: 1500,
              essential: true
            });
            
            console.log('Second click - showing building details');
          } else {
            // FIRST CLICK: Zoom to area view showing nearby points
            lastClickedPoint = { lng, lat };
            
            // Close any existing popup
            if (currentPopup) {
              currentPopup.remove();
              currentPopup = null;
            }
            
            // Zoom to area view to see office names and logos clearly
            map.flyTo({
              center: [lng, lat],
              zoom: 11.5, // Close enough to see Accenture logos and office names
              duration: 1500,
              essential: true
            });
            
            console.log('First click - zooming to area');
          }

          // Pause rotation when interacting with points
          userInteracting = true;
          if (resetTimeout) clearTimeout(resetTimeout);
          resetTimeout = window.setTimeout(resetAndResume, 15000); // 15 seconds
        }
      });

      // Change cursor on hover over clickable features
      map.on('mouseenter', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: map.getStyle().layers
            .filter(layer => layer.type === 'symbol' || layer.type === 'circle')
            .map(layer => layer.id)
        });
        
        if (features.length > 0) {
          map.getCanvas().style.cursor = 'pointer';
        }
      });

      map.on('mouseleave', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    // Auto-rotate globe slowly
    let userInteracting = false;
    let rotationInterval: number | null = null;
    let resetTimeout: number | null = null;
    let currentPopup: mapboxgl.Popup | null = null; // Track current popup
    let lastClickedPoint: { lng: number; lat: number } | null = null; // Track last clicked point for two-stage zoom
    const rotationView = { lng: 0, lat: 20, zoom: 1 }; // Zoomed out view for rotation

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
      // Pause rotation during initial transition
      userInteracting = true;
      
      // After a brief display of North America (3 seconds), zoom out to global view
      setTimeout(() => {
        if (map) {
          console.log('Auto-zooming to global rotation view...');
          map.flyTo({ 
            center: [rotationView.lng, rotationView.lat], 
            zoom: rotationView.zoom,
            duration: 3000, // Smooth 3-second transition to global view
            essential: true
          });
          
          // Resume rotation after flyTo completes
          setTimeout(() => {
            userInteracting = false;
            console.log('Starting endless rotation from global view...');
          }, 3100); // Wait for flyTo animation to complete
        }
      }, 3000);
      
      rotationInterval = requestAnimationFrame(rotateCamera);
    });

    // Function to resume rotation after inactivity
    const resetAndResume = () => {
      if (map) {
        console.log('Resuming rotation...');
        
        // Close any open popup
        if (currentPopup) {
          currentPopup.remove();
          currentPopup = null;
          console.log('Popup closed');
        }
        
        // Reset click tracking
        lastClickedPoint = null;
        
        // Get current center and zoom out to show full globe
        const currentCenter = map.getCenter();
        map.flyTo({ 
          center: [currentCenter.lng, currentCenter.lat], 
          zoom: rotationView.zoom, // Zoom out to level 1 to show full globe
          duration: 2000,
          essential: true
        });
        
        // Resume rotation after zoom completes
        setTimeout(() => {
          userInteracting = false;
          console.log('Endless rotation resumed from current position');
        }, 2100);
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

    // Detect mouse wheel zoom
    map.on('wheel', () => {
      userInteracting = true;
      if (resetTimeout) clearTimeout(resetTimeout);
      console.log('User zooming with wheel');
    });

    // Detect zoom start (pinch zoom, double-click zoom, etc.)
    map.on('zoomstart', () => {
      userInteracting = true;
      if (resetTimeout) clearTimeout(resetTimeout);
      console.log('Zoom started');
    });

    // Detect zoom end and schedule reset
    map.on('zoomend', () => {
      if (resetTimeout) clearTimeout(resetTimeout);
      console.log('Zoom ended, will reset in 15 seconds...');
      resetTimeout = window.setTimeout(resetAndResume, 15000); // 15 seconds
    });
    
    // Schedule reset after user stops interacting
    map.on('mouseup', () => { 
      if (resetTimeout) clearTimeout(resetTimeout);
      console.log('User stopped interacting, will reset in 15 seconds...');
      resetTimeout = window.setTimeout(resetAndResume, 15000); // Reset after 15 seconds
    });
    map.on('touchend', () => { 
      if (resetTimeout) clearTimeout(resetTimeout);
      console.log('User stopped interacting (touch), will reset in 15 seconds...');
      resetTimeout = window.setTimeout(resetAndResume, 15000); // Reset after 15 seconds
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
        
        // Get marker size from CSS variable (defaults to 40)
        const markerSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--marker-size')) || 40;
        const size = isPrimary ? markerSize : Math.round(markerSize * 0.6);

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


