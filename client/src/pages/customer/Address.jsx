import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, Trash2, Pencil, CheckCircle2, X, Home, Building2, Navigation, Map as MapIcon, Search, Compass, Loader2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { showToast } from '../../components/Toast';

const EMPTY_FORM = { title: '', fullAddress: '', latitude: '', longitude: '' };

function iconForTitle(title = '') {
  const t = title.toLowerCase();
  if (t.includes('home')) return Home;
  if (t.includes('office') || t.includes('work')) return Building2;
  return MapPin;
}

// Reverse geocoding (OpenStreetMap Nominatim primary)
const reverseGeocodeCoords = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    if (data && data.display_name) {
      return data.display_name;
    }
  } catch (err) {
    console.warn('OSM Geocode error:', err);
  }

  if (window.google && window.google.maps && window.google.maps.Geocoder) {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const res = await new Promise((resolve) => {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            resolve(null);
          }
        });
      });
      if (res) return res;
    } catch (e) {
      // Ignored
    }
  }
  return null;
};

// Forward geocoding search (Text -> Lat, Lng)
const searchLocationText = async (queryText) => {
  if (!queryText || !queryText.trim()) return null;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryText)}`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        formatted_address: data[0].display_name,
      };
    }
  } catch (err) {
    console.warn('OSM search failed:', err);
  }

  if (window.google && window.google.maps && window.google.maps.Geocoder) {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const res = await new Promise((resolve) => {
        geocoder.geocode({ address: queryText }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const loc = results[0].geometry.location;
            resolve({
              lat: loc.lat(),
              lng: loc.lng(),
              formatted_address: results[0].formatted_address,
            });
          } else {
            resolve(null);
          }
        });
      });
      if (res) return res;
    } catch (e) {
      // Ignored
    }
  }
  return null;
};

// Script Loaders
const loadGoogleMapsScript = (apiKey) => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }
    const existing = document.getElementById('google-maps-script');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google?.maps));
      existing.addEventListener('error', (e) => reject(e));
      return;
    }
    const key = apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    if (!key) {
      reject(new Error('No Google Maps API Key found'));
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google?.maps);
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
};

// Loads Leaflet JS *and* waits for its CSS to actually finish loading before
// resolving. Initializing the map before the stylesheet is applied is the
// #1 cause of "half-grey" / broken-looking Leaflet maps, because Leaflet's
// own CSS is what gives the container its positioning, pane stacking, and
// control layout.
let leafletCssLoadPromise = null;
const loadLeafletCss = () => {
  if (document.getElementById('leaflet-css')) {
    return leafletCssLoadPromise || Promise.resolve();
  }
  leafletCssLoadPromise = new Promise((resolve) => {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.onload = () => resolve();
    link.onerror = () => resolve(); // don't block forever on a CDN hiccup
    document.head.appendChild(link);
  });
  return leafletCssLoadPromise;
};

const loadLeafletScript = async () => {
  await loadLeafletCss();
  if (window.L) return window.L;

  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById('leaflet-js');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.L));
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }
    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
};

// Leaflet's default marker icon is resolved relative to wherever it *thinks*
// leaflet.js was loaded from. When the script is injected dynamically (as we
// do here) that auto-detection can fail silently and the pin renders as a
// broken image. Building the icon explicitly from the CDN sidesteps that.
const buildLeafletPinIcon = (L) =>
  L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

// One-time style patch so the Leaflet map behaves inside a rounded, flex-
// positioned modal instead of fighting Tailwind/overflow rules.
const ensureLeafletContainerStyles = () => {
  if (document.getElementById('leaflet-container-fix')) return;
  const style = document.createElement('style');
  style.id = 'leaflet-container-fix';
  style.textContent = `
    .leaflet-container { width: 100%; height: 100%; background: #e5e7eb; font-family: inherit; }
  `;
  document.head.appendChild(style);
};

// Tile sources per mode. "street" uses CARTO Voyager, which — unlike the
// plain OSM "Mapnik" tiles — renders building footprints, POI icons
// (cafes, libraries, dorms, etc.) and place labels clearly, closer to what
// Google Maps shows. Real building-level labels only exist once the data is
// in OpenStreetMap, but this style surfaces everything the data has.
const TILE_SOURCES = {
  street: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
    subdomains: 'abcd',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19,
  },
  topo: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
    maxZoom: 19,
  },
};

const addTileLayerForMode = (L, map, mode) => {
  const source = TILE_SOURCES[mode] || TILE_SOURCES.street;
  return L.tileLayer(source.url, {
    maxZoom: source.maxZoom,
    subdomains: source.subdomains,
    detectRetina: true,
    attribution: source.attribution,
  }).addTo(map);
};

// Zoom level used whenever we jump to a specific place (search result, GPS
// fix, marker drag). 18 is close enough that OSM/CARTO start rendering
// individual buildings and POI labels, like a campus map.
const DETAIL_ZOOM = 18;

export default function Address() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  // Map Modal State
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [mapMode, setMapMode] = useState('street');

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const isGoogleMapRef = useRef(false);
  const resizeObserverRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await API.get('/users/addresses');
      setAddresses(response.data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowAddForm(true);
  };

  const openEditForm = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      fullAddress: item.address || item.fullAddress || '',
      latitude: item.latitude || '',
      longitude: item.longitude || '',
    });
    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const updateCoordinatesAndAddress = async (lat, lng) => {
    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);
    setForm((prev) => ({ ...prev, latitude: latStr, longitude: lngStr }));
    const addr = await reverseGeocodeCoords(lat, lng);
    if (addr) {
      setForm((prev) => ({ ...prev, fullAddress: addr }));
    }
  };

  const switchTileLayerMode = (mode) => {
    setMapMode(mode);
    if (!mapInstanceRef.current) return;

    if (isGoogleMapRef.current && window.google) {
      if (mode === 'satellite') {
        mapInstanceRef.current.setMapTypeId(window.google.maps.MapTypeId.HYBRID);
      } else if (mode === 'topo') {
        mapInstanceRef.current.setMapTypeId(window.google.maps.MapTypeId.TERRAIN);
      } else {
        mapInstanceRef.current.setMapTypeId(window.google.maps.MapTypeId.ROADMAP);
      }
      return;
    }

    if (window.L && !isGoogleMapRef.current) {
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }
      tileLayerRef.current = addTileLayerForMode(window.L, mapInstanceRef.current, mode);
    }
  };

  // Fully tears down whatever map instance is currently mounted so the next
  // openMapPicker() call starts from a clean container. Reusing a container
  // that still has a live Leaflet/Google instance attached to it is what
  // produces the "half rendered / grey tiles" look on the second open.
  const destroyExistingMap = () => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }
    if (mapInstanceRef.current) {
      if (!isGoogleMapRef.current && typeof mapInstanceRef.current.remove === 'function') {
        mapInstanceRef.current.remove();
      }
    }
    mapInstanceRef.current = null;
    markerRef.current = null;
    tileLayerRef.current = null;
    if (mapRef.current) {
      mapRef.current.innerHTML = '';
    }
  };

  // Best-effort silent geolocation lookup, used only to pick a livelier
  // starting point for the map when the address doesn't have coordinates
  // yet. A low zoom on a sparsely-mapped fallback point is what produced
  // the mostly-blank "white" map — starting near the user (or at least
  // zoomed in further) avoids that.
  const trySilentGeolocation = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      const timer = setTimeout(() => resolve(null), 3000);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timer);
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          clearTimeout(timer);
          resolve(null);
        },
        { timeout: 2500, maximumAge: 5 * 60 * 1000 }
      );
    });

  const openMapPicker = () => {
    setShowMapModal(true);
    setMapLoading(true);
    setMapMode('street');
    destroyExistingMap();

    // Wait for the modal (and its ref'd div) to actually be in the DOM
    // with a non-zero size before initializing the map, instead of
    // guessing with a fixed timeout.
    let cancelled = false;
    const waitForContainer = () =>
      new Promise((resolve) => {
        const check = () => {
          if (cancelled) return resolve(false);
          if (mapRef.current && mapRef.current.clientWidth > 0 && mapRef.current.clientHeight > 0) {
            resolve(true);
          } else {
            requestAnimationFrame(check);
          }
        };
        requestAnimationFrame(check);
      });

    (async () => {
      const ready = await waitForContainer();
      if (!ready || !mapRef.current) return;

      let initialLat = form.latitude ? parseFloat(form.latitude) : null;
      let initialLng = form.longitude ? parseFloat(form.longitude) : null;
      let initialZoom = DETAIL_ZOOM;

      if (initialLat == null || initialLng == null) {
        // No saved coordinates yet — try the user's real location first so
        // the map opens somewhere with actual buildings/roads rendered,
        // instead of a hardcoded point that might be sparsely mapped.
        const geo = await trySilentGeolocation();
        if (cancelled) return;
        if (geo) {
          initialLat = geo.lat;
          initialLng = geo.lng;
          initialZoom = DETAIL_ZOOM;
        } else {
          initialLat = 8.5417; // Adama fallback
          initialLng = 39.2689;
          initialZoom = 16; // zoomed in enough to show streets/buildings, not a blank basemap
        }
      }

      const hasGoogleMapsKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

      try {
        // 1. Try Google Maps first, but only if a key is actually configured —
        // attempting (and failing) the load on every open just adds latency
        // when we know in advance it can't succeed.
        if (!hasGoogleMapsKey) {
          throw new Error('No Google Maps API key configured');
        }
        await loadGoogleMapsScript();
        if (window.google && window.google.maps) {
          isGoogleMapRef.current = true;
          const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: initialLat, lng: initialLng },
            zoom: initialZoom,
            mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: false,
            zoomControl: true,
          });
          mapInstanceRef.current = map;

          const marker = new window.google.maps.Marker({
            position: { lat: initialLat, lng: initialLng },
            map,
            draggable: true,
            title: 'Drag to adjust location',
          });
          markerRef.current = marker;

          marker.addListener('dragend', (e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            updateCoordinatesAndAddress(lat, lng);
          });

          map.addListener('click', (e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            marker.setPosition({ lat, lng });
            updateCoordinatesAndAddress(lat, lng);
          });

          window.google.maps.event.trigger(map, 'resize');
          setMapLoading(false);
          return;
        }
      } catch (e) {
        console.info(
          hasGoogleMapsKey
            ? 'Google Maps failed to load, using OpenStreetMap viewer.'
            : 'No Google Maps API key configured, using OpenStreetMap viewer.'
        );
      }

      // 2. OpenStreetMap / Leaflet fallback
      try {
        ensureLeafletContainerStyles();
        const L = await loadLeafletScript();
        if (cancelled || !mapRef.current) return;
        isGoogleMapRef.current = false;

        const map = L.map(mapRef.current, { zoomControl: true }).setView(
          [initialLat, initialLng],
          initialZoom
        );
        mapInstanceRef.current = map;

        tileLayerRef.current = addTileLayerForMode(L, map, 'street');

        const marker = L.marker([initialLat, initialLng], {
          draggable: true,
          icon: buildLeafletPinIcon(L),
        }).addTo(map);
        markerRef.current = marker;

        marker.on('dragend', (e) => {
          const pos = e.target.getLatLng();
          updateCoordinatesAndAddress(pos.lat, pos.lng);
        });

        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          updateCoordinatesAndAddress(lat, lng);
        });

        // Force Leaflet to recompute tile layout once the container has
        // definitely settled into its final size, and keep it in sync if
        // the modal is resized (e.g. orientation change on mobile).
        requestAnimationFrame(() => {
          map.invalidateSize();
          setTimeout(() => map.invalidateSize(), 250);
        });

        if (typeof ResizeObserver !== 'undefined') {
          const observer = new ResizeObserver(() => map.invalidateSize());
          observer.observe(mapRef.current);
          resizeObserverRef.current = observer;
        }
      } catch (err) {
        console.error('Leaflet load failed:', err);
        showToast('Could not load the map. Please try again.', 'error');
      } finally {
        setMapLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  };

  const closeMapModal = () => {
    setShowMapModal(false);
    destroyExistingMap();
  };

  // Safety net: make sure the map is torn down if the component unmounts
  // while the modal is open.
  useEffect(() => {
    return () => destroyExistingMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const latStr = lat.toFixed(6);
        const lngStr = lng.toFixed(6);

        setForm((prev) => ({ ...prev, latitude: latStr, longitude: lngStr }));

        if (mapInstanceRef.current) {
          if (isGoogleMapRef.current) {
            mapInstanceRef.current.setCenter({ lat, lng });
            mapInstanceRef.current.setZoom(DETAIL_ZOOM);
            if (markerRef.current) markerRef.current.setPosition({ lat, lng });
          } else if (mapInstanceRef.current.setView) {
            mapInstanceRef.current.setView([lat, lng], DETAIL_ZOOM);
            if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
          }
        }

        const addressText = await reverseGeocodeCoords(lat, lng);
        if (addressText) {
          setForm((prev) => ({ ...prev, fullAddress: addressText }));
          showToast('GPS Location applied!', 'success');
        } else {
          showToast('Current GPS coordinates fetched!', 'success');
        }
        setGeoLoading(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        showToast('Unable to retrieve GPS location. Please check permissions.', 'error');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearchPlace = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    const result = await searchLocationText(searchQuery);
    if (result) {
      const { lat, lng, formatted_address } = result;
      setForm((prev) => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
        fullAddress: formatted_address || prev.fullAddress,
      }));

      if (mapInstanceRef.current) {
        if (isGoogleMapRef.current) {
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(DETAIL_ZOOM);
          if (markerRef.current) markerRef.current.setPosition({ lat, lng });
        } else if (mapInstanceRef.current.setView) {
          mapInstanceRef.current.setView([lat, lng], DETAIL_ZOOM);
          if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        }
      }
      showToast('Found location on map!', 'success');
    } else {
      showToast('Location not found. Try entering a different landmark.', 'error');
    }
    setSearchLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.fullAddress) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const addressData = {
      title: form.title,
      fullAddress: form.fullAddress,
      address: form.fullAddress,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
    };

    try {
      setSaving(true);
      if (editingId) {
        const response = await API.put(`/users/addresses/${editingId}`, addressData);
        const updated = response.data.address || response.data;
        setAddresses((prev) =>
          prev.map((addr) => (addr.id === editingId ? { ...addr, ...updated } : addr))
        );
        showToast('Address updated successfully!', 'success');
      } else {
        const response = await API.post('/users/addresses', addressData);
        const newAddr = response.data.address || response.data;
        setAddresses((prev) => [newAddr, ...prev]);
        showToast('Address added successfully!', 'success');
      }
      closeForm();
    } catch (error) {
      console.error('Error saving address:', error);
      showToast(error.response?.data?.error || 'Failed to save address. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      setDeletingId(id);
      await API.delete(`/users/addresses/${id}`);
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
      showToast('Address deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting address:', error);
      showToast(error.response?.data?.error || 'Failed to delete address. Please try again.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="app-page">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <MapPin className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-gray-900 mb-4">{t('pleaseLogin')}</h2>
          <p className="text-gray-600">{t('loginToViewOrders')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page bg-gradient-to-b from-orange-50/40 via-white to-white min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-3.5 rounded-2xl shadow-lg shadow-orange-500/30">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('myAddress')}</h1>
              <p className="text-sm text-gray-500">
                {addresses.length} {addresses.length === 1 ? 'saved place' : 'saved places'}
              </p>
            </div>
          </div>
          <button
            onClick={() => (showAddForm ? closeForm() : openAddForm())}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-600/25 transition-all duration-150 text-sm cursor-pointer"
          >
            {showAddForm ? (
              <>
                <X className="w-4 h-4" />
                <span>{t('cancel')}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>{t('addNewAddress')}</span>
              </>
            )}
          </button>
        </div>

        {/* Add / Edit Address Form */}
        {showAddForm && (
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-orange-900/5 border border-orange-100 mb-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Address' : t('addNewAddress')}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('addressTitle')} *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Home, Office, Gym, etc."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('fullAddress')} *
                  </label>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={geoLoading}
                    className="flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 transition"
                  >
                    {geoLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Compass className="w-3.5 h-3.5" />
                    )}
                    <span>Use GPS Current Location</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <textarea
                    value={form.fullAddress}
                    onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
                    placeholder="Enter your address or pick on the map..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none resize-none transition-all text-sm"
                    rows="2"
                    required
                  />
                  <button
                    type="button"
                    onClick={openMapPicker}
                    title="Open map picker"
                    className="bg-orange-600 hover:bg-orange-700 text-white p-3.5 rounded-xl flex items-center justify-center transition-all shrink-0 shadow-md cursor-pointer"
                  >
                    <MapIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Coordinates Preview */}
              <div className="grid grid-cols-2 gap-4 bg-orange-50/50 p-4 rounded-2xl border border-orange-100/80">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Latitude</label>
                  <input
                    type="text"
                    value={form.latitude}
                    readOnly
                    placeholder="Set via Map"
                    className="w-full px-3 py-2 rounded-lg border border-orange-200/60 bg-white font-mono text-xs text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Longitude</label>
                  <input
                    type="text"
                    value={form.longitude}
                    readOnly
                    placeholder="Set via Map"
                    className="w-full px-3 py-2 rounded-lg border border-orange-200/60 bg-white font-mono text-xs text-gray-700"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={closeForm}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] bg-orange-600 hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-600/20 transition-all cursor-pointer"
                >
                  {saving ? 'Saving…' : editingId ? 'Update Address' : t('save')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Map Modal Picker - interactive pin-drop */}
        {showMapModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-2xl shadow-2xl border border-orange-100 relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <MapIcon className="w-5 h-5 text-orange-600" />
                    <span>Pick a Location</span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Click anywhere on the map or drag the pin to set your exact address.
                  </p>
                </div>
                <button
                  onClick={closeMapModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Map Search Bar + Geolocation inside Map Modal */}
              <div className="flex gap-2 mb-3">
                <form onSubmit={handleSearchPlace} className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search city, area, or landmark..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-medium focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searchLoading}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1 cursor-pointer"
                  >
                    {searchLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Search</span>
                  </button>
                </form>

                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={geoLoading}
                  title="Detect GPS location"
                  className="bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
                  <span className="hidden sm:inline">My Location</span>
                </button>
              </div>

              {/* Map style toggle - satellite view is the fastest way to actually
                  see buildings when OSM's label data for a place is sparse */}
              <div className="flex items-center gap-1.5 mb-3">
                {[
                  { id: 'street', label: 'Map' },
                  { id: 'satellite', label: 'Satellite' },
                  { id: 'topo', label: 'Terrain' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => switchTileLayerMode(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      mapMode === opt.id
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Map Container */}
              <div className="w-full h-80 relative rounded-2xl overflow-hidden border-2 border-orange-100 dark:border-gray-800 mb-4 shadow-inner bg-gray-100">
                {mapLoading && (
                  <div className="absolute inset-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-orange-600 gap-2">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Loading Map...</span>
                  </div>
                )}
                <div ref={mapRef} className="absolute inset-0 w-full h-full" />
              </div>

              {/* Current Selected Address Banner */}
              {form.fullAddress && (
                <div className="mb-4 p-3 bg-orange-50 dark:bg-gray-800 rounded-xl border border-orange-200 dark:border-gray-700 flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-gray-900 dark:text-gray-100">Selected Address:</span>
                    <p className="text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2">{form.fullAddress}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeMapModal}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-600/20 transition cursor-pointer text-sm"
                >
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Saved Addresses List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 animate-pulse">
                <div className="w-14 h-14 rounded-2xl bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-100 rounded" />
                  <div className="h-3 w-64 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-lg border border-orange-100/60">
            <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-12 h-12 text-orange-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">{t('noAddresses')}</h3>
            <p className="text-gray-500 mb-8">{t('addNewAddress')}</p>
            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-orange-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>{t('addAddress')}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((item, index) => {
              const Icon = iconForTitle(item.title);
              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-xl hover:shadow-orange-900/5 hover:border-orange-200 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 text-orange-600 p-3.5 rounded-2xl mt-1 shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center flex-wrap gap-2">
                        <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                        {item.latitude && item.longitude && (
                          <span className="bg-orange-100 text-orange-800 text-xs font-mono font-bold px-2 py-0.5 rounded-md border border-orange-200 inline-flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-orange-500" />
                            <span>Lat: {parseFloat(item.latitude).toFixed(4)}, Lng: {parseFloat(item.longitude).toFixed(4)}</span>
                          </span>
                        )}
                        {index === 0 && (
                          <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{t('defaultAddress')}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1 break-words">
                        {item.address || item.fullAddress}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditForm(item)}
                      title="Edit address"
                      className="p-3 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition cursor-pointer"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(item.id)}
                      disabled={deletingId === item.id}
                      title="Delete address"
                      className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition disabled:opacity-50 cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}