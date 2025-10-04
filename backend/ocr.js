import express from "express";
import multer from "multer";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan("combined"));
app.use(express.json());
app.use(express.static("public"));

// Log CORS configuration
console.log("CORS configured for:", corsOptions.origin);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image files and PDFs are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// SIMPLE AND RELIABLE OCR PROCESSING
const processReceiptWithOCR = async (filePath) => {
  try {
    console.log("Starting OCR processing for:", filePath);

    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("eng");

    console.log("Worker created, recognizing text...");

    const result = await worker.recognize(filePath);

    console.log("OCR completed successfully");
    console.log("OCR Confidence:", result.data.confidence);

    // DEBUG: Analyze the OCR output
    debugOCRText(result.data.text);

    const parsedData = parseReceiptText(result.data.text);
    parsedData.confidence = result.data.confidence;

    await worker.terminate();
    console.log("Worker terminated");

    return {
      success: true,
      text: result.data.text,
      confidence: result.data.confidence,
      parsedData: parsedData,
      rawText: result.data.text,
    };
  } catch (error) {
    console.error("OCR Processing Error:", error);
    return {
      success: false,
      error: error.message,
      text: "",
      confidence: 0,
      parsedData: null,
    };
  } finally {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("Cleaned up file:", filePath);
      }
    } catch (cleanupError) {
      console.error("Error cleaning up file:", cleanupError);
    }
  }
};

// IMPROVED RECEIPT PARSING WITH BETTER AMOUNT DETECTION
const parseReceiptText = (text) => {
  console.log("Parsing receipt text...");

  const parsedData = {
    amount: null,
    date: null,
    description: "",
    vendor: "",
    currency: "USD",
    items: [],
    tax: null,
    total: null,
    confidence: 0,
  };

  // Clean and normalize the text
  const cleanText = text.replace(/\s+/g, " ").trim();
  console.log("Cleaned text:", cleanText);

  // FIX FOR CORRUPTED OCR TEXT
  // The amount might appear as "$1 23 < 50" or similar corruption
  // Let's look for patterns around "Amount Received"

  // Method 1: Look for "Amount Received" section specifically
  const amountReceivedMatch = cleanText.match(
    /Amount\s*Received[^\$]*\$?([0-9][0-9,\s<\.]*[0-9])/i
  );
  if (amountReceivedMatch) {
    console.log("Found Amount Received section:", amountReceivedMatch[0]);
    const corruptedAmount = amountReceivedMatch[1];
    console.log("Corrupted amount string:", corruptedAmount);

    // Clean the corrupted amount
    const cleanedAmount = cleanCorruptedAmount(corruptedAmount);
    console.log("Cleaned amount:", cleanedAmount);

    if (cleanedAmount) {
      parsedData.amount = cleanedAmount;
      parsedData.total = cleanedAmount;
    }
  }

  // Method 2: If above fails, look for any dollar amount pattern
  if (!parsedData.amount) {
    const dollarPatterns = [
      /\$(\d+)\s*[<\\]?\s*(\d{2})/, // $123 < 50 or $123\50
      /\$(\d+)\s+(\d{2})/, // $123 50
      /\$(\d+\.\d{2})/, // $123.50
      /(\d+)\s*[<\\]?\s*(\d{2})\s*\$/, // 123 < 50 $
      /Amount[^\d]*(\d+)\s*[<\\]?\s*(\d{2})/i,
    ];

    for (const pattern of dollarPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        console.log("Found amount with pattern:", pattern, match);
        let amount;

        if (match[1] && match[2]) {
          // Handle cases like "123 < 50" -> 123.50
          amount = parseFloat(`${match[1]}.${match[2]}`);
        } else if (match[1]) {
          // Handle cases like "123.50"
          amount = parseFloat(match[1]);
        }

        if (amount && !isNaN(amount) && amount > 0) {
          parsedData.amount = amount;
          parsedData.total = amount;
          break;
        }
      }
    }
  }

  // Method 3: Look for numbers that look like money amounts
  if (!parsedData.amount) {
    const moneyLikePatterns = [
      /(\d{2,3}\.\d{2})/, // 123.50
      /(\d{1,3}\s*[<\\]\s*\d{2})/, // 123<50 or 123\50
      /(\d{1,3}\s+\d{2})/, // 123 50
    ];

    for (const pattern of moneyLikePatterns) {
      const matches = [...cleanText.matchAll(pattern)];
      for (const match of matches) {
        const potentialAmount = cleanCorruptedAmount(match[1]);
        if (potentialAmount && potentialAmount > 0 && potentialAmount < 10000) {
          console.log(
            "Found money-like amount:",
            match[1],
            "->",
            potentialAmount
          );
          parsedData.amount = potentialAmount;
          parsedData.total = potentialAmount;
          break;
        }
      }
      if (parsedData.amount) break;
    }
  }

  // DATE EXTRACTION
  const datePatterns = [
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
    /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/,
  ];

  for (const pattern of datePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      const dateStr = match[1];
      parsedData.date = formatSimpleDate(dateStr);
      console.log("Found date:", parsedData.date);
      break;
    }
  }

  // VENDOR EXTRACTION - look for names after "Received From"
  const vendorMatch = cleanText.match(
    /Received\s*From[:\s]*([^\n\r0-9$]{2,50})/i
  );
  if (vendorMatch) {
    parsedData.vendor = vendorMatch[1].trim();
    console.log("Found vendor:", parsedData.vendor);
  } else {
    // Fallback: look for any name-like text at the beginning
    const nameMatch = cleanText.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/);
    if (
      nameMatch &&
      !nameMatch[1].includes("Receipt") &&
      !nameMatch[1].includes("Amount")
    ) {
      parsedData.vendor = nameMatch[1];
      console.log("Found fallback vendor:", parsedData.vendor);
    }
  }

  // DESCRIPTION EXTRACTION - look for product names
  const purposeMatch = cleanText.match(
    /Purpose\s*of\s*Payment[:\s]*([^\n\r]+)/i
  );
  if (purposeMatch) {
    parsedData.description = purposeMatch[1].trim();
    console.log("Found description:", parsedData.description);
  }

  // If no specific description found, create a generic one
  if (!parsedData.description) {
    if (parsedData.vendor && parsedData.amount) {
      parsedData.description = `${parsedData.vendor} - $${parsedData.amount}`;
    } else if (parsedData.amount) {
      parsedData.description = `Expense - $${parsedData.amount}`;
    } else if (parsedData.vendor) {
      parsedData.description = `${parsedData.vendor} - Receipt`;
    } else {
      parsedData.description = `Receipt ${
        parsedData.date || new Date().toISOString().split("T")[0]
      }`;
    }
  }

  // Create items array
  if (parsedData.amount) {
    parsedData.items.push({
      description: parsedData.description,
      amount: parsedData.amount,
    });
  }

  console.log("Final parsed data:", parsedData);
  return parsedData;
};

// HELPER FUNCTION TO CLEAN CORRUPTED AMOUNTS
const cleanCorruptedAmount = (amountStr) => {
  if (!amountStr) return null;

  console.log("Cleaning corrupted amount:", amountStr);

  // Remove spaces, <, \, and other OCR artifacts
  let cleaned = amountStr
    .replace(/\s+/g, "")
    .replace(/[<\\\[]/g, ".")
    .replace(/[^0-9\.]/g, "");

  // Ensure we have a proper decimal format
  if (cleaned.includes(".")) {
    const parts = cleaned.split(".");
    if (parts.length === 2) {
      // Format as dollars.cents
      cleaned = `${parts[0]}.${parts[1].substring(0, 2)}`;
    }
  } else if (cleaned.length > 2) {
    // Assume last two digits are cents
    const dollars = cleaned.slice(0, -2);
    const cents = cleaned.slice(-2);
    cleaned = `${dollars}.${cents}`;
  }

  const amount = parseFloat(cleaned);
  console.log("Cleaned amount result:", amount, "from:", amountStr);

  return !isNaN(amount) && amount > 0 && amount < 10000 ? amount : null;
};

// DEBUG FUNCTION TO ANALYZE OCR OUTPUT
const debugOCRText = (text) => {
  console.log("=== OCR DEBUG ANALYSIS ===");
  console.log("Full text:", text);

  const lines = text.split("\n");
  console.log("Lines:", lines.length);

  lines.forEach((line, index) => {
    if (
      line.includes("Amount") ||
      line.includes("amount") ||
      line.includes("$")
    ) {
      console.log(`Line ${index} (AMOUNT RELATED):`, line);
    }
    if (line.includes("Received") || line.includes("received")) {
      console.log(`Line ${index} (RECEIVED RELATED):`, line);
    }
  });

  // Look for specific patterns
  const amountReceivedRegex = /Amount\s*Received/gi;
  const amountMatches = [...text.matchAll(amountReceivedRegex)];
  console.log("Amount Received matches:", amountMatches.length);

  const dollarRegex = /\$[0-9\s<\\\.]+/g;
  const dollarMatches = [...text.matchAll(dollarRegex)];
  console.log("Dollar sign matches:", dollarMatches);

  console.log("=== END DEBUG ===");
};

// SIMPLE DATE FORMATTING
const formatSimpleDate = (dateStr) => {
  try {
    // Try to parse the date
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }

    // If that fails, try common formats
    const parts = dateStr.split(/[\/\-\.]/);
    if (parts.length === 3) {
      let year, month, day;

      if (parts[0].length === 4) {
        // YYYY-MM-DD
        year = parts[0];
        month = parts[1].padStart(2, "0");
        day = parts[2].padStart(2, "0");
      } else {
        // Assume MM-DD-YYYY or DD-MM-YYYY
        if (parseInt(parts[0]) > 12) {
          // DD-MM-YYYY
          day = parts[0].padStart(2, "0");
          month = parts[1].padStart(2, "0");
          year = parts[2];
        } else {
          // MM-DD-YYYY
          month = parts[0].padStart(2, "0");
          day = parts[1].padStart(2, "0");
          year = parts[2];
        }
      }

      // Ensure 4-digit year
      if (year.length === 2) {
        year = "20" + year;
      }

      const isoDate = `${year}-${month}-${day}`;
      const finalDate = new Date(isoDate);
      if (!isNaN(finalDate.getTime())) {
        return isoDate;
      }
    }

    return new Date().toISOString().split("T")[0];
  } catch (error) {
    console.error("Date parsing error:", error);
    return new Date().toISOString().split("T")[0];
  }
};

// Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "OCR Service is running",
    timestamp: new Date().toISOString(),
    corsOrigin: process.env.CORS_ORIGIN,
  });
});

app.post("/api/process-receipt", upload.single("receipt"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    console.log("Processing file:", req.file.originalname);
    console.log("File path:", req.file.path);

    const ocrResult = await processReceiptWithOCR(req.file.path);

    if (ocrResult.success) {
      res.json({
        success: true,
        message: "Receipt processed successfully",
        data: {
          amount: ocrResult.parsedData.amount,
          date: ocrResult.parsedData.date,
          description: ocrResult.parsedData.description,
          vendor: ocrResult.parsedData.vendor,
          currency: ocrResult.parsedData.currency,
          items: ocrResult.parsedData.items,
          confidence: ocrResult.confidence,
          rawText: ocrResult.rawText.substring(0, 500),
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: "OCR processing failed: " + (ocrResult.error || "Unknown error"),
        details: "Please try again with a clearer image",
      });
    }
  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error: " + error.message,
    });
  }
});

// Error handling
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File too large. Maximum size is 10MB.",
      });
    }
  }

  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OCR Server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${uploadsDir}`);
  console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Test OCR: POST http://localhost:${PORT}/api/process-receipt`);
});

export default app;
