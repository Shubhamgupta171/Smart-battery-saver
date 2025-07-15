import React, { useState, useEffect, useRef } from "react";
import {
  Battery,
  MapPin,
  Wifi,
  Eye,
  Settings,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Smartphone,
  Zap,
  Shield,
  Activity,
  Globe,
  Signal,
  Menu,
  X,
  Home,
  BarChart3,
  Cpu,
  Bell,
} from "lucide-react";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface NetworkData {
  type: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

interface BatteryData {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

type ActivePanel =
  | "dashboard"
  | "battery"
  | "location"
  | "network"
  | "recommendations"
  | "settings";

function App() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [network, setNetwork] = useState<NetworkData | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [battery, setBattery] = useState<BatteryData | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [locationError, setLocationError] = useState<string>("");
  const [powerSaveMode, setPowerSaveMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const menuItems = [
    {
      id: "dashboard" as ActivePanel,
      label: "Dashboard",
      icon: Home,
      description: "Overview of all systems",
    },
    {
      id: "battery" as ActivePanel,
      label: "Battery",
      icon: Battery,
      description: "Detailed battery analytics",
    },
    {
      id: "location" as ActivePanel,
      label: "Location",
      icon: MapPin,
      description: "GPS tracking & optimization",
    },
    {
      id: "network" as ActivePanel,
      label: "Network",
      icon: Signal,
      description: "Connection monitoring",
    },
    {
      id: "recommendations" as ActivePanel,
      label: "AI Tips",
      icon: Lightbulb,
      description: "Smart recommendations",
    },
    {
      id: "settings" as ActivePanel,
      label: "Settings",
      icon: Settings,
      description: "Power management controls",
    },
  ];

  // here we initialize loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  //here we initialize location tracking
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
          });
          setLocationError("");
          setPulseAnimation(true);
          setTimeout(() => setPulseAnimation(false), 1000);
        },
        (error) => {
          setLocationError(`Location error: ${error.message}`);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setLocationError("Geolocation not supported");
    }
  }, []);

  // here we initialize network monitoring
  useEffect(() => {
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;

      const updateNetworkInfo = () => {
        setNetwork({
          type: connection.type || "unknown",
          effectiveType: connection.effectiveType || "unknown",
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
        });
      };

      updateNetworkInfo();
      connection.addEventListener("change", updateNetworkInfo);

      return () => connection.removeEventListener("change", updateNetworkInfo);
    }
  }, []);

  // here we initialize battery monitoring
  useEffect(() => {
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBatteryInfo = () => {
          setBattery({
            level: battery.level * 100,
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime,
          });
        };

        updateBatteryInfo();
        battery.addEventListener("chargingchange", updateBatteryInfo);
        battery.addEventListener("levelchange", updateBatteryInfo);

        return () => {
          battery.removeEventListener("chargingchange", updateBatteryInfo);
          battery.removeEventListener("levelchange", updateBatteryInfo);
        };
      });
    }
  }, []);

  // here we initialize intersection observer for visibility detection
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const target = document.getElementById("app-content");
    if (target) {
      observerRef.current.observe(target);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Generate recommendations based on current state
  useEffect(() => {
    const newRecommendations: string[] = [];

    if (battery && battery.level < 20) {
      newRecommendations.push(
        "⚠️ Critical battery level! Enable ultra power saving mode"
      );
    }

    if (network) {
      if (
        network.effectiveType === "slow-2g" ||
        network.effectiveType === "2g"
      ) {
        newRecommendations.push(
          "📶 Slow network detected - disable background sync"
        );
      } else if (
        network.effectiveType === "4g" &&
        battery &&
        battery.level < 50
      ) {
        newRecommendations.push("📱 Switch to WiFi to extend battery life");
      }
    }

    if (!isVisible) {
      newRecommendations.push("👁️ Page hidden - activating deep power saving");
    }

    if (location && location.accuracy > 100) {
      newRecommendations.push(
        "📍 High GPS usage detected - reduce location precision"
      );
    }

    setRecommendations(newRecommendations);
  }, [battery, network, isVisible, location]);

  const getNetworkTypeColor = (type: string) => {
    switch (type) {
      case "4g":
        return "text-emerald-400";
      case "3g":
        return "text-amber-400";
      case "2g":
      case "slow-2g":
        return "text-red-400";
      default:
        return "text-cyan-400";
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return "from-emerald-400 via-green-500 to-emerald-600";
    if (level > 30) return "from-amber-400 via-yellow-500 to-orange-500";
    return "from-red-400 via-red-500 to-red-600";
  };

  const getBatteryGlow = (level: number) => {
    if (level > 60) return "shadow-emerald-500/50";
    if (level > 30) return "shadow-amber-500/50";
    return "shadow-red-500/50";
  };

  const renderBatteryPanel = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Battery Analytics
        </h2>
        <p className="text-slate-300 text-lg">
          Comprehensive battery monitoring and optimization
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Battery Status */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500">
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-slate-800 to-slate-700 flex items-center justify-center relative overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${
                    battery
                      ? getBatteryColor(battery.level)
                      : "from-gray-400 to-gray-500"
                  } transition-all duration-1000`}
                  style={{
                    clipPath: battery
                      ? `polygon(0 ${100 - battery.level}%, 100% ${
                          100 - battery.level
                        }%, 100% 100%, 0% 100%)`
                      : "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)",
                  }}
                ></div>
                <span className="relative z-10 text-3xl font-bold text-white">
                  {battery ? Math.round(battery.level) : 0}%
                </span>
              </div>
              {battery?.charging && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 animate-bounce">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status:</span>
                <span
                  className={`font-bold ${
                    battery?.charging ? "text-green-400" : "text-blue-400"
                  }`}
                >
                  {battery?.charging ? "Charging" : "Discharging"}
                </span>
              </div>

              {battery &&
                battery.dischargingTime !== Infinity &&
                !battery.charging && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Time Remaining:</span>
                    <span className="font-bold text-orange-400">
                      {Math.round(battery.dischargingTime / 3600)}h{" "}
                      {Math.round((battery.dischargingTime % 3600) / 60)}m
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Battery Health & Tips */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <Activity className="w-6 h-6 mr-3 text-green-400" />
            Battery Health
          </h3>

          <div className="space-y-4">
            <div className="bg-slate-800/30 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400">Health Score:</span>
                <span className="text-green-400 font-bold">Excellent</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full w-[85%]"></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-slate-300">Optimal charging cycles</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-slate-300">Temperature within range</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-slate-300">
                  Consider reducing fast charging
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLocationPanel = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
          Location Services
        </h2>
        <p className="text-slate-300 text-lg">
          GPS tracking and location-based power optimization
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Location */}
        <div
          className={`bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500 ${
            pulseAnimation ? "animate-pulse" : ""
          }`}
        >
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <MapPin className="w-6 h-6 mr-3 text-green-400" />
            Current Position
          </h3>

          {location ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <span className="text-slate-400 text-sm block mb-1">
                    Latitude
                  </span>
                  <span className="font-mono text-green-400 text-lg">
                    {location.latitude.toFixed(6)}
                  </span>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <span className="text-slate-400 text-sm block mb-1">
                    Longitude
                  </span>
                  <span className="font-mono text-green-400 text-lg">
                    {location.longitude.toFixed(6)}
                  </span>
                </div>
              </div>

              <div className="bg-slate-800/30 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Accuracy:</span>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        location.accuracy < 50
                          ? "bg-green-400"
                          : location.accuracy < 100
                          ? "bg-yellow-400"
                          : "bg-red-400"
                      }`}
                    ></div>
                    <span className="font-medium">
                      {Math.round(location.accuracy)}m
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-green-500/20 rounded-full px-4 py-2">
                  <Globe className="w-4 h-4 text-green-400 animate-spin" />
                  <span className="text-green-400 text-sm font-medium">
                    GPS Active
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50 animate-pulse" />
              <p>{locationError || "Acquiring location..."}</p>
            </div>
          )}
        </div>

        {/* Location-based Recommendations */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <Lightbulb className="w-6 h-6 mr-3 text-yellow-400" />
            Location Tips
          </h3>

          <div className="space-y-4">
            <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-500/30">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-400 mt-1" />
                <div>
                  <h4 className="font-bold text-blue-300 mb-1">
                    Indoor Location
                  </h4>
                  <p className="text-blue-200 text-sm">
                    Switch to WiFi positioning to save battery
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/30">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <h4 className="font-bold text-green-300 mb-1">
                    Stationary Mode
                  </h4>
                  <p className="text-green-200 text-sm">
                    Reduce GPS frequency when not moving
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-500/30">
              <div className="flex items-start space-x-3">
                <Activity className="w-5 h-5 text-purple-400 mt-1" />
                <div>
                  <h4 className="font-bold text-purple-300 mb-1">
                    Background Apps
                  </h4>
                  <p className="text-purple-200 text-sm">
                    Limit location access for unused apps
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNetworkPanel = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Network Monitoring
        </h2>
        <p className="text-slate-300 text-lg">
          Real-time connection analysis and optimization
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Connection Status */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <Signal className="w-6 h-6 mr-3 text-purple-400" />
            Connection
          </h3>

          {network ? (
            <div className="space-y-4">
              <div className="text-center">
                <span
                  className={`text-4xl font-bold uppercase ${getNetworkTypeColor(
                    network.effectiveType
                  )}`}
                >
                  {network.effectiveType}
                </span>
                <p className="text-slate-400 text-sm mt-1">{network.type}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Signal Quality:</span>
                  <span
                    className={`font-bold ${
                      network.effectiveType === "4g"
                        ? "text-green-400"
                        : network.effectiveType === "3g"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {network.effectiveType === "4g"
                      ? "Excellent"
                      : network.effectiveType === "3g"
                      ? "Good"
                      : "Poor"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              <Wifi className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Network info unavailable</p>
            </div>
          )}
        </div>

        {/* Speed Metrics */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <BarChart3 className="w-6 h-6 mr-3 text-blue-400" />
            Performance
          </h3>

          {network ? (
            <div className="space-y-4">
              <div className="bg-slate-800/30 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400">Download:</span>
                  <span className="font-bold text-blue-400">
                    {network.downlink} Mbps
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min((network.downlink / 10) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="bg-slate-800/30 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400">Latency:</span>
                  <span className="font-bold text-purple-400">
                    {network.rtt}ms
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.max(100 - (network.rtt / 200) * 100, 0)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Performance data unavailable</p>
            </div>
          )}
        </div>

        {/* Network Optimization */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <Cpu className="w-6 h-6 mr-3 text-green-400" />
            Optimization
          </h3>

          <div className="space-y-4">
            <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/30">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-green-300 font-medium">
                  Auto-Switch WiFi
                </span>
              </div>
              <p className="text-green-200 text-sm">
                Automatically connect to known networks
              </p>
            </div>

            <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-500/30">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 font-medium">
                  Data Compression
                </span>
              </div>
              <p className="text-blue-200 text-sm">Reduce data usage by 30%</p>
            </div>

            <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-500/30">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300 font-medium">
                  Background Sync
                </span>
              </div>
              <p className="text-purple-200 text-sm">
                Limit when on mobile data
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecommendationsPanel = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-4">
          AI Recommendations
        </h2>
        <p className="text-slate-300 text-lg">
          Intelligent battery optimization suggestions
        </p>
      </div>

      <div className="grid gap-6">
        {recommendations.length > 0 ? (
          recommendations.map((rec, index) => (
            <div
              key={index}
              className="group bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-xl rounded-3xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-yellow-500/20"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-yellow-300 mb-2">
                    Optimization Tip #{index + 1}
                  </h3>
                  <p className="text-slate-200 leading-relaxed">{rec}</p>
                </div>
                <div className="flex-shrink-0">
                  <button className="bg-yellow-500/20 hover:bg-yellow-500/30 rounded-full p-2 transition-colors duration-300">
                    <CheckCircle2 className="w-5 h-5 text-yellow-400" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-3xl p-8 border border-green-500/30">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4 animate-pulse" />
              <h3 className="text-2xl font-bold text-green-300 mb-2">
                System Optimized
              </h3>
              <p className="text-green-400/80">
                All systems running efficiently - no recommendations needed
              </p>
            </div>
          </div>
        )}
      </div>

      {/* AI Insights */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
        <h3 className="text-xl font-bold mb-6 flex items-center">
          <Cpu className="w-6 h-6 mr-3 text-cyan-400" />
          AI Insights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-bold text-blue-300 mb-1">Usage Pattern</h4>
            <p className="text-slate-400 text-sm">
              Analyzing your daily habits
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-bold text-purple-300 mb-1">
              Predictive Analysis
            </h4>
            <p className="text-slate-400 text-sm">Forecasting battery needs</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-bold text-green-300 mb-1">Smart Suggestions</h4>
            <p className="text-slate-400 text-sm">Personalized optimizations</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsPanel = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-400 to-gray-400 bg-clip-text text-transparent mb-4">
          Power Settings
        </h2>
        <p className="text-slate-300 text-lg">
          Advanced power management and system controls
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Power Modes */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <Shield className="w-6 h-6 mr-3 text-orange-400" />
            Power Modes
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
              <div>
                <h4 className="font-bold text-white">Ultra Power Saving</h4>
                <p className="text-slate-400 text-sm">
                  Maximum battery conservation
                </p>
              </div>
              <button
                onClick={() => setPowerSaveMode(!powerSaveMode)}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 transform hover:scale-105 ${
                  powerSaveMode
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/50"
                    : "bg-slate-600 hover:bg-slate-500"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-lg ${
                    powerSaveMode ? "translate-x-9" : "translate-x-1"
                  }`}
                />
                {powerSaveMode && (
                  <Zap className="absolute left-2 w-3 h-3 text-white" />
                )}
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">CPU Throttling:</span>
                <span
                  className={
                    powerSaveMode ? "text-green-400" : "text-slate-500"
                  }
                >
                  {powerSaveMode ? "Active" : "Disabled"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Background Sync:</span>
                <span
                  className={powerSaveMode ? "text-red-400" : "text-green-400"}
                >
                  {powerSaveMode ? "Disabled" : "Active"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Location Services:</span>
                <span
                  className={
                    powerSaveMode ? "text-yellow-400" : "text-green-400"
                  }
                >
                  {powerSaveMode ? "Reduced" : "Full"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visibility Controls */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <Eye className="w-6 h-6 mr-3 text-blue-400" />
            Visibility Controls
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
              <div>
                <h4 className="font-bold text-white">Page Status</h4>
                <p className="text-slate-400 text-sm">
                  Current visibility state
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isVisible ? "bg-green-400" : "bg-red-400"
                  } animate-pulse`}
                ></div>
                <span
                  className={`font-bold ${
                    isVisible ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {isVisible ? "Active" : "Hidden"}
                </span>
              </div>
            </div>

            <div className="bg-slate-800/30 rounded-xl p-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                {isVisible
                  ? "🟢 Full monitoring active - all sensors and APIs running at optimal performance"
                  : "🔴 Power saving mode enabled - background activity reduced by 70%"}
              </p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500 lg:col-span-2">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <Bell className="w-6 h-6 mr-3 text-purple-400" />
            Notification Preferences
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-bold text-purple-300">Battery Alerts</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded bg-slate-700 border-slate-600"
                    defaultChecked
                  />
                  <span className="text-sm text-slate-300">
                    Critical level (20%)
                  </span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded bg-slate-700 border-slate-600"
                    defaultChecked
                  />
                  <span className="text-sm text-slate-300">
                    Low level (50%)
                  </span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded bg-slate-700 border-slate-600"
                  />
                  <span className="text-sm text-slate-300">
                    Charging complete
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-blue-300">Network Alerts</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded bg-slate-700 border-slate-600"
                    defaultChecked
                  />
                  <span className="text-sm text-slate-300">
                    Slow connection
                  </span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded bg-slate-700 border-slate-600"
                  />
                  <span className="text-sm text-slate-300">WiFi available</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded bg-slate-700 border-slate-600"
                  />
                  <span className="text-sm text-slate-300">
                    Data usage high
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-green-300">Location Alerts</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded bg-slate-700 border-slate-600"
                    defaultChecked
                  />
                  <span className="text-sm text-slate-300">High GPS usage</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded bg-slate-700 border-slate-600"
                  />
                  <span className="text-sm text-slate-300">New location</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded bg-slate-700 border-slate-600"
                  />
                  <span className="text-sm text-slate-300">
                    Indoor/outdoor switch
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center transform transition-all duration-1000 ease-out">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="p-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl shadow-purple-500/50 transform hover:scale-110 transition-all duration-300">
              <Smartphone className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-30 animate-pulse"></div>
          </div>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-gradient-x">
          Smart Battery Saver
        </h1>
        <p className="text-slate-300 text-xl max-w-2xl mx-auto leading-relaxed">
          AI-powered battery optimization with real-time monitoring and
          intelligent recommendations
        </p>
        <div className="mt-6 flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          <span className="text-green-400 text-sm font-medium">
            System Active
          </span>
        </div>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Battery Status */}
        <div className="group bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Battery className="w-7 h-7 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                {battery?.charging && (
                  <Zap className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-bounce" />
                )}
              </div>
              <h3 className="text-xl font-bold">Battery Status</h3>
            </div>
            {battery?.charging && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">
                  Charging
                </span>
              </div>
            )}
          </div>

          {battery ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <span className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {Math.round(battery.level)}%
                  </span>
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                </div>
              </div>

              <div className="relative">
                <div className="w-full bg-slate-800/50 rounded-2xl h-4 overflow-hidden shadow-inner">
                  <div
                    className={`h-full bg-gradient-to-r ${getBatteryColor(
                      battery.level
                    )} transition-all duration-1000 ease-out shadow-lg ${getBatteryGlow(
                      battery.level
                    )} relative overflow-hidden`}
                    style={{ width: `${battery.level}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </div>

              {battery.dischargingTime !== Infinity && !battery.charging && (
                <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                  <p className="text-sm text-slate-300">
                    <Activity className="inline w-4 h-4 mr-1" />~
                    {Math.round(battery.dischargingTime / 3600)}h remaining
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              <Battery className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Battery info unavailable</p>
            </div>
          )}
        </div>

        {/* Location Status */}
        <div
          className={`group bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 ${
            pulseAnimation ? "animate-pulse" : ""
          }`}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="relative">
              <MapPin className="w-7 h-7 text-green-400 group-hover:text-green-300 transition-colors duration-300" />
              {location && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              )}
            </div>
            <h3 className="text-xl font-bold">Location Tracking</h3>
          </div>

          {location ? (
            <div className="space-y-4">
              <div className="bg-slate-800/30 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <span className="text-slate-400 block">Latitude</span>
                    <span className="font-mono text-green-400 text-lg">
                      {location.latitude.toFixed(4)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block">Longitude</span>
                    <span className="font-mono text-green-400 text-lg">
                      {location.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-800/30 rounded-xl p-3">
                <span className="text-slate-400">Accuracy:</span>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      location.accuracy < 50
                        ? "bg-green-400"
                        : location.accuracy < 100
                        ? "bg-yellow-400"
                        : "bg-red-400"
                    }`}
                  ></div>
                  <span className="font-medium">
                    {Math.round(location.accuracy)}m
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2 text-green-400">
                <Globe className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">GPS Active</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50 animate-pulse" />
              <p>{locationError || "Acquiring location..."}</p>
            </div>
          )}
        </div>

        {/* Network Status */}
        <div className="group bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
          <div className="flex items-center space-x-3 mb-6">
            <div className="relative">
              <Signal className="w-7 h-7 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-xl font-bold">Network Status</h3>
          </div>

          {network ? (
            <div className="space-y-4">
              <div className="text-center">
                <span
                  className={`text-3xl font-bold uppercase ${getNetworkTypeColor(
                    network.effectiveType
                  )} drop-shadow-lg`}
                >
                  {network.effectiveType || "Unknown"}
                </span>
                <p className="text-slate-400 text-sm mt-1">{network.type}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                  <p className="text-slate-400 text-xs">Download Speed</p>
                  <p className="text-lg font-bold text-purple-400">
                    {network.downlink} Mbps
                  </p>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                  <p className="text-slate-400 text-xs">Latency</p>
                  <p className="text-lg font-bold text-purple-400">
                    {network.rtt}ms
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Speed</span>
                  <span>
                    {Math.min((network.downlink / 10) * 100, 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-slate-800/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 transition-all duration-1000 ease-out shadow-lg shadow-purple-500/30 relative overflow-hidden"
                    style={{
                      width: `${Math.min((network.downlink / 10) * 100, 100)}%`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              <Wifi className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Network info unavailable</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <Lightbulb className="w-6 h-6 text-yellow-400 animate-pulse" />
            <h3 className="text-xl font-bold">Quick Recommendations</h3>
            <div className="bg-yellow-400/20 rounded-full px-3 py-1">
              <span className="text-yellow-400 text-sm font-medium">
                {recommendations.length} Active
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            {recommendations.slice(0, 2).map((rec, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl border border-yellow-500/20"
              >
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-1" />
                <p className="text-slate-200 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>

          {recommendations.length > 2 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setActivePanel("recommendations")}
                className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors duration-300"
              >
                View {recommendations.length - 2} more recommendations →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderActivePanel = () => {
    switch (activePanel) {
      case "battery":
        return renderBatteryPanel();
      case "location":
        return renderLocationPanel();
      case "network":
        return renderNetworkPanel();
      case "recommendations":
        return renderRecommendationsPanel();
      case "settings":
        return renderSettingsPanel();
      default:
        return renderDashboard();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-500/30 rounded-full animate-spin border-t-blue-500 mb-6"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-500/30 rounded-full animate-ping"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Initializing Smart Battery Saver
          </h2>
          <p className="text-slate-300">Scanning your device capabilities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float-slow"></div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Navigation Menu */}
      <nav className="relative z-20 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Smart Battery Saver
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePanel(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      activePanel === item.id
                        ? "bg-white/20 text-white shadow-lg"
                        : "text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors duration-300"
            >
              {menuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-white/10 pt-4">
              <div className="grid grid-cols-2 gap-3">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePanel(item.id);
                        setMenuOpen(false);
                      }}
                      className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                        activePanel === item.id
                          ? "bg-white/20 text-white"
                          : "text-slate-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-slate-400">
                          {item.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </nav>

      <div
        id="app-content"
        className="relative z-10 container mx-auto px-6 py-8"
      >
        {renderActivePanel()}

        {/* Enhanced Footer */}
        <div className="text-center space-y-4 mt-16">
          <div className="flex items-center justify-center space-x-6 text-slate-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Real-time Monitoring</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm">AI Optimization</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Smart Recommendations</span>
            </div>
          </div>
          <p className="text-slate-500 text-sm">
           Created by Shubham Gupta - MCA 
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
