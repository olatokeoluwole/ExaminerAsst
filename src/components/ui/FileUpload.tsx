import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, File as FileIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  accept?: Record<string, string[]>;
  label?: string;
  files: File[];
  onRemoveFile: (index: number) => void;
  capture?: 'user' | 'environment';
}

export function FileUpload({ onFilesSelected, maxFiles = 1, accept = {'image/*': ['.jpeg', '.jpg', '.png']}, label = "Drag & drop files", files, onRemoveFile, capture }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    accept
  } as any);

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      // Reset input value to allow selecting the same file again if needed
      e.target.value = '';
    }
  };

  return (
    <div className="w-full">
        <div
        {...getRootProps()}
        className={cn(
            "border-2 border-dashed border-[#1A1A1A] p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white",
            isDragActive ? "bg-[#1A1A1A]/5 border-solid" : "hover:bg-[#1A1A1A]/5",
            files.length >= maxFiles && maxFiles === 1 ? "hidden" : "flex"
        )}
        >
        <input {...getInputProps({ capture })} />
        <UploadCloud className={cn("w-8 h-8 mb-2", isDragActive ? "text-[#1A1A1A]" : "text-[#1A1A1A]/50")} />
        <p className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]">{label}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/50 mt-2 mb-4">Supports images only</p>
        
        {/* Mobile Camera Option: We embed a clickable wrapper that uses an explicit camera input.
            To avoid clicking the dropzone when clicking the button, we stop propagation. */}
        <label 
           className="relative z-10 block w-full sm:w-auto mt-2 cursor-pointer font-bold uppercase tracking-widest text-xs border-2 border-[#1A1A1A] py-2 px-4 shadow-[4px_4px_0_0_#1A1A1A] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#1A1A1A] transition-all bg-[#F7F6F2] text-[#1A1A1A] text-center"
           onClick={(e) => e.stopPropagation()}
        >
           Take Photo
           <input 
             type="file" 
             accept="image/*" 
             capture="environment" 
             className="hidden" 
             onChange={handleCameraChange}
             multiple={maxFiles > 1}
           />
        </label>
        </div>

        {files.length > 0 && (
            <div className="mt-4 space-y-2">
                {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white border-2 border-[#1A1A1A]">
                        <div className="flex items-center space-x-3 truncate">
                           <FileIcon className="w-5 h-5 text-[#1A1A1A]" />
                           <span className="text-sm font-bold text-[#1A1A1A] truncate">{file.name}</span>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemoveFile(idx);
                            }}
                            className="p-1 text-[#1A1A1A]/50 hover:text-red-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}
