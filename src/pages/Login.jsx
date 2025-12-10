import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Shield, Radio, Command, Mail, Lock, User, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const Login = () => {
  const { loginWithGoogle, signupWithEmail, loginWithEmail, user } = useAuth();
  const navigate = useNavigate();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  // --- التعديل الهام جداً هنا ---
  // مش هنحوله الصفحة الرئيسية إلا لو كان مسجل دخول + إيميله مفعل
  useEffect(() => {
    if (user && user.emailVerified) {
      navigate('/'); 
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setStatus({ ...status, error: '' });
  };

  const handleGoogle = async () => {
    setStatus({ ...status, loading: true, error: '' });
    const res = await loginWithGoogle();
    if (!res.success) setStatus({ loading: false, error: res.error, success: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    if (!isLoginMode && !formData.name) return;

    setStatus({ loading: true, error: '', success: '' });

    if (isLoginMode) {
      // --- تسجيل دخول ---
      const res = await loginWithEmail(formData.email, formData.password);
      if (res.success) {
        // لو الحساب مفعل، الـ useEffect هيحوله أوتوماتيك
        // لو مش مفعل، دالة loginWithEmail اللي عملناها في useAuth هترجعه وهيظهر الخطأ
      } else {
        setStatus({ loading: false, error: res.error, success: '' });
      }
    } else {
      // --- تسجيل جديد ---
      const res = await signupWithEmail(formData.email, formData.password, formData.name);
      
      if (res.success) {
        // هنا بقى الرسالة هتظهر ومش هتختفي لأنه مش هيتحول للصفحة الرئيسية
        setStatus({ 
          loading: false, 
          error: '', 
          // دي الرسالة اللي هتظهرله
          success: 'Mission Initialized! A secure verification link has been sent to your inbox. Please verify your identity to access the network.' 
        });
        
        // نفضي الخانات ونرجعه لوضع الدخول عشان يكون جاهز
        setIsLoginMode(true);
        setFormData({ name: '', email: '', password: '' });
      } else {
        setStatus({ loading: false, error: res.error, success: '' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden font-sans selection:bg-cyan-500/30">
      
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px]"></div>

      <div className="relative z-10 p-8 md:p-10 max-w-md w-full mx-4">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-blue-600/5 rounded-3xl blur-sm -z-10"></div>
        <div className="absolute inset-[1px] bg-[#0A1128]/90 backdrop-blur-xl rounded-3xl -z-10 border border-cyan-900/30 shadow-2xl"></div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-950/50 border border-cyan-500/30 mb-4 shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)]">
            <Radio size={28} className="text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
            PROJECT <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">ZERO</span>
          </h1>
          <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Secure Access Terminal</p>
        </div>

        {/* Success Message Area - هتظهر هنا وثابتة */}
        {status.success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="text-green-400 shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h4 className="text-green-400 font-bold text-sm mb-1">Verification Required</h4>
              <p className="text-green-200/80 text-xs leading-relaxed">{status.success}</p>
            </div>
          </div>
        )}

        {/* Error Message Area */}
        {status.error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h4 className="text-red-400 font-bold text-sm mb-1">Access Denied</h4>
              <p className="text-red-200/80 text-xs leading-relaxed">{status.error}</p>
            </div>
          </div>
        )}

        {/* باقي الفورم زي ما هو */}
        <div className="flex bg-[#0f172a] p-1 rounded-xl mb-6 border border-slate-800">
          <button 
            onClick={() => { setIsLoginMode(true); setStatus({loading:false, error:'', success:''}); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLoginMode ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Login
          </button>
          <button 
            onClick={() => { setIsLoginMode(false); setStatus({loading:false, error:'', success:''}); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLoginMode ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {!isLoginMode && (
            <div className="relative group">
              <User className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input 
                type="text" 
                name="name"
                placeholder="Codename" 
                className="w-full bg-[#020617] border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600"
                value={formData.name}
                onChange={handleChange}
                required={!isLoginMode}
              />
            </div>
          )}
          
          <div className="relative group">
            <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input 
              type="email" 
              name="email"
              placeholder="Email Address" 
              className="w-full bg-[#020617] border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input 
              type="password" 
              name="password"
              placeholder="Password" 
              className="w-full bg-[#020617] border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={status.loading}
            className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status.loading ? <Loader2 className="animate-spin mx-auto" /> : (isLoginMode ? 'INITIALIZE SESSION' : 'REGISTER IDENTITY')}
          </button>
        </form>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-slate-800 flex-1"></div>
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Or Continue With</span>
          <div className="h-px bg-slate-800 flex-1"></div>
        </div>

        <div>
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <Command size={18} /> Google
          </button>
        </div>

        <div className="mt-8 flex justify-center gap-4 text-[10px] text-slate-600 font-mono uppercase tracking-widest">
          <span className="flex items-center gap-1"><Shield size={10} /> Secure Connection</span>
          <span>•</span>
          <span>Encrypted V2.0</span>
        </div>
      </div>
    </div>
  );
};

export default Login;