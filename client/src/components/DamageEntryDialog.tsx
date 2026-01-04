import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { VEHICLE_PARTS, DEFECT_TYPES, SEVERITY_LEVELS } from '@shared/constants';
import { X, Upload, Image as ImageIcon, Camera } from 'lucide-react';

interface DamageEntryDialogProps {
  open: boolean;
  onClose: () => void;
  preselectedPart?: string;
  positionX?: number;
  positionY?: number;
  vehicleArea?: string;
  onSubmit: (data: DamageData) => void;
}

export interface DamageData {
  partName: string;
  defectTypes: string[];
  severity: string;
  notes: string;
  photos: File[]; // Legacy: all photos
  defectPhotos?: { [defectType: string]: File[] }; // New: photos per defect type
  positionX?: number;
  positionY?: number;
  vehicleArea: string;
}

export function DamageEntryDialog({
  open,
  onClose,
  preselectedPart,
  positionX,
  positionY,
  vehicleArea = 'front',
  onSubmit,
}: DamageEntryDialogProps) {
  const [partName, setPartName] = useState(preselectedPart || '');
  const [defectTypes, setDefectTypes] = useState<string[]>([]);
  const [severity, setSeverity] = useState('medium');
  const [notes, setNotes] = useState('');
  const [defectPhotos, setDefectPhotos] = useState<{ [key: string]: File[] }>({});
  const [defectPhotoPreviews, setDefectPhotoPreviews] = useState<{ [key: string]: string[] }>({});
  const [showCamera, setShowCamera] = useState(false);
  const [currentDefectForPhoto, setCurrentDefectForPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async (defectType: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCurrentDefectForPhoto(defectType);
      setShowCamera(true);
    } catch (error) {
      alert('⚠️ لا يمكن الوصول للكاميرا. تأكد من السماح بالوصول للكاميرا.');
      console.error('Camera error:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setCurrentDefectForPhoto(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && currentDefectForPhoto) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            
            // Add to specific defect type photos
            setDefectPhotos(prev => ({
              ...prev,
              [currentDefectForPhoto]: [...(prev[currentDefectForPhoto] || []), file]
            }));
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
              setDefectPhotoPreviews(prev => ({
                ...prev,
                [currentDefectForPhoto]: [...(prev[currentDefectForPhoto] || []), reader.result as string]
              }));
            };
            reader.readAsDataURL(file);
            
            stopCamera();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, defectType: string) => {
    const files = Array.from(e.target.files || []);
    console.log('📁 Files selected:', files.length, 'for defect:', defectType);
    console.log('📁 File details:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
    
    setDefectPhotos(prev => {
      const updated = {
        ...prev,
        [defectType]: [...(prev[defectType] || []), ...files]
      };
      console.log('📸 Updated defectPhotos:', updated);
      console.log('📸 Total photos for', defectType, ':', updated[defectType]?.length || 0);
      return updated;
    });

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDefectPhotoPreviews(prev => ({
          ...prev,
          [defectType]: [...(prev[defectType] || []), reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (defectType: string, index: number) => {
    setDefectPhotos(prev => ({
      ...prev,
      [defectType]: (prev[defectType] || []).filter((_, i) => i !== index)
    }));
    setDefectPhotoPreviews(prev => ({
      ...prev,
      [defectType]: (prev[defectType] || []).filter((_, i) => i !== index)
    }));
  };

  const toggleDefectType = (defectId: string) => {
    setDefectTypes((prev) =>
      prev.includes(defectId)
        ? prev.filter((id) => id !== defectId)
        : [...prev, defectId]
    );
  };

  const handleSubmit = () => {
    if (!partName || defectTypes.length === 0) {
      alert('⚠️ يجب اختيار الجزء ونوع العطل');
      return;
    }

    // Collect all photos
    const allPhotos: File[] = [];
    Object.values(defectPhotos).forEach(photos => {
      allPhotos.push(...photos);
    });

    console.log('� SUBMIT CLICKED!');
    console.log('📸 Photos to upload:', allPhotos.length, allPhotos);
    console.log('📸 defectPhotos object:', defectPhotos);
    console.log('📸 defectTypes:', defectTypes);
    console.log('📸 Mapping:', defectTypes.map(dt => ({
      defectType: dt,
      photos: defectPhotos[dt]?.length || 0
    })));

    const dataToSubmit = {
      partName,
      defectTypes,
      severity,
      notes,
      photos: allPhotos, // Legacy: all photos combined
      defectPhotos, // New: photos organized by defect type
      positionX,
      positionY,
      vehicleArea,
    };
    
    console.log('📦 Full data being submitted:', dataToSubmit);
    
    console.log('🎯 CALLING onSubmit NOW!');
    try {
      onSubmit(dataToSubmit);
      console.log('✅ onSubmit called successfully!');
    } catch (error) {
      console.error('❌ Error calling onSubmit:', error);
    }

    // Reset form
    setPartName('');
    setDefectTypes([]);
    setSeverity('medium');
    setNotes('');
    setDefectPhotos({});
    setDefectPhotoPreviews({});
    onClose();
  };

  // Filter parts by area if preselected
  const relevantParts = (() => {
    // If a specific part is already preselected (like engine or tire), use it
    if (preselectedPart) {
      const part = VEHICLE_PARTS.find(p => p.id === preselectedPart);
      return part ? [part] : VEHICLE_PARTS;
    }
    
    // Filter by vehicle area
    if (vehicleArea) {
      return VEHICLE_PARTS.filter((part) => part.area === vehicleArea);
    }
    
    return VEHICLE_PARTS;
  })();

  // Filter defect types based on selected part
  const relevantDefects = (() => {
    if (!partName) return DEFECT_TYPES;
    
    // If it's a tire/wheel part, show only tire defects
    if (partName.includes('tire') || partName.includes('كوتش') || partName.includes('جنط')) {
      return DEFECT_TYPES.filter(d => 
        d.id.includes('tire') || d.id.includes('rim')
      );
    }
    
    // If it's engine, show only engine defects
    if (partName.includes('engine') || partName.includes('مكينة') || partName.includes('محرك')) {
      return DEFECT_TYPES.filter(d => d.id.includes('engine'));
    }
    
    // Otherwise show all general defects (not tire or engine specific)
    return DEFECT_TYPES.filter(d => 
      !d.id.includes('tire') && !d.id.includes('rim') && !d.id.includes('engine')
    );
  })();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            📸 تسجيل عطل في السيارة
          </DialogTitle>
          <p className="text-sm text-gray-600 text-center mt-2">
            حدد الجزء، نوع العطل، والتقط صور للتوثيق
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Info Banner */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 text-center">
              💡 <strong>نصيحة:</strong> التقط صور واضحة من زوايا مختلفة لكل عطل
            </p>
          </div>

          {/* Part Selection */}
          <div>
            <Label className="text-lg font-semibold mb-3 block">
              1️⃣ اختر الجزء <span className="text-red-500">*</span>
            </Label>
            <RadioGroup value={partName} onValueChange={setPartName}>
              <div className="grid grid-cols-2 gap-3">
                {relevantParts.map((part) => (
                  <div
                    key={part.id}
                    className={`flex items-center space-x-2 space-x-reverse p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      partName === part.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPartName(part.id)}
                  >
                    <RadioGroupItem value={part.id} id={part.id} />
                    <Label htmlFor={part.id} className="cursor-pointer flex-1">
                      {part.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Defect Type Selection (Multiple) */}
          <div>
            <Label className="text-lg font-semibold mb-3 block">
              2️⃣ اختر نوع العطل <span className="text-red-500">*</span>
              <span className="text-sm text-gray-500 mr-2">(يمكن اختيار أكثر من نوع)</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {relevantDefects.map((defect) => (
                <div
                  key={defect.id}
                  className={`flex items-center space-x-2 space-x-reverse p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    defectTypes.includes(defect.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleDefectType(defect.id)}
                >
                  <Checkbox
                    checked={defectTypes.includes(defect.id)}
                    onCheckedChange={() => toggleDefectType(defect.id)}
                  />
                  <span className="text-xl ml-2">{defect.icon}</span>
                  <Label className="cursor-pointer flex-1">{defect.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Severity Selection */}
          <div>
            <Label className="text-lg font-semibold mb-3 block">
              3️⃣ درجة العطل <span className="text-red-500">*</span>
            </Label>
            <RadioGroup value={severity} onValueChange={setSeverity}>
              <div className="flex gap-4">
                {SEVERITY_LEVELS.map((level) => (
                  <div
                    key={level.id}
                    className={`flex items-center space-x-2 space-x-reverse p-4 border-2 rounded-lg cursor-pointer transition-all flex-1 ${
                      severity === level.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSeverity(level.id)}
                    style={{
                      borderColor: severity === level.id ? level.color : undefined,
                    }}
                  >
                    <RadioGroupItem value={level.id} id={level.id} />
                    <Label htmlFor={level.id} className="cursor-pointer flex-1 text-center font-semibold">
                      {level.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-lg font-semibold mb-3 block">
              4️⃣ ملاحظة (اختياري)
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أضف أي ملاحظات إضافية..."
              className="min-h-[80px]"
              dir="rtl"
            />
          </div>

          {/* Photo Upload - Per Defect Type */}
          {defectTypes.length > 0 && (
            <div>
              <Label className="text-lg font-semibold mb-3 block">
                5️⃣ رفع صور لكل نوع عطل
                <span className="text-sm text-blue-600 mr-2">(صورة منفصلة لكل عطل اخترته)</span>
              </Label>
              
              <div className="space-y-6">
                {defectTypes.map((defectType) => {
                  const defect = DEFECT_TYPES.find(d => d.id === defectType);
                  if (!defect) return null;
                  
                  const photos = defectPhotos[defectType] || [];
                  const previews = defectPhotoPreviews[defectType] || [];
                  
                  return (
                    <div key={defectType} className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-lg border-2 border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{defect.icon}</span>
                        <span className="font-bold text-gray-900">{defect.label}</span>
                        <span className="text-sm text-gray-500">({photos.length} صورة)</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {/* Upload from gallery */}
                        <label
                          htmlFor={`photo-upload-${defectType}`}
                          className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl cursor-pointer hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                        >
                          <Upload className="w-6 h-6" />
                          <span className="font-bold text-sm">📤 رفع صورة</span>
                          <span className="text-xs opacity-90">من المعرض</span>
                          <input
                            id={`photo-upload-${defectType}`}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handlePhotoUpload(e, defectType)}
                            className="hidden"
                          />
                        </label>

                        {/* Capture from camera */}
                        <button
                          type="button"
                          onClick={() => startCamera(defectType)}
                          className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl cursor-pointer hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                        >
                          <Camera className="w-6 h-6" />
                          <span className="font-bold text-sm">📷 التقط صورة</span>
                          <span className="text-xs opacity-90">من الكاميرا</span>
                        </button>
                      </div>
                      
                      {/* Photo Previews */}
                      {previews.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                          {previews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`${defect.label} ${index + 1}`}
                                className="w-full h-20 object-cover rounded border-2 border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(defectType, index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Camera View */}
              {showCamera && currentDefectForPhoto && (
                <div className="relative border-2 border-blue-500 rounded-lg overflow-hidden bg-black mt-3">
                  <div className="bg-blue-600 text-white p-2 text-center font-bold">
                    📸 التقاط صورة: {DEFECT_TYPES.find(d => d.id === currentDefectForPhoto)?.label}
                  </div>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex justify-center gap-3">
                    <Button
                      type="button"
                      onClick={capturePhoto}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-full"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      التقط
                    </Button>
                    <Button
                      type="button"
                      onClick={stopCamera}
                      variant="outline"
                      className="bg-white/90 hover:bg-white font-bold px-6 py-2 rounded-full"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-lg py-6 relative"
            disabled={!partName || defectTypes.length === 0}
          >
            <span className="flex items-center gap-2">
              ✅ حفظ العطل
              {(() => {
                const totalPhotos = Object.values(defectPhotos).reduce((sum, arr) => sum + arr.length, 0);
                if (totalPhotos > 0) {
                  return (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      📸 {totalPhotos}
                    </span>
                  );
                } else {
                  return (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                      ⚠️ بدون صور
                    </span>
                  );
                }
              })()}
            </span>
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 text-lg py-6"
          >
            ❌ إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
