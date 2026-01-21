import React from "react";

export default function Loader() {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-50">
            <div className="relative flex flex-col items-center">
                {/* Logo Container with Pulse Effect */}
                <div className="w-32 h-32 sm:w-40 sm:h-40 mb-8 relative animate-pulse">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-[#ca0002] blur-3xl opacity-20 rounded-full"></div>

                    <img
                        src="/assets/ti-logo-new.jpg"
                        alt="Loading..."
                        className="w-full h-full object-contain relative z-10"
                    />
                </div>

                {/* Loading Spinner/Bar */}
                <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#ca0002] animate-marquee" style={{ width: '50%', animation: 'loading-bar 1.5s infinite ease-in-out' }}></div>
                </div>

                <style>{`
          @keyframes loading-bar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
            </div>
        </div>
    );
}
