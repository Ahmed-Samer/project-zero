import React from 'react';

const YearGrid = ({ totalDays = 365, activeDays, onDayClick }) => {
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="pro-card p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4 border-b border-[#333] pb-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Year Progress</span>
        <span className="text-xs font-mono text-orange-500 font-bold">{activeDays.length}/{totalDays}</span>
      </div>
      
      <div className="flex flex-wrap gap-1.5 justify-start">
        {days.map((dayNum) => {
          const isActive = activeDays.includes(dayNum);
          return (
            <button
              key={dayNum}
              onClick={() => isActive && onDayClick(dayNum)}
              disabled={!isActive}
              title={`Day ${dayNum}`}
              className={`
                w-2.5 h-2.5 rounded-[2px] transition-all duration-300
                ${isActive 
                  ? 'bg-blue-500 hover:bg-orange-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] cursor-pointer scale-110' 
                  : 'bg-[#1a1a1a] hover:bg-[#252525]'
                }
              `}
            />
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex gap-4 mt-4 text-[10px] text-slate-500 uppercase font-bold">
        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#1a1a1a] rounded"></div>Empty</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded shadow-[0_0_5px_blue]"></div>Logged</div>
      </div>
    </div>
  );
};

export default YearGrid;