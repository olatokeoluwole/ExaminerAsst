import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { MarkingResult } from '../lib/gemini';
import { BarChart3, GraduationCap, CheckCircle2, AlertTriangle, ArrowUpRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Dashboard() {
  const [results, setResults] = useState<MarkingResult[]>([]);
  const { school, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!school) return;
    
    const fetchResults = async () => {
        setIsLoading(true);
        try {
            const resRef = collection(db, `schools/${school.id}/results`);
            const q = query(resRef, orderBy('createdAt', 'desc'), limit(50));
            const snapshot = await getDocs(q);
            
            const fetchedResults: MarkingResult[] = snapshot.docs.map(d => {
                const data = d.data();
                return {
                    student_name: data.studentName,
                    class: data.class,
                    subject: data.subject,
                    score: data.score,
                    grade: data.grade,
                    remarks: data.remarks,
                    submission_id: d.id
                };
            });
            setResults(fetchedResults);
        } catch (e) {
            console.error('Error fetching results:', e);
        }
        setIsLoading(false);
    };

    fetchResults();
  }, [school]);

  const totalScripts = school ? school.registeredStudentsCount : results.length;
  const averageScore = results.length > 0 
    ? Math.round(results.reduce((acc, curr) => acc + curr.score, 0) / results.length)
    : 0;

  const topScore = results.length > 0 ? Math.max(...results.map(r => r.score)) : 0;
  
  const passCount = results.filter(r => r.score >= 50).length;
  const passRate = results.length > 0 ? Math.round((passCount / results.length) * 100) : 0;

  if (isAdmin && !school) {
      return (
          <div className="space-y-10">
              <header className="flex justify-between items-baseline border-b-2 border-[#1A1A1A] pb-6">
                <div className="flex flex-col">
                    <h1 className="text-5xl lg:text-7xl font-serif font-black tracking-tighter uppercase leading-none">Dashboard</h1>
                    <p className="text-xs font-bold tracking-[0.3em] uppercase mt-4 opacity-60">Admin Overview</p>
                </div>
            </header>
            <div className="p-8 border-2 border-[#1A1A1A] bg-white text-center">
                <p className="font-bold text-xs uppercase tracking-widest text-[#1A1A1A]/70">Please use the Admin Panel to manage schools.</p>
            </div>
          </div>
      );
  }

  return (
    <div className="space-y-10">
        <header className="flex justify-between items-baseline border-b-2 border-[#1A1A1A] pb-6">
            <div className="flex flex-col">
                <h1 className="text-5xl lg:text-7xl font-serif font-black tracking-tighter uppercase leading-none">Dashboard</h1>
                <p className="text-xs font-bold tracking-[0.3em] uppercase mt-4 opacity-60">Overview of student performance and marking sessions.</p>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                title="Total Students" 
                value={totalScripts.toString()} 
                icon={CheckCircle2} 
                description="Registered students" 
            />
            <StatCard 
                title="Class Average" 
                value={`${averageScore}%`} 
                icon={BarChart3} 
                description="Across all subjects" 
            />
            <StatCard 
                title="Highest Score" 
                value={`${topScore}%`} 
                icon={ArrowUpRight} 
                description="Top performance" 
            />
            <StatCard 
                title="Pass Rate" 
                value={`${passRate}%`} 
                icon={GraduationCap} 
                description="Scores >= 50%" 
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="border-2 border-[#1A1A1A] bg-white">
                    <div className="flex flex-row items-center justify-between p-6 border-b-2 border-[#1A1A1A]">
                        <h3 className="font-serif font-black text-xl italic tracking-tighter">Recent Grades</h3>
                        <Link to="/analytics" className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] hover:opacity-70 transition-colors">
                            View Analytics &rarr;
                        </Link>
                    </div>
                    <div className="p-0">
                        {isLoading ? (
                            <div className="flex justify-center py-16 text-[#1A1A1A]/50">
                                <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                        ) : results.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-[#1A1A1A]/50">
                                <GraduationCap className="w-12 h-12 mb-4" />
                                <p className="font-bold uppercase tracking-widest text-xs">No scripts marked yet.</p>
                                <Link to="/mark" className="mt-6 border-b-2 border-[#1A1A1A] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest pb-1 hover:opacity-70">Start Marking</Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="text-[10px] font-black uppercase tracking-widest bg-white border-b-2 border-[#1A1A1A]">
                                        <tr>
                                            <th className="p-4 border-r border-[#1A1A1A]/20">Student Name</th>
                                            <th className="p-4 border-r border-[#1A1A1A]/20">Class</th>
                                            <th className="p-4 border-r border-[#1A1A1A]/20">Subject</th>
                                            <th className="p-4 border-r border-[#1A1A1A]/20 text-center">Score</th>
                                            <th className="p-4 text-center">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {results.map((result, idx) => (
                                            <tr key={idx} className="border-b border-[#1A1A1A] hover:bg-[#F7F6F2] transition-colors last:border-b-0">
                                                <td className="p-4 font-bold border-r border-[#1A1A1A]/20">{result.student_name}</td>
                                                <td className="p-4 text-[#1A1A1A]/80 border-r border-[#1A1A1A]/20">{result.class}</td>
                                                <td className="p-4 text-[#1A1A1A]/80 border-r border-[#1A1A1A]/20">{result.subject}</td>
                                                <td className="p-4 font-mono font-bold text-center border-r border-[#1A1A1A]/20">{result.score}%</td>
                                                <td className="p-4 text-center">
                                                    <span className={`font-bold text-sm ${
                                                        result.score >= 70 ? "text-green-700" :
                                                        result.score >= 50 ? "text-amber-700" : 
                                                        "text-red-700"
                                                    }`}>
                                                        {result.grade}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
                 <div className="bg-[#1A1A1A] text-white p-6 h-full flex flex-col border-2 border-[#1A1A1A]">
                    <div className="border-b border-white/20 pb-4 mb-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-60">System Health</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-start space-x-4 border-l-2 border-emerald-500 pl-4">
                            <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-emerald-400" />
                            <div>
                                <p className="font-bold text-xs uppercase tracking-widest">AI Engine Active</p>
                                <p className="text-[10px] opacity-70 mt-2 leading-relaxed">Gemini Pro Vision RAG marking logic is online and operating with zero temperature constraints.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 border-l-2 border-amber-500 pl-4">
                            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-amber-400" />
                            <div>
                                <p className="font-bold text-xs uppercase tracking-widest">OCR Verification</p>
                                <p className="text-[10px] opacity-70 mt-2 leading-relaxed">All handwriting extractions are cross-referenced with expected WAEC marking schemes.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, description }: any) {
    return (
        <div className="border-2 border-[#1A1A1A] bg-white p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{title}</p>
                    <p className="text-4xl font-serif">{value}</p>
                </div>
                <Icon className="w-6 h-6 opacity-40" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-6 border-t-2 border-[#1A1A1A] pt-4">{description}</p>
        </div>
    )
}
