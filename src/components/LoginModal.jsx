import { useState } from 'react';
import { X, Lock } from 'lucide-react';

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // هنا كلمة السر اللي هتفتحلك الموقع
    // تقدر تغير 'admin123' لأي حاجة تريحك
    if (password === 'admin123') {
      onLogin();
      onClose();
      setPassword('');
      setError('');
    } else {
      setError('Access Denied: Incorrect Password');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-xl p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-3 mb-6 text-blue-500">
          <Lock size={24} />
          <h2 className="text-xl font-bold text-white">Admin Access</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="password" 
              placeholder="Enter Access Code..."
              className="w-full bg-black/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;