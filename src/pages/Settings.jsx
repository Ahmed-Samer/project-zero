import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useStorage } from '../hooks/useStorage'; // عشان نرفع صورة البروفايل
import { Save, Loader2, User, Briefcase, Calendar, ChevronLeft, LayoutDashboard, Lock, Globe, Users, Camera } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import MobileNav from '../components/MobileNav';

export default function Settings() {
  const { user, updateUserProfile } = useAuth();
  const { uploadImage, uploading } = useStorage();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    photoURL: '',
    birthDate: '',
    birthDatePrivacy: 'public',
    followingPrivacy: 'public',
    experience: []
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        bio: user.bio || '',
        photoURL: user.photoURL || '',
        birthDate: user.birthDate || '',
        birthDatePrivacy: user.birthDatePrivacy || 'public',
        followingPrivacy: user.followingPrivacy || 'public',
        experience: user.experience || []
      });
      setImagePreview(user.photoURL);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- منطق رفع الصورة ---
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // عرض مؤقت
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);

      // رفع فعلي
      const url = await uploadImage(file);
      if (url) {
        setFormData(prev => ({ ...prev, photoURL: url }));
      }
    }
  };

  // --- منطق الوظائف ---
  const handleAddJob = (e) => {
    e.preventDefault();
    setFormData({
      ...formData,
      experience: [...formData.experience, { title: '', company: '', year: '' }]
    });
  };

  const handleRemoveJob = (index) => {
    const newExp = [...formData.experience];
    newExp.splice(index, 1);
    setFormData({ ...formData, experience: newExp });
  };

  const handleJobChange = (index, field, value) => {
    const newExp = [...formData.experience];
    newExp[index][field] = value;
    setFormData({ ...formData, experience: newExp });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const validExperience = formData.experience.filter(job => job.title.trim() !== '' || job.company.trim() !== '');

    const success = await updateUserProfile(user.uid, {
      ...formData,
      experience: validExperience
    });

    setLoading(false);
    if (success) {
      navigate(`/profile/${user.uid}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#e7e9ea] font-sans pb-20 lg:pb-0">
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-[#0b0f19]/90 backdrop-blur-md border-b border-[#1f2937] z-40 px-4 h-14 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white">
          <ChevronLeft size={24} />
        </button>
        <span className="font-bold text-lg tracking-tight">Edit Profile</span>
      </div>

      <Sidebar />

      <div className="lg:ml-64 flex justify-center min-h-screen">
        
        <main className="flex-1 max-w-[700px] border-r border-[#1f2937] min-h-screen pt-14 lg:pt-0 w-full min-w-0">
          
          <div className="p-6">
            <h1 className="hidden lg:block text-2xl font-black text-white mb-8 border-b border-[#1f2937] pb-4">
              Profile Settings
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* 1. Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="relative w-28 h-28 rounded-full border-4 border-[#1f2937] overflow-hidden group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#111827] flex items-center justify-center text-slate-500">
                      <User size={40} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {uploading ? <Loader2 className="animate-spin text-white" /> : <Camera className="text-white" />}
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                <button type="button" onClick={() => fileInputRef.current.click()} className="mt-2 text-xs font-bold text-indigo-400 hover:text-indigo-300">
                  Change Photo
                </button>
              </div>

              {/* 2. Basic Info & Privacy */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                  <User size={16} /> Identity & Privacy
                </h3>
                
                <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Display Name</label>
                    <input 
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      className="w-full bg-[#0b0f19] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Bio</label>
                    <textarea 
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="w-full h-24 bg-[#0b0f19] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none resize-none leading-relaxed"
                    />
                  </div>

                  {/* Birth Date & Privacy */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Date of Birth</label>
                      <input 
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                        className="w-full bg-[#0b0f19] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Birth Date Visibility</label>
                      <select 
                        name="birthDatePrivacy"
                        value={formData.birthDatePrivacy}
                        onChange={handleChange}
                        className="w-full bg-[#0b0f19] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none"
                      >
                        <option value="public">🌎 Public</option>
                        <option value="followers">👥 Followers Only</option>
                        <option value="private">🔒 Private (Me Only)</option>
                      </select>
                    </div>
                  </div>

                  {/* Following List Privacy */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Who can see people I follow?</label>
                    <select 
                      name="followingPrivacy"
                      value={formData.followingPrivacy}
                      onChange={handleChange}
                      className="w-full bg-[#0b0f19] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none"
                    >
                      <option value="public">🌎 Public</option>
                      <option value="followers">👥 Followers Only</option>
                      <option value="private">🔒 Private (Me Only)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Experience */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                    <Briefcase size={16} /> Career History
                  </h3>
                  <button onClick={handleAddJob} className="text-xs bg-[#1f2937] hover:bg-[#374151] text-white px-3 py-1.5 rounded-lg border border-[#333] transition-colors font-bold">+ Add Role</button>
                </div>

                <div className="space-y-3">
                  {formData.experience.map((job, index) => (
                    <div key={index} className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 relative group">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <input type="text" value={job.title} onChange={(e) => handleJobChange(index, 'title', e.target.value)} className="w-full bg-[#0b0f19] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" placeholder="Job Title" />
                        <input type="text" value={job.company} onChange={(e) => handleJobChange(index, 'company', e.target.value)} className="w-full bg-[#0b0f19] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" placeholder="Company" />
                      </div>
                      <input type="text" value={job.year} onChange={(e) => handleJobChange(index, 'year', e.target.value)} className="w-full bg-[#0b0f19] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" placeholder="Year (e.g. 2023 - Present)" />
                      <button type="button" onClick={() => handleRemoveJob(index)} className="absolute -top-2 -right-2 bg-red-500/20 text-red-500 p-1.5 rounded-full"><LayoutDashboard size={14} className="rotate-45" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#1f2937] flex gap-4">
                <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 bg-[#1f2937] text-white font-bold rounded-xl">Cancel</button>
                <button type="submit" disabled={loading || uploading} className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                  {(loading || uploading) ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
                </button>
              </div>

            </form>
          </div>
        </main>
        <RightSidebar />
      </div>
      <MobileNav />
    </div>
  );
}