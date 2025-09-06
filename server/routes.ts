import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { generateNotesSchema, type DiamondNotes } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Mock function to generate Diamond Notes
async function generateDiamondNotes(
  className: string,
  subject: string,
  chapterName?: string,
  pdfContent?: string,
  language = "english"
): Promise<DiamondNotes> {
  // This would be replaced with actual NCERT content processing
  // For now, we'll generate structured notes based on the input
  
  const chapterTitle = chapterName || "Sample Chapter";
  
  // Mock structured notes generation
  const notes: DiamondNotes = {
    chapterTitle,
    headings: [
      {
        number: 1,
        title: `Introduction to ${chapterTitle}`,
        bulletPoints: [
          `Basic concepts and definitions related to ${chapterTitle}`,
          `Historical context and background information`,
          `Importance in the ${subject} curriculum for Class ${className}`,
        ]
      },
      {
        number: 2,
        title: `Key Concepts and Principles`,
        bulletPoints: [
          "Fundamental principles and theories",
          "Important formulas, laws, or rules (if applicable)",
          "Real-world applications and examples",
        ]
      },
      {
        number: 3,
        title: `Detailed Analysis`,
        bulletPoints: [
          "Step-by-step explanations of complex topics",
          "Comparative analysis with related concepts",
          "Common misconceptions and clarifications",
        ]
      }
    ],
    conclusion: `${chapterTitle} is an essential topic in ${subject} for Class ${className}. Understanding these concepts provides a strong foundation for advanced topics and practical applications in the field.`,
    keywords: [
      chapterTitle.split(' ')[0],
      subject,
      "NCERT",
      "Education",
      `Class ${className}`,
    ]
  };

  // If language is Hindi, translate the content
  if (language === "hindi") {
    notes.chapterTitle = `अध्याय: ${chapterTitle}`;
    notes.conclusion = `${chapterTitle} कक्षा ${className} के ${subject} विषय में एक महत्वपूर्ण विषय है। इन अवधारणाओं को समझना उन्नत विषयों और क्षेत्र में व्यावहारिक अनुप्रयोगों के लिए एक मजबूत आधार प्रदान करता है।`;
  }

  return notes;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate Diamond Notes
  app.post("/api/generate-notes", upload.single('pdf'), async (req, res) => {
    try {
      let requestData;
      
      // Handle form data if PDF is uploaded
      if (req.file) {
        requestData = {
          className: req.body.className,
          subject: req.body.subject,
          chapterName: req.body.chapterName,
          language: req.body.language || 'english',
          pdfContent: req.file.buffer.toString('base64'),
        };
      } else {
        requestData = req.body;
      }

      const validatedData = generateNotesSchema.parse(requestData);
      
      if (!validatedData.chapterName && !validatedData.pdfContent) {
        return res.status(400).json({ 
          message: "Either chapter name or PDF content is required" 
        });
      }

      // Generate Diamond Notes
      const diamondNotes = await generateDiamondNotes(
        validatedData.className,
        validatedData.subject,
        validatedData.chapterName,
        validatedData.pdfContent,
        validatedData.language
      );

      // Store the request and generated notes
      const notesRequest = await storage.createNotesRequest({
        className: validatedData.className,
        subject: validatedData.subject,
        chapterName: validatedData.chapterName,
        language: validatedData.language,
        generatedNotes: diamondNotes,
      });

      res.json({
        id: notesRequest.id,
        notes: diamondNotes,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      }
      
      console.error("Error generating notes:", error);
      res.status(500).json({
        message: "Failed to generate notes. Please try again.",
      });
    }
  });

  // Get recent notes requests
  app.get("/api/recent-notes", async (req, res) => {
    try {
      const recentNotes = await storage.getRecentNotesRequests(5);
      res.json(recentNotes);
    } catch (error) {
      console.error("Error fetching recent notes:", error);
      res.status(500).json({
        message: "Failed to fetch recent notes",
      });
    }
  });

  // Get specific notes request
  app.get("/api/notes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const notesRequest = await storage.getNotesRequest(id);
      
      if (!notesRequest) {
        return res.status(404).json({
          message: "Notes not found",
        });
      }

      res.json(notesRequest);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({
        message: "Failed to fetch notes",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
