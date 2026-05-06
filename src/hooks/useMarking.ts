import { useState, useCallback } from "react";
import { markStudentScript, MarkingResult } from "../lib/gemini";

export function useMarking() {
  const [isMarking, setIsMarking] = useState(false);
  const [results, setResults] = useState<MarkingResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const markBatch = useCallback(async (
    subject: string,
    questionImage: File,
    students: { name: string; className: string; scripts: File[] }[]
  ) => {
    setIsMarking(true);
    setError(null);
    try {
      const qBase64 = await fileToBase64(questionImage);
      const qMime = questionImage.type;

      const newResults: MarkingResult[] = [];
      
      // Process students sequentially or in parallel (parallel might hit rate limits)
      for (const student of students) {
        if (student.scripts.length === 0) continue;
        
        const scriptImages = await Promise.all(
          student.scripts.map(async (file) => ({
            data: await fileToBase64(file),
            mimeType: file.type,
          }))
        );

        const res = await markStudentScript(
          student.name,
          student.className,
          subject,
          qBase64,
          qMime,
          scriptImages
        );
        newResults.push(res);
      }

      setResults((prev) => [...prev, ...newResults]);
      return newResults;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during marking.");
      throw err;
    } finally {
      setIsMarking(false);
    }
  }, []);

  return { isMarking, results, error, markBatch };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/...;base64, prefix
      resolve(result.split(",")[1]);
    };
    reader.onerror = (error) => reject(error);
  });
}
