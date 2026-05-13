import Tesseract from "tesseract.js";
import { preprocessImage } from "./imagePreprocessor";
import { parseReceiptText } from "./receiptParser";
import { autoDetectCategory } from "../utils/autoCategorize";

/**
 * scanReceipt
 *
 * Full pipeline:
 *  1. Preprocess image (grayscale, contrast, sharpen, binarise)
 *  2. Run Tesseract OCR with progress reporting
 *  3. Parse extracted text with regex
 *  4. Auto-detect category from merchant name
 *
 * @param {File} file - Image file from input
 * @param {Function} onProgress - Called with { stage, progress (0-100), message }
 * @returns {Promise<ParsedReceipt>}
 */
export async function scanReceipt(file, onProgress = () => {}) {
  // Stage 1: Preprocess
  onProgress({ stage: "preprocessing", progress: 5, message: "Preprocessing image..." });

  let processedDataUrl;
  try {
    processedDataUrl = await preprocessImage(file);
  } catch {
    // If preprocessing fails, fall back to original file
    processedDataUrl = file;
  }

  onProgress({ stage: "preprocessing", progress: 20, message: "Image ready, starting OCR..." });

  // Stage 2: Tesseract OCR
  let ocrText = "";
  let ocrConfidence = 0;

  try {
    const result = await Tesseract.recognize(processedDataUrl, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          const pct = Math.round(20 + m.progress * 60); // 20–80%
          onProgress({ stage: "ocr", progress: pct, message: `Reading text... ${Math.round(m.progress * 100)}%` });
        }
      },
    });

    ocrText = result.data.text || "";
    ocrConfidence = Math.round(result.data.confidence || 0);
  } catch (err) {
    throw new Error(`OCR failed: ${err.message}`);
  }

  onProgress({ stage: "parsing", progress: 85, message: "Extracting fields..." });

  // Stage 3: Parse
  const parsed = parseReceiptText(ocrText);

  // Stage 4: Category detection
  const detectedCategory = autoDetectCategory(parsed.merchant) || autoDetectCategory(ocrText.slice(0, 200));

  onProgress({ stage: "done", progress: 100, message: "Done!" });

  return {
    ...parsed,
    category: detectedCategory,
    ocrConfidence,
    // Use OCR confidence if our field-based confidence is low
    confidence: Math.round((parsed.confidence + Math.min(ocrConfidence, 100)) / 2),
  };
}
