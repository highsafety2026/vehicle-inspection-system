import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { VehicleMap } from '../components/VehicleMap';
import { DamageEntryDialog, type DamageData } from '../components/DamageEntryDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Eye, Trash2, Edit } from 'lucide-react';
import { VEHICLE_PARTS, DEFECT_TYPES, SEVERITY_LEVELS } from '@shared/constants';
import type { InspectionResponse, InspectionItem } from '@shared/schema';

export function InspectionPage() {
  const [, params] = useRoute('/inspection/:id');
  const [, setLocation] = useLocation();
  const inspectionId = params?.id ? parseInt(params.id) : null;

  const [damageDialogOpen, setDamageDialogOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedVehicleArea, setSelectedVehicleArea] = useState<string>('front');
  const [viewingDamage, setViewingDamage] = useState<InspectionItem | null>(null);

  const queryClient = useQueryClient();

  // Fetch inspection data
  const { data: inspection, isLoading } = useQuery<InspectionResponse>({
    queryKey: ['inspection', inspectionId],
    queryFn: async () => {
      const res = await fetch(`/api/inspections/${inspectionId}`);
      if (!res.ok) throw new Error('Failed to fetch inspection');
      return res.json();
    },
    enabled: !!inspectionId,
  });

  // Add damage mutation
  const addDamageMutation = useMutation({
    mutationFn: async (data: DamageData) => {
      console.log('=== START MUTATION ===');
      console.log('Data received:', data);
      
      // Create items and upload photos
      const results = [];
      
      for (const defectType of data.defectTypes) {
        console.log(`Processing defect: ${defectType}`);
        
        // Create item
        const itemRes = await fetch(`/api/inspections/${inspectionId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partName: data.partName,
            defectType,
            severity: data.severity,
            notes: data.notes,
            positionX: data.positionX,
            positionY: data.positionY,
            vehicleArea: data.vehicleArea,
          }),
        });

        if (!itemRes.ok) {
          console.error('Failed to create item');
          throw new Error('Failed to create item');
        }
        
        const item = await itemRes.json();
        console.log('Item created:', item.id);

        // Upload photos for this defect
        const photos = data.defectPhotos?.[defectType] || [];
        console.log(`Found ${photos.length} photos for ${defectType}`);
        
        for (const photo of photos) {
          console.log('Uploading photo:', photo.name, photo.size);
          const formData = new FormData();
          formData.append('photo', photo);

          const photoRes = await fetch(`/api/items/${item.id}/photos`, {
            method: 'POST',
            body: formData,
          });

          if (photoRes.ok) {
            console.log('✅ Photo uploaded!');
          } else {
            console.error('❌ Photo upload failed:', await photoRes.text());
          }
        }
        
        results.push(item);
      }

      console.log('=== END MUTATION ===');
      return results;
    },
    onSuccess: () => {
      console.log('Mutation success!');
      queryClient.invalidateQueries({ queryKey: ['inspection', inspectionId] });
      setDamageDialogOpen(false);
    },
    onError: (error) => {
      console.error('MUTATION ERROR:', error);
      alert(`خطأ: ${error.message}`);
    },
  });

  // Delete damage mutation
  const deleteDamageMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete item');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspection', inspectionId] });
      setViewingDamage(null);
    },
  });

  const handleAreaClick = (area: string, x: number, y: number, vehicleArea: string) => {
    setSelectedArea(area);
    setClickPosition({ x, y });
    setSelectedVehicleArea(vehicleArea);
    setDamageDialogOpen(true);
  };

  const handleDamageSubmit = (data: DamageData) => {
    console.log('🎯🎯🎯 handleDamageSubmit CALLED!');
    console.log('🚀 SUBMIT! Photos:', data.defectPhotos);
    console.log('🚀 Data:', data);
    addDamageMutation.mutate(data);
  };

  const handleViewReport = () => {
    setLocation(`/inspections/${inspectionId}/report`);
  };

  if (isLoading || !inspection) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const items = inspection.items || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold">
                  🚗 فحص السيارة
                </CardTitle>
                <p className="text-gray-600 mt-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                  {inspection.clientName} • {inspection.vehicleInfo}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleViewReport}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Eye className="w-5 h-5 ml-2" />
                  عرض التقرير
                </Button>
                <Badge
                  variant={inspection.status === 'completed' ? 'default' : 'secondary'}
                  className="text-lg px-4 py-2"
                >
                  {inspection.status === 'completed' ? '✅ مكتمل' : '⏳ جاري الفحص'}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Vehicle Map */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              🗺️ خريطة السيارة
              <span className="text-sm text-gray-500 mr-3">
                (اضغط على أي جزء لإضافة عطل)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VehicleMap
              items={items}
              onAreaClick={(area, x, y) => handleAreaClick(area, x, y, selectedVehicleArea)}
              onDamageClick={(item) => setViewingDamage(item)}
            />
          </CardContent>
        </Card>

        {/* Damages List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                📝 الأعطال المسجلة ({items.length})
              </CardTitle>
              <Button
                onClick={() => {
                  setSelectedArea('');
                  setClickPosition(null);
                  setDamageDialogOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 ml-2" />
                إضافة عطل يدوياً
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Quick Add Panel */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                ⚡ إضافة سريعة - أعطال شائعة
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {DEFECT_TYPES.slice(0, 8).map((defect) => (
                  <Button
                    key={defect.id}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 hover:bg-blue-100"
                    onClick={() => {
                      setSelectedArea('');
                      setClickPosition(null);
                      setDamageDialogOpen(true);
                    }}
                  >
                    <span className="text-lg">{defect.icon}</span>
                    <span className="text-xs">{defect.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-xl">لم يتم تسجيل أي أعطال بعد</p>
                <p className="mt-2">اضغط على أي جزء من السيارة لإضافة عطل</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const part = VEHICLE_PARTS.find((p) => p.id === item.partName);
                  const defect = DEFECT_TYPES.find((d) => d.id === item.defectType);
                  const severity = SEVERITY_LEVELS.find((s) => s.id === item.severity);

                  return (
                    <div
                      key={item.id}
                      className="border-2 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{defect?.icon}</span>
                            <h3 className="text-xl font-bold">{part?.label}</h3>
                            <Badge style={{ backgroundColor: defect?.color }}>
                              {defect?.label}
                            </Badge>
                            <Badge style={{ backgroundColor: severity?.color }}>
                              {severity?.label}
                            </Badge>
                          </div>
                          {item.notes && (
                            <p className="text-gray-700 mt-2">{item.notes}</p>
                          )}
                          {item.photos && item.photos.length > 0 && (
                            <div className="flex gap-2 mt-3">
                              {item.photos.map((photo) => (
                                <img
                                  key={photo.id}
                                  src={photo.imageUrl}
                                  alt="Damage photo"
                                  className="w-20 h-20 object-cover rounded border-2"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingDamage(item)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => deleteDamageMutation.mutate(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Damage Entry Dialog */}
      <DamageEntryDialog
        open={damageDialogOpen}
        onClose={() => setDamageDialogOpen(false)}
        preselectedPart={selectedArea}
        positionX={clickPosition?.x}
        positionY={clickPosition?.y}
        vehicleArea={selectedVehicleArea}
        onSubmit={handleDamageSubmit}
      />

      {/* Viewing Damage Dialog */}
      {viewingDamage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">تفاصيل العطل</h2>
            {/* Add detailed view here */}
            <Button onClick={() => setViewingDamage(null)}>إغلاق</Button>
          </div>
        </div>
      )}
    </div>
  );
}
