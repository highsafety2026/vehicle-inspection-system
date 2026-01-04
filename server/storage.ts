import { db } from "./db";
import {
  inspections,
  inspectionItems,
  inspectionPhotos,
  type InsertInspection,
  type InsertInspectionItem,
  type InsertInspectionPhoto,
  type Inspection,
  type InspectionItem,
  type InspectionPhoto,
  type InspectionResponse
} from "@shared/schema";
import * as schemaModule from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Inspections
  getInspections(): Promise<Inspection[]>;
  getInspection(id: number): Promise<InspectionResponse | undefined>;
  createInspection(inspection: InsertInspection): Promise<Inspection>;
  updateInspectionStatus(id: number, status: string): Promise<Inspection>;
  deleteInspection(id: number): Promise<void>;

  // Items
  createInspectionItem(item: InsertInspectionItem): Promise<InspectionItem>;
  deleteInspectionItem(id: number): Promise<void>;
  
  // Photos
  createInspectionPhoto(photo: InsertInspectionPhoto): Promise<InspectionPhoto>;

  // Expose db and schema for custom operations
  db: typeof db;
  schema: typeof import("@shared/schema");
  eq: typeof eq;
}

export class DatabaseStorage implements IStorage {
  // Expose database objects for custom operations (e.g., signature updates)
  db = db;
  schema = schemaModule;
  eq = eq;

  async getInspections(): Promise<Inspection[]> {
    return await db.select().from(inspections).orderBy(desc(inspections.createdAt));
  }

  async getInspection(id: number): Promise<InspectionResponse | undefined> {
    const inspection = await db.select().from(inspections).where(eq(inspections.id, id));
    if (inspection.length === 0) return undefined;

    const items = await db.select().from(inspectionItems).where(eq(inspectionItems.inspectionId, id));
    
    // Get photos for all items
    const itemsWithPhotos = await Promise.all(items.map(async (item) => {
      const photos = await db.select().from(inspectionPhotos).where(eq(inspectionPhotos.itemId, item.id));
      return { ...item, photos };
    }));

    return { ...inspection[0], items: itemsWithPhotos };
  }

  async createInspection(inspection: InsertInspection): Promise<Inspection> {
    const [newInspection] = await db.insert(inspections).values(inspection).returning();
    return newInspection;
  }

  async updateInspectionStatus(id: number, status: string): Promise<Inspection> {
    const [updated] = await db.update(inspections)
      .set({ status })
      .where(eq(inspections.id, id))
      .returning();
    return updated;
  }
  async deleteInspection(id: number): Promise<void> {
    // Delete related photos first
    const items = await db.select().from(inspectionItems).where(eq(inspectionItems.inspectionId, id));
    for (const item of items) {
      await db.delete(inspectionPhotos).where(eq(inspectionPhotos.itemId, item.id));
    }
    // Delete items
    await db.delete(inspectionItems).where(eq(inspectionItems.inspectionId, id));
    // Delete inspection
    await db.delete(inspections).where(eq(inspections.id, id));
  }
  async createInspectionItem(item: InsertInspectionItem): Promise<InspectionItem> {
    const [newItem] = await db.insert(inspectionItems).values(item).returning();
    return newItem;
  }

  async deleteInspectionItem(id: number): Promise<void> {
    await db.delete(inspectionItems).where(eq(inspectionItems.id, id));
  }

  async createInspectionPhoto(photo: InsertInspectionPhoto): Promise<InspectionPhoto> {
    const [newPhoto] = await db.insert(inspectionPhotos).values(photo).returning();
    return newPhoto;
  }
}

export const storage = new DatabaseStorage();
