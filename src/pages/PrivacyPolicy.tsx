import { Link } from 'react-router-dom';
import { ClipboardCheck, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#F7F6F2] font-sans text-[#1A1A1A]">
            <header className="flex h-20 items-center px-6 lg:px-12 border-b-4 border-[#1A1A1A] bg-white">
                <Link to="/" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
                    <ClipboardCheck className="w-8 h-8 text-[#1A1A1A]" />
                    <span className="font-serif font-black text-2xl tracking-tighter uppercase hidden sm:inline-block">Examiner Asst.</span>
                </Link>
                <div className="ml-auto">
                    <Link to="/" className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] hover:opacity-70 transition-opacity flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>
            </header>

            <main className="py-16 px-6 lg:px-12 max-w-4xl mx-auto">
                <article className="prose prose-stone lg:prose-lg mx-auto bg-white p-8 lg:p-12 border-4 border-[#1A1A1A] shadow-[8px_8px_0_0_#1A1A1A]">
                    <h1 className="text-4xl font-serif font-black tracking-tighter uppercase mb-8 border-b-2 border-[#1A1A1A] pb-4">Privacy Policy</h1>
                    
                    <section className="mb-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-4">1. Information We Collect</h2>
                        <p className="text-sm leading-relaxed mb-4">
                            We collect basic account information necessary for registration (e.g., email address, name) and usage data regarding your interactions with the Service. When you upload student scripts or assessments, we process this data temporarily to generate scores and analytics.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-4">2. How We Secure Data</h2>
                        <p className="text-sm leading-relaxed mb-4">
                            We implement industry-standard security measures to protect your physical and digital data. Data is encrypted in transit and at rest. We utilize secure cloud infrastructure configured to limit access solely to authorized personnel handling maintenance and support.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-4">3. Data Management and Retention</h2>
                        <p className="text-sm leading-relaxed mb-4">
                            We retain institutional and account data only as long as necessary to provide the Service or to fulfill our legal obligations. You can request the deletion of your account and associated records, subject to regulatory retention requirements.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-4">4. Member Rights</h2>
                        <p className="text-sm leading-relaxed mb-4">
                            Under applicable Data Protection regulations, you have the right to:
                        </p>
                        <ul className="list-disc pl-6 text-sm leading-relaxed space-y-2 mb-4">
                            <li>Access your personal data stored by our Service.</li>
                            <li>Request correction of incomplete or inaccurate data.</li>
                            <li>Request erasure or restrict processing of your personal data.</li>
                            <li>Receive a copy of your data in a structured, commonly used format.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-4">5. Contact Us</h2>
                        <p className="text-sm leading-relaxed mb-4">
                            If you have questions about this Privacy Policy or how your data is handled, please contact our support team.
                        </p>
                    </section>
                </article>
            </main>
        </div>
    );
}
