import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  acceptedTypes?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  title: string;
  description: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedTypes = ".pdf,.doc,.docx,.txt",
  multiple = false,
  maxSize = 10,
  title,
  description,
  className
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File ${file.name} is too large (max ${maxSize}MB)`;
    }
    
    const validTypes = acceptedTypes.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      return `File type ${fileExtension} is not supported`;
    }
    
    return null;
  };

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(newErrors);
    
    if (validFiles.length > 0) {
      const updatedFiles = multiple ? [...uploadedFiles, ...validFiles] : validFiles;
      setUploadedFiles(updatedFiles);
      onFileSelect(updatedFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updatedFiles);
    onFileSelect(updatedFiles);
  };

  return (
    <div className={cn("w-full", className)}>
      <Card 
        className={cn(
          "border-2 border-dashed transition-all duration-300 cursor-pointer",
          isDragOver 
            ? "border-primary bg-primary-lighter/50 shadow-medium" 
            : "border-primary/30 hover:border-primary hover:bg-primary-lighter/20"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className={cn(
              "p-4 rounded-full transition-colors duration-200",
              isDragOver ? "bg-primary text-primary-foreground" : "bg-primary-lighter text-primary"
            )}>
              <Upload size={32} />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-muted-foreground mb-4">{description}</p>
              
              <Button 
                variant="upload" 
                size="lg"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Upload size={16} />
                Choose Files
              </Button>
              
              <input
                id="file-input"
                type="file"
                accept={acceptedTypes}
                multiple={multiple}
                onChange={handleFileInput}
                className="hidden"
              />
              
              <p className="text-xs text-muted-foreground mt-2">
                Supported formats: {acceptedTypes.replace(/\./g, '').toUpperCase()} • Max {maxSize}MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-4 space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center space-x-2 text-destructive text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-sm">Uploaded Files:</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-success-light rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle2 size={16} className="text-success" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="text-destructive hover:text-destructive"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};