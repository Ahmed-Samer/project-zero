import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Save, Loader2, User, Briefcase, Calendar, ChevronLeft, LayoutDashboard } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import MobileNav from '../components/MobileNav';

export default function Settings() {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    experience: []
  });

  // ملء البيانات عند التحميل
  useEffect(() => {
    // هنا بنجيب الداتا من الـ user object اللي جاي من useAuth
    // ملحوظة: لو useAuth مش بيرجع البايو والوظائف بشكل مباشر، 
    // يفضل نعمل fetch سريع هنا، بس للتبسيط هنعتمد إنه متحدث أو هنجيبه
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        bio: user.bio || '', // لازم نتأكد إن useAuth بيحدث الـ state ده
        experience: user.experience || []
      });
    }
  }, [user]);

  // تحديث الحقول النصية
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- منطق الوظائف (Experience) ---
  const handleAddJob = (e) => {
    e.preventDefault(); // منع تحديث الصفحة
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

  // --- الحفظ ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // تنظيف الوظائف الفارغة
    const validExperience = formData.experience.filter(job => job.title.trim() !== '' || job.company.trim() !== '');

    const success = await updateUserProfile(user.uid, {
      ...formData,
      experience: validExperience
    });

    setLoading(false);
    if (success) {
      navigate(`/profile/${user.uid}`); // نرجعه للبروفايل بعد الحفظ
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
              
              {/* 1. Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                  <User size={16} /> Identity
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
                      placeholder="Your Codename"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Bio / Mission Status</label>
                    <textarea 
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="w-full h-32 bg-[#0b0f19] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none transition-colors resize-none leading-relaxed"
                      placeholder="Tell the network about yourself..."
                    />
                  </div>
                </div>
              </div>

              {/* 2. Experience / Jobs */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                    <Briefcase size={16} /> Career History
                  </h3>
                  <button 
                    onClick={handleAddJob}
                    className="text-xs bg-[#1f2937] hover:bg-[#374151] text-white px-3 py-1.5 rounded-lg border border-[#333] transition-colors font-bold"
                  >
                    + Add Role
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.experience.map((job, index) => (
                    <div key={index} className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 relative group animate-in slide-in-from-bottom-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Job Title</label>
                          <input 
                            type="text"
                            value={job.title}
                            onChange={(e) => handleJobChange(index, 'title', e.target.value)}
                            className="w-full bg-[#0b0f19] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                            placeholder="e.g. Senior Developer"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Company</label>
                          <input 
                            type="text"
                            value={job.company}
                            onChange={(e) => handleJobChange(index, 'company', e.target.value)}
                            className="w-full bg-[#0b0f19] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                            placeholder="e.g. Project Zero Inc."
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                           <Calendar size={10} /> Duration
                        </label>
                        <input 
                          type="text"
                          value={job.year}
                          onChange={(e) => handleJobChange(index, 'year', e.target.value)}
                          className="w-full bg-[#0b0f19] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                          placeholder="e.g. 2023 - Present"
                        />
                      </div>

                      <button 
                        type="button"
                        onClick={() => handleRemoveJob(index)}
                        className="absolute -top-2 -right-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white p-1.5 rounded-full backdrop-blur-sm transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        <LayoutDashboard size={14} className="rotate-45" /> {/* أيقونة X */}
                      </button>
                    </div>
                  ))}

                  {formData.experience.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-[#1f2937] rounded-xl text-slate-600">
                      <p className="text-sm">No experience added yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Actions */}
              <div className="pt-4 border-t border-[#1f2937] flex gap-4">
                <button 
                  type="button" 
                  onClick={() => navigate(-1)}
                  className="flex-1 py-3 bg-[#1f2937] hover:bg-[#374151] text-white font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
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