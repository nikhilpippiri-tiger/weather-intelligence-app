import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { SevenDayForecast } from './components/SevenDayForecast';
import { PlanningRecommendationsCard } from './components/PlanningRecommendationsCard';
import { TemperatureChart } from './components/TemperatureChart';
import { HourlyForecastCard } from './components/HourlyForecastCard';
import { ErrorAlert } from './components/ErrorAlert';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { WeatherData, Location, TemperatureUnit, SpeedUnit, DailyForecast } from './types/weather';
import { fetchWeatherData, getLocationByCoords } from './services/weatherApi';

const DEFAULT_LOCATION: Location = {
  name: 'London',
  country: 'United Kingdom',
  countryCode: 'GB',
  latitude: 51.5074,
  longitude: -0.1278,
};

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location>(() => {
    try {
      const saved = localStorage.getItem('weather_last_location');
      return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
    } catch {
      return DEFAULT_LOCATION;
    }
  });

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [unit, setUnit] = useState<TemperatureUnit>(() => {
    return (localStorage.getItem('weather_unit') as TemperatureUnit) || 'C';
  });

  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>(() => {
    return (localStorage.getItem('weather_speed_unit') as SpeedUnit) || 'kmh';
  });

  const [selectedDay, setSelectedDay] = useState<DailyForecast | null>(null);

  // Load weather for location
  const loadWeather = useCallback(async (loc: Location) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(loc);
      setWeatherData(data);
      setSelectedDay(data.daily[0] || null);
      try {
        localStorage.setItem('weather_last_location', JSON.stringify(loc));
      } catch {}
    } catch (err: any) {
      console.error('Failed to load weather:', err);
      setError(err.message || 'Unable to fetch weather data for the selected location.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch weather when selectedLocation changes
  useEffect(() => {
    loadWeather(selectedLocation);
  }, [selectedLocation, loadWeather]);

  // Handle GPS location click
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const loc = await getLocationByCoords(lat, lon);
          setSelectedLocation(loc);
        } catch (err: any) {
          setError('Could not convert GPS coordinates to city location.');
          setIsLoading(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setError('Location access denied or unavailable. You can search for any city above.');
        setIsLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const toggleUnit = () => {
    const nextUnit: TemperatureUnit = unit === 'C' ? 'F' : 'C';
    setUnit(nextUnit);
    localStorage.setItem('weather_unit', nextUnit);
  };

  const toggleSpeedUnit = () => {
    const nextSpeed: SpeedUnit = speedUnit === 'kmh' ? 'mph' : 'kmh';
    setSpeedUnit(nextSpeed);
    localStorage.setItem('weather_speed_unit', nextSpeed);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Sticky Top Bar & Header */}
      <Header
        onSelectLocation={(loc) => setSelectedLocation(loc)}
        onUseCurrentLocation={handleUseCurrentLocation}
        unit={unit}
        onToggleUnit={toggleUnit}
        speedUnit={speedUnit}
        onToggleSpeedUnit={toggleSpeedUnit}
        isLoading={isLoading}
        selectedLocationName={selectedLocation.name}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Error Notification */}
        {error && (
          <ErrorAlert
            message={error}
            onRetry={() => loadWeather(selectedLocation)}
            onSearchFallback={(city) => setSelectedLocation(DEFAULT_LOCATION)}
          />
        )}

        {/* Loading State Skeleton */}
        {isLoading && !weatherData && <LoadingSkeleton />}

        {/* Loaded Weather Dashboard */}
        {weatherData && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Row: Current Conditions Hero Card */}
            <CurrentWeatherCard
              weatherData={weatherData}
              unit={unit}
              speedUnit={speedUnit}
              onRefresh={() => loadWeather(selectedLocation)}
              isLoading={isLoading}
            />

            {/* Next 24 Hours Timeline */}
            <HourlyForecastCard
              hourly={weatherData.hourly}
              unit={unit}
            />

            {/* Smart Planning Advice & Dynamic Recommendations */}
            <PlanningRecommendationsCard
              current={weatherData.current}
              daily={weatherData.daily}
            />

            {/* Middle Grid: 7-Day Forecast & Interactive Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 7-Day Extended Forecast */}
              <div className="lg:col-span-7">
                <SevenDayForecast
                  daily={weatherData.daily}
                  unit={unit}
                  speedUnit={speedUnit}
                  selectedDate={selectedDay?.date}
                  onSelectDay={(day) => setSelectedDay(day)}
                />
              </div>

              {/* Interactive Temperature Trend Charts */}
              <div className="lg:col-span-5">
                <TemperatureChart
                  daily={weatherData.daily}
                  hourly={weatherData.hourly}
                  unit={unit}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-4 px-8 text-xs border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span>Powered by Open-Meteo Infrastructure</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Systems Operational</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">React 19</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Tailwind CSS v4</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Recharts</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
