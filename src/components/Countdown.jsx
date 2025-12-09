import { useState, useEffect } from 'react';

const Countdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  // مكون صغير للرقم الواحد عشان منكررش الكود
  const TimeBlock = ({ value, label }) => (
    <div className="flex flex-col items-center mx-2 md:mx-4">
      <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-lg p-3 w-16 md:w-20 text-center shadow-lg">
        <span className="text-2xl md:text-4xl font-mono font-bold text-blue-400 tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] md:text-xs uppercase tracking-widest text-slate-400 mt-2 font-semibold">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex flex-wrap justify-center items-center py-8 animate-pulse-slow">
      <TimeBlock value={timeLeft.days} label="Days" />
      <span className="text-2xl text-slate-600 font-bold mb-6">:</span>
      <TimeBlock value={timeLeft.hours} label="Hours" />
      <span className="text-2xl text-slate-600 font-bold mb-6">:</span>
      <TimeBlock value={timeLeft.minutes} label="Mins" />
      <span className="text-2xl text-slate-600 font-bold mb-6">:</span>
      <TimeBlock value={timeLeft.seconds} label="Secs" />
    </div>
  );
};

export default Countdown;