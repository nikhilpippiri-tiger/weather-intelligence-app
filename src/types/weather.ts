export interface Location {
  id?: number;
  name: string;
  country: string;
  countryCode?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone?: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  weatherCode: number;
  windSpeed: number;
  pressure: number;
  uvIndex: number;
  isDay: boolean;
  time: string;
}

export interface DailyForecast {
  date: string;
  dayOfWeek: string;
  weatherCode: number;
  maxTemp: number;
  minTemp: number;
  precipitationSum: number;
  maxWindSpeed: number;
  maxUvIndex: number;
}

export interface HourlyForecast {
  time: string;
  formattedTime: string;
  temperature: number;
  weatherCode: number;
  precipitationProbability: number;
}

export interface WeatherData {
  location: Location;
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  timezone: string;
  fetchedAt: Date;
}

export type TemperatureUnit = 'C' | 'F';
export type SpeedUnit = 'kmh' | 'mph';

export interface ActivitySuitability {
  name: string;
  score: number; // 0 to 10
  status: 'Excellent' | 'Good' | 'Moderate' | 'Poor';
  icon: string;
  reason: string;
}

export interface Recommendation {
  id: string;
  category: 'clothing' | 'activity' | 'health' | 'alert';
  title: string;
  description: string;
  iconName: string;
  type: 'info' | 'warning' | 'success' | 'danger';
}
