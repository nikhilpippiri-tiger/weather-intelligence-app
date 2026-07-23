import React from 'react';
import { MapPin, Wind, Droplets, Gauge, Sun, RefreshCw, Eye } from 'lucide-react';
import { WeatherData, TemperatureUnit, SpeedUnit } from '../types/weather';
import { getWMOInfo } from '../utils/wmoCodes';
import { formatTemperature, formatSpeed } from '../utils/formatters';

interface CurrentWeatherCardProps {
  weatherData: WeatherData;
  unit: TemperatureUnit;
  speedUnit: SpeedUnit;
  onRefresh: () => void;
  isLoading: boolean;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  weatherData,
  unit,
  speedUnit,
  onRefresh,
  isLoading,
}) => {
  const { current, location, daily, fetchedAt } = weatherData;
  const wmoInfo = getWMOInfo(current.weatherCode, current.isDay);
  const IconComponent = wmoInfo.icon;

  const today = daily[0] || { maxTemp: current.temperature, minTemp: current.temperature };

  // UV level tag
  const getUvBadge = (uv: number) => {
    if (uv <= 2) return { text: 'Low', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    if (uv <= 5) return { text: 'Moderate', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    if (uv <= 7) return { text: 'High', bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40' };
    if (uv <= 10) return { text: 'Very High', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
    return { text: 'Extreme', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
  };

  const uvBadge = getUvBadge(current.uvIndex);

  return (
    <div className="relative bg-white rounded-2xl p-6 lg:p-8 border border-slate-200 shadow-sm text-slate-900 transition-all duration-300">
      {/* Header bar: City Name & Refresh button */}
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-900">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              {location.name}
            </span>
            {location.countryCode && (
              <span className="px-2 py-0.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-md uppercase tracking-wider border border-slate-200">
                {location.countryCode}
              </span>
            )}
            {weatherData.isFallback && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 rounded-md border border-amber-200" title="Live weather endpoint unreachable. Showing estimated cached weather.">
                Estimated / Offline Mode
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium ml-1 mt-1.5">
            {location.admin1 ? `${location.admin1}, ` : ''}{location.country || 'Global Location'}
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh current weather data"
          className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200 transition flex items-center gap-2 text-xs font-semibold text-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Updated {fetchedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </button>
      </div>

      {/* Main Temperature & Weather Icon Display */}
      <div className="relative z-10 my-6 sm:my-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
            <IconComponent className="w-16 h-16 sm:w-20 sm:h-20 text-blue-600" />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl sm:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight">
                {formatTemperature(current.temperature, unit)}
              </span>
              <span className="text-2xl font-bold text-slate-400 uppercase">
                {unit}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-slate-800">
                {wmoInfo.label}
              </span>
              <span className="text-xs text-slate-500">• {wmoInfo.description}</span>
            </div>
          </div>
        </div>

        {/* High / Low Range Badge */}
        <div className="flex sm:flex-col justify-between sm:items-end w-full sm:w-auto p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Day Range</span>
            <div className="text-sm sm:text-base font-extrabold flex items-center gap-2 mt-0.5">
              <span className="text-emerald-600">High: {formatTemperature(today.maxTemp, unit)}</span>
              <span className="text-blue-600">Low: {formatTemperature(today.minTemp, unit)}</span>
            </div>
          </div>
          <div className="text-right sm:mt-2">
            <span className="text-xs text-slate-600 font-medium">
              Feels like <strong className="text-slate-900 font-bold">{formatTemperature(current.apparentTemperature, unit)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Weather Metrics Cards */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-100">
        {/* Humidity */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-100/70 text-blue-700">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Humidity
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900">
              {current.relativeHumidity}%
            </span>
          </div>
        </div>

        {/* Wind Speed */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-100/70 text-teal-700">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Wind Speed
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900">
              {formatSpeed(current.windSpeed, speedUnit)}
            </span>
          </div>
        </div>

        {/* Air Pressure */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-100/70 text-indigo-700">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Pressure
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900">
              {Math.round(current.pressure)} <span className="text-xs font-semibold text-slate-500">hPa</span>
            </span>
          </div>
        </div>

        {/* UV Index */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-100/70 text-amber-700">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              UV Index
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-base sm:text-lg font-black text-slate-900">
                {current.uvIndex.toFixed(1)}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${uvBadge.bg}`}>
                {uvBadge.text}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
