import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// دالة أمان للتأكد من صحة التاريخ
const getValidDate = (dateObj) => {
  if (!dateObj) return null;
  try {
    // لو جاي من فايربيس
    if (dateObj.toDate && typeof dateObj.toDate === 'function') {
      return dateObj.toDate();
    }
    // لو تاريخ عادي أو نص
    const d = new Date(dateObj);
    // التأكد إنه تاريخ صالح (مش Invalid Date)
    if (isNaN(d.getTime())) return null;
    return d;
  } catch (e) {
    return null;
  }
};

export const formatTime = (dateObj) => {
  const d = getValidDate(dateObj);
  if (!d) return '--:--';
  
  return new Intl.DateTimeFormat('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  }).format(d);
};

export const formatDateFull = (dateObj) => {
  const d = getValidDate(dateObj);
  if (!d) return 'Unknown Date';

  return new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(d);
};

export const getDayNumber = (startDate, currentDate) => {
  const start = getValidDate(startDate);
  const current = getValidDate(currentDate);
  
  if (!start || !current) return 1;

  start.setHours(0, 0, 0, 0);
  current.setHours(0, 0, 0, 0);
  
  const diffTime = current - start;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; 
  return diffDays > 0 ? diffDays : 1;
};

// --- ضغط وتحويل الصورة (نسخة HD) ---
export const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        // عدلنا العرض لـ 1280 بكسل (جودة HD ممتازة للويب)
        const MAX_WIDTH = 1280;
        const scaleSize = MAX_WIDTH / img.width;
        
        canvas.width = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
        canvas.height = img.width > MAX_WIDTH ? (img.height * scaleSize) : img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // عدلنا الجودة لـ 0.85 (85%) عشان الصورة تكون واضحة جداً ومش مبكسلة
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        
        resolve(dataUrl);
      };
    };
  });
};