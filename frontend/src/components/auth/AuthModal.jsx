import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, modalView, setModalView, login, register, forgotPassword } =
    useAuthStore();

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reset form and alerts when view changes or opens
  useEffect(() => {
    setErrorMsg('');
    setSuccessMsg('');
    setFormData({ name: '', email: '', password: '' });
  }, [modalView, isAuthModalOpen]);

  // Lock body scroll on modal open
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (modalView === 'login') {
        await login(formData.email, formData.password);
      } else if (modalView === 'register') {
        await register(formData.name, formData.email, formData.password);
      } else if (modalView === 'forgot-password') {
        const res = await forgotPassword(formData.email);
        setSuccessMsg(res.message || 'Recovery token dispatched to your email address.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed Blur Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAuthModal}
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
      />

      {/* Modal Dialog Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-velora-surface border border-velora-border p-8 shadow-2xl z-10"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-velora-muted hover:text-velora-primary transition-colors p-1"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <span className="text-[10px] tracking-editorial uppercase text-velora-emerald font-medium block mb-1">
            Velora Skin Collective
          </span>
          <h2 className="font-serif text-2xl text-velora-primary font-normal">
            {modalView === 'login' && 'Member Access'}
            {modalView === 'register' && 'Begin Your Ritual'}
            {modalView === 'forgot-password' && 'Password Recovery'}
          </h2>
          <p className="text-xs text-velora-muted mt-1 font-light">
            {modalView === 'login' && 'Enter your credentials to access your private formulations.'}
            {modalView === 'register' && 'Join the collective for carbon-neutral delivery and private drops.'}
            {modalView === 'forgot-password' && 'We will dispatch an encrypted reset link valid for 10 minutes.'}
          </p>
        </div>

        {/* Feedback Messages */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2"
            >
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2"
            >
              <CheckCircle2 size={14} className="shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalView === 'register' && (
            <div>
              <label className="block text-[11px] uppercase tracking-luxury text-velora-muted mb-1.5 font-medium">
                Full Legal Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Eleanor Vance"
                className="w-full bg-stone-50 border border-velora-border px-3.5 py-2.5 text-xs text-velora-primary focus:outline-none focus:border-velora-emerald"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-luxury text-velora-muted mb-1.5 font-medium">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@domain.com"
              className="w-full bg-stone-50 border border-velora-border px-3.5 py-2.5 text-xs text-velora-primary focus:outline-none focus:border-velora-emerald"
            />
          </div>

          {modalView !== 'forgot-password' && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] uppercase tracking-luxury text-velora-muted font-medium">
                  Password
                </label>
                {modalView === 'login' && (
                  <button
                    type="button"
                    onClick={() => setModalView('forgot-password')}
                    className="text-[11px] text-velora-muted hover:text-velora-emerald transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-stone-50 border border-velora-border px-3.5 py-2.5 text-xs text-velora-primary pr-10 focus:outline-none focus:border-velora-emerald"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-velora-primary"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-velora-primary text-white py-3.5 px-4 text-xs uppercase tracking-editorial flex items-center justify-center gap-2 hover:bg-velora-emerald transition-colors disabled:opacity-60"
          >
            {isLoading ? (
              <span className="inline-block animate-pulse">Authenticating...</span>
            ) : (
              <>
                <span>
                  {modalView === 'login' && 'Sign In'}
                  {modalView === 'register' && 'Create Account'}
                  {modalView === 'forgot-password' && 'Dispatch Recovery Link'}
                </span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Switch Views Toggle */}
        <div className="mt-6 pt-6 border-t border-velora-border text-center text-xs text-velora-muted">
          {modalView === 'login' && (
            <p>
              New to Velora?{' '}
              <button
                type="button"
                onClick={() => setModalView('register')}
                className="text-velora-emerald font-medium underline underline-offset-4 hover:text-velora-primary transition-colors"
              >
                Create an account
              </button>
            </p>
          )}

          {modalView === 'register' && (
            <p>
              Already a collective member?{' '}
              <button
                type="button"
                onClick={() => setModalView('login')}
                className="text-velora-emerald font-medium underline underline-offset-4 hover:text-velora-primary transition-colors"
              >
                Sign in here
              </button>
            </p>
          )}

          {modalView === 'forgot-password' && (
            <button
              type="button"
              onClick={() => setModalView('login')}
              className="text-velora-emerald font-medium underline underline-offset-4 hover:text-velora-primary transition-colors"
            >
              Return to Sign In
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};