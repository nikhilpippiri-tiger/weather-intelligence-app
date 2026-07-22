import React from 'react';
import {
  Sparkles,
  Umbrella,
  Sun,
  Droplets,
  Shirt,
  ShieldAlert,
  Wind,
  Layers,
  CloudRain,
  Activity,
  Bike,
  Utensils,
  Footprints,
  Info,
  CheckCircle2,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { CurrentWeather, DailyForecast } from '../types/weather';
import { generateRecommendations, calculateActivitySuitability } from '../utils/weatherRecommendations';

interface PlanningRecommendationsCardProps {
  current: CurrentWeather;
  daily: DailyForecast[];
}

export const PlanningRecommendationsCard: React.FC<PlanningRecommendationsCardProps> = ({
  current,
  daily,
}) => {
  const recommendations = generateRecommendations(current, daily);
  const activities = calculateActivitySuitability(current, daily);

  // Map icon strings to Lucide components
  const getIcon = (name: string) => {
    switch (name) {
      case 'Umbrella': return Umbrella;
      case 'Droplets': return Droplets;
      case 'Sun': return Sun;
      case 'Shirt': return Shirt;
      case 'Layers': return Layers;
      case 'ShieldAlert': return ShieldAlert;
      case 'Wind': return Wind;
      case 'CloudRain': return CloudRain;
      case 'Sparkles': return Sparkles;
      case 'Activity': return Activity;
      case 'Bike': return Bike;
      case 'Utensils': return Utensils;
      case 'Footprints': return Footprints;
      default: return Info;
    }
  };

  const getSeverityStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'danger':
        return 'bg-rose-50 border-rose-200 text-rose-900';
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Smart Planning Advice</h3>
            <p className="text-xs text-slate-500 font-medium">Dynamic recommendations & outdoor activity scores</p>
          </div>
        </div>
      </div>

      {/* Dynamic Advice Cards List */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Weather Guidance & Precautions
        </h4>
        {recommendations.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Standard weather conditions. No severe warnings or special gear required today.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.map((rec) => {
              const IconComp = getIcon(rec.iconName);
              const styles = getSeverityStyle(rec.type);

              return (
                <div
                  key={rec.id}
                  className={`p-4 rounded-xl border ${styles} flex items-start gap-3.5 transition hover:shadow-xs`}
                >
                  <div className="p-2 rounded-lg bg-white shadow-xs border border-slate-200/60 shrink-0">
                    <IconComp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm leading-snug">
                      {rec.title}
                    </h5>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {rec.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Activity Suitability Index */}
      <div className="pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Outdoor Activity Ratings
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {activities.map((act) => {
            const Icon = getIcon(act.icon);

            const getScoreBadge = (score: number) => {
              if (score >= 8) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
              if (score >= 6) return 'bg-blue-50 text-blue-700 border-blue-200';
              if (score >= 4) return 'bg-amber-50 text-amber-700 border-amber-200';
              return 'bg-rose-50 text-rose-700 border-rose-200';
            };

            return (
              <div
                key={act.name}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 hover:bg-slate-100/80 transition flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white text-blue-600 border border-slate-200/60">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">{act.name}</span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getScoreBadge(
                      act.score
                    )}`}
                  >
                    {act.score}/10
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        act.score >= 8
                          ? 'bg-emerald-500'
                          : act.score >= 6
                          ? 'bg-blue-600'
                          : act.score >= 4
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${act.score * 10}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight font-medium">
                    {act.reason}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
