import { useState, useRef, useEffect } from 'react';
import { Edit2, Trash2, ChevronDown, ChevronUp, Quote, Calendar } from 'lucide-react';
import { formatTime } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

// دالة عشان نحسب مكان الماوس للإضاءة
const useSpotlight = () => {
  const divRef = useRef(null);
  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    divRef.current.style.setProperty('--mouse-x', `${x}px`);
    divRef.current.style.setProperty('--mouse-y', `${y}px`);
  };
  return { divRef, handleMouseMove };
};

const EntryCard = ({ entry, isAdmin, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { divRef, handleMouseMove } = useSpotlight();
  
  const MAX_LENGTH = 250;
  const isLongContent = entry.content.length > MAX_LENGTH;
  const displayContent = isExpanded || !isLongContent ? entry.content : entry.content.slice(0, MAX_LENGTH) + "...";

  return (
    <div 
      ref={divRef}
      onMouseMove={handleMouseMove}
      className="spotlight-card rounded-xl p-6 mb-6 transition-all duration-300 hover:bg-slate-900/80 group"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
             <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase">
              {entry.category || 'System Log'}
             </span>
          </div>
          <span className="text-2xl font-bold text-white font-mono tracking-tight">
            {formatTime(entry.date)}
          </span>
        </div>

        {isAdmin && (
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(entry)} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg"><Edit2 size={14} /></button>
            <button onClick={() => onDelete(entry.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={14} /></button>
          </div>
        )}
      </div>

      {/* Quote Area */}
      {entry.quote && (
        <div className="mb-6 bg-slate-950/50 border-l-2 border-indigo-500 p-4 rounded-r-lg">
          <Quote size={12} className="text-indigo-500 mb-2" />
          <p className="text-sm font-medium text-slate-300 italic">"{entry.quote}"</p>
        </div>
      )}

      {/* Main Content */}
      <div className="prose prose-invert prose-p:text-slate-400 prose-headings:text-slate-200 prose-a:text-indigo-400 max-w-none">
        <ReactMarkdown>{displayContent}</ReactMarkdown>
      </div>

      {isLongContent && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="mt-6 w-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-white border-t border-white/5 transition-colors uppercase tracking-widest"
        >
          {isExpanded ? <>Collapse <ChevronUp size={12}/></> : <>Read Full Entry <ChevronDown size={12}/></>}
        </button>
      )}
    </div>
  );
};

export default EntryCard;