import React, { useState, useEffect } from 'react';
import { Search, Cloud, Droplets, Wind, Thermometer, Loader2, MapPin, Umbrella, Sun, Moon, Settings as Lungs } from 'lucide-react';

const API_KEY = 'bd5e378503939ddaee76f12ad7a97608';

interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  sys: {
    sunrise: number;
    sunset: number;
  };
}

interface AirQualityData {
  list: Array<{
    main: {
      aqi: number;
    };
    components: {
      co: number;
      no2: number;
      o3: number;
      pm2_5: number;
      pm10: number;
    };
  }>;
}

interface ForecastData {
  list: Array<{
    dt: number;
    main: {
      temp_min: number;
      temp_max: number;
    };
    weather: Array<{
      description: string;
      icon: string;
    }>;
    pop: number;
  }>;
}

function App() {
  const [city, setCity] = useState('São Paulo');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=pt_br`
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=pt_br`
        )
      ]);

      if (!weatherResponse.ok || !forecastResponse.ok) {
        throw new Error('Cidade não encontrada');
      }

      const [weatherData, forecastData] = await Promise.all([
        weatherResponse.json(),
        forecastResponse.json()
      ]);

      setWeather(weatherData);
      setForecast(forecastData);

      // Buscar dados de qualidade do ar
      if (weatherData.coord) {
        const airQualityResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/air_pollution?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${API_KEY}`
        );
        if (airQualityResponse.ok) {
          const airQualityData = await airQualityResponse.json();
          setAirQuality(airQualityData);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather();
  };

  const getWeatherBackground = () => {
    if (!weather) return {
      gradient: 'from-blue-500 to-purple-600',
      image: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&q=80',
      overlay: null
    };

    const condition = weather.weather[0].main.toLowerCase();
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 18;

    switch (condition) {
      case 'clear':
        return {
          gradient: isDay ? 'from-blue-400 to-blue-200' : 'from-blue-900 to-purple-900',
          image: isDay 
            ? 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1532978879514-6cb2cac0c5c3?auto=format&fit=crop&q=80',
          overlay: null
        };
      case 'clouds':
        return {
          gradient: isDay ? 'from-gray-400 to-blue-300' : 'from-gray-800 to-blue-900',
          image: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80',
          overlay: null
        };
      case 'rain':
        return {
          gradient: 'from-gray-700 to-blue-900',
          image: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&q=80',
          overlay: 'rain'
        };
      case 'thunderstorm':
        return {
          gradient: 'from-gray-900 to-blue-900',
          image: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&q=80',
          overlay: 'rain'
        };
      case 'snow':
        return {
          gradient: 'from-blue-100 to-blue-200',
          image: 'https://images.unsplash.com/photo-1478265409131-1f65c88f965c?auto=format&fit=crop&q=80',
          overlay: null
        };
      default:
        return {
          gradient: 'from-blue-500 to-purple-600',
          image: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&q=80',
          overlay: null
        };
    }
  };

  const { gradient, image, overlay } = getWeatherBackground();

  const renderRaindrops = () => {
    return Array.from({ length: 20 }).map((_, index) => (
      <div
        key={index}
        className="rain-drop"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`,
        }}
      />
    ));
  };

  const getAirQualityInfo = () => {
    if (!airQuality?.list[0]) return null;
    
    const aqi = airQuality.list[0].main.aqi;
    const levels = {
      1: { label: 'Boa', color: 'bg-green-500', text: 'Qualidade do ar ideal para atividades ao ar livre.' },
      2: { label: 'Moderada', color: 'bg-yellow-500', text: 'Grupos sensíveis podem ter sintomas respiratórios.' },
      3: { label: 'Ruim', color: 'bg-orange-500', text: 'Pessoas sensíveis devem evitar atividades ao ar livre.' },
      4: { label: 'Muito Ruim', color: 'bg-red-500', text: 'Evite atividades ao ar livre prolongadas.' },
      5: { label: 'Péssima', color: 'bg-purple-500', text: 'Evite qualquer atividade ao ar livre.' }
    };

    return levels[aqi as keyof typeof levels];
  };

  const getMoonPhase = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const c = Math.floor((year - 2000) * 365.25);
    const e = 30.6 * month;
    const jd = c + e + day - 694039.09;
    const phase = jd / 29.53;
    const moonPhase = ((phase - Math.floor(phase)) * 8) + 0.5;
    const phaseIndex = Math.floor(moonPhase) % 8;

    const phases = [
      { name: 'Lua Nova', icon: '🌑' },
      { name: 'Lua Crescente', icon: '🌒' },
      { name: 'Quarto Crescente', icon: '🌓' },
      { name: 'Lua Gibosa Crescente', icon: '🌔' },
      { name: 'Lua Cheia', icon: '🌕' },
      { name: 'Lua Gibosa Minguante', icon: '🌖' },
      { name: 'Quarto Minguante', icon: '🌗' },
      { name: 'Lua Minguante', icon: '🌘' }
    ];

    return phases[phaseIndex];
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDailyForecasts = () => {
    if (!forecast) return [];
    
    const dailyForecasts = new Map();
    
    forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString('pt-BR', { weekday: 'long' });
      
      if (!dailyForecasts.has(day)) {
        dailyForecasts.set(day, {
          temp_min: item.main.temp_min,
          temp_max: item.main.temp_max,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          pop: item.pop
        });
      }
    });

    return Array.from(dailyForecasts.entries()).slice(1, 6);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradient} transition-colors duration-1000 relative overflow-hidden`}>
      <div 
        className="weather-background"
        style={{
          backgroundImage: `url("${image}")`,
        }}
      />
      {overlay === 'rain' && renderRaindrops()}
      
      <div className="relative max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg animate-float">
            Previsão do Tempo
          </h1>
          <p className="text-white/80 text-lg">
            Descubra o clima em qualquer lugar do mundo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-12 max-w-2xl mx-auto">
          <div className="relative transform hover:scale-[1.02] transition-transform duration-300">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Digite o nome da cidade..."
              className="w-full px-6 py-4 rounded-xl pl-14 pr-36 focus:outline-none focus:ring-4 focus:ring-blue-300/50 
                shadow-lg bg-white text-gray-800 placeholder-gray-500
                transition-all duration-300"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-blue-600 
                text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 
                transition-all duration-300 shadow-md disabled:opacity-70 disabled:cursor-not-allowed
                hover:shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                'Buscar'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-500 text-white p-4 rounded-xl shadow-lg 
              flex items-center justify-center space-x-2 animate-fade-in">
              <Cloud className="text-white/80" size={24} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {weather && !error && (
          <>
            <div className="bg-white rounded-2xl p-8 shadow-2xl 
              transform hover:scale-[1.01] transition-all duration-500 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center md:text-left space-y-4">
                  <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-700">
                    <MapPin className="w-6 h-6" />
                    <h2 className="text-3xl font-bold">{weather.name}</h2>
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start space-x-4">
                    <img
                      src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                      alt={weather.weather[0].description}
                      className="w-32 h-32 drop-shadow-md"
                    />
                    <div>
                      <span className="text-7xl font-bold text-gray-800 tracking-tight">
                        {Math.round(weather.main.temp)}°
                      </span>
                      <p className="text-xl text-gray-600 capitalize mt-1">
                        {weather.weather[0].description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      icon: <Thermometer className="w-6 h-6 text-black" />,
                      label: 'Sensação',
                      value: `${Math.round(weather.main.feels_like)}°C`,
                      color: 'from-orange-400 to-red-400',
                      textColor: 'text-black'
                    },
                    {
                      icon: <Droplets className="w-6 h-6 text-black" />,
                      label: 'Umidade',
                      value: `${weather.main.humidity}%`,
                      color: 'from-blue-400 to-blue-500',
                      textColor: 'text-black'
                    },
                    {
                      icon: <Wind className="w-6 h-6 text-black" />,
                      label: 'Vento',
                      value: `${Math.round(weather.wind.speed * 3.6)} km/h`,
                      color: 'from-teal-400 to-teal-500',
                      textColor: 'text-black'
                    },
                    {
                      icon: <Cloud className="w-6 h-6 text-black" />,
                      label: 'Tempo',
                      value: weather.weather[0].main,
                      color: 'from-purple-400 to-purple-500',
                      textColor: 'text-black'
                    }
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br rounded-xl p-4 shadow-lg
                        transform hover:scale-105 transition-transform duration-300"
                      style={{
                        background: `linear-gradient(135deg, var(--tw-gradient-${item.color}))`
                      }}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        {item.icon}
                        <span className={`font-medium ${item.textColor}`}>{item.label}</span>
                      </div>
                      <p className={`text-2xl font-bold ${item.textColor}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Informações Educativas */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sol e Lua */}
                <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Sun className="w-5 h-5" /> Sol e Lua
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Nascer do Sol:</span>
                      <span className="font-semibold">{formatTime(weather.sys.sunrise)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Pôr do Sol:</span>
                      <span className="font-semibold">{formatTime(weather.sys.sunset)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-gray-600">Fase da Lua:</span>
                      <span className="font-semibold flex items-center gap-2">
                        {getMoonPhase().icon} {getMoonPhase().name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Qualidade do Ar */}
                {airQuality && (
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-6 shadow-lg col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Lungs className="w-5 h-5" /> Qualidade do Ar
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${getAirQualityInfo()?.color}`} />
                        <span className="font-semibold text-gray-800">
                          {getAirQualityInfo()?.label}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        {getAirQualityInfo()?.text}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <span className="text-sm text-gray-500">PM2.5:</span>
                          <span className="ml-2 font-semibold">
                            {airQuality.list[0].components.pm2_5.toFixed(1)} µg/m³
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">PM10:</span>
                          <span className="ml-2 font-semibold">
                            {airQuality.list[0].components.pm10.toFixed(1)} µg/m³
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Próximos Dias</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {getDailyForecasts().map(([day, data], index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-700 capitalize mb-2">
                        {day.split('-')[0]}
                      </h4>
                      <img
                        src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
                        alt={data.description}
                        className="w-16 h-16 mx-auto"
                      />
                      <div className="flex justify-center items-center space-x-2 mb-2">
                        <span className="text-lg font-bold text-gray-800">
                          {Math.round(data.temp_max)}°
                        </span>
                        <span className="text-sm text-gray-500">
                          {Math.round(data.temp_min)}°
                        </span>
                      </div>
                      <div className="flex items-center justify-center space-x-1 text-blue-500 mb-2">
                        <Umbrella size={16} />
                        <span className="text-sm">{Math.round(data.pop * 100)}%</span>
                      </div>
                      <p className="text-sm text-gray-600 capitalize">
                        {data.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;