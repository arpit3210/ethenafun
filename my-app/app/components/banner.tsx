import React from 'react';


export default function Banner() {
  return (
    <div className="relative h-80 rounded-lg overflow-hidden glass-effect">
      <div className="absolute inset-0">
        <div className="absolute w-full h-32 bottom-0 bg-gradient-to-t from-purple-900/50 to-transparent"></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-16 h-16 bg-white/10 rounded-full animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-4xl md:text-6xl font-bold text-center gradient-text">
          Welcome to EthenaFun
        </h1>
      </div>
    </div>
  )
}
