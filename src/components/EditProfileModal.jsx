import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Briefcase, Calendar as CalendarIcon, User } from 'lucide-react';

const EditProfileModal = ({ isOpen, onClose, currentUserData, onSave }) => {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUserData) {
      setDisplayName(currentUserData.displayName || '');
      setBio(currentUserData.bio || '');
      setExperience(currentUserData.experience || []);
    }
  }, [currentUserData, isOpen]);

  const handleAddJob = () => {
    setExperience([...experience, { title: '', company: '', year: '' }]);
  };

  const handleRemoveJob = (index) => {
    const newExp = [...experience];
    newExp.splice(index, 1);
    setExperience(newExp);
  };

  const handleJobChange = (index, field, value) => {
    const newExp = [...experience];
    newExp[index][field] = value;
    setExperience(newExp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // تنظيف الوظائف الفارغة
    const validExperience = experience.filter(job => job.title.trim() !== '' || job.company.trim() !== '');

    await onSave({
      displayName,
      bio,
      experience: validExperience
    });
    
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0A0A0A] border border-[#222] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#222]">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Update Identity</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-6">
          
          {/* Name */}
          <div className="space-y-2">
            <label className="text-[10px] text-indigo-400 uppercase tracking-wider font-bold flex items-center gap-1">
              <User size={12} /> Display Name
            </label>
            <input 
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none text-sm"
              placeholder="Your Codename"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-[10px] text-indigo-400 uppercase tracking-wider font-bold">Bio / Status</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full h-24 bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none resize-none text-sm"
              placeholder="Brief description about your mission..."
            />
          </div>

          {/* Experience Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-indigo-400 uppercase tracking-wider font-bold flex items-center gap-1">
                <Briefcase size={12} /> Career History
              </label>
              <button 
                onClick={handleAddJob}
                className="text-[10px] bg-[#1a1a1a] hover:bg-[#252525] text-white px-2 py-1 rounded border border-[#333] flex items-center gap-1 transition-colors"
              >
                <Plus size={10} /> Add Job
              </button>
            </div>

            {experience.map((job, index) => (
              <div key={index} className="bg-[#111] border border-[#222] p-3 rounded-xl space-y-2 relative group">
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text"
                    value={job.title}
                    onChange={(e) => handleJobChange(index, 'title', e.target.value)}
                    placeholder="Job Title"
                    className="bg-[#0A0A0A] border border-[#333] rounded px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                  />
                  <input 
                    type="text"
                    value={job.company}
                    onChange={(e) => handleJobChange(index, 'company', e.target.value)}
                    placeholder="Company / Place"
                    className="bg-[#0A0A0A] border border-[#333] rounded px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex gap-2">
                   <div className="relative flex-1">
                      <CalendarIcon size={12} className="absolute left-2 top-2 text-slate-500" />
                      <input 
                        type="text"
                        value={job.year}
                        onChange={(e) => handleJobChange(index, 'year', e.target.value)}
                        placeholder="Year (e.g. 2023 - Present)"
                        className="w-full bg-[#0A0A0A] border border-[#333] rounded px-2 py-1.5 pl-7 text-xs text-white outline-none focus:border-indigo-500"
                      />
                   </div>
                </div>
                
                <button 
                  onClick={() => handleRemoveJob(index)}
                  className="absolute -top-2 -right-2 bg-red-900/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            
            {experience.length === 0 && (
              <p className="text-center text-xs text-[#444] py-2 border border-dashed border-[#222] rounded-lg">No records found.</p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#222] flex justify-end gap-3 bg-[#0A0A0A]">
          <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:text-white text-xs font-bold">CANCEL</button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;