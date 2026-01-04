import { z } from "zod";
import { insertInspectionSchema, insertInspectionItemSchema, inspections, inspectionItems, inspectionPhotos, type InsertInspection, type InsertInspectionItem, type InspectionResponse } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// Export request/response types
export type CreateInspectionRequest = InsertInspection;
export type CreateItemRequest = InsertInspectionItem;
export { type InspectionResponse } from "./schema";

export const api = {
  inspections: {
    list: {
      method: "GET" as const,
      path: "/api/inspections",
      responses: {
        200: z.array(z.custom<typeof inspections.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/inspections/:id",
      responses: {
        200: z.custom<typeof inspections.$inferSelect>(), // Extended type handled in storage
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/inspections",
      input: insertInspectionSchema,
      responses: {
        201: z.custom<typeof inspections.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/inspections/:id",
      input: insertInspectionSchema.partial(),
      responses: {
        200: z.custom<typeof inspections.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/inspections/:id",
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  items: {
    create: {
      method: "POST" as const,
      path: "/api/inspections/:id/items",
      input: insertInspectionItemSchema.omit({ inspectionId: true }),
      responses: {
        201: z.custom<typeof inspectionItems.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/items/:id",
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  photos: {
    upload: {
      method: "POST" as const,
      path: "/api/items/:itemId/photos",
      // Input is FormData, not strictly typed here
      responses: {
        201: z.custom<typeof inspectionPhotos.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  inspection: {
    signature: (id: string) => `/api/inspections/${id}/signature`,
    sendEmail: (id: string) => `/api/inspections/${id}/send-email`,
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
