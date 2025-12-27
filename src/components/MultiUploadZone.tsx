import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, UploadCloud, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ImageSlot {
  id: 'front' | 'right' | 'left';
  label: string;
  description: string;
  file: File | null;
  preview: string | null;
}

interface MultiUploadZoneProps {
  onUploadComplete: (files: { front: File; right: File; left: File; zipCode: string }) => void;
}

export default function MultiUploadZone({ onUploadComplete }: MultiUploadZoneProps) {
  const frontInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);
  const leftInputRef = useRef<HTMLInputElement>(null);

  const inputRefs = {
    front: frontInputRef,
    right: rightInputRef,
    left: leftInputRef,
  };

  const [frontFile, setFrontFile] = useState<{ file: File; preview: string } | null>(null);
  const [rightFile, setRightFile] = useState<{ file: File; preview: string } | null>(null);
  const [leftFile, setLeftFile] = useState<{ file: File; preview: string } | null>(null);
  const [zipCode, setZipCode] = useState('');
  const [zipError, setZipError] = useState('');

  const slots: ImageSlot[] = [
    { id: 'front', label: 'Front Center', description: 'Main front view of the house', file: frontFile?.file || null, preview: frontFile?.preview || null },
    { id: 'right', label: 'Front Right Side', description: 'Right angle view', file: rightFile?.file || null, preview: rightFile?.preview || null },
    { id: 'left', label: 'Front Left Side', description: 'Left angle view', file: leftFile?.file || null, preview: leftFile?.preview || null },
  ];

  const handleFileChange = useCallback((slotId: 'front' | 'right' | 'left', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      if (slotId === 'front') {
        setFrontFile({ file, preview });
      } else if (slotId === 'right') {
        setRightFile({ file, preview });
      } else {
        setLeftFile({ file, preview });
      }
    }
  }, []);

  const clearSlot = (slotId: 'front' | 'right' | 'left', e: React.MouseEvent) => {
    e.stopPropagation();
    if (slotId === 'front') {
      setFrontFile(null);
      if (frontInputRef.current) frontInputRef.current.value = '';
    } else if (slotId === 'right') {
      setRightFile(null);
      if (rightInputRef.current) rightInputRef.current.value = '';
    } else {
      setLeftFile(null);
      if (leftInputRef.current) leftInputRef.current.value = '';
    }
  };

  const handleSlotClick = (slotId: 'front' | 'right' | 'left') => {
    inputRefs[slotId].current?.click();
  };

  const allUploaded = frontFile && rightFile && leftFile;
  const isValidZip = /^\d{5}(-\d{4})?$/.test(zipCode);
  const canSubmit = allUploaded && isValidZip;

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d-]/g, '').slice(0, 10);
    setZipCode(value);
    if (value && !/^\d{5}(-\d{4})?$/.test(value)) {
      setZipError('Enter a valid 5-digit ZIP code');
    } else {
      setZipError('');
    }
  };

  const handleSubmit = () => {
    if (canSubmit) {
      onUploadComplete({
        front: frontFile.file,
        right: rightFile.file,
        left: leftFile.file,
        zipCode,
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Hidden file inputs */}
      <input
        ref={frontInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        className="hidden"
        onChange={(e) => handleFileChange('front', e)}
        data-testid="input-front"
      />
      <input
        ref={rightInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        className="hidden"
        onChange={(e) => handleFileChange('right', e)}
        data-testid="input-right"
      />
      <input
        ref={leftInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        className="hidden"
        onChange={(e) => handleFileChange('left', e)}
        data-testid="input-left"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {slots.map((slot, index) => (
          <motion.div
            key={slot.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => !slot.preview && handleSlotClick(slot.id)}
            className={`
              relative cursor-pointer rounded-2xl border-2 transition-all duration-300 overflow-hidden
              ${slot.preview 
                ? 'border-green-500' 
                : 'border-dashed border-border hover:border-primary hover:bg-primary/5'}
            `}
            data-testid={`slot-${slot.id}`}
          >
            <div className="aspect-[4/3] relative overflow-hidden">
              {slot.preview ? (
                <>
                  <img 
                    src={slot.preview} 
                    alt={slot.label} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <button
                      onClick={(e) => clearSlot(slot.id, e)}
                      className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                      data-testid={`clear-${slot.id}`}
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSlotClick(slot.id);
                    }}
                    className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium hover:bg-white transition-colors shadow-lg"
                    data-testid={`replace-${slot.id}`}
                  >
                    Replace
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-secondary/20 hover:bg-secondary/30 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <UploadCloud className="w-7 h-7 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground mb-1">Click to Upload</span>
                  <span className="text-xs text-muted-foreground text-center">{slot.description}</span>
                </div>
              )}
            </div>
            <div className="p-3 text-center bg-card">
              <span className={`font-medium text-sm ${slot.preview ? 'text-green-600' : ''}`}>
                {slot.label}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ZIP Code Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-xs mx-auto mb-8"
      >
        <Label htmlFor="zipCode" className="flex items-center gap-2 mb-2 text-sm font-medium">
          <MapPin className="w-4 h-4 text-primary" />
          Property ZIP Code
        </Label>
        <Input
          id="zipCode"
          type="text"
          placeholder="Enter ZIP code (e.g., 90210)"
          value={zipCode}
          onChange={handleZipChange}
          className={`text-center text-lg ${zipError ? 'border-red-500' : ''}`}
          data-testid="input-zipcode"
        />
        {zipError && (
          <p className="text-red-500 text-xs mt-1">{zipError}</p>
        )}
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Used for accurate local pricing estimates
        </p>
      </motion.div>

      {/* Submit Button */}
      {allUploaded ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Button 
            size="lg" 
            className="rounded-full px-12 py-6 text-lg"
            onClick={handleSubmit}
            disabled={!canSubmit}
            data-testid="button-analyze"
          >
            Analyze My Property
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            {canSubmit 
              ? "All 3 photos uploaded. Ready to analyze!" 
              : !isValidZip 
                ? "Please enter a valid ZIP code" 
                : "Upload all 3 photos to continue"}
          </p>
        </motion.div>
      ) : (
        <div className="text-center">
          <p className="text-muted-foreground">
            Click on each photo slot above to upload your property photos
          </p>
        </div>
      )}

      {/* Progress indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {slots.map((slot) => (
          <div 
            key={slot.id}
            className={`w-3 h-3 rounded-full transition-colors ${
              slot.preview ? 'bg-green-500' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}