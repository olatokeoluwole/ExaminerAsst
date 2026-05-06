import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, school, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A1A1A]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If they are not admin and not a registered school, we should show them an unauthorized page.
  if (!isAdmin && !school) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] font-sans text-[#1A1A1A] p-8 flex items-center justify-center">
        <div className="border-4 border-[#1A1A1A] bg-white p-8 max-w-md w-full shadow-[8px_8px_0_0_#1A1A1A] text-center">
          <h2 className="text-3xl font-serif font-black uppercase italic tracking-tighter mb-4 text-red-600">Unauthorized</h2>
          <p className="font-bold text-xs uppercase tracking-widest text-[#1A1A1A]/70 mb-8 leading-relaxed">
            Your email ({user.email}) is not registered. An Administrator must register your school before you can use the system.
          </p>
          <a href="/" className="inline-block border-2 border-[#1A1A1A] px-6 py-3 font-bold text-xs uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-white transition-colors">
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
