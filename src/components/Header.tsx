import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Compass, X, History, Sparkles } from 'lucide-react';
import { Location, TemperatureUnit, SpeedUnit } from '../types/weather';
import { searchLocations } from '../services/weatherApi';

interface HeaderProps {
  onSelectLocation: (location: Location) => void;
  onUseCurrentLocation: () => void;
  unit: TemperatureUnit;
  onToggleUnit: () => void;
  speedUnit: SpeedUnit;
  onToggleSpeedUnit: () => void;
  isLoading: boolean;
  selectedLocationName?: string;
}

const POPULAR_CITIES: Location[] = [
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060 },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708 },
];

export const Header: React.FC<HeaderProps> = ({
  onSelectLocation,
  onUseCurrentLocation,
  unit,
  onToggleUnit,
  speedUnit,
  onToggleSpeedUnit,
  isLoading,
  selectedLocationName,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<Location[]>(() => {
    try {
      const saved = localStorage.getItem('weather_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced live search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await searchLocations(query);
        setSuggestions(results);
        if (results.length === 0) {
          setSearchError(`No city found matching "${query}"`);
        }
      } catch (err: any) {
        setSearchError('Failed to fetch city suggestions');
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (loc: Location) => {
    onSelectLocation(loc);
    setQuery('');
    setIsOpen(false);
    setSuggestions([]);

    // Save to recent
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.name.toLowerCase() !== loc.name.toLowerCase());
      const updated = [loc, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('weather_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
    } else {
      setIsSearching(true);
      try {
        const results = await searchLocations(query);
        if (results.length > 0) {
          handleSelect(results[0]);
        } else {
          setSearchError(`No city matching "${query}" was found. Try another city.`);
        }
      } catch (err: any) {
        setSearchError(err.message || 'Error searching city');
      } finally {
        setIsSearching(false);
      }
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 lg:px-8 py-3.5 text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
                WEATHER<span className="font-normal text-slate-500 underline decoration-blue-500 underline-offset-4">INTEL</span>
              </h1>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Precision forecasts & dynamic planning
              </p>
            </div>
          </div>

          {/* Unit Toggle controls for mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onToggleUnit}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 border border-slate-200 text-blue-600 hover:bg-slate-200 transition"
              title="Toggle Temperature Unit"
            >
              °{unit}
            </button>
            <button
              onClick={onToggleSpeedUnit}
              className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition"
              title="Toggle Wind Speed Unit"
            >
              {speedUnit}
            </button>
          </div>
        </div>

        {/* Search Bar Container */}
        <div ref={searchContainerRef} className="relative w-full md:max-w-md">
          <form onSubmit={handleFormSubmit} className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search city (e.g. London, Tokyo, New York)..."
              className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                }}
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Live Search Suggestions Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-100">
              {isSearching && (
                <div className="p-3 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  Searching location database...
                </div>
              )}

              {!isSearching && searchError && (
                <div className="p-3 text-center text-xs text-rose-600 bg-rose-50">
                  {searchError}
                </div>
              )}

              {!isSearching && suggestions.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50">
                    City Matches
                  </div>
                  {suggestions.map((loc, idx) => (
                    <button
                      key={`${loc.latitude}-${loc.longitude}-${idx}`}
                      onClick={() => handleSelect(loc)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between group transition text-sm text-slate-800"
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-blue-600 shrink-0 group-hover:scale-110 transition" />
                        <div>
                          <span className="font-semibold text-slate-800">{loc.name}</span>
                          <span className="text-xs text-slate-500 ml-1.5">
                            {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Recent searches */}
              {!isSearching && suggestions.length === 0 && recentSearches.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50 flex justify-between items-center">
                    <span>Recent Searches</span>
                    <History className="w-3 h-3 text-slate-400" />
                  </div>
                  {recentSearches.map((loc, idx) => (
                    <button
                      key={`recent-${idx}`}
                      onClick={() => handleSelect(loc)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-xs text-slate-700"
                    >
                      <History className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800">{loc.name}</span>
                      <span className="text-slate-500 text-[11px]">{loc.country}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Popular list when input is empty */}
              {!isSearching && suggestions.length === 0 && !query && (
                <div>
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Popular Cities</span>
                  </div>
                  <div className="p-2 grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {POPULAR_CITIES.map((city) => (
                      <button
                        key={city.name}
                        onClick={() => handleSelect(city)}
                        className="text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-xs font-medium text-slate-700 transition flex items-center gap-1.5"
                      >
                        <MapPin className="w-3 h-3 text-blue-600" />
                        {city.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Unit Toggles */}
        <div className="hidden md:flex items-center gap-3">
          {/* Temperature unit switch */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1">
            <button
              onClick={onToggleUnit}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                unit === 'C'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              °C
            </button>
            <button
              onClick={onToggleUnit}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                unit === 'F'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              °F
            </button>
          </div>

          {/* Speed unit switch */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1">
            <button
              onClick={onToggleSpeedUnit}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                speedUnit === 'kmh'
                  ? 'bg-white text-blue-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              km/h
            </button>
            <button
              onClick={onToggleSpeedUnit}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                speedUnit === 'mph'
                  ? 'bg-white text-blue-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              mph
            </button>
          </div>
        </div>
      </div>

      {/* Quick City Buttons Chips Bar */}
      <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          Quick Access:
        </span>
        {POPULAR_CITIES.map((city) => (
          <button
            key={`chip-${city.name}`}
            onClick={() => handleSelect(city)}
            className={`px-3 py-0.5 rounded-full text-xs font-semibold shrink-0 transition border ${
              selectedLocationName?.toLowerCase() === city.name.toLowerCase()
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {city.name}
          </button>
        ))}
      </div>
    </header>
  );
};
