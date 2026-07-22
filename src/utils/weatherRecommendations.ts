import { CurrentWeather, DailyForecast, Recommendation, ActivitySuitability } from '../types/weather';

export function generateRecommendations(
  current: CurrentWeather,
  dailyForecast: DailyForecast[]
): Recommendation[] {
  const list: Recommendation[] = [];
  const todayForecast = dailyForecast[0] || { precipitationSum: 0, maxTemp: current.temperature, minTemp: current.temperature };

  // 1. Rain & Precipitation Advice
  if (todayForecast.precipitationSum > 5 || [61, 63, 65, 80, 81, 82, 95, 96, 99].includes(current.weatherCode)) {
    list.push({
      id: 'rain-alert',
      category: 'clothing',
      title: 'Bring an Umbrella & Raincoat',
      description: `Significant rainfall expected today (~${todayForecast.precipitationSum.toFixed(1)} mm). Keep wet weather gear handy.`,
      iconName: 'Umbrella',
      type: 'warning',
    });
  } else if (todayForecast.precipitationSum > 0) {
    list.push({
      id: 'light-rain-alert',
      category: 'clothing',
      title: 'Light Rain Likely',
      description: 'Drizzle or scattered light rain expected today. A water-resistant jacket is recommended.',
      iconName: 'CloudRain',
      type: 'info',
    });
  }

  // 2. Heat & Hydration
  if (current.temperature > 32 || todayForecast.maxTemp > 32) {
    list.push({
      id: 'extreme-heat',
      category: 'health',
      title: 'Stay Hydrated & Seek Shade',
      description: `High temperature of ${Math.round(todayForecast.maxTemp)}°C. Avoid prolonged afternoon sun exposure and drink plenty of water.`,
      iconName: 'Droplets',
      type: 'danger',
    });
  } else if (current.temperature > 26) {
    list.push({
      id: 'warm-weather',
      category: 'clothing',
      title: 'Light & Breathable Clothing',
      description: 'Warm and pleasant temperatures today. Wear breathable cotton or linen fabrics.',
      iconName: 'Sun',
      type: 'info',
    });
  }

  // 3. Cold Weather
  if (current.temperature < 5 || todayForecast.minTemp < 5) {
    list.push({
      id: 'cold-weather',
      category: 'clothing',
      title: 'Heavy Winter Coat Needed',
      description: `Chilly conditions dropping down to ${Math.round(todayForecast.minTemp)}°C. Wear a warm jacket, beanie, and gloves.`,
      iconName: 'Shirt',
      type: 'warning',
    });
  } else if (current.temperature < 15) {
    list.push({
      id: 'cool-weather',
      category: 'clothing',
      title: 'Layer Up',
      description: 'Mildly cool weather. A sweater or light jacket will keep you comfortable throughout the day.',
      iconName: 'Layers',
      type: 'info',
    });
  }

  // 4. UV Protection
  if (current.uvIndex >= 6 || (dailyForecast[0] && dailyForecast[0].maxUvIndex >= 6)) {
    list.push({
      id: 'uv-protection',
      category: 'health',
      title: 'High UV Radiation',
      description: 'UV Index is elevated. Apply SPF 30+ broad-spectrum sunscreen, wear UV sunglasses, and consider a hat.',
      iconName: 'ShieldAlert',
      type: 'warning',
    });
  }

  // 5. Wind Warning
  if (current.windSpeed > 30) {
    list.push({
      id: 'high-wind',
      category: 'alert',
      title: 'Gusty Winds Alert',
      description: `Strong winds up to ${Math.round(current.windSpeed)} km/h. Secure loose outdoor furniture and exercise extra caution driving.`,
      iconName: 'Wind',
      type: 'danger',
    });
  }

  // 6. Ideal Outdoor Conditions
  if (
    current.temperature >= 18 &&
    current.temperature <= 26 &&
    todayForecast.precipitationSum === 0 &&
    current.windSpeed < 20
  ) {
    list.push({
      id: 'perfect-outdoor',
      category: 'activity',
      title: 'Great Outdoor Weather',
      description: 'Comfortable temperature, moderate humidity, and low precipitation make today ideal for outdoor walks, dining, or sports.',
      iconName: 'Sparkles',
      type: 'success',
    });
  }

  // 7. High Humidity Notice
  if (current.relativeHumidity > 80 && current.temperature > 24) {
    list.push({
      id: 'high-humidity',
      category: 'health',
      title: 'Muggy & Humid Atmosphere',
      description: `Humidity is at ${current.relativeHumidity}%. Temperatures may feel hotter than actual readings. Stay in well-ventilated areas.`,
      iconName: 'Gauge',
      type: 'info',
    });
  }

  return list;
}

export function calculateActivitySuitability(
  current: CurrentWeather,
  dailyForecast: DailyForecast[]
): ActivitySuitability[] {
  const today = dailyForecast[0] || { precipitationSum: 0, maxTemp: current.temperature, minTemp: current.temperature };
  const temp = current.temperature;
  const rain = today.precipitationSum;
  const wind = current.windSpeed;
  const code = current.weatherCode;

  // Running / Jogging
  let runScore = 10;
  let runReason = 'Ideal conditions for running';
  if (rain > 2) { runScore -= 4; runReason = 'Rainy track conditions'; }
  if (temp > 28) { runScore -= 3; runReason = 'High ambient heat'; }
  if (temp < 5) { runScore -= 2; runReason = 'Cold air temperature'; }
  if (wind > 25) { runScore -= 2; runReason = 'Headwinds & strong gusts'; }
  runScore = Math.max(1, Math.min(10, runScore));

  // Cycling
  let bikeScore = 10;
  let bikeReason = 'Smooth riding weather';
  if (wind > 25) { bikeScore -= 5; bikeReason = 'Dangerous strong wind gusts'; }
  if (rain > 1) { bikeScore -= 4; bikeReason = 'Slippery roads'; }
  if (code >= 95) { bikeScore = 1; bikeReason = 'Thunderstorm hazard'; }
  bikeScore = Math.max(1, Math.min(10, bikeScore));

  // Outdoor Dining / Picnic
  let diningScore = 10;
  let diningReason = 'Pleasant outdoor patio weather';
  if (rain > 0) { diningScore -= 6; diningReason = 'Risk of wet seating'; }
  if (temp < 16) { diningScore -= 4; diningReason = 'Too chilly for open dining'; }
  if (temp > 30) { diningScore -= 3; diningReason = 'Hot without AC/shade'; }
  if (wind > 20) { diningScore -= 3; diningReason = 'Breezy table conditions'; }
  diningScore = Math.max(1, Math.min(10, diningScore));

  // Hiking / Strolling
  let hikeScore = 10;
  let hikeReason = 'Great visibility and footing';
  if (rain > 5) { hikeScore -= 5; hikeReason = 'Muddy trails and low visibility'; }
  if (temp < 2) { hikeScore -= 3; hikeReason = 'Freezing trail hazards'; }
  if (code >= 95) { hikeScore = 1; hikeReason = 'Lightning hazard on elevated paths'; }
  hikeScore = Math.max(1, Math.min(10, hikeScore));

  const getStatus = (score: number): 'Excellent' | 'Good' | 'Moderate' | 'Poor' => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Moderate';
    return 'Poor';
  };

  return [
    { name: 'Running & Jogging', score: runScore, status: getStatus(runScore), icon: 'Activity', reason: runReason },
    { name: 'Cycling & Biking', score: bikeScore, status: getStatus(bikeScore), icon: 'Bike', reason: bikeReason },
    { name: 'Outdoor Dining', score: diningScore, status: getStatus(diningScore), icon: 'Utensils', reason: diningReason },
    { name: 'Hiking & Walking', score: hikeScore, status: getStatus(hikeScore), icon: 'Footprints', reason: hikeReason },
  ];
}
