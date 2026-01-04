import { useInspection, useDeleteItem, useUpdateInspectionStatus, useCreateItem } from "@/hooks/use-inspections";
import { Layout } from "@/components/Layout";
import { VehicleMap } from "@/components/VehicleMap";
import { DamageEntryDialog, DamageData } from "@/components/DamageEntryDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Trash2, Printer, Check, AlertTriangle, Image as ImageIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function InspectionDetail() {
  const [, params] = useRoute("/inspections/:id");
  const id = parseInt(params?.id || "0");
  const { data: inspection, isLoading } = useInspection(id);
  const deleteItem = useDeleteItem();
  const updateStatus = useUpdateInspectionStatus();
  const createItem = useCreateItem();

  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedX, setSelectedX] = useState<number>(0);
  const [selectedY, setSelectedY] = useState<number>(0);
  const [selectedArea, setSelectedArea] = useState<string>('front');

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!inspection) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <h2 className="text-2xl font-bold">Inspection Not Found</h2>
          <Link href="/"><Button className="mt-4">Back to Dashboard</Button></Link>
        </div>
      </Layout>
    );
  }

  const handlePartClick = (partName: string, x: number, y: number) => {
    if (inspection.status === 'completed') return;
    setSelectedPart(partName);
    setSelectedX(x);
    setSelectedY(y);
    // Determine vehicle area from part name
    if (partName.includes('front')) setSelectedArea('front');
    else if (partName.includes('rear') || partName.includes('back')) setSelectedArea('back');
    else if (partName.includes('left')) setSelectedArea('left');
    else if (partName.includes('right')) setSelectedArea('right');
    else if (partName.includes('roof')) setSelectedArea('roof');
    else setSelectedArea('front'); // default
    setIsDialogOpen(true);
  };

  const handleSubmitDefect = async (data: DamageData) => {
    try {
      // Create separate item for each defect type
      const promises = data.defectTypes.map(async (defectType) => {
        await createItem.mutateAsync({
          inspectionId: id,
          partName: data.partName,
          defectType,
          severity: data.severity,
          notes: data.notes,
          positionX: data.positionX,
          positionY: data.positionY,
          vehicleArea: data.vehicleArea,
        });
      });
      
      await Promise.all(promises);
      setIsDialogOpen(false);
      setSelectedPart(null);
    } catch (error) {
      console.error("Error adding defect:", error);
    }
  };

  const handleDelete = async (itemId: number) => {
    if (confirm("Delete this defect?")) {
      await deleteItem.mutateAsync({ id: itemId, inspectionId: id });
    }
  };

  const handleComplete = async () => {
    await updateStatus.mutateAsync({ 
      id, 
      status: inspection.status === 'in_progress' ? 'completed' : 'in_progress' 
    });
  };

  // Prepare defects for map visualization
  const mapDefects = inspection.items?.map((item: any) => ({
    partName: item.partName,
    defectType: item.defectType,
    severity: item.severity as "low" | "medium" | "high",
  })) || [];

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)]">
        {/* Left: Map & Controls */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center mb-1">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Link>
              <h1 className="text-2xl font-display font-bold">{inspection.vehicleInfo}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span>{inspection.clientName}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link href={`/inspections/${id}/report`}>
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-2" /> Report
                </Button>
              </Link>
              <Button 
                variant={inspection.status === 'completed' ? "secondary" : "default"}
                size="sm"
                onClick={handleComplete}
                disabled={updateStatus.isPending}
              >
                {updateStatus.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  inspection.status === 'completed' ? 'Reopen Inspection' : 'Complete Inspection'
                )}
              </Button>
            </div>
          </div>

          <div className="flex-1 bg-card/30 rounded-3xl border border-border/50 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]" />
            <div className="relative z-10 w-full max-w-lg p-6">
              <VehicleMap 
                items={inspection.items || []}
                onAreaClick={(area, x, y) => handlePartClick(area, x, y)}
                onDamageClick={() => {}}
              />
            </div>
          </div>
        </div>

        {/* Damage Entry Dialog */}
        <DamageEntryDialog
          open={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedPart(null);
          }}
          preselectedPart={selectedPart || undefined}
          positionX={selectedX}
          positionY={selectedY}
          vehicleArea={selectedArea}
          onSubmit={handleSubmitDefect}
        />

        {/* Right: Defect List */}
        <Card className="w-full lg:w-96 flex flex-col h-full border-border">
          <CardHeader className="border-b border-border bg-muted/20 pb-4">
            <CardTitle className="text-lg flex justify-between items-center">
              Defects Log
              <Badge variant="outline">{inspection.items?.length || 0}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              {inspection.items && inspection.items.length > 0 ? (
                <div className="divide-y divide-border">
                  {inspection.items.map((item: any) => (
                    <div key={item.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-sm capitalize">{item.partName.replace(/_/g, " ")}</h4>
                          <span className="text-xs text-muted-foreground capitalize">{item.defectType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`
                              capitalize text-xs
                              ${item.severity === 'high' ? 'border-red-500 text-red-500' : 
                                item.severity === 'medium' ? 'border-orange-500 text-orange-500' : 
                                'border-yellow-500 text-yellow-500'}
                            `}
                          >
                            {item.severity}
                          </Badge>
                          {inspection.status !== 'completed' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {item.notes && (
                        <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded mb-2">
                          "{item.notes}"
                        </p>
                      )}

                      {item.photos && item.photos.length > 0 && (
                        <div className="flex gap-2 mt-2">
                            {item.photos.map((photo: any) => (
                            <a 
                              key={photo.id} 
                              href={photo.imageUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="relative group w-12 h-12 rounded overflow-hidden border border-border"
                            >
                              {/* Assuming uploads handled as static serving or presigned urls. Using placeholder for now if no real upload mechanism in this env */}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-white" />
                              </div>
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground p-8 text-center">
                  <Check className="w-8 h-8 mb-2 opacity-20" />
                  <p>No defects recorded yet.</p>
                  <p className="text-xs mt-1">Click a car part to add one.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
