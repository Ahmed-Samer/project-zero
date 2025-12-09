import { useState, useEffect } from 'react';
import { X, Save, Briefcase, Brain, Dumbbell, Zap, Target, Quote } from 'lucide-react';

const CATEGORIES = [
  { id: 'Business', label: 'Business', icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
  { id: 'Mindset', label: 'Mindset', icon: Brain, color: 'from-purple-500 to-pink-500' },
  { id: 'Health', label: 'Health', icon: Dumbbell, color: 'from-emerald-500 to-green-500' },
  { id: 'DeepWork', label: 'Deep Work', icon: Zap, color: 'from-orange-500 to-yellow-500' },
  { id: 'General', label: 'General', icon: Target, color: 'from-slate-500 to-gray-500' },
];

const EditorModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [content, setContent] = useState('');
  const [quote, setQuote] = useState(''); // حالة الاقتباس
  const [category, setCategory] = useState('General');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setContent(initialData.content);
      setQuote(initialData.quote || ''); // تحميل الاقتباس القديم
      setCategory(initialData.category || 'General');
    } else {
      setContent('');
      setQuote('');
      setCategory('General');
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
      quote, // إرسال الاقتباس
      category,
      date: initialData?.date,
      dayNumber: initialData?.dayNumber
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] border border-white/10 bg-slate-900/90">
        
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white tracking-wide">
            {initialData ? 'Edit Signal' : 'New Transmission'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          
          {/* Categories */}
          <div className="mb-6">
            <label className="block text-xs text-slate-400 mb-3 uppercase tracking-wider font-bold">Frequency</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-300 border
                      ${isSelected 
                        ? `bg-gradient-to-r ${cat.color} text-white border-transparent shadow-lg scale-105` 
                        : 'bg-slate-800/50 text-slate-400 border-white/5 hover:bg-slate-800 hover:border-white/20'
                      }
                    `}
                  >
                    <Icon size={14} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            
            {/* Quote of the Day Section */}
            <div>
              <label className="flex items-center gap-2 text-xs text-yellow-500 mb-2 uppercase tracking-wider font-bold">
                <Quote size={12} />
                Quote of the Day
              </label>
              <input 
                type="text"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className="w-full bg-slate-950/50 border border-yellow-500/20 rounded-xl px-4 py-3 text-yellow-100 focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500/50 outline-none text-sm font-serif italic placeholder:text-yellow-500/30 placeholder:not-italic"
                placeholder='e.g. "Consistency is what transforms average into excellence."'
              />
            </div>

            {/* Main Content */}
            <div>
              <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">
                Log Data
              </label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-40 bg-slate-950/50 border border-white/10 rounded-xl px-4 py-4 text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none resize-none text-lg leading-relaxed font-sans placeholder:text-slate-700"
                placeholder="What did you achieve today?..."
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-white/5">
          <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-bold">
            ABORT
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-600/40 hover:scale-105 disabled:opacity-50 disabled:scale-100"
          >
            <Save size={16} />
            {isSubmitting ? 'TRANSMITTING...' : 'SAVE LOG'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorModal;