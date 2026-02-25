import React, { useState } from 'react';
import axios from 'axios';
import { WiDaySunny, WiCloudy, WiRain, WiFog, WiSnow, WiThunderstorm } from 'react-icons/wi';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (lat, lon) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=Asia%2FKarachi`
      );
      setWeather(response.data.current);
      setError('');
    } catch (err) {
      setError('Unable to fetch weather data. Please try again.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const geoResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'WeatherApp/1.0 (contact@yourdomain.com)' // Required by Nominatim policy
          }
        }
      );

      if (geoResponse.data && geoResponse.data.length > 0) {
        const { lat, lon, display_name } = geoResponse.data[0];

        setCity(display_name.split(',')[0]);

        await fetchWeather(lat, lon);
      } else {
        setError('City not found. Please check the spelling.');
        setWeather(null);
      }
    } catch (err) {
      setError('Error fetching location. Try again later.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherInfo = (code) => {
    if (code === undefined) return { icon: <WiDaySunny size={80} />, desc: 'Unknown' };

    if (code === 0) return { icon: <WiDaySunny size={80} />, desc: 'Clear sky' };
    if ([1, 2, 3].includes(code)) return { icon: <WiCloudy size={80} />, desc: 'Partly cloudy' };
    if ([45, 48].includes(code)) return { icon: <WiFog size={80} />, desc: 'Fog' };
    if ([51, 53, 55, 56, 57].includes(code)) return { icon: <WiRain size={60} />, desc: 'Light drizzle' };
    if ([61, 63, 65, 66, 67].includes(code)) return { icon: <WiRain size={80} />, desc: 'Rain' };
    if ([71, 73, 75, 77].includes(code)) return { icon: <WiSnow size={80} />, desc: 'Snow' };
    if ([80, 81, 82].includes(code)) return { icon: <WiRain size={80} />, desc: 'Rain showers' };
    if ([95, 96, 99].includes(code)) return { icon: <WiThunderstorm size={80} />, desc: 'Thunderstorm' };

    return { icon: <WiCloudy size={80} />, desc: 'Overcast' };
  };

  const weatherInfo = weather ? getWeatherInfo(weather.weather_code) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Weather App</h1>

        <form onSubmit={handleSearch} className="mb-8">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name (e.g., Lahore, Karachi, London)"
            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 text-lg placeholder-gray-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className={`mt-4 w-full p-4 rounded-xl text-white font-semibold text-lg transition ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Fetching...' : 'Get Weather'}
          </button>
        </form>

        {error && <p className="text-red-600 text-center font-medium mb-6">{error}</p>}

        {weather && weatherInfo && (
          <div className="text-center text-gray-800">
            <h2 className="text-3xl font-semibold mb-4 break-words">
              {city}
            </h2>

            <div className="flex justify-center items-center my-6">
              {weatherInfo.icon}
            </div>

            <div className="text-7xl font-light mb-2">
              {Math.round(weather.temperature_2m)}°C
            </div>

            <p className="text-2xl capitalize mb-8">{weatherInfo.desc}</p>

            <div className="grid grid-cols-3 gap-6 text-lg">
              <div>
                <p className="font-medium text-gray-600">Feels like</p>
                <p className="text-2xl font-semibold">{Math.round(weather.apparent_temperature)}°C</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Humidity</p>
                <p className="text-2xl font-semibold">{weather.relative_humidity_2m}%</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Wind</p>
                <p className="text-2xl font-semibold">{Math.round(weather.wind_speed_10m)} km/h</p>
              </div>
            </div>
          </div>
        )}

        {!weather && !error && !loading && (
          <p className="text-center text-gray-600 mt-10 text-lg">
            Type a city name and press Get Weather!
          </p>
        )}
      </div>
    </div>
  );
}

export default App;