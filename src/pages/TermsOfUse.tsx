import { Link } from 'react-router-dom';
import { ClipboardCheck, ArrowLeft } from 'lucide-react';

export default function TermsOfUse() {
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
                    <h1 className="text-4xl font-serif font-black tracking-tighter uppercase mb-8 border-b-2 border-[#1A1A1A] pb-4">Terms of Use</h1>
                    
                    <section className="mb-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-4">1. Acceptance of Terms</h2>
                        <p className="text-sm leading-relaxed mb-4">
                            By accessing and using Examiner Asst. (the "Service"), you agree to be bound by these Terms of Use. If you do not agree, please do not use our Service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-4">2. Accessing the System</h2>
                        <p className="text-sm leading-relaxed mb-4">
                            You are responsible for maintaining the confidentiality of your account credentials. You agree to use the Service strictly for institutional or educational purposes. Automated or programmatic access intended to scrape data or bypass Service limits is strictly prohibited.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-4">3. Data Accuracy Obligations</h2>
                        <p className="text-sm leading-relaxed mb-4">
                            While our AI grading system is built with high precision mechanisms, you are responsible for the final review of marks and grades. The outputs provided by the Service serve as an assistant, and the final responsibility for accuracy lies with you as the educator or administrator.
                        </p>
                    </section>
                    
                    <section className="mb-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-4">4. User Conduct</h2>
                        <ul className="list-disc pl-6 text-sm leading-relaxed space-y-2 mb-4">
                            <li>You agree not to upload inappropriate, offensive, or purely irrelevant material.</li>
                            <li>You will not interfere with or disrupt the operation of the Service.</li>
                            <li>You will not attempt to gain unauthorized access to other users' accounts or data.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-4">5. Compliance with External Vendors</h2>
                        <p className="text-sm leading-relaxed mb-4">
                            The Service integrates with third-party vendors (e.g., Google GenAI, Firebase). By using the Service, you also agree to comply with the applicable terms of these respective service providers. Any violation of vendor terms facilitated by your usage may result in immediate suspension of your account.
                        </p>
                    </section>
                </article>
            </main>
        </div>
    );
}
