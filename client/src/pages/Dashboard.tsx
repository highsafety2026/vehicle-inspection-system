import { useInspections, useDeleteInspection } from "@/hooks/use-inspections";
import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import { Plus, Search, FileText, Clock, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: inspections, isLoading } = useInspections();
  const deleteInspection = useDeleteInspection();
  const [search, setSearch] = useState("");

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذا الفحص؟ سيتم حذف جميع البيانات المرتبطة به.')) {
      await deleteInspection.mutateAsync(id);
    }
  };

  const filtered = inspections?.filter(i => 
    i.clientName.toLowerCase().includes(search.toLowerCase()) || 
    i.vehicleInfo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Inspections</h1>
          <p className="text-muted-foreground mt-1">Manage vehicle condition reports</p>
        </div>
        <Link href="/inspections/new">
          <Button size="lg" className="shadow-lg shadow-primary/25">
            <Plus className="w-5 h-5 mr-2" /> New Inspection
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard 
          title="In Progress" 
          value={inspections?.filter(i => i.status === 'in_progress').length || 0} 
          icon={Clock}
          color="text-yellow-500"
        />
        <StatsCard 
          title="Completed" 
          value={inspections?.filter(i => i.status === 'completed').length || 0} 
          icon={CheckCircle2}
          color="text-green-500"
        />
        <StatsCard 
          title="Total Reports" 
          value={inspections?.length || 0} 
          icon={FileText}
          color="text-blue-500"
        />
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Recent Activity</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search client or vehicle..." 
              className="pl-9 bg-background border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-muted/20 animate-pulse rounded-lg" />)}
            </div>
          ) : filtered?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No inspections found. Create your first one!
            </div>
          ) : (
            <div className="space-y-2">
              {filtered?.map(inspection => (
                <Link key={inspection.id} href={`/inspections/${inspection.id}`}>
                  <div className="group flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-lg font-display">{inspection.vehicleInfo}</span>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{inspection.clientName}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${inspection.status === 'completed' 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-yellow-500/10 text-yellow-500'}
                        `}>
                          {inspection.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(inspection.createdAt || new Date()), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <button
                          onClick={(e) => handleDelete(e, inspection.id)}
                          className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-500 text-red-600 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                          title="حذف الفحص"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}

function StatsCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-2 font-display">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-background border border-border ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </CardContent>
    </Card>
  );
}
