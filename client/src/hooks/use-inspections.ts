import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateInspectionRequest, type CreateItemRequest, type InspectionResponse } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// === INSPECTIONS ===

export function useInspections() {
  return useQuery({
    queryKey: [api.inspections.list.path],
    queryFn: async () => {
      const res = await fetch(api.inspections.list.path);
      if (!res.ok) throw new Error("Failed to fetch inspections");
      return api.inspections.list.responses[200].parse(await res.json());
    },
  });
}

export function useInspection(id: number) {
  return useQuery({
    queryKey: [api.inspections.get.path, id],
    enabled: !isNaN(id),
    queryFn: async () => {
      const url = buildUrl(api.inspections.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch inspection");
      // The backend returns the inspection with joined items
      return res.json() as Promise<InspectionResponse>;
    },
  });
}

export function useCreateInspection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: CreateInspectionRequest) => {
      const validated = api.inspections.create.input.parse(data);
      const res = await fetch(api.inspections.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.inspections.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create inspection");
      }
      return api.inspections.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.inspections.list.path] });
      toast({ title: "Success", description: "Inspection created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateInspectionStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const url = buildUrl(api.inspections.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      return api.inspections.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.inspections.get.path, data.id] });
      queryClient.invalidateQueries({ queryKey: [api.inspections.list.path] });
      toast({ title: "Updated", description: "Inspection status updated" });
    },
  });
}

export function useDeleteInspection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.inspections.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete inspection");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.inspections.list.path] });
      toast({ title: "✅ تم الحذف", description: "تم حذف الفحص بنجاح" });
    },
    onError: () => {
      toast({ title: "❌ خطأ", description: "فشل حذف الفحص", variant: "destructive" });
    },
  });
}

// === INSPECTION ITEMS ===

export function useCreateItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ inspectionId, ...data }: CreateItemRequest & { inspectionId: number }) => {
      const url = buildUrl(api.items.create.path, { id: inspectionId });
      // Validate without inspectionId as per route schema requirements
      const validated = api.items.create.input.parse(data);
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) throw new Error("Failed to add defect");
      return api.items.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.inspections.get.path, variables.inspectionId] });
      toast({ title: "Defect Added", description: "The defect has been recorded." });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, inspectionId }: { id: number, inspectionId: number }) => {
      const url = buildUrl(api.items.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.inspections.get.path, variables.inspectionId] });
      toast({ title: "Deleted", description: "Defect removed successfully." });
    },
  });
}

// === PHOTOS ===

export function useUploadPhoto() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ itemId, file, inspectionId }: { itemId: number, file: File, inspectionId: number }) => {
      const url = buildUrl(api.photos.upload.path, { itemId });
      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.inspections.get.path, variables.inspectionId] });
      toast({ title: "Photo Uploaded", description: "Image attached to defect." });
    },
    onError: () => {
      toast({ title: "Upload Failed", description: "Could not upload photo.", variant: "destructive" });
    },
  });
}
