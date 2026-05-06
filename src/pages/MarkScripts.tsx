import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FileUpload } from '../components/ui/FileUpload';
import { useMarking } from '../hooks/useMarking';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, getDocs, setDoc, doc, serverTimestamp, writeBatch, increment } from 'firebase/firestore';

interface StudentEntry {
  id: string;
  name: string;
  className: string;
  scripts: File[];
}

export default function MarkScripts() {
  const [subject, setSubject] = useState('Mathematics');
  const [questionImage, setQuestionImage] = useState<File | null>(null);
  const [students, setStudents] = useState<StudentEntry[]>([
    { id: '1', name: '', className: 'SS3A', scripts: [] }
  ]);
  
  const { isMarking, markBatch, error } = useMarking();
  const navigate = useNavigate();
  const { school, refreshSchool } = useAuth();
  const [localError, setLocalError] = useState('');

  const handleAddStudent = () => {
      if (students.length >= 10) return;
      setStudents([...students, { id: Math.random().toString(), name: '', className: 'SS3A', scripts: [] }]);
  };

  const handleRemoveStudent = (id: string) => {
      setStudents(students.filter(s => s.id !== id));
  };

  const updateStudent = (id: string, field: keyof StudentEntry, value: any) => {
      setStudents(students.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleMark = async () => {
      if (!questionImage) {
          setLocalError('Please upload the WAEC theory question image.');
          return;
      }
      
      const validStudents = students.filter(s => s.name.trim() && s.scripts.length > 0);
      if (validStudents.length === 0) {
          setLocalError('Please add at least one student with a name and script images.');
          return;
      }

      setLocalError('');

      if (!school) {
          setLocalError('No school context found. Ensure you are logged in properly.');
          return;
      }

      try {
          // 1. Fetch existing students for this school to see if any are new
          const studentsCol = collection(db, `schools/${school.id}/students`);
          const existingSnap = await getDocs(studentsCol);
          const existingNames = new Set(existingSnap.docs.map(d => d.data().name.trim().toLowerCase()));

          // 2. See how many of our validStudents are genuinely new
          const inputNames = new Set(validStudents.map(s => s.name.trim().toLowerCase()));
          let newUniqueCount = 0;
          inputNames.forEach(name => {
              if (!existingNames.has(name)) newUniqueCount++;
          });

          // 3. Limit check
          if (school.registeredStudentsCount + newUniqueCount > school.maxStudents) {
              setLocalError(`Limit Exceeded: You have ${Math.max(0, school.maxStudents - school.registeredStudentsCount)} student(s) limit left, but this batch adds ${newUniqueCount} new student(s).`);
              return;
          }

          // 4. Proceed to Mark
          const results = await markBatch(subject, questionImage, validStudents);
          
          // 5. Store in Firebase using Batch
          const batch = writeBatch(db);
          
          let actuallyAddedCount = 0;
          const processedNames = new Set<string>();

          for (const res of results) {
              const nameLower = res.student_name.trim().toLowerCase();
              if (!existingNames.has(nameLower) && !processedNames.has(nameLower)) {
                  // This is a new student
                  processedNames.add(nameLower);
                  actuallyAddedCount++;
                  
                  const stdRef = doc(collection(db, `schools/${school.id}/students`));
                  batch.set(stdRef, {
                      name: res.student_name.trim(),
                      className: res.class,
                      createdAt: serverTimestamp()
                  });
              }

              const resultRef = doc(collection(db, `schools/${school.id}/results`));
              batch.set(resultRef, {
                  studentName: res.student_name.trim(),
                  class: res.class,
                  subject: res.subject,
                  score: res.score,
                  grade: res.grade,
                  remarks: res.remarks,
                  createdAt: serverTimestamp()
              });
          }

          if (actuallyAddedCount > 0) {
              const schoolRef = doc(db, 'schools', school.id);
              batch.update(schoolRef, {
                  registeredStudentsCount: increment(actuallyAddedCount)
              });
          }

          await batch.commit();

          await refreshSchool(); // Sync UI limits
          
          navigate('/dashboard');
      } catch (err: any) {
          console.error(err);
          setLocalError(err.message || 'An error occurred during marking or saving.');
      }
  };

  const displayError = localError || error;

  return (
    <div className="space-y-10 pb-12">
        <header className="flex justify-between items-baseline border-b-2 border-[#1A1A1A] pb-6">
            <div className="flex flex-col">
                <h1 className="text-5xl lg:text-7xl font-serif font-black tracking-tighter uppercase leading-none">Mark Scripts</h1>
                <p className="text-xs font-bold tracking-[0.3em] uppercase mt-4 opacity-60">Upload the question and student scripts to grade using the WAEC standard.</p>
            </div>
        </header>

        {displayError && (
            <div className="p-6 bg-[#1A1A1A] text-white border-2 border-red-500 relative">
                <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[9px] font-bold px-2 py-1 uppercase tracking-widest">Error_Detected</div>
                {displayError}
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <div className="border-2 border-[#1A1A1A] bg-white">
                    <div className="p-6 border-b-2 border-[#1A1A1A]">
                        <h3 className="font-serif font-black text-xl italic tracking-tighter">Session Details</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Subject</label>
                            <select 
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="flex h-12 w-full border-2 border-[#1A1A1A] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
                            >
                                <option value="Mathematics">Mathematics</option>
                                <option value="English">English</option>
                                <optgroup label="Science Subjects">
                                    <option value="Physics">Physics</option>
                                    <option value="Chemistry">Chemistry</option>
                                    <option value="Biology">Biology</option>
                                    <option value="Agricultural Science">Agricultural Science</option>
                                </optgroup>
                                <optgroup label="Commercial Subjects">
                                    <option value="Economics">Economics</option>
                                    <option value="Commerce">Commerce</option>
                                    <option value="Accounting">Accounting</option>
                                </optgroup>
                                <optgroup label="Arts Subjects">
                                    <option value="Geography">Geography</option>
                                    <option value="Government">Government</option>
                                    <option value="Literature in English">Literature in English</option>
                                </optgroup>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] flex items-center justify-between">
                                Question Image
                                {questionImage && (
                                    <span className="text-[9px] text-[#1A1A1A] font-bold bg-[#1A1A1A]/10 px-2 py-0.5 uppercase tracking-widest">Uploaded</span>
                                )}
                            </label>
                            <FileUpload 
                                files={questionImage ? [questionImage] : []}
                                maxFiles={1}
                                label="Upload WAEC Question"
                                onFilesSelected={(files) => setQuestionImage(files[0])}
                                onRemoveFile={() => setQuestionImage(null)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between bg-[#1A1A1A] text-white py-4 px-6 border-2 border-[#1A1A1A]">
                    <h2 className="text-xl font-serif font-black italic tracking-tighter">Students Batch ({students.length}/10)</h2>
                    <Button variant="outline" size="sm" onClick={handleAddStudent} disabled={students.length >= 10 || isMarking} className="border-white text-white hover:bg-white hover:text-[#1A1A1A]">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Student
                    </Button>
                </div>

                <div className="space-y-6">
                    {students.map((student, index) => (
                        <div key={student.id} className="relative border-2 border-[#1A1A1A] bg-white p-6">
                            {students.length > 1 && !isMarking && (
                                <button 
                                    className="absolute -right-3 -top-3 bg-red-600 border-2 border-[#1A1A1A] text-white p-2 hover:bg-red-700 transition-colors z-10"
                                    onClick={() => handleRemoveStudent(student.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] flex items-center">
                                        <span className="w-6 h-6 bg-[#1A1A1A] text-white flex items-center justify-center text-[10px] mr-2 font-black">{index + 1}</span>
                                        Student Name
                                    </label>
                                    <Input 
                                        placeholder="e.g. Amina Bello" 
                                        value={student.name}
                                        onChange={(e) => updateStudent(student.id, 'name', e.target.value)}
                                        disabled={isMarking}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Class</label>
                                    <select 
                                        value={student.className}
                                        onChange={(e) => updateStudent(student.id, 'className', e.target.value)}
                                        className="flex h-12 w-full border-2 border-[#1A1A1A] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
                                        disabled={isMarking}
                                    >
                                        <option value="SS3A">SS3A</option>
                                        <option value="SS3B">SS3B</option>
                                        <option value="SS3C">SS3C</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2 border-t-2 border-[#1A1A1A] pt-6 mt-6">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Answer Scripts (Multiple Pages allowed)</label>
                                <FileUpload 
                                    files={student.scripts}
                                    maxFiles={5}
                                    label="Upload handwritten scripts"
                                    onFilesSelected={(files) => updateStudent(student.id, 'scripts', [...student.scripts, ...files])}
                                    onRemoveFile={(idx) => {
                                        const newScripts = [...student.scripts];
                                        newScripts.splice(idx, 1);
                                        updateStudent(student.id, 'scripts', newScripts);
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-8 flex justify-end">
                    <Button 
                        size="lg" 
                        onClick={handleMark} 
                        disabled={isMarking || !questionImage}
                        className="w-full md:w-auto h-16 text-sm bg-blue-600 border-blue-600 hover:text-blue-600"
                    >
                        {isMarking ? (
                            <>
                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                Grading Scripts...
                            </>
                        ) : (
                            "MARK SCRIPTS "
                        )}
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
}
