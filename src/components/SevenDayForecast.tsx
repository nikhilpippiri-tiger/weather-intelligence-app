import React from 'react';
import { Calendar, Umbrella, Wind, Thermometer, ChevronRight } from 'lucide-react';
import { DailyForecast, TemperatureUnit, SpeedUnit } from '../types/weather';
import { getWMOInfo } from '../utils/wmoCodes';
import { formatTemperature, formatSpeed, formatDateString } from '../utils/formatters';

interface SevenDayForecastProps {
  daily: DailyForecast[];
  unit: TemperatureUnit;
  speedUnit: SpeedUnit;
  selectedDate?: string;
  onSelectDay?: (day: DailyForecast) => void;
}

export const SevenDayForecast: React.FC<SevenDayForecastProps> = ({
  daily,
  unit,
  speedUnit,
  selectedDate,
  onSelectDay,
}) => {
  // Find overall min and max temp across the 7 days for normalized visual bars
  const minTempAll = Math.min(...daily.map((d) => d.minTemp));
  const maxTempAll = Math.max(...daily.map((d) => d.maxTemp));
  const tempSpan = Math.max(1, maxTempAll - minTempAll);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">7-Day Extended Forecast</h3>
            <p className="text-xs text-slate-500 font-medium">Daily temperatures & precipitation outlook</p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          7 Days
        </span>
      </div>

      <div className="space-y-2.5">
        {daily.map((day, idx) => {
          const wmoInfo = getWMOInfo(day.weatherCode, true);
          const Icon = wmoInfo.icon;
          const isToday = idx === 0;
          const isSelected = selectedDate === day.date;

          // Compute left offset % and width % for normalized bar
          const leftPercent = ((day.minTemp - minTempAll) / tempSpan) * 100;
          const barWidthPercent = Math.max(10, ((day.maxTemp - day.minTemp) / tempSpan) * 100);

          return (
            <div
              key={day.date}
              onClick={() => onSelectDay && onSelectDay(day)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-blue-50/90 border-blue-300 shadow-xs'
                  : isToday
                  ? 'bg-slate-50 border-blue-200 hover:bg-slate-100'
                  : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              {/* Day & Date & Condition */}
              <div className="flex items-center gap-3 min-w-[180px]">
                <div className="p-2 rounded-xl bg-white border border-slate-200 text-blue-600 group-hover:scale-110 transition shadow-2xs">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {day.dayOfWeek}
                    </span>
                    {isToday && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-blue-600 text-white rounded">
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-medium block">
                    {formatDateString(day.date)} • {wmoInfo.label}
                  </span>
                </div>
              </div>

              {/* Rain / Precipitation Badge */}
              <div className="flex items-center gap-4 text-xs font-medium">
                {day.precipitationSum > 0 ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 font-semibold">
                    <Umbrella className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{day.precipitationSum.toFixed(1)} mm</span>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs font-medium hidden md:inline">0.0 mm</span>
                )}

                {day.maxWindSpeed > 25 && (
                  <div className="hidden sm:flex items-center gap-1 text-amber-700 text-xs font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Wind className="w-3.5 h-3.5" />
                    <span>{formatSpeed(day.maxWindSpeed, speedUnit)}</span>
                  </div>
                )}
              </div>

              {/* Temperature Visual Bar & Range */}
              <div className="w-full sm:w-56 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 w-10 text-right">
                  {formatTemperature(day.minTemp, unit)}
                </span>

                {/* Progress span bar */}
                <div className="flex-1 h-2 bg-slate-200 rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-blue-500 via-amber-500 to-rose-500"
                    style={{
                      left: `${Math.max(0, leftPercent)}%`,
                      width: `${Math.min(100, barWidthPercent)}%`,
                    }}
                  />
                </div>

                <span className="text-xs font-bold text-slate-900 w-10 text-left">
                  {formatTemperature(day.maxTemp, unit)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
