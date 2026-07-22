import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudRainWind,
  LucideIcon
} from 'lucide-react';

export interface WMOCodeInfo {
  code: number;
  label: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  bgAtmosphere: 'clear' | 'cloudy' | 'rainy' | 'snowy' | 'thunderstorm' | 'foggy';
}

export function getWMOInfo(code: number, isDay: boolean = true): WMOCodeInfo {
  switch (code) {
    case 0:
      return {
        code,
        label: 'Clear Sky',
        description: 'Sunny and clear conditions',
        icon: Sun,
        gradient: isDay ? 'from-amber-400 via-orange-400 to-amber-500' : 'from-slate-800 via-indigo-900 to-slate-900',
        bgAtmosphere: 'clear',
      };
    case 1:
      return {
        code,
        label: 'Mainly Clear',
        description: 'Mostly sunny with few clouds',
        icon: CloudSun,
        gradient: 'from-amber-300 via-sky-400 to-blue-500',
        bgAtmosphere: 'clear',
      };
    case 2:
      return {
        code,
        label: 'Partly Cloudy',
        description: 'Scattered clouds in the sky',
        icon: CloudSun,
        gradient: 'from-sky-400 via-blue-500 to-slate-600',
        bgAtmosphere: 'cloudy',
      };
    case 3:
      return {
        code,
        label: 'Overcast',
        description: 'Fully cloud covered sky',
        icon: Cloud,
        gradient: 'from-slate-500 via-gray-600 to-slate-700',
        bgAtmosphere: 'cloudy',
      };
    case 45:
    case 48:
      return {
        code,
        label: 'Foggy',
        description: 'Depositing rime fog and reduced visibility',
        icon: CloudFog,
        gradient: 'from-slate-400 via-stone-500 to-slate-600',
        bgAtmosphere: 'foggy',
      };
    case 51:
    case 53:
    case 55:
      return {
        code,
        label: 'Drizzle',
        description: 'Light to moderate fine rain droplets',
        icon: CloudDrizzle,
        gradient: 'from-blue-400 via-slate-500 to-cyan-600',
        bgAtmosphere: 'rainy',
      };
    case 56:
    case 57:
      return {
        code,
        label: 'Freezing Drizzle',
        description: 'Freezing rain drizzle onto surfaces',
        icon: CloudDrizzle,
        gradient: 'from-cyan-500 via-blue-600 to-slate-700',
        bgAtmosphere: 'snowy',
      };
    case 61:
      return {
        code,
        label: 'Slight Rain',
        description: 'Light rain showers',
        icon: CloudRain,
        gradient: 'from-sky-500 via-blue-600 to-slate-700',
        bgAtmosphere: 'rainy',
      };
    case 63:
      return {
        code,
        label: 'Moderate Rain',
        description: 'Steady moderate rainfall',
        icon: CloudRain,
        gradient: 'from-blue-600 via-slate-700 to-indigo-800',
        bgAtmosphere: 'rainy',
      };
    case 65:
      return {
        code,
        label: 'Heavy Rain',
        description: 'Heavy precipitation and downpour',
        icon: CloudRainWind,
        gradient: 'from-slate-700 via-blue-900 to-slate-900',
        bgAtmosphere: 'rainy',
      };
    case 66:
    case 67:
      return {
        code,
        label: 'Freezing Rain',
        description: 'Heavy freezing rain',
        icon: CloudRain,
        gradient: 'from-cyan-600 via-slate-700 to-blue-900',
        bgAtmosphere: 'snowy',
      };
    case 71:
    case 73:
    case 75:
      return {
        code,
        label: 'Snow Fall',
        description: 'Slight to heavy snow fall',
        icon: CloudSnow,
        gradient: 'from-blue-200 via-indigo-300 to-slate-500',
        bgAtmosphere: 'snowy',
      };
    case 77:
      return {
        code,
        label: 'Snow Grains',
        description: 'Fine icy snow grains',
        icon: CloudSnow,
        gradient: 'from-slate-300 via-blue-400 to-slate-600',
        bgAtmosphere: 'snowy',
      };
    case 80:
    case 81:
    case 82:
      return {
        code,
        label: 'Rain Showers',
        description: 'Intermittent localized rain showers',
        icon: CloudRainWind,
        gradient: 'from-sky-600 via-blue-700 to-slate-800',
        bgAtmosphere: 'rainy',
      };
    case 85:
    case 86:
      return {
        code,
        label: 'Snow Showers',
        description: 'Localized snow squalls',
        icon: CloudSnow,
        gradient: 'from-indigo-300 via-slate-500 to-blue-700',
        bgAtmosphere: 'snowy',
      };
    case 95:
    case 96:
    case 99:
      return {
        code,
        label: 'Thunderstorm',
        description: 'Thunderstorm with possible hail',
        icon: CloudLightning,
        gradient: 'from-purple-900 via-slate-900 to-blue-950',
        bgAtmosphere: 'thunderstorm',
      };
    default:
      return {
        code,
        label: 'Variable Weather',
        description: 'Mixed atmospheric conditions',
        icon: CloudSun,
        gradient: 'from-sky-400 via-blue-500 to-slate-600',
        bgAtmosphere: 'cloudy',
      };
  }
}
