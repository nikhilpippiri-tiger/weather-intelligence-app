import React from 'react';
import { Clock, Umbrella } from 'lucide-react';
import { HourlyForecast, TemperatureUnit } from '../types/weather';
import { getWMOInfo } from '../utils/wmoCodes';
import { formatTemperature } from '../utils/formatters';

interface HourlyForecastCardProps {
  hourly: HourlyForecast[];
  unit: TemperatureUnit;
}

export const HourlyForecastCard: React.FC<HourlyForecastCardProps> = ({
  hourly,
  unit,
}) => {
  if (!hourly || hourly.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Hourly Forecast (Next 24 Hours)</h3>
            <p className="text-xs text-slate-500 font-medium">Hour-by-hour temperature and rain probability</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-slate-50">
        {hourly.slice(0, 24).map((hour, idx) => {
          const wmoInfo = getWMOInfo(hour.weatherCode, true);
          const Icon = wmoInfo.icon;
          const isFirst = idx === 0;

          return (
            <div
              key={hour.time}
              className={`flex-shrink-0 w-24 p-3 rounded-xl border text-center transition flex flex-col items-center justify-between gap-2.5 ${
                isFirst
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                  : 'bg-slate-50 border-slate-200/90 text-slate-800 hover:bg-slate-100'
              }`}
            >
              <span className={`text-xs font-bold ${isFirst ? 'text-blue-100' : 'text-slate-600'}`}>
                {isFirst ? 'Now' : hour.formattedTime}
              </span>

              <div className={`p-2 rounded-xl ${isFirst ? 'bg-blue-700 text-white' : 'bg-white text-blue-600 border border-slate-100'}`}>
                <Icon className="w-6 h-6" />
              </div>

              <span className={`text-base font-extrabold ${isFirst ? 'text-white' : 'text-slate-900'}`}>
                {formatTemperature(hour.temperature, unit)}
              </span>

              {hour.precipitationProbability > 0 ? (
                <div className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                  isFirst ? 'bg-blue-500 text-white' : 'text-blue-600 bg-blue-50 border border-blue-100'
                }`}>
                  <Umbrella className="w-3 h-3" />
                  <span>{hour.precipitationProbability}%</span>
                </div>
              ) : (
                <span className={`text-[10px] font-mono ${isFirst ? 'text-blue-200' : 'text-slate-400'}`}>0% rain</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
