import { Location, WeatherData, DailyForecast, HourlyForecast } from '../types/weather';

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// Helper for fetch with timeout
async function fetchWithTimeout(url: string, timeoutMs: number = 8000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function searchLocations(query: string, count: number = 5): Promise<Location[]> {
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return [];
  }

  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(query.trim())}&count=${count}&language=en&format=json`;

  try {
    const response = await fetchWithTimeout(url, 6000);
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
    console.warn('Location search network request failed:', err);
    return [];
  }
}

// Generate sensible offline/fallback weather data when network fails
function getFallbackWeatherData(location: Location): WeatherData {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  // Generate realistic estimate temperatures based on latitude magnitude
  const baseTemp = Math.round(25 - Math.abs(location.latitude) * 0.25);

  const daily: DailyForecast[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const timeStr = d.toISOString().split('T')[0];
    const isToday = i === 0;
    const dayOfWeek = isToday ? 'Today' : dayNames[d.getDay()];

    return {
      date: timeStr,
      dayOfWeek,
      weatherCode: (i % 3 === 0) ? 1 : (i % 3 === 1) ? 2 : 0, // Clear / Partly Cloudy
      maxTemp: baseTemp + 3 - (i % 2),
      minTemp: baseTemp - 5 - (i % 3),
      precipitationSum: i === 3 ? 2.0 : 0,
      maxWindSpeed: 12 + (i * 2),
      maxUvIndex: Math.min(10, Math.max(1, Math.round(6 - Math.abs(location.latitude) * 0.05))),
    };
  });

  const hourly: HourlyForecast[] = Array.from({ length: 24 }, (_, i) => {
    const d = new Date(today);
    d.setHours(today.getHours() + i, 0, 0, 0);
    const hours = d.getHours();
    const formattedTime = hours === 0 ? '12 AM' : hours === 12 ? '12 PM' : hours > 12 ? `${hours - 12} PM` : `${hours} AM`;

    return {
      time: d.toISOString(),
      formattedTime,
      temperature: baseTemp + Math.round(Math.sin((hours - 8) / 3) * 4),
      weatherCode: 1,
      precipitationProbability: (i >= 12 && i <= 16) ? 15 : 0,
    };
  });

  return {
    location,
    current: {
      temperature: baseTemp,
      apparentTemperature: baseTemp - 1,
      relativeHumidity: 55,
      weatherCode: 1,
      windSpeed: 10,
      pressure: 1013,
      uvIndex: Math.min(10, Math.max(1, Math.round(5 - Math.abs(location.latitude) * 0.05))),
      isDay: true,
      time: today.toISOString(),
    },
    daily,
    hourly,
    timezone: location.timezone || 'UTC',
    fetchedAt: today,
    isFallback: true,
  };
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

  // Attempt fetch with retry
  let response: Response | null = null;
  try {
    response = await fetchWithTimeout(url, 8000);
  } catch (firstErr) {
    console.warn('Initial weather fetch failed, retrying in 500ms...', firstErr);
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      response = await fetchWithTimeout(url, 8000);
    } catch (retryErr) {
      console.warn('Retry weather fetch failed. Serving fallback weather model:', retryErr);
      return getFallbackWeatherData(location);
    }
  }

  if (!response || !response.ok) {
    console.warn(`Weather service response not OK (${response?.status}). Serving fallback weather model.`);
    return getFallbackWeatherData(location);
  }

  try {
    const data = await response.json();

    if (!data.current || !data.daily) {
      console.warn('Incomplete data structure from weather provider. Serving fallback model.');
      return getFallbackWeatherData(location);
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
        temperature: data.current.temperature_2m ?? 20,
        apparentTemperature: data.current.apparent_temperature ?? data.current.temperature_2m ?? 20,
        relativeHumidity: data.current.relative_humidity_2m ?? 50,
        weatherCode: data.current.weather_code ?? 0,
        windSpeed: data.current.wind_speed_10m ?? 0,
        pressure: data.current.surface_pressure ?? 1013,
        uvIndex: data.current.uv_index ?? 0,
        isDay: Boolean(data.current.is_day ?? 1),
        time: data.current.time || new Date().toISOString(),
      },
      daily,
      hourly,
      timezone: data.timezone || 'UTC',
      fetchedAt: new Date(),
    };
  } catch (parseErr) {
    console.warn('Failed to parse weather API response:', parseErr);
    return getFallbackWeatherData(location);
  }
}

// Reverse geocoding helper with timeout and fallback
export async function getLocationByCoords(lat: number, lon: number): Promise<Location> {
  try {
    const response = await fetchWithTimeout(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      5000
    );
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
