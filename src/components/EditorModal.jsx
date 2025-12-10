import { useState, useEffect, useRef } from 'react';
import { X, Save, Quote, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import { compressImage } from '../lib/utils'; // استدعاء دالة الضغط

const EditorModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [content, setContent] = useState('');
  const [quote, setQuote] = useState('');
  // States للصورة
  const [selectedFile, setSelectedFile] = useState(null); // الملف الخام
  const [previewUrl, setPreviewUrl] = useState(null); // للعرض المؤقت
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef(null);
  const { uploadImage, uploading } = useStorage();

  useEffect(() => {
    if (initialData) {
      setContent(initialData.content);
      setQuote(initialData.quote || '');
      setPreviewUrl(initialData.image || null);
    } else {
      setContent('');
      setQuote('');
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [initialData, isOpen]);

  // دالة اختيار الملف وضغطه فوراً للعرض
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // نضغط الصورة الأول قبل أي حاجة
        const compressedDataUrl = await compressImage(file);
        setPreviewUrl(compressedDataUrl); // نعرض النسخة المضغوطة
        setSelectedFile(compressedDataUrl); // هنرفع النسخة المضغوطة دي (DataURL)
      } catch (error) {
        console.error("Compression error", error);
      }
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !quote.trim() && !previewUrl) return;

    setIsSubmitting(true);

    let finalImageUrl = initialData?.image || null;

    // لو فيه ملف جديد تم اختياره، نرفعه
    if (selectedFile) {
      const uploadedUrl = await uploadImage(selectedFile);
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      }
    } 
    // لو مفيش ملف جديد، بس اليوزر مسح الصورة القديمة
    else if (!previewUrl && initialData?.image) {
      finalImageUrl = null;
    }

    await onSave({
      id: initialData?.id,
      content,
      quote,
      image: finalImageUrl, // رابط الصورة النهائي
      category: 'General',
      date: initialData?.date,
      dayNumber: initialData?.dayNumber
    });

    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

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
          
          {/* Quote Input */}
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

          {/* Content Input */}
          <div>
            <label className="block text-[10px] text-slate-500 mb-2 uppercase tracking-wider font-bold">Content</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-32 bg-[#111] border border-[#333] rounded-lg px-3 py-3 text-slate-200 focus:border-blue-500 outline-none resize-none text-base leading-relaxed"
              placeholder="Document your journey..."
              autoFocus
            />
          </div>

          {/* Image Upload Area */}
          <div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            
            {previewUrl ? (
              <div className="relative mt-2 rounded-xl overflow-hidden border border-[#333] group">
                <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-64 object-cover" />
                <button 
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-red-500/80 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-400 transition-colors mt-2 py-2 px-3 hover:bg-[#151515] rounded-lg border border-transparent hover:border-[#333]"
              >
                <ImageIcon size={16} /> Add Image
              </button>
            )}
          </div>

        </div>

        <div className="p-4 border-t border-[#222] flex justify-end gap-3 bg-[#0A0A0A]">
          <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:text-white text-xs font-bold">CANCEL</button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || uploading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {(isSubmitting || uploading) ? (
              <>
                <Loader2 size={14} className="animate-spin" /> {uploading ? 'UPLOADING...' : 'SENDING...'}
              </>
            ) : 'PUBLISH'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorModal;