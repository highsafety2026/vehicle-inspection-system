import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===

export const inspections = sqliteTable("inspections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone"),
  clientEmail: text("client_email"),
  vehicleInfo: text("vehicle_info").notNull(), // Make/Model/Year
  vinNumber: text("vin_number"),
  color: text("color"),
  mileage: text("mileage"),
  engineNumber: text("engine_number"),
  clientSignature: text("client_signature"), // Base64 signature image
  status: text("status").notNull().default("in_progress"), // in_progress, completed
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const inspectionItems = sqliteTable("inspection_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  inspectionId: integer("inspection_id").notNull(),
  // الجزء: باب أمامي يمين، باب أمامي يسار، رفرف، صدام، إلخ
  partName: text("part_name").notNull(),
  // نوع العطل: خدش سطحي، خدش عميق، طعجة خفيفة، طعجة شديدة، كسر، شق، صبغ غير أصلي، فرق لون، صدأ، عدم اتزان، أضرار متعددة
  defectType: text("defect_type").notNull(),
  // درجة العطل: خفيف، متوسط، شديد
  severity: text("severity").notNull(),
  // ملاحظة اختيارية
  notes: text("notes"),
  // موقع العطل على الخريطة (x, y coordinates)
  positionX: integer("position_x"),
  positionY: integer("position_y"),
  // منطقة السيارة: front, back, left, right, roof
  vehicleArea: text("vehicle_area").notNull(),
});

export const inspectionPhotos = sqliteTable("inspection_photos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: integer("item_id").notNull(),
  imageUrl: text("image_url").notNull(),
});

// === RELATIONS ===

export const inspectionsRelations = relations(inspections, ({ many }) => ({
  items: many(inspectionItems),
}));

export const inspectionItemsRelations = relations(inspectionItems, ({ one, many }) => ({
  inspection: one(inspections, {
    fields: [inspectionItems.inspectionId],
    references: [inspections.id],
  }),
  photos: many(inspectionPhotos),
}));

export const inspectionPhotosRelations = relations(inspectionPhotos, ({ one }) => ({
  item: one(inspectionItems, {
    fields: [inspectionPhotos.itemId],
    references: [inspectionItems.id],
  }),
}));

// === SCHEMAS ===

export const insertInspectionSchema = createInsertSchema(inspections).omit({ id: true, createdAt: true }).extend({
  clientPhone: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal("")),
  vinNumber: z.string().optional(),
  color: z.string().optional(),
  mileage: z.string().optional(),
  engineNumber: z.string().optional(),
  clientSignature: z.string().optional(),
});
export const insertInspectionItemSchema = createInsertSchema(inspectionItems).omit({ id: true });
export const insertInspectionPhotoSchema = createInsertSchema(inspectionPhotos).omit({ id: true });

// === TYPES ===

export type Inspection = typeof inspections.$inferSelect;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;

export type InspectionItem = typeof inspectionItems.$inferSelect;
export type InsertInspectionItem = z.infer<typeof insertInspectionItemSchema>;

export type InspectionPhoto = typeof inspectionPhotos.$inferSelect;
export type InsertInspectionPhoto = z.infer<typeof insertInspectionPhotoSchema>;

// === API TYPES ===

export type CreateInspectionRequest = InsertInspection;
export type CreateItemRequest = InsertInspectionItem;

export type InspectionResponse = Inspection & {
  items?: (InspectionItem & { photos?: InspectionPhoto[] })[];
};
