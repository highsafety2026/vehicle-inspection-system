import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import nodemailer from "nodemailer";

// Configure upload storage
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storageConfig = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storageConfig });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve uploaded files statically
  app.use("/uploads", express.static(uploadDir));

  // Inspections
  app.get(api.inspections.list.path, async (req, res) => {
    const inspections = await storage.getInspections();
    res.json(inspections);
  });

  app.get(api.inspections.get.path, async (req, res) => {
    const inspection = await storage.getInspection(Number(req.params.id));
    if (!inspection) {
      return res.status(404).json({ message: "Inspection not found" });
    }
    res.json(inspection);
  });

  app.post(api.inspections.create.path, async (req, res) => {
    try {
      const input = api.inspections.create.input.parse(req.body);
      const inspection = await storage.createInspection(input);
      res.status(201).json(inspection);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.inspections.update.path, async (req, res) => {
    const status = req.body.status;
    if (!status) return res.status(400).json({ message: "Status required" });
    const updated = await storage.updateInspectionStatus(Number(req.params.id), status);
    res.json(updated);
  });

  app.delete(api.inspections.delete.path, async (req, res) => {
    await storage.deleteInspection(Number(req.params.id));
    res.status(204).send();
  });

  // Items
  app.post(api.items.create.path, async (req, res) => {
    try {
      const input = api.items.create.input.parse(req.body);
      const item = await storage.createInspectionItem({
        ...input,
        inspectionId: Number(req.params.id)
      });
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.items.delete.path, async (req, res) => {
    await storage.deleteInspectionItem(Number(req.params.id));
    res.status(204).send();
  });

  // Photos
  app.post(api.photos.upload.path, upload.single("photo"), async (req, res) => {
    console.log("📸 Photo upload request received for itemId:", req.params.itemId);
    console.log("📁 File received:", req.file ? req.file.filename : "NO FILE");
    
    if (!req.file) {
      console.error("❌ No file in request!");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const photo = await storage.createInspectionPhoto({
      itemId: Number(req.params.itemId),
      imageUrl: `/uploads/${req.file.filename}`
    });

    console.log("✅ Photo saved:", photo);
    res.status(201).json(photo);
  });

  // Update inspection signature
  app.patch(`/api/inspections/:id/signature`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { signature } = req.body;
      
      // Update signature using direct database access
      const [updatedInspection] = await storage.db
        .update(storage.schema.inspections)
        .set({ clientSignature: signature })
        .where(storage.eq(storage.schema.inspections.id, id))
        .returning();
      
      res.json(updatedInspection);
    } catch (error: any) {
      console.error('Error updating signature:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Send inspection email
  app.post(`/api/inspections/:id/send-email`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { to } = req.body;
      
      const inspection = await storage.getInspection(id);
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }

      // Configure email transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'highsafety2021@gmail.com',
          pass: process.env.EMAIL_PASSWORD || '', // Use app password, not regular password
        }
      });

      const reportUrl = `${req.protocol}://${req.get('host')}/report/${id}`;
      
      const mailOptions = {
        from: 'highsafety2021@gmail.com',
        to,
        subject: `تقرير فحص السيارة - ${inspection.clientName}`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif;">
            <h2>تقرير فحص السيارة</h2>
            <p>مرحباً ${inspection.clientName}،</p>
            <p>يمكنك الاطلاع على تقرير فحص سيارتك من خلال الرابط التالي:</p>
            <a href="${reportUrl}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">
              عرض التقرير
            </a>
            <p>معلومات السيارة: ${inspection.vehicleInfo}</p>
            <p>مع تحياتنا،<br>فريق High Safety</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      res.json({ message: "Email sent successfully" });
    } catch (error: any) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getInspections();
  if (existing.length === 0) {
    const inspection = await storage.createInspection({
      clientName: "John Doe",
      vehicleInfo: "2023 Toyota Camry - Silver",
      status: "in_progress"
    });

    const item = await storage.createInspectionItem({
      inspectionId: inspection.id,
      partName: "front_bumper",
      defectType: "scratch_light",
      severity: "light",
      notes: "خدوش خفيفة على الصدام الأمامي",
      vehicleArea: "front",
      positionX: 150,
      positionY: 140
    });
    
    console.log("Seeded database with initial inspection");
  }
}
