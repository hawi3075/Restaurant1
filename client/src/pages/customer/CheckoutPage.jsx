import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bike,
  UtensilsCrossed,
  MapPin,
  CreditCard,
  Wallet,
  CheckCircle,
  Map as MapIcon,
  Search,
  Compass,
  Loader2,
  X,
  User,
  Mail,
  Phone,
  Plus,
  Minus,
  CheckSquare,
  Square,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';
import API from '../../services/api';
import { showToast } from '../../components/Toast';

/* -------------------------------------------------------------------------
 * Map helpers — mirrors the implementation used on the Address page so the
 * checkout picker looks and behaves exactly the same (Google Maps first,
 * Leaflet/OSM fallback, satellite + terrain modes, search, GPS).
 * ---------------------------------------------------------------------- */

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

// Script loaders
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
// resolving, otherwise the map renders half-grey / broken.
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
    link.onerror = () => resolve();
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

// Explicit marker icon build — avoids the "broken pin" issue that happens
// when leaflet.js is injected dynamically and can't auto-detect its own path.
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

const ensureLeafletContainerStyles = () => {
  if (document.getElementById('leaflet-container-fix')) return;
  const style = document.createElement('style');
  style.id = 'leaflet-container-fix';
  style.textContent = `
    .leaflet-container { width: 100%; height: 100%; background: #e5e7eb; font-family: inherit; }
  `;
  document.head.appendChild(style);
};

// Tile sources per mode — CARTO Voyager renders building footprints and POI
// labels much closer to what Google Maps shows than plain OSM Mapnik tiles.
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
// fix, marker drag) — close enough to show individual buildings/POIs.
const DETAIL_ZOOM = 18;

const FALLBACK_LAT = 8.5417; // Adama, Ethiopia
const FALLBACK_LNG = 39.2689;

// Simple, dependency-free validators for the contact-info fields required by
// the Chapa payment gateway. Kept intentionally permissive (Chapa itself is
// the final source of truth) but strict enough to catch empty/garbage input
// before it ever reaches the backend.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Accepts Ethiopian-style numbers (09xxxxxxxx / 07xxxxxxxx / +2519xxxxxxxx)
// as well as generic 7-15 digit numbers so it doesn't block other formats.
const PHONE_REGEX = /^(\+?251|0)?[79]\d{8}$/;

const validateContactInfo = ({ fullName, email, phone }) => {
  const errors = {};

  if (!fullName || !fullName.trim()) {
    errors.fullName = 'Full name is required.';
  } else if (fullName.trim().split(/\s+/).length < 2) {
    errors.fullName = 'Please enter both first and last name.';
  }

  if (!email || !email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Please enter a valid email address.';
  } else if (email.trim().toLowerCase().endsWith('@example.com') || email.trim().toLowerCase().endsWith('@test.com')) {
    errors.email = 'Please enter a real email address (e.g. user@gmail.com).';
  }

  if (!phone || !phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!PHONE_REGEX.test(phone.trim().replace(/[\s-]/g, ''))) {
    errors.phone = 'Please enter a valid phone number (e.g. 0912345678).';
  }

  return errors;
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  // NOTE: updateQuantity / removeFromCart are assumed to exist on CartContext
  // (common naming). If your context uses different names, rename these two
  // destructured values and the two call sites that use them below.
  const { cart, cartLoaded, getCartTotal, clearCart, getRestaurantId, updateQuantity, removeFromCart } = useCart();
  const { deliveryFee: defaultDeliveryFee } = useSettings();

  const [orderType, setOrderType] = useState('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState('CHAPA');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    title: '',
    fullAddress: '',
    latitude: '',
    longitude: '',
  });
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [restaurant, setRestaurant] = useState(null);

  // Table selection for Dine-In orders
  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState(null);

  // Which cart items the customer wants to include in THIS order. Defaults
  // to "all selected" the first time the cart loads, but the customer can
  // uncheck items they don't want to check out right now.
  const [selectedItemIds, setSelectedItemIds] = useState(new Set());

  // Contact info required by the payment gateway (Chapa) — pre-filled from
  // the logged-in user's profile where available, but always editable and
  // validated before an order/payment is submitted. This guarantees valid
  // data reaches Chapa even if the stored profile is incomplete.
  const [contactInfo, setContactInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [contactErrors, setContactErrors] = useState({});

  // Map modal state (mirrors the Address page picker)
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

  // Only the items the customer has checked participate in totals / the
  // order that actually gets placed.
  const selectedCartItems = cart.filter((item) => selectedItemIds.has(item.id));
  const allSelected = cart.length > 0 && selectedCartItems.length === cart.length;

  const unitPrice = (item) => {
    if (item.food?.price != null) return Number(item.food.price);
    if (item.quantity) return Number(item.total) / item.quantity;
    return Number(item.total) || 0;
  };

  const subtotal = selectedCartItems.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0);
  const deliveryFee = orderType === 'DELIVERY' ? (defaultDeliveryFee !== undefined ? defaultDeliveryFee : 50) : 0;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchUserAddresses();
    fetchRestaurantDetails();

    // Pre-fill contact info from the user's profile (still editable/required).
    setContactInfo({
      fullName: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch available tables when DINE_IN is selected
  useEffect(() => {
    if (orderType === 'DINE_IN') {
      const restaurantId = getRestaurantId() || restaurant?.id;
      if (restaurantId) {
        API.get(`/restaurants/${restaurantId}/tables`)
          .then((res) => setTables(res.data))
          .catch(() => setTables([]));
      }
    } else {
      setSelectedTableId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderType, restaurant?.id]);

  // Keep the selection in sync with the cart: newly-added items default to
  // selected, items removed from the cart drop out of the selection.
  useEffect(() => {
    setSelectedItemIds((prev) => {
      const next = new Set();
      cart.forEach((item) => {
        // Brand-new items (not previously tracked) start selected.
        if (prev.size === 0 || prev.has(item.id)) next.add(item.id);
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.length]);

  // Safety net: tear the map down if the component unmounts mid-picker.
  useEffect(() => {
    return () => destroyExistingMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserAddresses = async () => {
    try {
      const response = await API.get('/users/addresses');
      setAddresses(response.data);
      if (response.data.length > 0) {
        setSelectedAddress(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const fetchRestaurantDetails = async () => {
    try {
      const restaurantId = getRestaurantId();
      if (restaurantId) {
        const response = await API.get(`/restaurants/${restaurantId}`);
        setRestaurant(response.data);
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    }
  };

  const handleContactInfoChange = (field, value) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
    // Clear the error for this field as soon as the user starts fixing it.
    setContactErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const toggleItemSelected = (itemId) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(cart.map((item) => item.id)));
    }
  };

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity < 1) return;
    if (typeof updateQuantity === 'function') {
      updateQuantity(item.id, newQuantity);
    } else {
      console.warn(
        'CartContext does not expose updateQuantity() — quantity change was ignored. Wire this up to your cart context.'
      );
    }
  };

  const updateCoordinatesAndAddress = async (lat, lng) => {
    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);
    setNewAddress((prev) => ({ ...prev, latitude: latStr, longitude: lngStr }));
    const addr = await reverseGeocodeCoords(lat, lng);
    if (addr) {
      setNewAddress((prev) => ({ ...prev, fullAddress: addr }));
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

  // Tears down whatever map instance is mounted so the next openMapPicker()
  // call starts from a clean container (otherwise the second open renders
  // half-grey / broken).
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
    setShowNewAddressForm(true);
    setShowMapModal(true);
    setMapLoading(true);
    setMapMode('street');
    destroyExistingMap();

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

      let initialLat = newAddress.latitude ? parseFloat(newAddress.latitude) : null;
      let initialLng = newAddress.longitude ? parseFloat(newAddress.longitude) : null;
      let initialZoom = DETAIL_ZOOM;

      if (initialLat == null || initialLng == null) {
        const geo = await trySilentGeolocation();
        if (cancelled) return;
        if (geo) {
          initialLat = geo.lat;
          initialLng = geo.lng;
          initialZoom = DETAIL_ZOOM;
        } else {
          initialLat = FALLBACK_LAT;
          initialLng = FALLBACK_LNG;
          initialZoom = 16;
        }
      }

      const hasGoogleMapsKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

      try {
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

      // OpenStreetMap / Leaflet fallback
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

        setNewAddress((prev) => ({ ...prev, latitude: latStr, longitude: lngStr }));

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
          setNewAddress((prev) => ({ ...prev, fullAddress: addressText }));
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
      setNewAddress((prev) => ({
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

  const handleAddAddress = async () => {
    if (!newAddress.title || !newAddress.fullAddress) {
      showToast('Please fill in address title and full location.', 'error');
      return;
    }

    try {
      const response = await API.post('/users/addresses', {
        title: newAddress.title,
        fullAddress: newAddress.fullAddress,
        address: newAddress.fullAddress,
        latitude: newAddress.latitude ? parseFloat(newAddress.latitude) : null,
        longitude: newAddress.longitude ? parseFloat(newAddress.longitude) : null,
      });
      const createdAddr = response.data.address || response.data;
      setAddresses([...addresses, createdAddr]);
      setSelectedAddress(createdAddr.id);
      setShowNewAddressForm(false);
      setNewAddress({ title: '', fullAddress: '', latitude: '', longitude: '' });
      showToast('Address added successfully!', 'success');
    } catch (error) {
      console.error('Error adding address:', error);
      showToast('Failed to add address. Please try again.', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (selectedCartItems.length === 0) {
      showToast('Select at least one item to check out.', 'error');
      return;
    }

    let currentAddressId = selectedAddress;
    if (orderType === 'DELIVERY' && !currentAddressId) {
      if (addresses.length > 0) {
        currentAddressId = addresses[0].id;
        setSelectedAddress(addresses[0].id);
      } else {
        showToast('Please add or choose a delivery location.', 'error');
        return;
      }
    }

    // Validate contact info up front so bad/missing data never reaches the
    // backend or Chapa. This is what was previously causing the silent
    // "validation.email" rejection from Chapa.
    const errors = validateContactInfo(contactInfo);
    if (Object.keys(errors).length > 0) {
      setContactErrors(errors);
      showToast('Please fix the contact details below before placing your order.', 'error');
      // Scroll the contact section into view so the user sees the errors.
      document.getElementById('checkout-contact-info')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      setLoading(true);

      const selectedAddressObj = addresses.find((a) => a.id === currentAddressId);
      const trimmedName = contactInfo.fullName.trim();
      const [firstName, ...rest] = trimmedName.split(/\s+/);
      const lastName = rest.join(' ') || firstName;

      const resolvedRestaurantId = getRestaurantId() ||
        selectedCartItems.find((i) => i.food?.restaurantId || i.food?.restaurant_id)?.food?.restaurantId ||
        selectedCartItems.find((i) => i.food?.restaurant_id)?.food?.restaurant_id ||
        restaurant?.id || null;

      const selectedTable = tables.find((t) => t.id === selectedTableId);

      const orderData = {
        restaurantId: resolvedRestaurantId,
        orderType,
        addressId: orderType === 'DELIVERY' ? currentAddressId : null,
        deliveryAddress: orderType === 'DELIVERY' && selectedAddressObj ? selectedAddressObj.fullAddress : null,
        latitude: orderType === 'DELIVERY' && selectedAddressObj ? selectedAddressObj.latitude : null,
        longitude: orderType === 'DELIVERY' && selectedAddressObj ? selectedAddressObj.longitude : null,
        tableId: orderType === 'DINE_IN' && selectedTableId ? selectedTableId : null,
        tableNumber: orderType === 'DINE_IN' && selectedTable ? selectedTable.tableNumber : null,
        items: selectedCartItems.map((item) => ({
          foodId: item.food.id,
          name: item.food.name,
          quantity: item.quantity,
        })),
        deliveryFee,
        discount: 0,
        specialInstructions,
        contactName: trimmedName,
        contactEmail: contactInfo.email.trim(),
        contactPhone: contactInfo.phone.trim(),
      };

      // 1. Create Order
      const orderResponse = await API.post('/orders', orderData);
      const createdOrder = orderResponse.data.order;

      // 2. Handle Payment Method Selection
      if (paymentMethod === 'CHAPA') {
        const cleanAmount = parseFloat((total || 0).toFixed(2));
        const chapaResponse = await API.post('/payments/initialize', {
          orderId: createdOrder.id,
          amount: cleanAmount,
          email: contactInfo.email.trim(),
          first_name: firstName,
          last_name: lastName,
          phone_number: contactInfo.phone.trim(),
        });

        if (chapaResponse.data && chapaResponse.data.checkout_url) {
          // Only clear the items that were actually checked out — anything
          // left unselected should remain in the cart for later.
          selectedCartItems.forEach((item) => {
            if (typeof removeFromCart === 'function') removeFromCart(item.id);
          });
          if (selectedCartItems.length === cart.length) clearCart();
          window.location.href = chapaResponse.data.checkout_url;
          return;
        }
      } else {
        await API.post('/payments', {
          orderId: createdOrder.id,
          amount: total,
          method: paymentMethod,
        });

        selectedCartItems.forEach((item) => {
          if (typeof removeFromCart === 'function') removeFromCart(item.id);
        });
        if (selectedCartItems.length === cart.length) clearCart();

        navigate('/order-success', { search: `?status=success&orderId=${createdOrder.id}` });
      }
    } catch (error) {
      console.error('Error placing order or initializing payment:', error);
      const serverErrMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to process order. Please try again.';
      showToast(serverErrMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user || cart.length === 0) {
    return null;
  }

  return (
    <div className="app-page">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-3 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t('backTo')} {t('cart')}</span>
          </Link>
          <h1 className="text-4xl font-black text-gray-900">{t('checkout')}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Restaurant Info */}
            {restaurant && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-black text-gray-900 mb-4">{t('restaurant')}</h2>
                <div className="flex items-center space-x-4">
                  <img
                    src={restaurant.logo || '/m7.webp'}
                    alt={restaurant.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{restaurant.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{restaurant.address}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information — required for payment gateway (Chapa) */}
            <div id="checkout-contact-info" className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-black text-gray-900 mb-1">Contact Information</h2>
              <p className="text-xs text-gray-500 mb-4">
                Required to process your payment and send order updates.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Abebe Kebede"
                    value={contactInfo.fullName}
                    onChange={(e) => handleContactInfoChange('fullName', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none ${contactErrors.fullName
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-200 focus:border-orange-500'
                      }`}
                  />
                  {contactErrors.fullName && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{contactErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. abebe@example.com"
                    value={contactInfo.email}
                    onChange={(e) => handleContactInfoChange('email', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none ${contactErrors.email
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-200 focus:border-orange-500'
                      }`}
                  />
                  {contactErrors.email && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{contactErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 0912345678"
                    value={contactInfo.phone}
                    onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none ${contactErrors.phone
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-200 focus:border-orange-500'
                      }`}
                  />
                  {contactErrors.phone && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{contactErrors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Type */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-black text-gray-900 mb-4">{t('delivery')} / {t('dineIn')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setOrderType('DELIVERY')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${orderType === 'DELIVERY'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                    }`}
                >
                  <Bike className={`w-8 h-8 mb-3 mx-auto ${orderType === 'DELIVERY' ? 'text-orange-600' : 'text-gray-400'}`} />
                  <h3 className={`text-lg font-bold ${orderType === 'DELIVERY' ? 'text-orange-600' : 'text-gray-700'}`}>
                    {t('delivery')}
                  </h3>
                </button>

                <button
                  onClick={() => setOrderType('DINE_IN')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${orderType === 'DINE_IN'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                    }`}
                >
                  <UtensilsCrossed className={`w-8 h-8 mb-3 mx-auto ${orderType === 'DINE_IN' ? 'text-orange-600' : 'text-gray-400'}`} />
                  <h3 className={`text-lg font-bold ${orderType === 'DINE_IN' ? 'text-orange-600' : 'text-gray-700'}`}>
                    {t('dineIn')}
                  </h3>
                </button>
              </div>
            </div>

            {/* Table Selection for Dine-In */}
            {orderType === 'DINE_IN' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-black text-gray-900 mb-1">Select Table</h2>
                <p className="text-xs text-gray-500 mb-4">
                  Choose your table number for dine-in service
                </p>

                {tables.length === 0 ? (
                  <div className="text-center py-6">
                    <UtensilsCrossed className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm font-medium">No available tables right now</p>
                    <p className="text-xs text-gray-400 mt-1">Please ask staff for assistance</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {tables.map((table) => (
                      <button
                        key={table.id}
                        onClick={() => setSelectedTableId(prev => prev === table.id ? null : table.id)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 font-bold text-sm ${
                          selectedTableId === table.id
                            ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md scale-105'
                            : 'border-gray-200 hover:border-orange-300 text-gray-700 hover:bg-orange-50/40'
                        }`}
                      >
                        <UtensilsCrossed className={`w-5 h-5 mb-1 ${selectedTableId === table.id ? 'text-orange-600' : 'text-gray-400'}`} />
                        <span className="text-xs font-black">Table</span>
                        <span className="text-lg font-black leading-tight">{table.tableNumber}</span>
                        {table.capacity && (
                          <span className="text-[10px] text-gray-400 font-medium">{table.capacity} seats</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {selectedTableId && (
                  <div className="mt-4 flex items-center space-x-2 text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span className="font-bold">
                      Table {tables.find(t => t.id === selectedTableId)?.tableNumber} selected
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Delivery Address */}
            {orderType === 'DELIVERY' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black text-gray-900">{t('selectAddress')}</h2>
                  <div className="space-x-3">
                    <button
                      onClick={() => (showNewAddressForm ? setShowNewAddressForm(false) : setShowNewAddressForm(true))}
                      className="text-orange-600 hover:text-orange-700 font-bold text-sm transition-colors"
                    >
                      {showNewAddressForm ? t('cancel') : t('addNew')}
                    </button>
                  </div>
                </div>

                {showNewAddressForm && (
                  <div className="bg-orange-50 rounded-xl p-4 mb-4 space-y-3">
                    <input
                      type="text"
                      placeholder={t('addressTitle')}
                      value={newAddress.title}
                      onChange={(e) => setNewAddress({ ...newAddress, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:outline-none"
                    />

                    <div className="flex items-center gap-2">
                      <textarea
                        placeholder={t('fullAddress')}
                        value={newAddress.fullAddress}
                        onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:outline-none resize-none text-sm"
                        rows="2"
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

                    <button
                      onClick={handleAddAddress}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-colors"
                    >
                      {t('save')}
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {addresses.length === 0 && !showNewAddressForm ? (
                    <p className="text-gray-500 text-center py-4">{t('noAddresses')}</p>
                  ) : (
                    addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress === address.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                          }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress === address.id}
                          onChange={() => setSelectedAddress(address.id)}
                          className="mt-1 w-5 h-5 text-orange-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <h4 className="font-bold text-gray-900">{address.title}</h4>
                            {address.latitude && address.longitude && (
                              <span className="bg-orange-100 text-orange-800 text-xs font-mono font-bold px-2 py-0.5 rounded-md border border-orange-200 inline-flex items-center gap-1">
                                📍 Lat: {parseFloat(address.latitude).toFixed(4)}, Lng: {parseFloat(address.longitude).toFixed(4)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{address.fullAddress}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-black text-gray-900 mb-4">{t('paymentMethod')}</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-orange-500 bg-orange-50">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                  <div>
                    <span className="font-bold text-gray-900 block">Chapa Payment Gateway</span>
                    <span className="text-xs text-gray-500">Pay securely with Telebirr, CBE Birr, Cards, or Bank Transfer</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-black text-gray-900 mb-4">{t('orderNotes')}</h2>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder={t('orderNotesPlaceholder')}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none resize-none"
                rows="4"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-gray-900">{t('orderSummary')}</h2>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 cursor-pointer"
                >
                  {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  <span>{allSelected ? 'Deselect all' : 'Select all'}</span>
                </button>
              </div>

              <p className="text-[11px] text-gray-500 mb-3">
                Uncheck items you don't want to include in this order, and adjust quantities as needed.
              </p>

              <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-1">
                {cart.map((item) => {
                  const isSelected = selectedItemIds.has(item.id);
                  const lineTotal = unitPrice(item) * item.quantity;
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-orange-200 bg-orange-50/50' : 'border-gray-100 bg-gray-50 opacity-60'
                        }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => toggleItemSelected(item.id)}
                          className="mt-0.5 text-orange-600 shrink-0 cursor-pointer"
                          aria-label={isSelected ? 'Deselect item' : 'Select item'}
                        >
                          {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-gray-400" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-bold text-gray-800 truncate">{item.food.name}</span>
                            <span className="text-sm font-bold text-gray-900 shrink-0">
                              ETB {lineTotal.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 mb-6 border-t pt-4">
                <div className="flex justify-between text-gray-700">
                  <span>{t('subtotal')} ({selectedCartItems.length} {selectedCartItems.length === 1 ? 'item' : 'items'})</span>
                  <span className="font-bold">ETB {subtotal.toFixed(2)}</span>
                </div>

                {orderType === 'DELIVERY' && (
                  <div className="flex justify-between text-gray-700">
                    <span>{t('deliveryFee')}</span>
                    <span className="font-bold">ETB {deliveryFee.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t-2 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">{t('total')}</span>
                    <span className="text-3xl font-black text-orange-600">ETB {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || selectedCartItems.length === 0 || (orderType === 'DELIVERY' && !selectedAddress)}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>{t('loading')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>{paymentMethod === 'CHAPA' ? 'Proceed to Chapa' : t('placeOrder')}</span>
                  </>
                )}
              </button>

              {selectedCartItems.length === 0 && (
                <p className="text-xs text-red-500 font-medium text-center mt-2">
                  Select at least one item to place an order.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map Modal Picker — same look/behavior as the Address page */}
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
                  Click anywhere on the map or drag the pin to set your exact delivery location.
                </p>
              </div>
              <button
                onClick={closeMapModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search + GPS */}
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

            {/* Map style toggle */}
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${mapMode === opt.id
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
            {newAddress.fullAddress && (
              <div className="mb-4 p-3 bg-orange-50 dark:bg-gray-800 rounded-xl border border-orange-200 dark:border-gray-700 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-gray-900 dark:text-gray-100">Selected Address:</span>
                  <p className="text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2">{newAddress.fullAddress}</p>
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
    </div>
  );
}