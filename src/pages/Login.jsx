import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Shield, Radio, Command } from 'lucide-react';

const Login = () => {
  const { loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // لو اليوزر دخل بالفعل، حوله على الصفحة الرئيسية
  React.useEffect(() => {
    if (user) {
      navigate('/'); 
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px]"></div>

      {/* Login Card */}
      <div className="relative z-10 p-8 md:p-12 max-w-md w-full mx-4">
        {/* Border Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-blue-600/5 rounded-3xl blur-sm -z-10"></div>
        <div className="absolute inset-[1px] bg-[#0A1128]/90 backdrop-blur-xl rounded-3xl -z-10 border border-cyan-900/30"></div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-950/50 border border-cyan-500/30 mb-6 shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)]">
            <Radio size={32} className="text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-2">
            PROJECT <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">ZERO</span>
          </h1>
          <p className="text-slate-400 text-sm">Identify yourself to access the network.</p>
        </div>

        <button
          onClick={loginWithGoogle}
          className="w-full group relative overflow-hidden rounded-xl bg-white text-black font-bold py-4 transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        >
          <div className="relative z-10 flex items-center justify-center gap-3">
            <Command size={20} />
            <span>INITIALIZE WITH GOOGLE</span>
          </div>
          {/* Shine Effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent z-0"></div>
        </button>

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