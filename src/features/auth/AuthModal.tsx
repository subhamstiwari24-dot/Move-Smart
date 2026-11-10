import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useIncidents } from '../../context/IncidentContext';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  ArrowLeft,
  KeyRound,
  ChevronDown,
  Check
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    authModalOpen, 
    closeAuthModal, 
    authModalMode, 
    setAuthModalMode, 
    sessionExpired,
    clearSessionExpired,
    login, 
    register, 
    requestPasswordReset,
    resetPassword,
    loginDemo 
  } = useAuth();

  const { setActiveRole, showToast } = useIncidents();

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDemoFlyout, setShowDemoFlyout] = useState(false);
  const [registeredCitizenName, setRegisteredCitizenName] = useState<string | null>(null);

  // Status & error states
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculate password strength
  const passwordCriteria = useMemo(() => {
    return {
      length: password.length >= 8,
      letter: /[a-zA-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
    };
  }, [password]);

  const passwordStrengthScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.length) score += 1;
    if (passwordCriteria.letter) score += 1;
    if (passwordCriteria.number) score += 1;
    if (passwordCriteria.special) score += 1;
    return score;
  }, [passwordCriteria]);

  if (!authModalOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setPhone('');
    setTermsAccepted(false);
    setError(null);
    setSuccessMsg(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setRegisteredCitizenName(null);
  };

  const handleSwitchMode = (newMode: 'citizen-login' | 'citizen-register' | 'admin-login' | 'forgot-password') => {
    resetForm();
    clearSessionExpired();
    setAuthModalMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (authModalMode === 'citizen-register') {
        // Field 1: Full name validation
        if (!fullName.trim() || fullName.trim().length < 2) {
          setError('Please provide your legal full name (at least 2 characters)');
          setLoading(false);
          return;
        }

        // Field 2: Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim() || !emailRegex.test(email.trim())) {
          setError('Please enter a valid email address (e.g. name@example.com)');
          setLoading(false);
          return;
        }

        // Field 3: Mobile number validation
        const cleanPhone = phone.trim().replace(/[\s-]/g, '');
        if (!cleanPhone || cleanPhone.length < 10) {
          setError('Please enter a valid 10-digit mobile number for dispatch alerts');
          setLoading(false);
          return;
        }

        // Field 4: Password strength validation
        if (password.length < 8) {
          setError('Password must be at least 8 characters long');
          setLoading(false);
          return;
        }
        if (!passwordCriteria.letter || !passwordCriteria.number) {
          setError('Password must contain both letters and numbers for civic security');
          setLoading(false);
          return;
        }

        // Field 5: Confirm password validation
        if (password !== confirmPassword) {
          setError('Passwords do not match. Please re-enter identical passwords');
          setLoading(false);
          return;
        }

        // Field 6: Terms and privacy consent
        if (!termsAccepted) {
          setError('You must accept the Civic Reporting Terms & Privacy Policy to register');
          setLoading(false);
          return;
        }

        const res = await register({
          email: email.trim().toLowerCase(),
          password,
          fullName: fullName.trim(),
          phone: phone.trim(),
        });

        if (res.success && res.user) {
          setActiveRole('citizen');
          setRegisteredCitizenName(res.user.fullName);
          showToast('Welcome to MoveSmart! Registration confirmed by operations backend.', 'success');
        } else {
          setError(res.error || 'Registration failed. Email may already be in use.');
        }
      } else if (authModalMode === 'citizen-login' || authModalMode === 'admin-login') {
        if (!email.trim() || !password) {
          setError('Please provide both email address and password');
          setLoading(false);
          return;
        }

        const res = await login({ email: email.trim(), password });
        if (res.success) {
          if (authModalMode === 'admin-login') {
            setActiveRole('admin');
            showToast('Authenticated as Operations Staff', 'success');
          } else {
            setActiveRole('citizen');
            showToast('Welcome back to MoveSmart Citizen Portal!', 'success');
          }
          closeAuthModal();
        } else {
          setError(res.error || 'Invalid email or password. Please verify your credentials.');
        }
      } else if (authModalMode === 'forgot-password') {
        if (!email.trim()) {
          setError('Please enter your registered email address');
          setLoading(false);
          return;
        }

        if (password) {
          if (password.length < 8) {
            setError('New password must be at least 8 characters');
            setLoading(false);
            return;
          }
          const res = await resetPassword({ email: email.trim(), newPassword: password });
          if (res.success) {
            setSuccessMsg(res.message || 'Password updated! You can now log in.');
            setPassword('');
          } else {
            setError(res.error || 'Password update failed');
          }
        } else {
          const res = await requestPasswordReset(email.trim());
          if (res.success) {
            setSuccessMsg(res.message || 'Password reset instructions dispatched. Enter your new password below.');
          } else {
            setError(res.error || 'Request failed');
          }
        }
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'citizen' | 'operations' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      await loginDemo(role);
      if (role === 'citizen') {
        setActiveRole('citizen');
        showToast('Signed in as Demo Citizen Commuter', 'info');
      } else {
        setActiveRole('admin');
        showToast(`Signed in as Demo ${role === 'admin' ? 'Administrator' : 'Operations Staff'}`, 'info');
      }
      closeAuthModal();
    } catch {
      setError('Demo authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 text-white flex items-center justify-between bg-[#0B192C] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              authModalMode === 'admin-login'
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {authModalMode === 'admin-login' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <UserCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {authModalMode === 'citizen-login' && 'Citizen Sign In'}
                {authModalMode === 'citizen-register' && 'Citizen Registration'}
                {authModalMode === 'admin-login' && 'Operations Center Portal'}
                {authModalMode === 'forgot-password' && 'Password Recovery'}
              </h3>
              <p className="text-[11px] text-slate-300">
                {authModalMode === 'admin-login'
                  ? 'Authorized Municipal Staff & Admin Login'
                  : 'Mumbai Metropolitan Region • Civic Mobility'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Session Expired Banner */}
        {sessionExpired && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Your login session has expired. Please sign in to continue accessing citizen services.</span>
          </div>
        )}

        {/* Tab Switcher for Citizen */}
        {authModalMode !== 'admin-login' && authModalMode !== 'forgot-password' && !registeredCitizenName && (
          <div className="flex border-b border-slate-200 bg-slate-50/70 p-1">
            <button
              type="button"
              onClick={() => handleSwitchMode('citizen-login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authModalMode === 'citizen-login'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('citizen-register')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authModalMode === 'citizen-register'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register New Citizen
            </button>
          </div>
        )}

        {/* Registration Success Screen */}
        {registeredCitizenName ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Citizen Account Created
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">
                Welcome, {registeredCitizenName}!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your account has been registered with verified Citizen role on the MoveSmart Smart Mobility Platform. You can now submit hazard reports and track your civic complaints.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Account Role:</span>
                <span className="font-bold text-teal-700">ROLE_CITIZEN</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Email Address:</span>
                <span className="font-mono text-slate-800">{email}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => closeAuthModal()}
              className="w-full py-2.5 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Enter Citizen Portal Now
            </button>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Field 1: Full Name (Registration only) */}
            {authModalMode === 'citizen-register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Legal Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0F766E] bg-white text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Field 2: Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0F766E] bg-white font-sans text-slate-900"
                />
              </div>
            </div>

            {/* Field 3: Mobile Number (Registration only) */}
            {authModalMode === 'citizen-register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98201 00000"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0F766E] bg-white text-slate-900 font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Used for urgent SMS verification and municipal response alerts.</p>
              </div>
            )}

            {/* Field 4: Password */}
            {authModalMode !== 'forgot-password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  {authModalMode === 'citizen-login' && (
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('forgot-password')}
                      className="text-[11px] text-[#0F766E] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0F766E] bg-white text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Real-time Password Strength Meter for Registration */}
                {authModalMode === 'citizen-register' && password && (
                  <div className="mt-2 space-y-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Strength:</span>
                      <span className={`font-bold ${
                        passwordStrengthScore <= 1 ? 'text-red-600' :
                        passwordStrengthScore <= 3 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {passwordStrengthScore <= 1 ? 'Weak' :
                         passwordStrengthScore <= 3 ? 'Medium' : 'Strong'}
                      </span>
                    </div>
                    {/* Visual 4-bar indicator */}
                    <div className="grid grid-cols-4 gap-1 h-1.5">
                      <div className={`rounded-full ${passwordStrengthScore >= 1 ? (passwordStrengthScore <= 1 ? 'bg-red-500' : 'bg-emerald-500') : 'bg-slate-200'}`} />
                      <div className={`rounded-full ${passwordStrengthScore >= 2 ? (passwordStrengthScore <= 2 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-200'}`} />
                      <div className={`rounded-full ${passwordStrengthScore >= 3 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                      <div className={`rounded-full ${passwordStrengthScore >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 text-[10px] text-slate-500 pt-1">
                      <span className={passwordCriteria.length ? 'text-emerald-700 font-semibold' : ''}>
                        {passwordCriteria.length ? '✓' : '•'} 8+ characters
                      </span>
                      <span className={passwordCriteria.letter ? 'text-emerald-700 font-semibold' : ''}>
                        {passwordCriteria.letter ? '✓' : '•'} Letters
                      </span>
                      <span className={passwordCriteria.number ? 'text-emerald-700 font-semibold' : ''}>
                        {passwordCriteria.number ? '✓' : '•'} Numbers
                      </span>
                      <span className={passwordCriteria.special ? 'text-emerald-700 font-semibold' : ''}>
                        {passwordCriteria.special ? '✓' : '•'} Special symbols
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Forgot Password Reset Input */}
            {authModalMode === 'forgot-password' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password (Enter to update directly)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password (min 8 characters)"
                    className="w-full pl-9 pr-9 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0F766E] bg-white text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Field 5: Confirm Password (Registration only) */}
            {authModalMode === 'citizen-register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter identical password"
                    className="w-full pl-9 pr-9 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0F766E] bg-white text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[10px] text-rose-600 mt-1 font-semibold">Passwords do not match.</p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="text-[10px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Passwords match perfectly.
                  </p>
                )}
              </div>
            )}

            {/* Field 6: Terms and Privacy Consent (Registration only) */}
            {authModalMode === 'citizen-register' && (
              <div>
                <label className="flex items-start gap-2 cursor-pointer p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded text-[#0F766E] focus:ring-[#0F766E]"
                  />
                  <span className="text-[11px] text-slate-600 leading-tight">
                    I agree to the <strong className="text-slate-800">MoveSmart Civic Participation Terms</strong> and consent to municipal processing of submitted traffic hazard evidence for public roadway safety in MMR.
                  </span>
                </label>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                authModalMode === 'admin-login'
                  ? 'bg-teal-700 hover:bg-teal-800 text-white'
                  : 'bg-[#0F766E] hover:bg-[#115E59] text-white'
              }`}
            >
              {loading ? (
                <span>Processing...</span>
              ) : authModalMode === 'citizen-register' ? (
                <>
                  <span>Complete Citizen Registration</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : authModalMode === 'forgot-password' ? (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{password ? 'Set New Password' : 'Send Reset Link'}</span>
                </>
              ) : (
                <>
                  <span>Sign In Securely</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Navigation Links */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2 text-center text-xs">
              {authModalMode === 'forgot-password' && (
                <button
                  type="button"
                  onClick={() => handleSwitchMode('citizen-login')}
                  className="text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1 cursor-pointer font-medium"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to Sign In</span>
                </button>
              )}

              {authModalMode === 'admin-login' ? (
                <button
                  type="button"
                  onClick={() => handleSwitchMode('citizen-login')}
                  className="text-slate-500 hover:text-slate-800 text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Return to Citizen Commuter Portal</span>
                </button>
              ) : authModalMode !== 'forgot-password' ? (
                <button
                  type="button"
                  onClick={() => handleSwitchMode('admin-login')}
                  className="text-slate-500 hover:text-slate-800 text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Operations Staff & Admin Access</span>
                </button>
              ) : null}
            </div>
          </form>
        )}

        {/* Demonstration Mode Flyout (collapsible) */}
        {!registeredCitizenName && (
          <div className="p-3 bg-slate-100/70 border-t border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setShowDemoFlyout(!showDemoFlyout)}
              className="w-full flex items-center justify-between text-slate-600 hover:text-slate-900 font-semibold cursor-pointer text-[11px]"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Demonstration Mode Profiles (Optional)</span>
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDemoFlyout ? 'rotate-180' : ''}`} />
            </button>

            {showDemoFlyout && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-200 space-y-1.5 animate-in fade-in duration-100">
                <p className="text-[10px] text-slate-500 leading-tight">
                  Pre-configured evaluation accounts:
                </p>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('citizen')}
                    className="p-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-[10px] font-bold text-center cursor-pointer"
                  >
                    Citizen
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('operations')}
                    className="p-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-teal-700 text-[10px] font-bold text-center cursor-pointer"
                  >
                    Operations
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('admin')}
                    className="p-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-amber-700 text-[10px] font-bold text-center cursor-pointer"
                  >
                    Admin
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
