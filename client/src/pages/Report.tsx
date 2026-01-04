import { useInspection } from "@/hooks/use-inspections";
import { useRoute } from "wouter";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Download, Share2, X, ZoomIn, Mail, Check } from "lucide-react";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef, useState } from "react";
import logoImg from "/assets/logo.png";
import { VEHICLE_PARTS, DEFECT_TYPES, SEVERITY_LEVELS } from "@shared/constants";
import { QRCodeSVG } from "qrcode.react";
import SignatureCanvas from "react-signature-canvas";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Report() {
  const [, params] = useRoute("/inspections/:id/report");
  const id = parseInt(params?.id || "0");
  const { data: inspection, isLoading } = useInspection(id);
  const reportRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);
  const { toast } = useToast();

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    
    toast({
      title: "⏳ جاري إنشاء التقرير",
      description: "الرجاء الانتظار...",
    });
    
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width / 2, canvas.height / 2],
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
    
    // Generate filename: hs-{inspectionId}-{date}
    const date = format(new Date(), 'yyyy-MM-dd');
    pdf.save(`hs-${inspection?.id || id}-${date}.pdf`);
    
    toast({
      title: "✅ تم التحميل",
      description: "تم تحميل التقرير بنجاح",
    });
  };

  const shareReport = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'تقرير فحص سيارة',
        url: url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      alert("تم نسخ رابط التقرير");
    }
  };

  const openDefectPhotos = (item: any) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const openPhotoViewer = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
  };

  const saveSignature = async () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const signatureData = signatureRef.current.toDataURL();
      
      try {
        await fetch(`/api/inspections/${id}/signature`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signature: signatureData }),
        });
        
        toast({
          title: "✅ تم الحفظ",
          description: "تم حفظ توقيعك بنجاح",
        });
        
        setShowSignatureDialog(false);
        window.location.reload(); // Refresh to show signature
      } catch (error) {
        toast({
          title: "❌ خطأ",
          description: "فشل في حفظ التوقيع",
          variant: "destructive",
        });
      }
    }
  };

  const sendEmail = async () => {
    if (!inspection?.clientEmail) {
      toast({
        title: "⚠️ تحذير",
        description: "لا يوجد بريد إلكتروني للعميل",
        variant: "destructive",
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await fetch(`/api/inspections/${id}/send-email`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: "✅ تم الإرسال",
          description: `تم إرسال التقرير إلى ${inspection.clientEmail}`,
        });
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      toast({
        title: "❌ خطأ",
        description: "فشل في إرسال الإيميل",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!inspection) return <div className="p-8 text-center">التقرير غير موجود</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4" dir="rtl">
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden flex flex-wrap justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm max-w-4xl mx-auto gap-4">
        <div className="flex gap-2">
          <Link href={`/inspections/${id}`}>
            <Button variant="outline" size="sm" className="font-sans">
              <ArrowLeft className="w-4 h-4 ml-2" /> العودة للفحص
            </Button>
          </Link>
        </div>
        <div className="flex gap-2">
          {!inspection.clientSignature && (
            <Button onClick={() => setShowSignatureDialog(true)} variant="outline" size="sm" className="bg-purple-50 text-purple-700 border-purple-200">
              ✍️ توقيع العميل
            </Button>
          )}
          {inspection.clientEmail && (
            <Button onClick={sendEmail} disabled={isSendingEmail} variant="outline" size="sm" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              {isSendingEmail ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Mail className="w-4 h-4 ml-2" />}
              إرسال بالإيميل
            </Button>
          )}
          <Button onClick={shareReport} variant="outline" size="sm" className="bg-blue-50 text-blue-700 border-blue-200">
            <Share2 className="w-4 h-4 ml-2" /> مشاركة الرابط
          </Button>
          <Button onClick={downloadPDF} variant="outline" size="sm" className="bg-green-50 text-green-700 border-green-200">
            <Download className="w-4 h-4 ml-2" /> تحميل PDF
          </Button>
          <Button onClick={() => window.print()} size="sm">
            <Printer className="w-4 h-4 ml-2" /> طباعة
          </Button>
        </div>
      </div>

      {/* Actual Report Content */}
      <div ref={reportRef} className="bg-white text-black shadow-lg max-w-5xl mx-auto print:shadow-none">
        {/* Cover Page */}
        <div className="min-h-screen flex flex-col justify-center items-center p-16 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white print:break-after-page">
          <div className="text-center mb-12">
            <img src={logoImg} alt="Logo" className="w-40 h-40 object-contain mx-auto mb-6 drop-shadow-2xl" />
            <h1 className="text-6xl font-black mb-4 tracking-tight">هاي سيفيتي</h1>
            <div className="h-1 w-32 bg-yellow-400 mx-auto mb-6"></div>
            <p className="text-xl font-bold text-yellow-400 tracking-[0.3em] uppercase mb-2">HIGH SAFETY</p>
            <p className="text-lg text-blue-200">Vehicle Inspection Center</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl p-12 mb-12 w-full max-w-2xl">
            <h2 className="text-4xl font-black mb-8 text-center" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>تقرير فحص المركبة</h2>
            
            <div className="space-y-6 text-lg">
              <div className="flex justify-between border-b border-white/20 pb-4">
                <span className="text-blue-200">التاريخ:</span>
                <span className="font-bold">{format(new Date(inspection.createdAt || new Date()), "dd MMMM yyyy")}</span>
              </div>
              
              <div className="flex justify-between border-b border-white/20 pb-4">
                <span className="text-blue-200">العميل:</span>
                <span className="font-bold" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>{inspection.clientName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-blue-200">المركبة:</span>
                <span className="font-bold" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>{inspection.vehicleInfo}</span>
              </div>
            </div>
          </div>

          <div className="text-center text-blue-200 text-sm space-y-3">
            <p className="text-base font-semibold text-yellow-300">نقدم خدمات فحص المركبات بأعلى معايير الجودة والدقة</p>
            <div className="h-px w-48 bg-blue-400/30 mx-auto"></div>
            <p className="text-xs">هذا التقرير صادر من مركز هاي سيفيتي لفحص المركبات</p>
          </div>
        </div>

        {/* Main Content Pages */}
        <div className="p-10">
          {/* Statistics Dashboard */}
          {inspection.items && inspection.items.length > 0 && (
            <div className="mb-12 print:break-inside-avoid">
              <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <span className="w-2 h-10 bg-blue-600 rounded"></span>
                <span style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>ملخص الفحص</span>
              </h2>
              
              <div className="grid grid-cols-4 gap-6 mb-8">
                {/* Total Defects */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200 shadow-sm">
                  <div className="text-4xl mb-2">📋</div>
                  <div className="text-3xl font-black text-blue-900">{inspection.items.length}</div>
                  <div className="text-sm font-bold text-blue-700" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>إجمالي الأعطال</div>
                </div>

                {/* Critical */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border-2 border-red-200 shadow-sm">
                  <div className="text-4xl mb-2">🔴</div>
                  <div className="text-3xl font-black text-red-900">
                    {inspection.items.filter((i: any) => i.severity === 'severe').length}
                  </div>
                  <div className="text-sm font-bold text-red-700" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>أعطال شديدة</div>
                </div>

                {/* Medium */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border-2 border-orange-200 shadow-sm">
                  <div className="text-4xl mb-2">🟠</div>
                  <div className="text-3xl font-black text-orange-900">
                    {inspection.items.filter((i: any) => i.severity === 'medium').length}
                  </div>
                  <div className="text-sm font-bold text-orange-700" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>أعطال متوسطة</div>
                </div>

                {/* Light */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200 shadow-sm">
                  <div className="text-4xl mb-2">🟢</div>
                  <div className="text-3xl font-black text-green-900">
                    {inspection.items.filter((i: any) => i.severity === 'light').length}
                  </div>
                  <div className="text-sm font-bold text-green-700" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>أعطال خفيفة</div>
                </div>
              </div>

              {/* Photos Count */}
              {inspection.items.some((item: any) => item.photos && item.photos.length > 0) && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">📸</div>
                      <div>
                        <div className="text-3xl font-black text-purple-900">
                          {inspection.items.reduce((acc: number, item: any) => acc + (item.photos?.length || 0), 0)}
                        </div>
                        <div className="text-sm font-bold text-purple-700" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>إجمالي الصور الموثقة</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vehicle Info Card */}
          <div className="mb-12 print:break-inside-avoid">
            <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-2 h-10 bg-blue-600 rounded"></span>
              <span style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>معلومات المركبة</span>
            </h2>
            
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-8 rounded-xl border-2 border-gray-200 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Client Name</p>
                  <p className="text-lg font-black text-gray-900" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>{inspection.clientName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Vehicle</p>
                  <p className="text-lg font-black text-gray-900" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>{inspection.vehicleInfo}</p>
                </div>
                {inspection.mileage && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase">الكيلومترات | Mileage</p>
                    <p className="text-lg font-black text-blue-600" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
                      {inspection.mileage} كم
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Inspection Date</p>
                  <p className="text-lg font-black text-gray-900">{format(new Date(inspection.createdAt || new Date()), "dd/MM/yyyy")}</p>
                </div>
              </div>
            </div>
          </div>

        {/* Vehicle Map Section - Interactive */}
        {inspection.items && inspection.items.length > 0 && (
          <div className="mb-12 print:break-inside-avoid print:break-after-page">
            <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-2 h-10 bg-blue-600 rounded"></span>
              <span style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>خريطة توزيع الأعطال</span>
            </h2>
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl border-2 border-slate-200 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Professional Car Diagram with Full Details */}
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-6 rounded-lg shadow-xl border-2 border-slate-300">
                  <svg viewBox="0 0 600 400" className="w-full drop-shadow-md">
                    <defs>
                      <linearGradient id="carBody" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#e0e7ff', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#c7d2fe', stopOpacity: 1}} />
                      </linearGradient>
                      <linearGradient id="carRoof" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#dbeafe', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#93c5fd', stopOpacity: 1}} />
                      </linearGradient>
                      <linearGradient id="engineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#fee2e2', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#fecaca', stopOpacity: 1}} />
                      </linearGradient>
                      <radialGradient id="tireGrad">
                        <stop offset="0%" style={{stopColor: '#1f2937', stopOpacity: 1}} />
                        <stop offset="70%" style={{stopColor: '#374151', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#1f2937', stopOpacity: 1}} />
                      </radialGradient>
                      <radialGradient id="lightGrad">
                        <stop offset="0%" style={{stopColor: '#fef9c3', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#fde047', stopOpacity: 1}} />
                      </radialGradient>
                    </defs>
                    
                    {/* Car Main Body */}
                    <path d="M 150 130 L 450 130 L 450 260 L 150 260 Z" fill="url(#carBody)" stroke="#1e3a8a" strokeWidth="3"/>
                    
                    {/* Windshield/Roof */}
                    <path d="M 200 130 L 240 90 L 360 90 L 400 130 Z" fill="url(#carRoof)" stroke="#1e3a8a" strokeWidth="3"/>
                    <path d="M 240 90 L 360 90 L 360 130 L 240 130 Z" fill="#bfdbfe" fillOpacity="0.7" stroke="#1e3a8a" strokeWidth="2"/>
                    
                    {/* Engine Under Hood */}
                    <rect x="130" y="170" width="80" height="50" rx="5" fill="url(#engineGrad)" stroke="#dc2626" strokeWidth="2.5"/>
                    <text x="170" y="185" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#7f1d1d">⚙️</text>
                    <text x="170" y="200" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#7f1d1d">محرك</text>
                    <text x="170" y="213" textAnchor="middle" fontSize="8" fill="#991b1b">Engine</text>
                    
                    {/* Front Bumper */}
                    <rect x="105" y="150" width="30" height="80" rx="8" fill="#cbd5e1" stroke="#1e3a8a" strokeWidth="2.5"/>
                    <text x="120" y="195" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e3a8a">أمام</text>
                    
                    {/* Rear Bumper */}
                    <rect x="465" y="150" width="30" height="80" rx="8" fill="#cbd5e1" stroke="#1e3a8a" strokeWidth="2.5"/>
                    <text x="480" y="195" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e3a8a">خلف</text>
                    
                    {/* Front Headlights */}
                    <ellipse cx="122" cy="145" rx="14" ry="18" fill="url(#lightGrad)" stroke="#ca8a04" strokeWidth="2.5"/>
                    <text x="122" y="150" textAnchor="middle" fontSize="16">💡</text>
                    <ellipse cx="122" cy="235" rx="14" ry="18" fill="url(#lightGrad)" stroke="#ca8a04" strokeWidth="2.5"/>
                    <text x="122" y="240" textAnchor="middle" fontSize="16">💡</text>
                    
                    {/* Rear Lights */}
                    <ellipse cx="478" cy="145" rx="12" ry="16" fill="#fca5a5" stroke="#dc2626" strokeWidth="2.5"/>
                    <circle cx="478" cy="145" r="5" fill="#fee2e2"/>
                    <ellipse cx="478" cy="235" rx="12" ry="16" fill="#fca5a5" stroke="#dc2626" strokeWidth="2.5"/>
                    <circle cx="478" cy="235" r="5" fill="#fee2e2"/>
                    
                    {/* Left Doors */}
                    <rect x="170" y="135" width="55" height="120" rx="5" fill="#e0f2fe" stroke="#0369a1" strokeWidth="2.5"/>
                    <line x1="197" y1="135" x2="197" y2="255" stroke="#0369a1" strokeWidth="2" strokeDasharray="4,4"/>
                    <circle cx="210" cy="195" r="4" fill="#0369a1"/>
                    <text x="197" y="200" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0369a1" transform="rotate(-90 197 200)">باب يسار</text>
                    
                    <rect x="235" y="135" width="55" height="120" rx="5" fill="#e0f2fe" stroke="#0369a1" strokeWidth="2.5"/>
                    <line x1="262" y1="135" x2="262" y2="255" stroke="#0369a1" strokeWidth="2" strokeDasharray="4,4"/>
                    <circle cx="275" cy="195" r="4" fill="#0369a1"/>
                    <text x="262" y="200" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0369a1" transform="rotate(-90 262 200)">باب يسار</text>
                    
                    {/* Right Doors */}
                    <rect x="310" y="135" width="55" height="120" rx="5" fill="#fef3c7" stroke="#d97706" strokeWidth="2.5"/>
                    <line x1="337" y1="135" x2="337" y2="255" stroke="#d97706" strokeWidth="2" strokeDasharray="4,4"/>
                    <circle cx="325" cy="195" r="4" fill="#d97706"/>
                    <text x="337" y="200" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#d97706" transform="rotate(90 337 200)">باب يمين</text>
                    
                    <rect x="375" y="135" width="55" height="120" rx="5" fill="#fef3c7" stroke="#d97706" strokeWidth="2.5"/>
                    <line x1="402" y1="135" x2="402" y2="255" stroke="#d97706" strokeWidth="2" strokeDasharray="4,4"/>
                    <circle cx="390" cy="195" r="4" fill="#d97706"/>
                    <text x="402" y="200" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#d97706" transform="rotate(90 402 200)">باب يمين</text>
                    
                    {/* Hood */}
                    <rect x="155" y="175" width="65" height="35" rx="4" fill="#a5b4fc" stroke="#4338ca" strokeWidth="2"/>
                    <text x="187" y="196" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#312e81">كبوت</text>
                    
                    {/* Trunk */}
                    <rect x="380" y="175" width="65" height="35" rx="4" fill="#a5b4fc" stroke="#4338ca" strokeWidth="2"/>
                    <text x="412" y="196" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#312e81">شنطة</text>
                    
                    {/* Roof Label */}
                    <rect x="270" y="95" width="60" height="22" rx="6" fill="#60a5fa" stroke="#1e40af" strokeWidth="2.5"/>
                    <text x="300" y="110" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">السقف</text>
                    
                    {/* Front Left Wheel/Tire */}
                    <g>
                      <circle cx="180" cy="270" r="28" fill="url(#tireGrad)" stroke="#111827" strokeWidth="3"/>
                      <circle cx="180" cy="270" r="15" fill="#6b7280" stroke="#374151" strokeWidth="2"/>
                      <circle cx="180" cy="270" r="8" fill="#9ca3af"/>
                      <text x="180" y="310" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#374151">كوتش أمامي</text>
                    </g>
                    
                    {/* Front Right Wheel/Tire */}
                    <g>
                      <circle cx="180" cy="120" r="28" fill="url(#tireGrad)" stroke="#111827" strokeWidth="3"/>
                      <circle cx="180" cy="120" r="15" fill="#6b7280" stroke="#374151" strokeWidth="2"/>
                      <circle cx="180" cy="120" r="8" fill="#9ca3af"/>
                      <text x="180" y="105" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#374151">كوتش أمامي</text>
                    </g>
                    
                    {/* Rear Left Wheel/Tire */}
                    <g>
                      <circle cx="420" cy="270" r="28" fill="url(#tireGrad)" stroke="#111827" strokeWidth="3"/>
                      <circle cx="420" cy="270" r="15" fill="#6b7280" stroke="#374151" strokeWidth="2"/>
                      <circle cx="420" cy="270" r="8" fill="#9ca3af"/>
                      <text x="420" y="310" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#374151">كوتش خلفي</text>
                    </g>
                    
                    {/* Rear Right Wheel/Tire */}
                    <g>
                      <circle cx="420" cy="120" r="28" fill="url(#tireGrad)" stroke="#111827" strokeWidth="3"/>
                      <circle cx="420" cy="120" r="15" fill="#6b7280" stroke="#374151" strokeWidth="2"/>
                      <circle cx="420" cy="120" r="8" fill="#9ca3af"/>
                      <text x="420" y="105" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#374151">كوتش خلفي</text>
                    </g>
                    
                    {/* Damage Markers with Enhanced Positioning */}
                    {inspection.items.map((item: any, idx: number) => {
                      const defect = DEFECT_TYPES.find(d => d.id === item.defectType);
                      const severity = SEVERITY_LEVELS.find(s => s.id === item.severity);
                      let x = 300, y = 195;
                      
                      // Enhanced position mapping to new diagram
                      if (item.vehicleArea === 'front') {
                        // Position near front bumper/engine
                        x = 120;
                        y = 165 + (idx * 20);
                      }
                      else if (item.vehicleArea === 'back') {
                        // Position near rear bumper
                        x = 480;
                        y = 165 + (idx * 20);
                      }
                      else if (item.vehicleArea === 'left') {
                        // Position on left doors
                        if (item.partName?.includes('front')) {
                          x = 197;
                          y = 160 + (idx * 22);
                        } else {
                          x = 262;
                          y = 160 + (idx * 22);
                        }
                      }
                      else if (item.vehicleArea === 'right') {
                        // Position on right doors
                        if (item.partName?.includes('front')) {
                          x = 337;
                          y = 160 + (idx * 22);
                        } else {
                          x = 402;
                          y = 160 + (idx * 22);
                        }
                      }
                      else if (item.vehicleArea === 'roof') {
                        x = 280 + (idx * 18);
                        y = 107;
                      }
                      
                      // Special positions for specific parts
                      if (item.partName?.includes('hood') || item.partName?.includes('كبوت')) {
                        x = 187;
                        y = 193;
                      }
                      else if (item.partName?.includes('trunk') || item.partName?.includes('شنطة')) {
                        x = 412;
                        y = 193;
                      }
                      else if (item.partName?.includes('engine') || item.partName?.includes('محرك')) {
                        x = 170;
                        y = 195;
                      }
                      else if (item.partName?.includes('wheel') || item.partName?.includes('tire') || item.partName?.includes('كوتش')) {
                        // Position near wheels
                        if (item.partName?.includes('front_left')) { x = 180; y = 270; }
                        else if (item.partName?.includes('front_right')) { x = 180; y = 120; }
                        else if (item.partName?.includes('rear_left')) { x = 420; y = 270; }
                        else if (item.partName?.includes('rear_right')) { x = 420; y = 120; }
                      }
                      else if (item.partName?.includes('headlight') || item.partName?.includes('لايت') || item.partName?.includes('ضوء')) {
                        if (item.partName?.includes('front')) {
                          x = 122;
                          y = 190;
                        } else {
                          x = 478;
                          y = 190;
                        }
                      }
                      
                      return (
                        <g 
                          key={item.id} 
                          className="cursor-pointer hover:scale-110 transition-transform print:cursor-default"
                          onClick={() => setSelectedItem(item)}
                        >
                          {/* Glow effect */}
                          <circle cx={x} cy={y} r="14" fill={severity?.color || '#ef4444'} opacity="0.3"/>
                          
                          {/* Main marker with shadow */}
                          <circle cx={x} cy={y} r="11" fill={severity?.color || '#ef4444'} stroke="white" strokeWidth="3.5"/>
                          
                          {/* Icon */}
                          <text x={x} y={y + 5} textAnchor="middle" fontSize="16" fontWeight="bold">{defect?.icon}</text>
                          
                          {/* Number badge */}
                          <circle cx={x + 10} cy={y - 10} r="7" fill="white" stroke={severity?.color || '#ef4444'} strokeWidth="2.5"/>
                          <text x={x + 10} y={y - 6} textAnchor="middle" fontSize="9" fontWeight="bold" fill={severity?.color || '#ef4444'}>{idx + 1}</text>
                        </g>
                      );
                    })}
                  </svg>
                  <div className="mt-3 flex items-center justify-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <span className="text-gray-600">خفيف</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-gray-600">متوسط</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-600"></div>
                      <span className="text-gray-600">شديد</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2 font-semibold">💡 اضغط على العلامات لعرض التفاصيل الكاملة</p>
                </div>

                {/* Defects List with Click Info */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-slate-200 overflow-auto max-h-[350px]">
                  <h4 className="font-black text-gray-900 mb-4 text-lg" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>قائمة الأعطال المسجلة ({inspection.items.length})</h4>
                  <div className="space-y-3">
                    {inspection.items.map((item: any) => {
                      const part = VEHICLE_PARTS.find(p => p.id === item.partName);
                      const defect = DEFECT_TYPES.find(d => d.id === item.defectType);
                      const severity = SEVERITY_LEVELS.find(s => s.id === item.severity);
                      
                      return (
                        <div 
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                            selectedItem?.id === item.id 
                              ? 'border-blue-600 bg-blue-50 shadow-md' 
                              : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center border-2" style={{ borderColor: DEFECT_TYPES.find(d => d.id === item.defectType)?.color }}>
                              {defect?.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-sm text-gray-900 truncate" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>{part?.label}</p>
                              <p className="text-xs text-gray-600 truncate" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>{defect?.label}</p>
                            </div>
                            <span 
                              className="px-3 py-1.5 rounded-full text-xs font-black flex-shrink-0"
                              style={{ backgroundColor: severity?.color, color: 'white', fontFamily: 'Segoe UI, Tahoma, sans-serif' }}
                            >
                              {severity?.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Selected Item Details */}
              {selectedItem && (
                <div className="mt-6 bg-white p-6 rounded-lg border-2 border-blue-400 shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-xl text-blue-900">تفاصيل العطل</h4>
                    <button 
                      onClick={() => setSelectedItem(null)}
                      className="text-gray-500 hover:text-gray-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">الجزء</p>
                      <p className="font-bold" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
                        {VEHICLE_PARTS.find(p => p.id === selectedItem.partName)?.label}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">نوع العطل</p>
                      <p className="font-bold" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
                        {DEFECT_TYPES.find(d => d.id === selectedItem.defectType)?.label}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">الدرجة</p>
                      <p className="font-bold" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
                        {SEVERITY_LEVELS.find(s => s.id === selectedItem.severity)?.label}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">المنطقة</p>
                      <p className="font-bold" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
                        {selectedItem.vehicleArea === 'front' ? 'أمام' :
                         selectedItem.vehicleArea === 'back' ? 'خلف' :
                         selectedItem.vehicleArea === 'left' ? 'يسار' :
                         selectedItem.vehicleArea === 'right' ? 'يمين' : 'سقف'}
                      </p>
                    </div>
                  </div>

                  {selectedItem.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">ملاحظات</p>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
                        {selectedItem.notes}
                      </p>
                    </div>
                  )}

                  {/* Photos for Selected Item */}
                  {selectedItem.photos && selectedItem.photos.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">الصور ({selectedItem.photos.length}) - اضغط للتكبير 🔍</p>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedItem.photos.map((photo: any) => (
                          <img 
                            key={photo.id}
                            src={photo.imageUrl} 
                            alt="Damage" 
                            onClick={() => openPhotoViewer(photo.imageUrl)}
                            className="w-full h-24 object-cover rounded border-2 border-gray-200 cursor-pointer hover:border-blue-500 transition-all hover:scale-105"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Defects Table */}
        <div className="mb-12 print:break-inside-avoid">
          <h2 className="text-3xl font-black text-gray-900 mb-4 flex items-center gap-3">
            <span className="w-2 h-10 bg-blue-600 rounded"></span>
            <span style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>جدول الأعطال التفصيلي</span>
          </h2>
          <p className="text-sm text-blue-600 mb-6 print:hidden flex items-center gap-2" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
            <span>💡</span>
            <span className="font-bold">اضغط على أي عطل لعرض صوره المرفقة</span>
          </p>
          <div className="overflow-hidden rounded-xl border-2 border-slate-200 shadow-lg">
            <table className="w-full border-collapse" style={{ direction: 'rtl' }}>
              <thead>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                  <th className="text-right py-5 px-6 font-black text-sm" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>#</th>
                  <th className="text-right py-5 px-6 font-black text-sm" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>الجزء</th>
                  <th className="text-right py-5 px-6 font-black text-sm" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>نوع العطل</th>
                  <th className="text-right py-5 px-6 font-black text-sm" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>الدرجة</th>
                  <th className="text-right py-5 px-6 font-black text-sm" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>الملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inspection.items && inspection.items.length > 0 ? (
                  inspection.items.map((item: any, idx: number) => {
                    const part = VEHICLE_PARTS.find(p => p.id === item.partName);
                    const defect = DEFECT_TYPES.find(d => d.id === item.defectType);
                    const severity = SEVERITY_LEVELS.find(s => s.id === item.severity);
                    
                    return (
                      <tr 
                        key={item.id} 
                        onClick={() => openDefectPhotos(item)}
                        className={`transition-all cursor-pointer print:cursor-default ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-100 hover:shadow-md`}
                      >
                        <td className="py-5 px-6 font-black text-gray-400 text-sm">{idx + 1}</td>
                        <td className="py-5 px-6 font-black text-gray-900" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
                          {part?.label || item.partName}
                        </td>
                        <td className="py-5 px-6" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{defect?.icon}</span>
                            <span className="font-bold text-gray-700">{defect?.label || item.defectType}</span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span 
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black"
                            style={{ 
                              backgroundColor: severity?.color || '#fbbf24',
                              color: 'white',
                              fontFamily: 'Segoe UI, Tahoma, sans-serif'
                            }}
                          >
                            {severity?.label || item.severity}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-gray-600 text-sm leading-relaxed max-w-xs" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
                          {item.notes || "—"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-400 text-lg" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
                      ✅ لا توجد أعطال مسجلة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Photos Grid */}
        {inspection.items?.some((item: any) => item.photos && item.photos.length > 0) && (
          <div className="break-inside-avoid mb-12 print:break-before-page">
            <h2 className="text-3xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-2 h-10 bg-blue-600 rounded"></span>
              <span style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>الصور الموثقة</span>
            </h2>
            <p className="text-sm text-blue-600 mb-6 print:hidden flex items-center gap-2" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
              <span>💡</span>
              <span className="font-bold">اضغط على الصورة لتكبيرها أو على معلومات العطل لعرض جميع صوره</span>
            </p>
            <div className="grid grid-cols-2 gap-6">
              {inspection.items.flatMap((item: any) => 
                item.photos?.map((photo: any, photoIdx: number) => {
                  const part = VEHICLE_PARTS.find(p => p.id === item.partName);
                  const defect = DEFECT_TYPES.find(d => d.id === item.defectType);
                  const severity = SEVERITY_LEVELS.find(s => s.id === item.severity);
                  
                  return (
                    <div key={photo.id} className="group border-2 border-slate-200 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all break-inside-avoid bg-white">
                      <div 
                        onClick={() => openPhotoViewer(photo.imageUrl)}
                        className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden relative cursor-pointer print:cursor-default"
                      >
                        <img src={photo.imageUrl} alt="Defect" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                          <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-10 h-10 drop-shadow-lg" />
                        </div>
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-black text-gray-700">
                          صورة {photoIdx + 1}
                        </div>
                      </div>
                      <div 
                        onClick={() => openDefectPhotos(item)}
                        className="p-5 bg-gradient-to-br from-white to-slate-50 cursor-pointer print:cursor-default hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-black text-base text-gray-900 mb-1" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
                              {part?.label || item.partName}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-2" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
                              <span className="text-lg">{defect?.icon}</span>
                              {defect?.label}
                            </p>
                          </div>
                          <span 
                            className="px-3 py-1.5 rounded-full text-xs font-black flex-shrink-0"
                            style={{ 
                              backgroundColor: severity?.color,
                              color: 'white',
                              fontFamily: 'Segoe UI, Tahoma, sans-serif'
                            }}
                          >
                            {severity?.label}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t-2 border-gray-200">
          <div className="flex justify-between items-start gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <img src={logoImg} alt="Logo" className="w-16 h-16 object-contain" />
                <div>
                  <p className="font-black text-xl text-gray-900">هاي سيفيتي</p>
                  <p className="text-xs text-gray-500 uppercase font-bold">High Safety Inspection Center</p>
                </div>
              </div>
              <p className="text-sm text-blue-700 font-semibold mb-3 italic">نقدم خدمات فحص المركبات بأعلى معايير الجودة والدقة</p>
              <div className="text-sm text-gray-700 space-y-1.5">
                <p className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">📍</span>
                  <span className="leading-relaxed" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
                    CITY PLAZA Al darari - near طريق المدينة الجامعية<br/>
                    الصناعية - 13 - الشارقة، الإمارات العربية المتحدة
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">📞</span>
                  <span dir="ltr" className="font-semibold">+971 54 220 0600</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-red-600 font-bold">📧</span>
                  <span className="font-semibold">highsafety2021@gmail.com</span>
                </p>
              </div>
            </div>

            {/* QR Code */}
            <div className="text-center">
              <QRCodeSVG 
                value={window.location.href}
                size={100}
                level="M"
                includeMargin={true}
              />
              <p className="text-xs text-gray-500 mt-2">امسح لعرض التقرير</p>
            </div>

            {/* Signature or Date */}
            {inspection.clientSignature ? (
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">توقيع العميل</p>
                <img 
                  src={inspection.clientSignature} 
                  alt="Signature" 
                  className="w-32 h-20 object-contain border border-gray-300 rounded bg-white"
                />
                <p className="text-xs text-gray-400 mt-1">{inspection.clientName}</p>
              </div>
            ) : (
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">تاريخ إصدار التقرير</p>
                <p className="font-black text-lg text-gray-900">{format(new Date(), "dd/MM/yyyy")}</p>
                <p className="text-xs text-gray-500 mt-1 font-mono">{format(new Date(), "HH:mm")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Signature Dialog */}
      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
              ✍️ توقيع العميل
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  width: 400,
                  height: 200,
                  className: 'signature-canvas'
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => signatureRef.current?.clear()}
                variant="outline"
                className="flex-1"
              >
                مسح
              </Button>
              <Button
                onClick={saveSignature}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Check className="w-4 h-4 ml-2" />
                حفظ التوقيع
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photos Gallery Modal - Shows photos for selected defect */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-900" dir="rtl">
          {selectedItem && (
            <>
              <DialogHeader className="border-b border-slate-700 pb-4">
                <DialogTitle className="text-2xl font-black flex items-center gap-3 text-white" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
                  <span className="text-4xl">
                    {DEFECT_TYPES.find(d => d.id === selectedItem.defectType)?.icon}
                  </span>
                  <div className="flex-1">
                    <div className="text-2xl" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
                      {VEHICLE_PARTS.find(p => p.id === selectedItem.partName)?.label}
                    </div>
                    <div className="text-base font-normal text-slate-300 mt-1" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
                      {DEFECT_TYPES.find(d => d.id === selectedItem.defectType)?.label}
                      <span className="mx-2">•</span>
                      <span 
                        className="inline-block px-3 py-1 rounded-full text-xs font-black"
                        style={{ 
                          backgroundColor: SEVERITY_LEVELS.find(s => s.id === selectedItem.severity)?.color,
                          fontFamily: 'Segoe UI, Tahoma, sans-serif'
                        }}
                      >
                        {SEVERITY_LEVELS.find(s => s.id === selectedItem.severity)?.label}
                      </span>
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="mt-6">
                {selectedItem.photos && selectedItem.photos.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-white">
                        <span className="text-3xl">📸</span>
                        <h3 className="text-xl font-black" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
                          الصور المرفقة ({selectedItem.photos.length})
                        </h3>
                      </div>
                      {selectedItem.notes && (
                        <div className="text-sm text-slate-400 max-w-md text-left" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
                          💬 {selectedItem.notes}
                        </div>
                      )}
                    </div>

                    {/* Photos Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedItem.photos.map((photo: any, idx: number) => (
                        <div 
                          key={photo.id}
                          onClick={() => openPhotoViewer(photo.imageUrl)}
                          className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-slate-700 hover:border-blue-500 transition-all"
                        >
                          <img 
                            src={photo.imageUrl} 
                            alt={`صورة ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                            <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-12 h-12 drop-shadow-2xl" />
                          </div>
                          <div className="absolute top-3 right-3 bg-black/80 text-white px-3 py-1.5 rounded-full text-xs font-black backdrop-blur-sm">
                            {idx + 1} / {selectedItem.photos.length}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16 text-slate-400">
                    <div className="text-6xl mb-4">📷</div>
                    <p className="text-lg font-bold" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
                      لا توجد صور مرفقة لهذا العطل
                    </p>
                    <p className="text-sm mt-2" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
                      لم يتم تصوير هذا العطل أثناء الفحص
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Viewer Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-6xl p-0 bg-black" dir="rtl">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 left-4 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          {selectedPhoto && (
            <div className="relative">
              <img 
                src={selectedPhoto} 
                alt="صورة مكبرة" 
                className="w-full h-auto max-h-[90vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

