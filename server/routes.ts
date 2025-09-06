import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import Groq from "groq-sdk";
import { storage } from "./storage";
import { generateNotesSchema, type DiamondNotes } from "@shared/schema";
import { z } from "zod";

// Initialize Groq client with API key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// AI-powered function to generate detailed Diamond Notes using Groq
async function generateDiamondNotes(
  className: string,
  subject: string,
  chapterName?: string,
  pdfContent?: string,
  language = "english"
): Promise<DiamondNotes> {
  try {
    const chapterTitle = chapterName || "Chapter from PDF";
    const isHindi = language === "hindi";
    
    // Create a comprehensive prompt for AI to generate Diamond Notes
    const prompt = createDiamondNotesPrompt(className, subject, chapterTitle, pdfContent, language);
    
    // Use Groq API to generate AI-powered notes
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: isHindi 
            ? "आप एक विशेषज्ञ NCERT शिक्षा सहायक हैं जो कक्षा 1 से 12 तक के छात्रों के लिए विस्तृत, संरचित अध्ययन नोट्स बनाते हैं। आपका काम NCERT अध्यायों का विश्लेषण करना और उच्च गुणवत्ता वाले डायमंड नोट्स वापस करना है।"
            : "You are an expert NCERT educational assistant that generates detailed, structured study notes for students in Classes 1 to 12. Your job is to analyze NCERT chapters and return high-quality Diamond Notes."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile", // Using Llama 3.3 70B for high quality responses
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("No response from AI model");
    }

    // Parse the AI response
    const aiResponse = JSON.parse(responseContent);
    
    // Validate and structure the response into DiamondNotes format
    const notes: DiamondNotes = {
      chapterTitle: aiResponse.chapterTitle || chapterTitle,
      headings: aiResponse.headings || [],
      conclusion: aiResponse.conclusion || "",
      keywords: aiResponse.keywords || []
    };

    return notes;

  } catch (error) {
    console.error("Error generating AI notes:", error);
    // Fallback to template-based generation if AI fails
    return generateFallbackNotes(className, subject, chapterName, language);
  }
}

// Create a comprehensive prompt for AI to generate Diamond Notes
function createDiamondNotesPrompt(
  className: string,
  subject: string,
  chapterTitle: string,
  pdfContent?: string,
  language = "english"
): string {
  const isHindi = language === "hindi";
  
  const basePrompt = isHindi 
    ? `कक्षा ${className} के ${subject} विषय के "${chapterTitle}" अध्याय के लिए विस्तृत डायमंड नोट्स बनाएं।`
    : `Generate detailed Diamond Notes for the chapter "${chapterTitle}" from Class ${className} ${subject}.`;

  const formatInstructions = isHindi
    ? `निम्नलिखित JSON फॉर्मेट में जवाब दें:
{
  "chapterTitle": "अध्याय का शीर्षक",
  "headings": [
    {
      "number": 1,
      "title": "शीर्षक",
      "bulletPoints": ["विस्तृत बिंदु 1", "विस्तृत बिंदु 2", "विस्तृत बिंदु 3", "विस्तृत बिंदु 4", "विस्तृत बिंदु 5"]
    }
  ],
  "conclusion": "2-3 वाक्यों में निष्कर्ष",
  "keywords": ["महत्वपूर्ण शब्द 1", "महत्वपूर्ण शब्द 2"]
}`
    : `Please respond in the following JSON format:
{
  "chapterTitle": "Chapter Title",
  "headings": [
    {
      "number": 1,
      "title": "Heading Title",
      "bulletPoints": ["Detailed point 1", "Detailed point 2", "Detailed point 3", "Detailed point 4", "Detailed point 5"]
    }
  ],
  "conclusion": "2-3 sentence conclusion",
  "keywords": ["Important term 1", "Important term 2"]
}`;

  const contentRequirements = isHindi
    ? `आवश्यकताएं:
- कम से कम 4-5 मुख्य शीर्षक बनाएं
- प्रत्येक शीर्षक के तहत 5-6 विस्तृत बिंदु लिखें
- NCERT पाठ्यक्रम के अनुसार शैक्षिक सामग्री शामिल करें
- परीक्षा की दृष्टि से महत्वपूर्ण तथ्य शामिल करें
- व्यावहारिक उदाहरण और अनुप्रयोग दें
- महत्वपूर्ण तिथियां, तथ्य, परिभाषाएं शामिल करें`
    : `Requirements:
- Create at least 4-5 main headings
- Include 5-6 detailed bullet points under each heading
- Include educational content appropriate for NCERT curriculum
- Add important facts, dates, definitions, and examples from exam perspective
- Provide practical applications and real-world connections
- Include step-by-step explanations for complex topics`;

  const subjectSpecificGuidance = getSubjectSpecificGuidance(subject, language);

  let fullPrompt = `${basePrompt}\n\n${formatInstructions}\n\n${contentRequirements}\n\n${subjectSpecificGuidance}`;

  if (pdfContent) {
    const pdfInstruction = isHindi
      ? "\n\nPDF सामग्री के आधार पर नोट्स बनाएं (यदि उपलब्ध हो)।"
      : "\n\nGenerate notes based on the PDF content provided (if available).";
    fullPrompt += pdfInstruction;
  }

  return fullPrompt;
}

// Get subject-specific guidance for AI
function getSubjectSpecificGuidance(subject: string, language: string): string {
  const isHindi = language === "hindi";
  const subjectLower = subject.toLowerCase();

  if (subjectLower.includes('mathematics') || subjectLower.includes('गणित')) {
    return isHindi
      ? "गणित के लिए: सूत्र, उदाहरण, समस्या समाधान तकनीक, प्रमाण, और व्यावहारिक अनुप्रयोग शामिल करें।"
      : "For Mathematics: Include formulas, worked examples, problem-solving techniques, proofs, and practical applications.";
  } else if (subjectLower.includes('science') || subjectLower.includes('physics') || 
             subjectLower.includes('chemistry') || subjectLower.includes('biology')) {
    return isHindi
      ? "विज्ञान के लिए: वैज्ञानिक सिद्धांत, प्रयोग, तथ्य, नियम, और दैनिक जीवन के उदाहरण शामिल करें।"
      : "For Science: Include scientific principles, experiments, facts, laws, and real-life examples.";
  } else if (subjectLower.includes('history') || subjectLower.includes('geography') || 
             subjectLower.includes('political') || subjectLower.includes('economics')) {
    return isHindi
      ? "सामाजिक अध्ययन के लिए: ऐतिहासिक घटनाएं, तिथियां, व्यक्तित्व, कारण-परिणाम, और समसामयिक प्रासंगिकता शामिल करें।"
      : "For Social Studies: Include historical events, dates, personalities, cause-effect relationships, and contemporary relevance.";
  }
  
  return isHindi
    ? "विषय की मुख्य अवधारणाएं, महत्वपूर्ण तथ्य, और व्यावहारिक अनुप्रयोग शामिल करें।"
    : "Include main concepts, important facts, and practical applications of the subject.";
}

// Fallback function for when AI generation fails
function generateFallbackNotes(
  className: string,
  subject: string,
  chapterName?: string,
  language = "english"
): DiamondNotes {
  const chapterTitle = chapterName || "Chapter from PDF";
  const isHindi = language === "hindi";
  
  return {
    chapterTitle: isHindi ? `अध्याय: ${chapterTitle}` : chapterTitle,
    headings: [
      {
        number: 1,
        title: isHindi ? `परिचय - ${chapterTitle}` : `Introduction to ${chapterTitle}`,
        bulletPoints: [
          isHindi 
            ? `${chapterTitle} की मूलभूत अवधारणाएं और परिभाषाएं`
            : `Fundamental concepts and definitions of ${chapterTitle}`,
          isHindi
            ? `कक्षा ${className} के ${subject} पाठ्यक्रम में इसका महत्व`
            : `Importance in Class ${className} ${subject} curriculum`
        ]
      }
    ],
    conclusion: isHindi
      ? `${chapterTitle} कक्षा ${className} के ${subject} विषय का एक महत्वपूर्ण अध्याय है।`
      : `${chapterTitle} is an important chapter in Class ${className} ${subject}.`,
    keywords: [chapterTitle, subject, `Class ${className}`]
  };
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
