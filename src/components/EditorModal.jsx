import { useState, useEffect } from 'react';
import { X, Save, Quote } from 'lucide-react';

const EditorModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [content, setContent] = useState('');
  const [quote, setQuote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setContent(initialData.content);
      setQuote(initialData.quote || '');
    } else {
      setContent('');
      setQuote('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !quote.trim()) return;

    setIsSubmitting(true);
    await onSave({
      id: initialData?.id,
      content,
      quote,
      category: 'General', // قيمة افتراضية مخفية
      date: initialData?.date,
      dayNumber: initialData?.dayNumber
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl bg-[#0A0A0A] border border-[#222] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-4 border-b border-[#222]">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">
            {initialData ? 'Edit Signal' : 'New Transmission'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="flex items-center gap-2 text-[10px] text-orange-500 mb-2 uppercase tracking-wider font-bold">
              <Quote size={12} /> Quote (Optional)
            </label>
            <input 
              type="text"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-orange-500 outline-none text-sm font-serif italic"
              placeholder='e.g. "Action is the foundational key to all success."'
            />
          </div>

          <div className="h-full">
            <label className="block text-[10px] text-slate-500 mb-2 uppercase tracking-wider font-bold">Content</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-48 bg-[#111] border border-[#333] rounded-lg px-3 py-3 text-slate-200 focus:border-blue-500 outline-none resize-none text-base leading-relaxed"
              placeholder="Document your journey..."
              autoFocus
            />
          </div>
        </div>

        <div className="p-4 border-t border-[#222] flex justify-end gap-3 bg-[#0A0A0A]">
          <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:text-white text-xs font-bold">CANCEL</button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'SENDING...' : 'PUBLISH'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorModal;