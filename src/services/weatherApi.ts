import { Location, WeatherData, DailyForecast, HourlyForecast } from '../types/weather';

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export async function searchLocations(query: string, count: number = 5): Promise<Location[]> {
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return [];
  }

  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(query.trim())}&count=${count}&language=en&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Geocoding server responded with status ${response.status}`);
      return [];
    }

    const data = await response.json();
    if (!data || !data.results || !Array.isArray(data.results) || data.results.length === 0) {
      return [];
    }

    return data.results
      .filter((item: any) => item && typeof item === 'object' && item.name && typeof item.latitude === 'number' && typeof item.longitude === 'number')
      .map((item: any) => ({
        id: item.id || Math.random(),
        name: item.name || 'Unknown',
        country: item.country || '',
        countryCode: item.country_code || '',
        admin1: item.admin1 || '',
        latitude: item.latitude,
        longitude: item.longitude,
        elevation: item.elevation ?? 0,
        timezone: item.timezone || 'UTC',
      }));
  } catch (err: any) {
    console.error('Location search failed:', err);
    return [];
  }
}

export async function fetchWeatherData(location: Location): Promise<WeatherData> {
  const { latitude, longitude } = location;

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure,uv_index,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,uv_index_max',
    hourly: 'temperature_2m,weather_code,precipitation_probability',
    timezone: 'auto',
  });

  const url = `${FORECAST_BASE_URL}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather service returned status code ${response.status}`);
    }

    const data = await response.json();

    if (!data.current || !data.daily) {
      throw new Error('Incomplete weather data received from weather provider');
    }

    // Format daily forecast array
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daily: DailyForecast[] = (data.daily.time || []).map((timeStr: string, idx: number) => {
      const dateObj = new Date(timeStr + 'T00:00:00');
      const isToday = idx === 0;
      const dayOfWeek = isToday ? 'Today' : dayNames[dateObj.getDay()];

      return {
        date: timeStr,
        dayOfWeek,
        weatherCode: data.daily.weather_code?.[idx] ?? 0,
        maxTemp: data.daily.temperature_2m_max?.[idx] ?? 0,
        minTemp: data.daily.temperature_2m_min?.[idx] ?? 0,
        precipitationSum: data.daily.precipitation_sum?.[idx] ?? 0,
        maxWindSpeed: data.daily.wind_speed_10m_max?.[idx] ?? 0,
        maxUvIndex: data.daily.uv_index_max?.[idx] ?? 0,
      };
    });

    // Format hourly forecast for next 24 hours
    const nowIsoIndex = data.hourly?.time ? Math.max(0, data.hourly.time.findIndex((t: string) => new Date(t) >= new Date())) : 0;
    const hourlyTimes = (data.hourly?.time || []).slice(nowIsoIndex, nowIsoIndex + 24);

    const hourly: HourlyForecast[] = hourlyTimes.map((timeStr: string, idx: number) => {
      const rawIdx = nowIsoIndex + idx;
      const dateObj = new Date(timeStr);
      const hours = dateObj.getHours();
      const formattedTime = hours === 0 ? '12 AM' : hours === 12 ? '12 PM' : hours > 12 ? `${hours - 12} PM` : `${hours} AM`;

      return {
        time: timeStr,
        formattedTime,
        temperature: data.hourly?.temperature_2m?.[rawIdx] ?? 0,
        weatherCode: data.hourly?.weather_code?.[rawIdx] ?? 0,
        precipitationProbability: data.hourly?.precipitation_probability?.[rawIdx] ?? 0,
      };
    });

    return {
      location,
      current: {
        temperature: data.current.temperature_2m,
        apparentTemperature: data.current.apparent_temperature ?? data.current.temperature_2m,
        relativeHumidity: data.current.relative_humidity_2m,
        weatherCode: data.current.weather_code,
        windSpeed: data.current.wind_speed_10m,
        pressure: data.current.surface_pressure ?? 1013,
        uvIndex: data.current.uv_index ?? 0,
        isDay: Boolean(data.current.is_day ?? 1),
        time: data.current.time,
      },
      daily,
      hourly,
      timezone: data.timezone || 'UTC',
      fetchedAt: new Date(),
    };
  } catch (err: any) {
    console.error('Weather data fetch failed:', err);
    throw new Error(err.message || 'Unable to retrieve forecast data. Please check connection.');
  }
}

// Reverse geocoding helper using Open-Meteo or BigDataCloud client API if coordinates available
export async function getLocationByCoords(lat: number, lon: number): Promise<Location> {
  try {
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    if (response.ok) {
      const data = await response.json();
      const city = data.city || data.locality || data.principalSubdivision || 'Current Location';
      const country = data.countryName || '';
      return {
        name: city,
        country: country,
        admin1: data.principalSubdivision,
        latitude: lat,
        longitude: lon,
      };
    }
  } catch (e) {
    console.warn('Reverse geocoding failed, falling back to coordinates name:', e);
  }
  return {
    name: 'Current Location',
    country: '',
    latitude: lat,
    longitude: lon,
  };
}
