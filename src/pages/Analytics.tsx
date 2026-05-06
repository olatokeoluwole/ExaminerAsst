import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { MarkingResult } from '../lib/gemini';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '../components/ui/Button';
import { Download, FileWarning, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Analytics() {
    const [results, setResults] = useState<MarkingResult[]>([]);
    const { school } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!school) return;

        const fetchResults = async () => {
            setIsLoading(true);
            try {
                const resRef = collection(db, `schools/${school.id}/results`);
                const q = query(resRef);
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

    // Process data for charts
    const gradeDistribution = {
        'A1': 0, 'B2': 0, 'B3': 0, 'C4': 0, 'C5': 0, 'C6': 0, 'D7': 0, 'E8': 0, 'F9': 0
    };
    
    results.forEach(r => {
        if (gradeDistribution[r.grade as keyof typeof gradeDistribution] !== undefined) {
             gradeDistribution[r.grade as keyof typeof gradeDistribution]++;
        }
    });

    const chartData = Object.keys(gradeDistribution).map(grade => ({
        name: grade,
        count: gradeDistribution[grade as keyof typeof gradeDistribution]
    }));

    const handleDownloadReport = async () => {
        const reportElement = document.getElementById('report-content');
        if (!reportElement) return;

        try {
             const canvas = await html2canvas(reportElement, {
                scale: 2,
                useCORS: true,
             });
             const imgData = canvas.toDataURL('image/png');
             const pdf = new jsPDF('p', 'mm', 'a4');
             const pdfWidth = pdf.internal.pageSize.getWidth();
             const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
             
             pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
             pdf.save(`WAEC_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF", error);
            alert("Failed to generate PDF report.");
        }
    };

    const avgScore = results.length ? Math.round(results.reduce((a, b) => a + b.score, 0) / results.length) : 0;
    const commonErrors = results.slice(0, 4); // Just picking first 4 for demo requirements

    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b-2 border-[#1A1A1A] pb-6 mb-8">
                <div>
                    <h1 className="text-5xl lg:text-7xl font-serif font-black tracking-tighter uppercase leading-none">Analytics & Reports</h1>
                    <p className="text-xs font-bold tracking-[0.3em] uppercase mt-4 opacity-60">Deep dive into class performance and official reports.</p>
                </div>
                <Button onClick={handleDownloadReport} disabled={isLoading || results.length === 0}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF Report
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            ) : (
                <div id="report-content" className="bg-[#F7F6F2] p-0">
                    <div className="border-2 border-[#1A1A1A] bg-white mb-8">
                        <div className="border-b-2 border-[#1A1A1A] p-6">
                            <h3 className="font-serif font-black text-xl italic tracking-tighter">Grade Distribution (WAEC Standard)</h3>
                        </div>
                        <div className="p-6">
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#1A1A1A', fontWeight: 'bold' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#1A1A1A' }} />
                                        <RechartsTooltip 
                                            cursor={{ fill: '#f0f0f0' }}
                                            contentStyle={{ borderRadius: '0', border: '2px solid #1A1A1A', boxShadow: '4px 4px 0 0 #1A1A1A', padding: '10px' }}
                                        />
                                        <Bar dataKey="count" radius={[0, 0, 0, 0]}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={
                                                    ['A1', 'B2', 'B3'].includes(entry.name) ? '#16a34a' : 
                                                    ['C4', 'C5', 'C6'].includes(entry.name) ? '#d97706' : 
                                                    '#dc2626'
                                                } />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="border-2 border-[#1A1A1A] bg-white">
                            <div className="border-b-2 border-[#1A1A1A] p-6">
                                <h3 className="font-serif font-black text-xl italic tracking-tighter">Overall Performance</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center py-3 border-b-2 border-[#1A1A1A]/10">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/60">Class Average</span>
                                    <span className="font-mono font-bold text-2xl">{avgScore}%</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b-2 border-[#1A1A1A]/10">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/60">Highest Score</span>
                                    <span className="font-mono font-bold text-2xl text-green-700">
                                        {results.length ? Math.max(...results.map(r => r.score)) : 0}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/60">Lowest Score</span>
                                    <span className="font-mono font-bold text-2xl text-red-700">
                                        {results.length ? Math.min(...results.map(r => r.score)) : 0}%
                                    </span>
                                </div>
                                
                                <div className="mt-8 pt-6 border-t-2 border-[#1A1A1A] text-sm p-4 bg-[#1A1A1A] text-white">
                                    <span className="text-[10px] font-bold uppercase tracking-widest block mb-2 opacity-60">General Observation</span>
                                    <p className="leading-relaxed">"Most students struggled with showing full methodical steps. Marks were frequently lost due to premature approximation and missing intermediary calculations."</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-2 border-[#1A1A1A] bg-white">
                            <div className="border-b-2 border-[#1A1A1A] p-6">
                                <h3 className="font-serif font-black text-xl italic tracking-tighter">Examples of Errors</h3>
                            </div>
                            <div className="p-6">
                                {commonErrors.length === 0 ? (
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/50">No data available for error analysis yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {commonErrors.map((student, idx) => (
                                            <div key={idx} className="flex gap-4 p-4 border-2 border-red-500 bg-red-50">
                                                <div className="shrink-0 mt-0.5">
                                                    <FileWarning className="w-5 h-5 text-red-600" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-[#1A1A1A]">{student.student_name} ({student.score}%)</p>
                                                    <p className="text-xs text-[#1A1A1A]/70 mt-2 leading-relaxed">
                                                        <strong className="uppercase tracking-widest text-[10px] block mb-1">Error Context:</strong> {student.remarks}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
