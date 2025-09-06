import type { Express, Request } from "express";
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
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Enhanced function to generate detailed Diamond Notes
async function generateDiamondNotes(
  className: string,
  subject: string,
  chapterName?: string,
  pdfContent?: string,
  language = "english"
): Promise<DiamondNotes> {
  const chapterTitle = chapterName || "Chapter from PDF";
  
  // Generate detailed, subject-specific content
  const headings = generateSubjectSpecificHeadings(subject, chapterTitle, className, language);
  const conclusion = generateConclusion(chapterTitle, subject, className, language);
  const keywords = generateKeywords(chapterTitle, subject, className);

  const notes: DiamondNotes = {
    chapterTitle: language === "hindi" ? `अध्याय: ${chapterTitle}` : chapterTitle,
    headings,
    conclusion,
    keywords
  };

  return notes;
}

function generateSubjectSpecificHeadings(subject: string, chapterTitle: string, className: string, language: string) {
  const isHindi = language === "hindi";
  const headings = [];

  // Introduction section
  headings.push({
    number: 1,
    title: isHindi ? `परिचय - ${chapterTitle}` : `Introduction to ${chapterTitle}`,
    bulletPoints: [
      isHindi 
        ? `${chapterTitle} की मूलभूत अवधारणाएं और परिभाषाएं`
        : `Fundamental concepts and definitions of ${chapterTitle}`,
      isHindi
        ? `इस विषय का ऐतिहासिक संदर्भ और पृष्ठभूमि`
        : `Historical context and background of this topic`,
      isHindi
        ? `कक्षा ${className} के ${subject} पाठ्यक्रम में इसका महत्व`
        : `Importance in Class ${className} ${subject} curriculum`,
      isHindi
        ? `अन्य विषयों के साथ इसका संबंध और प्रासंगिकता`
        : `Connection and relevance with other subjects`
    ]
  });

  // Subject-specific detailed content based on subject type
  if (subject.toLowerCase().includes('mathematics') || subject.toLowerCase().includes('गणित')) {
    headings.push({
      number: 2,
      title: isHindi ? `मुख्य सूत्र और सिद्धांत` : `Key Formulas and Principles`,
      bulletPoints: [
        isHindi ? `इस अध्याय के महत्वपूर्ण सूत्र और उनके अनुप्रयोग` : `Important formulas of this chapter and their applications`,
        isHindi ? `गणितीय सिद्धांतों की विस्तृत व्याख्या` : `Detailed explanation of mathematical principles`,
        isHindi ? `समस्याओं को हल करने की तकनीकें` : `Problem-solving techniques and methods`,
        isHindi ? `सूत्रों की व्युत्पत्ति और प्रमाण` : `Derivation and proof of formulas`,
        isHindi ? `व्यावहारिक जीवन में इनका उपयोग` : `Practical applications in real life`
      ]
    });
    
    headings.push({
      number: 3,
      title: isHindi ? `उदाहरण और अभ्यास` : `Examples and Practice`,
      bulletPoints: [
        isHindi ? `विभिन्न प्रकार के प्रश्नों के हल किए गए उदाहरण` : `Solved examples of different types of questions`,
        isHindi ? `चरणबद्ध समाधान की विधि` : `Step-by-step solution methods`,
        isHindi ? `सामान्य गलतियां और उनसे बचने के तरीके` : `Common mistakes and ways to avoid them`,
        isHindi ? `अभ्यास के लिए महत्वपूर्ण प्रश्न` : `Important questions for practice`,
        isHindi ? `परीक्षा की दृष्टि से महत्वपूर्ण टिप्स` : `Important exam tips and tricks`
      ]
    });
  } else if (subject.toLowerCase().includes('science') || subject.toLowerCase().includes('physics') || 
             subject.toLowerCase().includes('chemistry') || subject.toLowerCase().includes('biology') ||
             subject.toLowerCase().includes('विज्ञान') || subject.toLowerCase().includes('भौतिकी') || 
             subject.toLowerCase().includes('रसायन') || subject.toLowerCase().includes('जीवविज्ञान')) {
    
    headings.push({
      number: 2,
      title: isHindi ? `वैज्ञानिक सिद्धांत और नियम` : `Scientific Principles and Laws`,
      bulletPoints: [
        isHindi ? `इस अध्याय के मुख्य वैज्ञानिक सिद्धांत` : `Main scientific principles of this chapter`,
        isHindi ? `प्राकृतिक नियमों की विस्तृत व्याख्या` : `Detailed explanation of natural laws`,
        isHindi ? `प्रयोगों और अवलोकनों के आधार पर निष्कर्ष` : `Conclusions based on experiments and observations`,
        isHindi ? `वैज्ञानिक तथ्यों के पीछे का तर्क` : `Logic behind scientific facts`,
        isHindi ? `दैनिक जीवन में इन सिद्धांतों के उदाहरण` : `Examples of these principles in daily life`
      ]
    });
    
    headings.push({
      number: 3,
      title: isHindi ? `प्रयोग और गतिविधियां` : `Experiments and Activities`,
      bulletPoints: [
        isHindi ? `इस अध्याय से संबंधित महत्वपूर्ण प्रयोग` : `Important experiments related to this chapter`,
        isHindi ? `प्रयोगों की विधि और आवश्यक सामग्री` : `Experimental methods and required materials`,
        isHindi ? `प्रयोगों से प्राप्त निष्कर्ष और उनका विश्लेषण` : `Results from experiments and their analysis`,
        isHindi ? `सुरक्षा के उपाय और सावधानियां` : `Safety measures and precautions`,
        isHindi ? `घर पर किए जा सकने वाले आसान प्रयोग` : `Simple experiments that can be done at home`
      ]
    });
  } else if (subject.toLowerCase().includes('history') || subject.toLowerCase().includes('geography') || 
             subject.toLowerCase().includes('political') || subject.toLowerCase().includes('economics') ||
             subject.toLowerCase().includes('इतिहास') || subject.toLowerCase().includes('भूगोल') || 
             subject.toLowerCase().includes('राजनीति') || subject.toLowerCase().includes('अर्थशास्त्र')) {
    
    headings.push({
      number: 2,
      title: isHindi ? `ऐतिहासिक तथ्य और घटनाएं` : `Historical Facts and Events`,
      bulletPoints: [
        isHindi ? `महत्वपूर्ण ऐतिहासिक घटनाओं का कालक्रम` : `Chronology of important historical events`,
        isHindi ? `प्रमुख व्यक्तित्वों का योगदान और भूमिका` : `Contribution and role of key personalities`,
        isHindi ? `सामाजिक, राजनीतिक और आर्थिक कारक` : `Social, political and economic factors`,
        isHindi ? `घटनाओं के कारण और परिणाम` : `Causes and consequences of events`,
        isHindi ? `तत्कालीन समाज पर इनका प्रभाव` : `Impact on contemporary society`
      ]
    });
    
    headings.push({
      number: 3,
      title: isHindi ? `विश्लेषण और महत्व` : `Analysis and Significance`,
      bulletPoints: [
        isHindi ? `घटनाओं का गहन विश्लेषण और तुलनात्मक अध्ययन` : `In-depth analysis and comparative study of events`,
        isHindi ? `आज के समय में इनकी प्रासंगिकता` : `Relevance in today's context`,
        isHindi ? `इतिहास से मिलने वाली सीख और शिक्षा` : `Lessons and learning from history`,
        isHindi ? `भविष्य के लिए दिशा-निर्देश` : `Guidelines for the future`,
        isHindi ? `विभिन्न दृष्टिकोणों से विषय की समझ` : `Understanding the topic from different perspectives`
      ]
    });
  } else {
    // Default detailed structure for other subjects
    headings.push({
      number: 2,
      title: isHindi ? `मुख्य विषयवस्तु और अवधारणाएं` : `Main Content and Concepts`,
      bulletPoints: [
        isHindi ? `इस अध्याय की मुख्य विषयवस्तु का विस्तृत विवरण` : `Detailed description of the main content of this chapter`,
        isHindi ? `महत्वपूर्ण अवधारणाओं की स्पष्ट व्याख्या` : `Clear explanation of important concepts`,
        isHindi ? `विषय के विभिन्न पहलुओं का गहन अध्ययन` : `In-depth study of various aspects of the topic`,
        isHindi ? `संबंधित तथ्यों और आंकड़ों का संकलन` : `Compilation of related facts and data`,
        isHindi ? `विषय की व्यापक समझ के लिए उदाहरण` : `Examples for comprehensive understanding of the topic`
      ]
    });
    
    headings.push({
      number: 3,
      title: isHindi ? `व्यावहारिक अनुप्रयोग` : `Practical Applications`,
      bulletPoints: [
        isHindi ? `दैनिक जीवन में इस विषय का उपयोग` : `Use of this topic in daily life`,
        isHindi ? `समसामयिक घटनाओं के साथ संबंध` : `Connection with contemporary events`,
        isHindi ? `भविष्य की संभावनाएं और दिशाएं` : `Future possibilities and directions`,
        isHindi ? `व्यावसायिक क्षेत्रों में इसकी उपयोगिता` : `Its utility in professional fields`,
        isHindi ? `समाज के विकास में इसका योगदान` : `Its contribution to societal development`
      ]
    });
  }

  // Additional detailed sections
  headings.push({
    number: 4,
    title: isHindi ? `महत्वपूर्ण बिंदु और तथ्य` : `Important Points and Facts`,
    bulletPoints: [
      isHindi ? `याद रखने योग्य महत्वपूर्ण तथ्य` : `Important facts to remember`,
      isHindi ? `परीक्षा की दृष्टि से महत्वपूर्ण प्रश्न` : `Important questions from exam perspective`,
      isHindi ? `सामान्य भ्रम और उनके स्पष्टीकरण` : `Common confusions and their clarifications`,
      isHindi ? `अतिरिक्त जानकारी और विस्तृत तथ्य` : `Additional information and detailed facts`,
      isHindi ? `संबंधित अन्य अध्यायों के साथ संबंध` : `Connection with other related chapters`
    ]
  });

  return headings;
}

function generateConclusion(chapterTitle: string, subject: string, className: string, language: string): string {
  if (language === "hindi") {
    return `${chapterTitle} कक्षा ${className} के ${subject} विषय का एक अत्यंत महत्वपूर्ण अध्याय है। इस अध्याय में दी गई जानकारी न केवल परीक्षा की दृष्टि से महत्वपूर्ण है बल्कि व्यावहारिक जीवन में भी अत्यधिक उपयोगी है। इन अवधारणाओं को समझना आगे के अध्ययन और भविष्य की चुनौतियों के लिए एक मजबूत आधार प्रदान करता है। नियमित अभ्यास और गहन अध्ययन के माध्यम से इस विषय में महारत हासिल की जा सकती है।`;
  }
  
  return `${chapterTitle} is a crucial chapter in Class ${className} ${subject} curriculum. The knowledge provided in this chapter is not only important from an examination perspective but also highly useful in practical life. Understanding these concepts provides a strong foundation for further studies and future challenges. Through regular practice and thorough study, mastery in this subject can be achieved. This chapter connects various aspects of the subject and helps in developing a comprehensive understanding of the field.`;
}

function generateKeywords(chapterTitle: string, subject: string, className: string): string[] {
  const basicKeywords = [
    chapterTitle,
    subject,
    `Class ${className}`,
    "NCERT",
    "Education",
    "Study Notes",
    "Diamond Notes"
  ];

  // Add subject-specific keywords
  const subjectLower = subject.toLowerCase();
  if (subjectLower.includes('mathematics') || subjectLower.includes('गणित')) {
    basicKeywords.push("Formula", "Calculation", "Problem Solving", "Mathematical Concepts");
  } else if (subjectLower.includes('science') || subjectLower.includes('physics') || 
             subjectLower.includes('chemistry') || subjectLower.includes('biology')) {
    basicKeywords.push("Scientific Method", "Experiments", "Natural Laws", "Scientific Principles");
  } else if (subjectLower.includes('history') || subjectLower.includes('geography') || 
             subjectLower.includes('political') || subjectLower.includes('economics')) {
    basicKeywords.push("Historical Events", "Social Studies", "Cultural Heritage", "Contemporary Issues");
  }

  return basicKeywords;
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
