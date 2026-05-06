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
}

export function FileUpload({ onFilesSelected, maxFiles = 1, accept = {'image/*': ['.jpeg', '.jpg', '.png']}, label = "Drag & drop files", files, onRemoveFile }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    accept
  } as any);

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
        <input {...getInputProps()} />
        <UploadCloud className={cn("w-8 h-8 mb-2", isDragActive ? "text-[#1A1A1A]" : "text-[#1A1A1A]/50")} />
        <p className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]">{label}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/50 mt-2">Supports images only</p>
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
