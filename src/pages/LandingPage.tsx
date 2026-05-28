import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ClipboardCheck, ArrowRight, ShieldCheck, Zap, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import React, { useEffect, useState } from 'react';

export default function LandingPage() {
    const { user, login, loginWithEmail, signupWithEmail } = useAuth();
    const navigate = useNavigate();
    const [loginError, setLoginError] = useState('');
    
    // Auth Modal State
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthLoading, setIsAuthLoading] = useState(false);

    const handleGoogleAuth = async () => {
        try {
            setLoginError('');
            await login();
            setIsAuthModalOpen(false);
        } catch (err: any) {
            console.error('Login failed:', err);
            if (err.code === 'auth/popup-blocked') {
                setLoginError('Login popup was blocked. Please allow popups for this site.');
            } else {
                setLoginError(err.message || 'Failed to sign in.');
            }
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        setIsAuthLoading(true);
        try {
            if (isSignUp) {
                await signupWithEmail(email, password);
            } else {
                await loginWithEmail(email, password);
            }
            setIsAuthModalOpen(false);
        } catch (err: any) {
            console.error('Email Auth failed:', err);
            setLoginError(err.message || 'Authentication failed.');
        } finally {
            setIsAuthLoading(false);
        }
    };

    const handleAction = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            setIsAuthModalOpen(true);
        }
    };

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-[#F7F6F2] font-sans text-[#1A1A1A]">
            <header className="flex h-20 items-center justify-between px-6 lg:px-12 border-b-4 border-[#1A1A1A] bg-white">
                <div className="flex items-center gap-3">
                    <ClipboardCheck className="w-8 h-8 text-[#1A1A1A]" />
                    <span className="font-serif font-black text-2xl tracking-tighter uppercase">Examiner Asst.</span>
                </div>
                <div className="flex items-center gap-6">
                    <button onClick={handleAction} className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] hover:opacity-70 transition-opacity">
                        {user ? 'Go to Dashboard' : 'Sign In'}
                    </button>
                    <Button onClick={handleAction}>{user ? 'Dashboard' : 'Get Started'}</Button>
                </div>
            </header>

            <main>
                {loginError && (
                    <div className="bg-amber-100 border-b-2 border-amber-900 text-amber-900 p-4 font-bold text-center text-sm">
                        {loginError}
                    </div>
                )}
                <section className="py-32 px-6 lg:px-12 max-w-5xl mx-auto text-center border-b-2 border-[#1A1A1A]">
                    <h1 className="text-6xl lg:text-8xl font-serif font-black tracking-tighter uppercase leading-[0.9] text-[#1A1A1A] mb-8 mx-auto text-balance">
                        Mark Scripts with WAEC Precision.
                    </h1>
                    <p className="text-sm lg:text-base font-bold uppercase tracking-widest text-[#1A1A1A]/70 max-w-2xl mx-auto mb-12 text-balance leading-relaxed">
                        Your trusted assistant examiner built strictly on WAEC grading standards to achieve consistent, objective, and detailed marking in seconds.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-6">
                        <Button size="lg" className="w-full sm:w-auto" onClick={handleAction}>
                            Enter Teacher Portal <ArrowRight className="ml-3 w-5 h-5" />
                        </Button>
                        <p className="text-xs font-medium text-[#1A1A1A]/70 max-w-sm mt-4 text-balance">
                            By creating an account or logging in, you agree to our{' '}
                            <Link to="/terms" className="underline hover:text-[#1A1A1A]">Terms of Use</Link> and{' '}
                            <Link to="/privacy" className="underline hover:text-[#1A1A1A]">Privacy Policy</Link>.
                        </p>
                    </div>
                </section>

                <section className="bg-[#1A1A1A] text-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#F7F6F2]/20">
                            <div className="p-12 space-y-6">
                                <div className="w-16 h-16 border-2 border-white flex items-center justify-center mb-8">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-serif font-black italic tracking-tighter uppercase">Strict Compliance</h3>
                                <p className="text-xs font-bold uppercase tracking-widest leading-loose opacity-70">
                                    Enforces zero-temperature constraints. Marks awarded only for clear methodological progression and exact final answers.
                                </p>
                            </div>
                            <div className="p-12 space-y-6">
                                <div className="w-16 h-16 border-2 border-white flex items-center justify-center mb-8">
                                    <Zap className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-serif font-black italic tracking-tighter uppercase">Batch Processing</h3>
                                <p className="text-xs font-bold uppercase tracking-widest leading-loose opacity-70">
                                    Upload up to 10 student scripts with multiple pages at once. Reduces marking workload by over 95%.
                                </p>
                            </div>
                            <div className="p-12 space-y-6">
                                <div className="w-16 h-16 border-2 border-white flex items-center justify-center mb-8">
                                    <ClipboardCheck className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-serif font-black italic tracking-tighter uppercase">Automated Analytics</h3>
                                <p className="text-xs font-bold uppercase tracking-widest leading-loose opacity-70">
                                    Instantly generates class averages, grade distributions, and pinpoints common structural errors across cohorts.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {isAuthModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/80 backdrop-blur-sm">
                    <div className="bg-white border-4 border-[#1A1A1A] w-full max-w-md shadow-[8px_8px_0_0_#1A1A1A] relative">
                        <button 
                            onClick={() => setIsAuthModalOpen(false)}
                            className="absolute top-4 right-4 text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        
                        <div className="p-8">
                            <h2 className="text-3xl font-serif font-black tracking-tighter uppercase mb-6">
                                {isSignUp ? 'Create Account' : 'Welcome Back'}
                            </h2>
                            
                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Email Address</label>
                                    <Input 
                                        type="email" 
                                        required 
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="teacher@school.edu" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Password</label>
                                    <Input 
                                        type="password" 
                                        required 
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••" 
                                    />
                                </div>
                                
                                {loginError && (
                                    <div className="text-xs font-bold text-red-600 bg-red-50 p-2 border border-red-200">
                                        {loginError}
                                    </div>
                                )}

                                <Button 
                                    type="submit" 
                                    disabled={isAuthLoading}
                                    className="w-full h-12 mt-4"
                                >
                                    {isAuthLoading ? 'Please wait...' : (isSignUp ? 'Sign Up with Email' : 'Sign In with Email')}
                                </Button>
                            </form>

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-[#1A1A1A]/20"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                                    <span className="bg-white px-4 text-[#1A1A1A]/50">Or continue with</span>
                                </div>
                            </div>

                            <Button 
                                type="button" 
                                variant="outline" 
                                className="w-full h-12 bg-[#F7F6F2]"
                                onClick={handleGoogleAuth}
                            >
                                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google Account
                            </Button>

                            <div className="mt-6 text-center">
                                <button 
                                    className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] hover:underline"
                                    onClick={() => {
                                        setIsSignUp(!isSignUp);
                                        setLoginError('');
                                    }}
                                >
                                    {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
