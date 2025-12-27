import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadZoneProps {
  onUploadComplete: (file: File) => void;
}

export default function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onUploadComplete(file);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 ease-out cursor-pointer
          min-h-[400px] flex flex-col items-center justify-center text-center p-8
          ${isDragActive 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-border hover:border-primary/50 hover:bg-secondary/30 bg-card'}
        `}
        data-testid="upload-zone"
      >
        <input {...getInputProps()} data-testid="input-file" />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full"
            >
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-full object-cover"
                data-testid="img-preview"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-white font-medium">Click or drop to replace</p>
              </div>

              <Button
                variant="destructive"
                size="icon"
                className="absolute top-4 right-4 rounded-full"
                onClick={clearFile}
                data-testid="button-clear"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-4 max-w-sm"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UploadCloud className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                Upload your yard photo
              </h3>
              <p className="text-muted-foreground mb-6">
                Drag & drop or click to upload. Supports JPG, PNG, WEBP up to 10MB.
              </p>
              <Button size="lg" className="rounded-full px-8" data-testid="button-select">
                Select Photo
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}