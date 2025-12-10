import React from 'react';
import { X } from 'lucide-react';

const ImageModal = ({ isOpen, onClose, imageSrc }) => {
  if (!isOpen || !imageSrc) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose} // عشان يقفل لما تدوس في أي حتة
    >
      {/* زرار الإغلاق */}
      <button 
        onClick={onClose}
        className="absolute top-5 right-5 text-white/70 hover:text-white bg-black/50 p-2 rounded-full transition-colors z-50"
      >
        <X size={32} />
      </button>

      {/* الصورة */}
      <img 
        src={imageSrc} 
        alt="Full view" 
        className="max-h-[90vh] max-w-[95vw] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()} // عشان لما يدوس عالصورة نفسها متقفلش
      />
    </div>
  );
};

export default ImageModal;