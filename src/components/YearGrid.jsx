import React from 'react';

const YearGrid = ({ totalDays = 365, activeDays, onDayClick }) => {
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="glass-panel rounded-2xl p-4 md:p-6 mb-8 md:mb-16 animate-enter" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-xs md:text-sm font-bold text-slate-200 tracking-wide uppercase">Journey Map</h3>
          <p className="text-[10px] md:text-xs text-slate-500 mt-1">Consistency is key</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 px-2 py-1 md:px-3 rounded-full">
          <span className="text-[10px] md:text-xs font-bold text-blue-400 font-mono">
            {activeDays.length} / {totalDays}
          </span>
        </div>
      </div>
      
      {/* Mobile: gap-1, w-2 h-2 (أصغر)
         Desktop: gap-1.5, w-3 h-3 (أكبر)
      */}
      <div className="flex flex-wrap gap-1 md:gap-1.5 justify-center md:justify-start">
        {days.map((dayNum) => {
          const isActive = activeDays.includes(dayNum);
          
          return (
            <button
              key={dayNum}
              onClick={() => isActive && onDayClick(dayNum)}
              disabled={!isActive}
              className={`
                w-2 h-2 md:w-3 md:h-3 rounded-[1px] md:rounded-[2px] transition-all duration-300 relative group
                ${isActive 
                  ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)] md:shadow-[0_0_10px_rgba(34,211,238,0.8)] scale-110 z-10 cursor-pointer' 
                  : 'bg-slate-800/40 cursor-default'
                }
              `}
            >
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default YearGrid;