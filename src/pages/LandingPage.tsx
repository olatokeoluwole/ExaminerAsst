import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ClipboardCheck, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function LandingPage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [loginError, setLoginError] = useState('');

    const handleAction = async () => {
        if (user) {
            navigate('/dashboard');
        } else {
            try {
                setLoginError('');
                await login();
            } catch (err: any) {
                console.error('Login failed:', err);
                if (err.code === 'auth/popup-blocked') {
                    setLoginError('Login popup was blocked. Please click "Open App" in the top right corner to open this preview in a new tab, or allow popups for this site.');
                } else {
                    setLoginError(err.message || 'Failed to sign in.');
                }
            }
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
        </div>
    )
}
