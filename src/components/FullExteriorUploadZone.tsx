import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, UploadCloud, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type SlotId = 'front' | 'back' | 'left' | 'right' | 'corner-front-left' | 'corner-front-right' | 'corner-back-left' | 'corner-back-right';

interface ImageSlot {
  id: SlotId;
  label: string;
  description: string;
  required: boolean;
}

interface FileState {
  file: File;
  preview: string;
}

export interface FullExteriorFiles {
  front: File;
  back: File;
  left: File;
  right: File;
  cornerFrontLeft?: File;
  cornerFrontRight?: File;
  cornerBackLeft?: File;
  cornerBackRight?: File;
  zipCode: string;
}

interface FullExteriorUploadZoneProps {
  onUploadComplete: (files: FullExteriorFiles) => void;
}

const REQUIRED_SLOTS: ImageSlot[] = [
  { id: 'front', label: 'Front View', description: 'Front of the house', required: true },
  { id: 'back', label: 'Back View', description: 'Back of the house', required: true },
  { id: 'left', label: 'Left Side', description: 'Left side of house', required: true },
  { id: 'right', label: 'Right Side', description: 'Right side of house', required: true },
];

const OPTIONAL_SLOTS: ImageSlot[] = [
  { id: 'corner-front-left', label: 'Front-Left Corner', description: 'Outer edge view', required: false },
  { id: 'corner-front-right', label: 'Front-Right Corner', description: 'Outer edge view', required: false },
  { id: 'corner-back-left', label: 'Back-Left Corner', description: 'Outer edge view', required: false },
  { id: 'corner-back-right', label: 'Back-Right Corner', description: 'Outer edge view', required: false },
];

export default function FullExteriorUploadZone({ onUploadComplete }: FullExteriorUploadZoneProps) {
  const [files, setFiles] = useState<Record<SlotId, FileState | null>>({
    front: null,
    back: null,
    left: null,
    right: null,
    'corner-front-left': null,
    'corner-front-right': null,
    'corner-back-left': null,
    'corner-back-right': null,
  });
  const [showOptional, setShowOptional] = useState(false);
  const [zipCode, setZipCode] = useState('');
  const [zipError, setZipError] = useState('');

  const inputRefs = useRef<Record<SlotId, HTMLInputElement | null>>({
    front: null,
    back: null,
    left: null,
    right: null,
    'corner-front-left': null,
    'corner-front-right': null,
    'corner-back-left': null,
    'corner-back-right': null,
  });

  const handleFileChange = useCallback((slotId: SlotId, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setFiles(prev => ({ ...prev, [slotId]: { file, preview } }));
    }
  }, []);

  const clearSlot = (slotId: SlotId, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles(prev => ({ ...prev, [slotId]: null }));
    const input = inputRefs.current[slotId];
    if (input) input.value = '';
  };

  const handleSlotClick = (slotId: SlotId) => {
    inputRefs.current[slotId]?.click();
  };

  const requiredComplete = REQUIRED_SLOTS.every(slot => files[slot.id]);
  const optionalCount = OPTIONAL_SLOTS.filter(slot => files[slot.id]).length;
  const isValidZip = /^\d{5}(-\d{4})?$/.test(zipCode);
  const canSubmit = requiredComplete && isValidZip;

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
        front: files.front!.file,
        back: files.back!.file,
        left: files.left!.file,
        right: files.right!.file,
        cornerFrontLeft: files['corner-front-left']?.file,
        cornerFrontRight: files['corner-front-right']?.file,
        cornerBackLeft: files['corner-back-left']?.file,
        cornerBackRight: files['corner-back-right']?.file,
        zipCode,
      });
    }
  };

  const renderSlot = (slot: ImageSlot, index: number) => {
    const fileState = files[slot.id];
    return (
      <motion.div
        key={slot.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => !fileState && handleSlotClick(slot.id)}
        className={`
          relative cursor-pointer rounded-2xl border-2 transition-all duration-300 overflow-hidden
          ${fileState 
            ? 'border-green-500' 
            : slot.required 
              ? 'border-dashed border-primary/50 hover:border-primary hover:bg-primary/5'
              : 'border-dashed border-border hover:border-primary/50 hover:bg-primary/5'}
        `}
        data-testid={`slot-${slot.id}`}
      >
        <input
          ref={el => { inputRefs.current[slot.id] = el; }}
          type="file"
          accept="image/jpeg,image/png,image/jpg,image/webp"
          className="hidden"
          onChange={(e) => handleFileChange(slot.id, e)}
          data-testid={`input-${slot.id}`}
        />
        <div className="aspect-[4/3] relative overflow-hidden">
          {fileState ? (
            <>
              <img 
                src={fileState.preview} 
                alt={slot.label} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <button
                  onClick={(e) => clearSlot(slot.id, e)}
                  className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  data-testid={`clear-${slot.id}`}
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSlotClick(slot.id);
                }}
                className="absolute bottom-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium hover:bg-white transition-colors shadow-lg"
                data-testid={`replace-${slot.id}`}
              >
                Replace
              </button>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-secondary/20 hover:bg-secondary/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <UploadCloud className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground mb-1">Click to Upload</span>
              <span className="text-xs text-muted-foreground text-center">{slot.description}</span>
            </div>
          )}
        </div>
        <div className="p-2 text-center bg-card">
          <span className={`font-medium text-xs ${fileState ? 'text-green-600' : ''}`}>
            {slot.label}
            {slot.required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Required Photos (4)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload photos from all four sides of your property
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {REQUIRED_SLOTS.map((slot, index) => renderSlot(slot, index))}
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowOptional(!showOptional)}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          data-testid="toggle-optional-photos"
        >
          <Plus className={`w-4 h-4 transition-transform ${showOptional ? 'rotate-45' : ''}`} />
          {showOptional ? 'Hide' : 'Add'} Corner Photos (Optional)
          {optionalCount > 0 && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
              {optionalCount} added
            </span>
          )}
        </button>
        
        {showOptional && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Add photos from each corner of your property for a more comprehensive analysis
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {OPTIONAL_SLOTS.map((slot, index) => renderSlot(slot, index + 4))}
            </div>
          </motion.div>
        )}
      </div>

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
          data-testid="input-zipcode-full"
        />
        {zipError && (
          <p className="text-red-500 text-xs mt-1">{zipError}</p>
        )}
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Used for accurate local pricing estimates
        </p>
      </motion.div>

      {requiredComplete ? (
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
            data-testid="button-analyze-full"
          >
            Analyze My Property
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            {canSubmit 
              ? `${4 + optionalCount} photos uploaded. Ready to analyze!` 
              : !isValidZip 
                ? "Please enter a valid ZIP code" 
                : "Upload all 4 required photos to continue"}
          </p>
        </motion.div>
      ) : (
        <div className="text-center">
          <p className="text-muted-foreground">
            Upload all 4 required photos to continue
          </p>
        </div>
      )}

      <div className="flex justify-center gap-2 mt-6">
        {REQUIRED_SLOTS.map((slot) => (
          <div 
            key={slot.id}
            className={`w-3 h-3 rounded-full transition-colors ${
              files[slot.id] ? 'bg-green-500' : 'bg-primary/30'
            }`}
          />
        ))}
        {showOptional && OPTIONAL_SLOTS.map((slot) => (
          <div 
            key={slot.id}
            className={`w-2 h-2 rounded-full transition-colors ${
              files[slot.id] ? 'bg-green-500' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
