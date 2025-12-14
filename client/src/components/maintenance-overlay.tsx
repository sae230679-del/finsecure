import { useState, useEffect } from "react";

function TrafficLight() {
  const [activeLight, setActiveLight] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLight((prev) => (prev + 1) % 3);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const lights = [
    { color: "red", activeClass: "bg-red-500 shadow-[0_0_15px_5px_rgba(239,68,68,0.7)]", inactiveClass: "bg-red-900/30" },
    { color: "yellow", activeClass: "bg-yellow-400 shadow-[0_0_15px_5px_rgba(250,204,21,0.7)]", inactiveClass: "bg-yellow-900/30" },
    { color: "green", activeClass: "bg-green-500 shadow-[0_0_15px_5px_rgba(34,197,94,0.7)]", inactiveClass: "bg-green-900/30" },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="bg-gray-800 rounded-lg p-2 shadow-xl border-2 border-gray-600">
        <div className="flex flex-col gap-2">
          {lights.map((light, index) => (
            <div
              key={light.color}
              className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full transition-all duration-300 ${
                activeLight === index ? light.activeClass : light.inactiveClass
              }`}
            />
          ))}
        </div>
      </div>
      <div className="w-2 h-8 sm:h-10 md:h-12 bg-gray-700 mt-1 rounded-b" />
    </div>
  );
}

export function MaintenanceOverlay() {
  const [textPulse, setTextPulse] = useState(false);
  const [greenTextVisible, setGreenTextVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextPulse((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const greenInterval = setInterval(() => {
      setGreenTextVisible((prev) => !prev);
    }, 600);
    return () => clearInterval(greenInterval);
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
    >
      <div className="relative max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full">
        <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6">
          <TrafficLight />
          
          <div className="relative flex-1 max-w-md">
            <div 
              className="border-2 sm:border-4 rounded-xl p-3 sm:p-5 md:p-6 bg-gray-900/95 backdrop-blur-sm"
              style={{
                animation: "tricolor-border 3s linear infinite",
              }}
            >
              <style>{`
                @keyframes tricolor-border {
                  0%, 100% { 
                    border-color: rgb(239, 68, 68);
                    box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
                  }
                  33% { 
                    border-color: rgb(250, 204, 21);
                    box-shadow: 0 0 15px rgba(250, 204, 21, 0.6);
                  }
                  66% { 
                    border-color: rgb(34, 197, 94);
                    box-shadow: 0 0 15px rgba(34, 197, 94, 0.6);
                  }
                }
                @keyframes green-blink {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.3; }
                }
              `}</style>
              
              <div className="text-center space-y-2 sm:space-y-3">
                <div className="flex items-center justify-center">
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-yellow-400" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                    />
                  </svg>
                </div>
                
                <h1 
                  className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-black tracking-wide transition-all duration-300 ${
                    textPulse 
                      ? "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]" 
                      : "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.7)]"
                  }`}
                  data-testid="text-maintenance-title"
                >
                  ТЕХНИЧЕСКИЕ РАБОТЫ
                </h1>
                
                <div className="h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
                
                <p 
                  className={`text-sm sm:text-base md:text-lg font-bold transition-all duration-500 ${
                    textPulse 
                      ? "text-yellow-300" 
                      : "text-red-400"
                  }`}
                  data-testid="text-maintenance-subtitle"
                >
                  САЙТ ВРЕМЕННО НЕ РАБОТАЕТ
                </p>
                
                <div className="pt-2 sm:pt-3 border-t border-gray-600">
                  <p 
                    className={`text-xs sm:text-sm font-semibold transition-opacity duration-300 ${
                      greenTextVisible 
                        ? "text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" 
                        : "text-green-400/30"
                    }`}
                    style={{ animation: "green-blink 1.2s ease-in-out infinite" }}
                  >
                    Мы скоро вернёмся!
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Приносим извинения за неудобства.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-1 -left-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: "0.5s" }} />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-ping" style={{ animationDelay: "1s" }} />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-ping" style={{ animationDelay: "1.5s" }} />
          </div>
          
          <TrafficLight />
        </div>
      </div>
    </div>
  );
}
