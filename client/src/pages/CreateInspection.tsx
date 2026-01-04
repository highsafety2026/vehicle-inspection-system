import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInspectionSchema } from "@shared/schema";
import { z } from "zod";
import { useCreateInspection } from "@/hooks/use-inspections";
import { useLocation } from "wouter";
import { ArrowLeft, Loader2, Search, Camera, Upload } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const formSchema = insertInspectionSchema;
type FormValues = z.infer<typeof formSchema>;

const OCR_API_KEY = "K87581183888957";

export default function CreateInspection() {
  const [, setLocation] = useLocation();
  const createInspection = useCreateInspection();
  const [vinNumber, setVinNumber] = useState("");
  const [isDecodingVin, setIsDecodingVin] = useState(false);
  const [vinDetails, setVinDetails] = useState<any>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      vehicleInfo: "",
      vinNumber: "",
      color: "",
      mileage: "",
      engineNumber: "",
      status: "in_progress",
    },
  });

  const decodeVin = async () => {
    if (!vinNumber || vinNumber.length < 17) {
      toast({
        title: "❌ خطأ",
        description: "رقم VIN يجب أن يكون 17 حرف",
        variant: "destructive",
      });
      return;
    }

    setIsDecodingVin(true);
    try {
      const response = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${vinNumber}?format=json`
      );
      const data = await response.json();
      
      if (data.Results && data.Results[0]) {
        const result = data.Results[0];
        
        // استخراج جميع البيانات المهمة
        const make = result.Make || "";
        const model = result.Model || "";
        const year = result.ModelYear || "";
        const bodyClass = result.BodyClass || "";
        const engineCylinders = result.EngineCylinders || "";
        const engineHP = result.EngineHP || "";
        const fuelType = result.FuelTypePrimary || "";
        const transmission = result.TransmissionStyle || "";
        const driveType = result.DriveType || "";
        const doors = result.Doors || "";
        const vehicleType = result.VehicleType || "";
        const trim = result.Trim || "";
        const series = result.Series || "";
        const manufacturer = result.Manufacturer || "";
        
        // حفظ التفاصيل الكاملة
        setVinDetails({
          make, model, year, bodyClass, engineCylinders, engineHP,
          fuelType, transmission, driveType, doors, vehicleType,
          trim, series, manufacturer
        });
        
        // بناء معلومات السيارة الكاملة
        let vehicleInfo = `${year} ${make} ${model}`;
        if (trim) vehicleInfo += ` ${trim}`;
        if (bodyClass) vehicleInfo += ` - ${bodyClass}`;
        
        if (make && model && year) {
          form.setValue("vehicleInfo", vehicleInfo);
          
          // عرض معلومات تفصيلية في Toast
          const details = [];
          if (engineCylinders) details.push(`محرك ${engineCylinders} سلندر`);
          if (fuelType) details.push(fuelType);
          if (transmission) details.push(transmission);
          
          toast({
            title: "✅ نجح!",
            description: `${vehicleInfo}\n${details.join(" • ")}`,
            duration: 5000,
          });
        } else {
          toast({
            title: "⚠️ تحذير",
            description: "تم فك VIN لكن بعض البيانات غير متوفرة",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "❌ خطأ",
        description: "فشل في الاتصال بخدمة VIN",
        variant: "destructive",
      });
    } finally {
      setIsDecodingVin(false);
    }
  };

  const extractTextFromImage = async (file: File, fieldType: 'vin') => {
    setIsOcrProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('apikey', OCR_API_KEY);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('OCREngine', '2');

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.ParsedResults && result.ParsedResults[0]) {
        const extractedText = result.ParsedResults[0].ParsedText.trim();
        
        if (fieldType === 'vin') {
          // Extract VIN (17 alphanumeric characters)
          const vinMatch = extractedText.match(/[A-HJ-NPR-Z0-9]{17}/i);
          if (vinMatch) {
            const detectedVin = vinMatch[0].toUpperCase();
            setVinNumber(detectedVin);
            form.setValue('vinNumber', detectedVin);
            toast({
              title: "✅ تم قراءة رقم الشاصي",
              description: detectedVin,
            });
          } else {
            toast({
              title: "⚠️ تحذير",
              description: "لم يتم العثور على رقم VIN صحيح (17 حرف)",
              variant: "destructive",
            });
          }
        }
      } else {
        toast({
          title: "❌ فشل",
          description: "لم يتم التعرف على نص في الصورة",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ خطأ",
        description: "فشل في معالجة الصورة",
        variant: "destructive",
      });
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, fieldType: 'vin') => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "❌ خطأ",
          description: "حجم الصورة يجب أن يكون أقل من 5MB",
          variant: "destructive",
        });
        return;
      }
      extractTextFromImage(file, fieldType);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const result = await createInspection.mutateAsync(data);
      setLocation(`/inspections/${result.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">New Inspection</h1>
          <p className="text-muted-foreground mt-1">Enter vehicle details to start recording condition.</p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
            <CardDescription>All fields are required to start.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* VIN Decoder Section */}
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <label className="text-sm font-semibold text-blue-900 block mb-2">
                    🔍 فك تشفير VIN (اختياري)
                  </label>
                  <p className="text-xs text-blue-700 mb-3">
                    أدخل رقم VIN (17 حرف) للحصول على معلومات السيارة تلقائياً
                  </p>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={vinNumber}
                      onChange={(e) => setVinNumber(e.target.value.toUpperCase())}
                      placeholder="1FTFW1E5XPKE49896"
                      className="font-mono uppercase"
                      maxLength={17}
                    />
                    <Button
                      type="button"
                      onClick={decodeVin}
                      disabled={isDecodingVin || vinNumber.length !== 17}
                      variant="outline"
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {isDecodingVin ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* OCR Upload for VIN */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleImageUpload(e, 'vin')}
                      className="hidden"
                      id="vin-image-upload"
                      disabled={isOcrProcessing}
                    />
                    <label
                      htmlFor="vin-image-upload"
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs bg-white border-2 border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 cursor-pointer transition-colors ${isOcrProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isOcrProcessing ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>جاري المعالجة...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-3 h-3" />
                          <span>التقط صورة الشاصي VIN</span>
                        </>
                      )}
                    </label>
                    <span className="text-xs text-blue-600">أو</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'vin')}
                      className="hidden"
                      id="vin-file-upload"
                      disabled={isOcrProcessing}
                    />
                    <label
                      htmlFor="vin-file-upload"
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs bg-white border-2 border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 cursor-pointer transition-colors ${isOcrProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>ارفع صورة</span>
                    </label>
                  </div>

                  {vinNumber.length > 0 && vinNumber.length < 17 && (
                    <p className="text-xs text-red-600 mt-1">
                      VIN يجب أن يكون 17 حرف ({vinNumber.length}/17)
                    </p>
                  )}
                  
                  {/* عرض تفاصيل VIN */}
                  {vinDetails && (
                    <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-400 shadow-md">
                      <h4 className="font-bold text-blue-900 mb-3 text-base flex items-center gap-2">
                        📋 تفاصيل السيارة
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {vinDetails.make && (
                          <div className="bg-white p-2 rounded border border-blue-200">
                            <span className="text-blue-700 font-semibold block">الصانع:</span>
                            <span className="font-bold text-gray-900">{vinDetails.make}</span>
                          </div>
                        )}
                        {vinDetails.model && (
                          <div className="bg-white p-2 rounded border border-blue-200">
                            <span className="text-blue-700 font-semibold block">الموديل:</span>
                            <span className="font-bold text-gray-900">{vinDetails.model}</span>
                          </div>
                        )}
                        {vinDetails.year && (
                          <div className="bg-white p-2 rounded border border-blue-200">
                            <span className="text-blue-700 font-semibold block">السنة:</span>
                            <span className="font-bold text-gray-900">{vinDetails.year}</span>
                          </div>
                        )}
                        {vinDetails.bodyClass && (
                          <div className="bg-white p-2 rounded border border-blue-200">
                            <span className="text-blue-700 font-semibold block">نوع الهيكل:</span>
                            <span className="font-bold text-gray-900">{vinDetails.bodyClass}</span>
                          </div>
                        )}
                        {vinDetails.engineCylinders && (
                          <div className="bg-white p-2 rounded border border-blue-200">
                            <span className="text-blue-700 font-semibold block">المحرك:</span>
                            <span className="font-bold text-gray-900">{vinDetails.engineCylinders} سلندر</span>
                          </div>
                        )}
                        {vinDetails.engineHP && (
                          <div className="bg-white p-2 rounded border border-blue-200">
                            <span className="text-blue-700 font-semibold block">القوة:</span>
                            <span className="font-bold text-gray-900">{vinDetails.engineHP} HP</span>
                          </div>
                        )}
                        {vinDetails.fuelType && (
                          <div className="bg-white p-2 rounded border border-blue-200">
                            <span className="text-blue-700 font-semibold block">الوقود:</span>
                            <span className="font-bold text-gray-900">{vinDetails.fuelType}</span>
                          </div>
                        )}
                        {vinDetails.transmission && (
                          <div className="bg-white p-2 rounded border border-blue-200">
                            <span className="text-blue-700 font-semibold block">ناقل الحركة:</span>
                            <span className="font-bold text-gray-900">{vinDetails.transmission}</span>
                          </div>
                        )}
                        {vinDetails.driveType && (
                          <div className="bg-white p-2 rounded border border-blue-200">
                            <span className="text-blue-700 font-semibold block">نوع الدفع:</span>
                            <span className="font-bold text-gray-900">{vinDetails.driveType}</span>
                          </div>
                        )}
                        {vinDetails.doors && (
                          <div className="bg-white p-2 rounded border border-blue-200">
                            <span className="text-blue-700 font-semibold block">الأبواب:</span>
                            <span className="font-bold text-gray-900">{vinDetails.doors}</span>
                          </div>
                        )}
                        {vinDetails.vehicleType && (
                          <div className="bg-white p-2 rounded border border-blue-200">
                            <span className="text-blue-700 font-semibold block">نوع المركبة:</span>
                            <span className="font-bold text-gray-900">{vinDetails.vehicleType}</span>
                          </div>
                        )}
                        {vinDetails.manufacturer && (
                          <div className="col-span-2 bg-white p-2 rounded border border-blue-200">
                            <span className="text-blue-700 font-semibold block">المصنع:</span>
                            <span className="font-bold text-gray-900">{vinDetails.manufacturer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* بيانات العميل */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">👤 بيانات العميل</h3>
                  
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم العميل *</FormLabel>
                        <FormControl>
                          <Input placeholder="محمد أحمد" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clientPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الهاتف</FormLabel>
                          <FormControl>
                            <Input placeholder="0500000000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clientEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>البريد الإلكتروني</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="client@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* بيانات المركبة */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">🚗 بيانات المركبة</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="vehicleInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع/موديل/سنة المركبة *</FormLabel>
                        <FormControl>
                          <Input placeholder="Toyota Camry 2023" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vinNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الشاصي (VIN)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="1FTFW1E5XPKE49896" 
                            className="uppercase font-mono" 
                            maxLength={17}
                            {...field}
                            value={vinNumber || field.value}
                            onChange={(e) => {
                              field.onChange(e);
                              setVinNumber(e.target.value.toUpperCase());
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اللون</FormLabel>
                        <FormControl>
                          <Input placeholder="أبيض، أسود، فضي..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عداد الكيلومترات</FormLabel>
                        <FormControl>
                          <Input placeholder="50000" type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="engineNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          رقم المحرك (اختياري)
                          <span className="text-xs text-orange-600 font-normal">⚠️ يُدخل يدوياً من المحرك</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="أدخل رقم المحرك من لوحة المحرك" {...field} />
                        </FormControl>
                        <p className="text-xs text-gray-500 mt-1">💡 رقم المحرك موجود على لوحة معدنية على المحرك نفسه</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <Button 
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setLocation("/")}
                  >
                    إلغاء
                  </Button>
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full md:w-auto"
                    disabled={createInspection.isPending}
                  >
                    {createInspection.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                    ) : "Start Inspection"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
