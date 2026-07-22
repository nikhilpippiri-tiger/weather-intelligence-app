import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { TrendingUp, Clock, Calendar } from 'lucide-react';
import { DailyForecast, HourlyForecast, TemperatureUnit } from '../types/weather';
import { formatTemperature, formatDateString } from '../utils/formatters';

interface TemperatureChartProps {
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  unit: TemperatureUnit;
}

export const TemperatureChart: React.FC<TemperatureChartProps> = ({
  daily,
  hourly,
  unit,
}) => {
  const [activeTab, setActiveTab] = useState<'7day' | '24hour'>('7day');

  // Convert daily temperatures according to selected unit for chart rendering
  const convertTemp = (temp: number) => {
    if (unit === 'F') {
      return Math.round((temp * 9) / 5 + 32);
    }
    return Math.round(temp);
  };

  // Format 7-Day data for Recharts
  const chartData7Day = daily.map((d) => ({
    name: d.dayOfWeek,
    date: formatDateString(d.date),
    maxTemp: convertTemp(d.maxTemp),
    minTemp: convertTemp(d.minTemp),
    precipitation: d.precipitationSum,
  }));

  // Format 24-Hour data for Recharts
  const chartData24Hour = hourly.map((h) => ({
    time: h.formattedTime,
    temp: convertTemp(h.temperature),
    rainProb: h.precipitationProbability,
  }));

  const unitSymbol = `°${unit}`;

  // Custom tooltip component for 7-day chart
  const CustomTooltip7Day = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1 text-white">
          <p className="font-bold text-white text-sm">
            {label} ({data.date})
          </p>
          <div className="flex items-center gap-2 text-rose-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Max Temp: {data.maxTemp}{unitSymbol}</span>
          </div>
          <div className="flex items-center gap-2 text-blue-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Min Temp: {data.minTemp}{unitSymbol}</span>
          </div>
          {data.precipitation > 0 && (
            <p className="text-blue-300 text-[11px] pt-1 border-t border-slate-800">
              Expected Rain: {data.precipitation.toFixed(1)} mm
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for 24-hour chart
  const CustomTooltip24Hour = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1 text-white">
          <p className="font-bold text-white text-sm">{label}</p>
          <p className="text-amber-300 font-semibold">Temperature: {data.temp}{unitSymbol}</p>
          <p className="text-blue-300 font-semibold">Rain Probability: {data.rainProb}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Temperature Trends</h3>
            <p className="text-xs text-slate-500 font-medium">Visual temperature curves & precipitation analytics</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('7day')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === '7day'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            7-Day Range
          </button>
          <button
            onClick={() => setActiveTab('24hour')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === '24hour'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            24 Hours
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="w-full h-72 sm:h-80">
        {activeTab === '7day' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData7Day} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} unit={unitSymbol} />
              <Tooltip content={<CustomTooltip7Day />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="maxTemp"
                name={`Max Temp (${unitSymbol})`}
                stroke="#2563eb"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMax)"
                dot={{ r: 4, fill: '#2563eb' }}
              />
              <Area
                type="monotone"
                dataKey="minTemp"
                name={`Min Temp (${unitSymbol})`}
                stroke="#64748b"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMin)"
                dot={{ r: 4, fill: '#64748b' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData24Hour} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke="#2563eb" fontSize={12} tickLine={false} unit={unitSymbol} />
              <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={12} tickLine={false} unit="%" domain={[0, 100]} />
              <Tooltip content={<CustomTooltip24Hour />} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }} />
              <Bar yAxisId="right" dataKey="rainProb" name="Rain Prob (%)" fill="#93c5fd" opacity={0.7} radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="temp" name={`Temperature (${unitSymbol})`} fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
