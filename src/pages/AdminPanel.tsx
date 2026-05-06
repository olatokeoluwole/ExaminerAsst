import React, { useState, useEffect, useRef } from 'react';
import { collection, query, getDocs, addDoc, doc, serverTimestamp, setDoc, writeBatch, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SchoolData, useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader2, UserPlus, Building, Mail, Hash, BookOpen, Upload, FileText, Trash2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { ALL_SUBJECTS } from '../lib/constants';

interface KBDoc {
  id: string;
  subject: string;
  fileName: string;
  chunksCount: number;
}


export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newSchoolEmail, setNewSchoolEmail] = useState('');
  const [newSchoolName, setNewSchoolName] = useState('');
  const [maxStudents, setMaxStudents] = useState<number>(50);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Knowledge Base State
  const [kbDocs, setKbDocs] = useState<KBDoc[]>([]);
  const [kbSubject, setKbSubject] = useState(ALL_SUBJECTS[0]);
  const [kbFile, setKbFile] = useState<File | null>(null);
  const [isUploadingKB, setIsUploadingKB] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSchoolsAndKb = async () => {
    setIsLoading(true);
    try {
      const qSchools = query(collection(db, 'schools'));
      const snapshotSchools = await getDocs(qSchools);
      const fetchedSchools: SchoolData[] = snapshotSchools.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolData));
      setSchools(fetchedSchools);

      const qKb = query(collection(db, 'knowledgeBase'), orderBy('createdAt', 'desc'));
      const snapshotKb = await getDocs(qKb);
      const fetchedKb: KBDoc[] = snapshotKb.docs.map(doc => ({ id: doc.id, ...doc.data() } as KBDoc));
      setKbDocs(fetchedKb);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch data');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSchoolsAndKb();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolEmail || !newSchoolName || maxStudents <= 0) {
      setError('Please fill out all fields correctly.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Use the email prefix as a slug or a random ID. We'll use a random doc ID that is valid.
      const newDocRef = doc(collection(db, 'schools'));
      await setDoc(newDocRef, {
        email: newSchoolEmail,
        name: newSchoolName,
        maxStudents: maxStudents,
        registeredStudentsCount: 0,
        createdAt: serverTimestamp()
      });
      setNewSchoolEmail('');
      setNewSchoolName('');
      setMaxStudents(50);
      fetchSchoolsAndKb();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create school');
    }
    setIsSubmitting(false);
  };

  const [schoolToDelete, setSchoolToDelete] = useState<string | null>(null);

  const handleDeleteSchool = async (schoolId: string) => {
    try {
      await deleteDoc(doc(db, 'schools', schoolId));
      fetchSchoolsAndKb();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to delete school');
    }
    setSchoolToDelete(null);
  };

  const handleUploadKB = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbFile) {
        setError('Please select a PDF file.');
        return;
    }
    if (kbFile.type !== 'application/pdf') {
        setError('Only PDF files are supported.');
        return;
    }

    setIsUploadingKB(true);
    setError('');

    try {
        const buffer = await kbFile.arrayBuffer();
        
        let base64String = '';
        if (typeof Buffer !== 'undefined') {
            base64String = Buffer.from(buffer).toString('base64');
        } else {
            const bytes = new Uint8Array(buffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                base64String += String.fromCharCode(bytes[i]);
            }
            base64String = window.btoa(base64String);
        }

        const CHUNK_SIZE = 800000;
        const chunksCount = Math.ceil(base64String.length / CHUNK_SIZE);

        if (chunksCount > 50) {
            throw new Error(`PDF is too large. Max size supported is approx 30MB.`);
        }

        const newDocRef = doc(collection(db, 'knowledgeBase'));
        const batch = writeBatch(db);

        batch.set(newDocRef, {
            subject: kbSubject,
            fileName: kbFile.name,
            chunksCount: chunksCount,
            createdAt: serverTimestamp()
        });

        for (let i = 0; i < chunksCount; i++) {
            const chunkData = base64String.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
            const chunkRef = doc(db, `knowledgeBase/${newDocRef.id}/chunks`, i.toString());
            batch.set(chunkRef, { data: chunkData });
        }

        await batch.commit();

        setKbFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        fetchSchoolsAndKb();
    } catch (err: any) {
        console.error('Upload Error:', err);
        setError(err.message || 'Failed to upload Knowledge Base document.');
    }
    setIsUploadingKB(false);
  };

  return (
    <div className="space-y-10 pb-12">
        <header className="flex justify-between items-baseline border-b-2 border-[#1A1A1A] pb-6">
            <div className="flex flex-col">
                <h1 className="text-5xl lg:text-7xl font-serif font-black tracking-tighter uppercase leading-none">Admin</h1>
                <p className="text-xs font-bold tracking-[0.3em] uppercase mt-4 opacity-60">Manage school registrations</p>
            </div>
        </header>

        {error && (
            <div className="p-6 bg-[#1A1A1A] text-white border-2 border-red-500 relative">
                <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[9px] font-bold px-2 py-1 uppercase tracking-widest">Error</div>
                {error}
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 border-2 border-[#1A1A1A] bg-white h-fit">
                <div className="p-6 border-b-2 border-[#1A1A1A]">
                    <h3 className="font-serif font-black text-xl italic tracking-tighter">Register School</h3>
                </div>
                <form onSubmit={handleCreateSchool} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] flex items-center gap-2">
                            <Building className="w-4 h-4" /> School Name
                        </label>
                        <Input 
                            value={newSchoolName} 
                            onChange={e => setNewSchoolName(e.target.value)} 
                            placeholder="e.g. Lagos Int'l School" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] flex items-center gap-2">
                            <Mail className="w-4 h-4" /> Contact Email
                        </label>
                        <Input 
                            type="email" 
                            value={newSchoolEmail} 
                            onChange={e => setNewSchoolEmail(e.target.value)} 
                            placeholder="school@example.com" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] flex items-center gap-2">
                            <Hash className="w-4 h-4" /> Max Students Limit
                        </label>
                        <Input 
                            type="number" 
                            min="1"
                            value={maxStudents} 
                            onChange={e => setMaxStudents(parseInt(e.target.value) || 0)} 
                        />
                    </div>
                    <div className="pt-4 border-t-2 border-[#1A1A1A]">
                        <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-sm bg-blue-600 border-blue-600 hover:text-blue-600">
                            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                            Register School
                        </Button>
                    </div>
                </form>
            </div>

            <div className="lg:col-span-2 border-2 border-[#1A1A1A] bg-white">
                <div className="p-6 border-b-2 border-[#1A1A1A] flex justify-between items-center">
                    <h3 className="font-serif font-black text-xl italic tracking-tighter">Registered Schools</h3>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] bg-[#1A1A1A] text-white px-3 py-1">{schools.length} Total</span>
                </div>
                <div className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : schools.length === 0 ? (
                        <div className="p-12 text-center text-[#1A1A1A]/50">
                            <p className="font-bold uppercase tracking-widest text-xs">No schools registered yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-black uppercase tracking-widest bg-white border-b-2 border-[#1A1A1A]">
                                    <tr>
                                        <th className="p-4 border-r border-[#1A1A1A]/20">School Name</th>
                                        <th className="p-4 border-r border-[#1A1A1A]/20">Email</th>
                                        <th className="p-4 border-r border-[#1A1A1A]/20 text-center">Usage</th>
                                        <th className="p-4 border-r border-[#1A1A1A]/20 text-center">Left</th>
                                        <th className="p-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {schools.map(sch => {
                                        const remaining = Math.max(0, sch.maxStudents - sch.registeredStudentsCount);
                                        return (
                                            <tr key={sch.id} className="border-b border-[#1A1A1A]/20 hover:bg-[#F7F6F2] transition-colors last:border-0">
                                                <td className="p-4 font-bold border-r border-[#1A1A1A]/20">{sch.name}</td>
                                                <td className="p-4 text-[#1A1A1A]/80 border-r border-[#1A1A1A]/20">{sch.email}</td>
                                                <td className="p-4 text-center border-r border-[#1A1A1A]/20">
                                                    <span className="font-mono font-bold">{sch.registeredStudentsCount}</span>
                                                    <span className="text-[#1A1A1A]/50 px-1">/</span>
                                                    <span className="font-mono">{sch.maxStudents}</span>
                                                </td>
                                                <td className="p-4 text-center border-r border-[#1A1A1A]/20">
                                                    <span className={`font-mono font-bold ${remaining <= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                        {remaining}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {schoolToDelete === sch.id ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button onClick={() => handleDeleteSchool(sch.id)} className="text-[10px] font-bold bg-red-600 text-white px-2 py-1 hover:bg-red-700">Confirm</button>
                                                            <button onClick={() => setSchoolToDelete(null)} className="text-[10px] font-bold bg-gray-200 text-gray-800 px-2 py-1 hover:bg-gray-300">Cancel</button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => setSchoolToDelete(sch.id)} className="text-red-600 hover:text-red-800 transition-colors p-2" title="Delete School">
                                                            <Trash2 className="w-4 h-4 mx-auto" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
            <div className="lg:col-span-1 border-2 border-[#1A1A1A] bg-white h-fit">
                <div className="p-6 border-b-2 border-[#1A1A1A]">
                    <h3 className="font-serif font-black text-xl italic tracking-tighter">Upload Knowledge Base</h3>
                </div>
                <form onSubmit={handleUploadKB} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] flex items-center gap-2">
                            <BookOpen className="w-4 h-4" /> Subject
                        </label>
                        <select 
                            className="w-full bg-[#fcfbf9] border-2 border-[#1A1A1A] p-3 text-sm focus:outline-none focus:ring-0 focus:border-[#1A1A1A]"
                            value={kbSubject}
                            onChange={(e) => setKbSubject(e.target.value)}
                        >
                            {ALL_SUBJECTS.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] flex items-center gap-2">
                            <FileText className="w-4 h-4" /> PDF Document
                        </label>
                        <Input 
                            type="file" 
                            accept="application/pdf"
                            ref={fileInputRef}
                            onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                    setKbFile(e.target.files[0]);
                                }
                            }} 
                        />
                    </div>
                    <div className="pt-4 border-t-2 border-[#1A1A1A]">
                        <Button type="submit" disabled={isUploadingKB} className="w-full h-12 text-sm bg-green-700 border-green-700 hover:text-green-700">
                            {isUploadingKB ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                            Upload Document
                        </Button>
                    </div>
                </form>
            </div>

            <div className="lg:col-span-2 border-2 border-[#1A1A1A] bg-white">
                <div className="p-6 border-b-2 border-[#1A1A1A] flex justify-between items-center">
                    <h3 className="font-serif font-black text-xl italic tracking-tighter">Knowledge Base Resources</h3>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] bg-[#1A1A1A] text-white px-3 py-1">{kbDocs.length} Uploads</span>
                </div>
                <div className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : kbDocs.length === 0 ? (
                        <div className="p-12 text-center text-[#1A1A1A]/50">
                            <p className="font-bold uppercase tracking-widest text-xs">No resources uploaded yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-black uppercase tracking-widest bg-white border-b-2 border-[#1A1A1A]">
                                    <tr>
                                        <th className="p-4 border-r border-[#1A1A1A]/20">Subject</th>
                                        <th className="p-4 border-r border-[#1A1A1A]/20">File Name</th>
                                        <th className="p-4 text-center">Chunks</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {kbDocs.map(doc => {
                                        return (
                                            <tr key={doc.id} className="border-b border-[#1A1A1A]/20 hover:bg-[#F7F6F2] transition-colors last:border-0">
                                                <td className="p-4 font-bold border-r border-[#1A1A1A]/20">{doc.subject}</td>
                                                <td className="p-4 text-[#1A1A1A]/80 border-r border-[#1A1A1A]/20">{doc.fileName}</td>
                                                <td className="p-4 text-center font-mono">{doc.chunksCount}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}
