import {
  Alert, AlertDescription, AlertIcon, Badge, Box, Button,
  Flex, Grid, Icon, Progress, Text, VStack, useColorModeValue,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import {
  FiAlertTriangle, FiCamera, FiCheck, FiRefreshCw,
  FiUpload, FiZap,
} from "react-icons/fi";
import { scanReceipt } from "../../services/ocrService";
import { currency } from "../../utils/format";

const MotionBox = motion(Box);

const STAGE_LABELS = {
  preprocessing: "Preprocessing image",
  ocr: "Reading text with OCR",
  parsing: "Extracting fields",
  done: "Complete",
};

function ConfidenceBadge({ value }) {
  if (value == null) return null;
  const scheme = value >= 70 ? "green" : value >= 40 ? "yellow" : "red";
  const label = value >= 70 ? "High" : value >= 40 ? "Medium" : "Low";
  return (
    <Badge colorScheme={scheme} fontSize="10px" px={2} py={0.5} borderRadius="full">
      {value}% confidence · {label}
    </Badge>
  );
}

function FieldRow({ label, value, uncertain }) {
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const textColor = useColorModeValue("gray.800", "gray.100");
  if (value == null || value === "") return null;
  return (
    <Flex justify="space-between" align="center" py={1.5}>
      <Text fontSize="xs" color={mutedColor} fontWeight="600">{label}</Text>
      <Flex align="center" gap={1.5}>
        {uncertain && <Icon as={FiAlertTriangle} color="orange.400" boxSize={3} />}
        <Text fontSize="sm" fontWeight="700" color={uncertain ? "orange.400" : textColor}>{value}</Text>
      </Flex>
    </Flex>
  );
}

export default function ReceiptScanner({ onResult, categoryList = [] }) {
  const [isDragging, setIsDragging] = useState(false);
  const [scanState, setScanState] = useState("idle");
  const [progress, setProgress] = useState({ stage: "", progress: 0, message: "" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const fieldBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const dragBg = useColorModeValue("brand.50", "rgba(14,165,233,0.08)");

  async function processFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WEBP)");
      setScanState("error");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setScanState("scanning");
    setError("");
    setResult(null);
    try {
      const parsed = await scanReceipt(file, (p) => setProgress(p));
      setResult(parsed);
      setScanState("done");
    } catch (err) {
      setError(err.message || "OCR failed. Try a clearer image.");
      setScanState("error");
    }
  }

  function handleFileInput(e) {
    processFile(e.target.files?.[0]);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  }

  function handleRetry() {
    setScanState("idle");
    setResult(null);
    setError("");
    setPreviewUrl("");
    setProgress({ stage: "", progress: 0, message: "" });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }

  function handleUseResult() {
    if (result) onResult(result);
  }

  return (
    <Box>
      <AnimatePresence mode="wait">
        {scanState === "idle" && (
          <MotionBox
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Box
              border="2px dashed"
              borderColor={isDragging ? "brand.400" : border}
              borderRadius="12px"
              p={6}
              textAlign="center"
              bg={isDragging ? dragBg : "transparent"}
              cursor="pointer"
              transition="all 0.15s"
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              _hover={{ borderColor: "brand.400" }}
            >
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileInput} />
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFileInput} />
              <Icon as={FiUpload} boxSize={7} color="brand.500" mb={2} />
              <Text fontWeight="700" fontSize="sm" mb={1}>Drop receipt here or click to browse</Text>
              <Text fontSize="xs" color={mutedColor} mb={3}>JPG, PNG, WEBP · Processed locally on your device</Text>
              <Flex justify="center" gap={3}>
                <Button size="xs" colorScheme="brand" leftIcon={<FiUpload />} onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                  Browse
                </Button>
                <Button size="xs" variant="outline" leftIcon={<FiCamera />} onClick={(e) => { e.stopPropagation(); cameraRef.current?.click(); }}>
                  Camera
                </Button>
              </Flex>
            </Box>
          </MotionBox>
        )}

        {scanState === "scanning" && (
          <MotionBox
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <VStack spacing={4} align="stretch">
              <Box position="relative" borderRadius="10px" overflow="hidden" maxH="180px" bg="blackAlpha.200">
                {previewUrl && (
                  <Box
                    as="img"
                    src={previewUrl}
                    alt="Receipt preview"
                    w="full"
                    maxH="180px"
                    objectFit="cover"
                    style={{ filter: "brightness(0.6)" }}
                  />
                )}
                <MotionBox
                  position="absolute"
                  left={0}
                  right={0}
                  h="2px"
                  bg="brand.400"
                  boxShadow="0 0 10px rgba(14,165,233,0.9)"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                />
                <Flex position="absolute" inset={0} align="center" justify="center" direction="column" gap={1}>
                  <Icon as={FiZap} color="brand.400" boxSize={5} />
                  <Text fontSize="xs" color="white" fontWeight="700">
                    {STAGE_LABELS[progress.stage] || "Processing..."}
                  </Text>
                </Flex>
              </Box>
              <Box>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="xs" color={mutedColor}>{progress.message || "Starting..."}</Text>
                  <Text fontSize="xs" color="brand.500" fontWeight="700">{progress.progress}%</Text>
                </Flex>
                <Progress value={progress.progress} colorScheme="brand" borderRadius="full" size="sm" hasStripe isAnimated />
              </Box>
              <Text fontSize="xs" color={mutedColor} textAlign="center">
                🔒 OCR runs locally — your image never leaves your device
              </Text>
            </VStack>
          </MotionBox>
        )}

        {scanState === "done" && result && (
          <MotionBox
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <VStack spacing={3} align="stretch">
              <Flex align="center" justify="space-between">
                <Flex align="center" gap={2}>
                  <Flex w="24px" h="24px" bg="income.500" borderRadius="full" align="center" justify="center" flexShrink={0}>
                    <Icon as={FiCheck} color="white" boxSize={3} />
                  </Flex>
                  <Text fontSize="sm" fontWeight="700">Receipt scanned</Text>
                </Flex>
                <ConfidenceBadge value={result.confidence} />
              </Flex>

              <Box bg={fieldBg} borderRadius="10px" px={4} py={1} border="1px solid" borderColor={border}>
                <FieldRow label="Merchant" value={result.merchant} uncertain={!result.merchant} />
                <FieldRow label="Amount" value={result.amount ? currency(result.amount) : null} uncertain={!result.amount} />
                <FieldRow label="Date" value={result.date} />
                {result.subtotal != null && <FieldRow label="Subtotal" value={currency(result.subtotal)} />}
                {result.tax != null && <FieldRow label="Tax" value={currency(result.tax)} />}
                {result.paymentMethod && <FieldRow label="Payment" value={result.paymentMethod} />}
                {result.invoiceNumber && <FieldRow label="Invoice #" value={result.invoiceNumber} />}
                {result.category && (
                  <Flex justify="space-between" align="center" py={1.5}>
                    <Text fontSize="xs" color={mutedColor} fontWeight="600">Category</Text>
                    <Badge colorScheme="brand" fontSize="10px">{result.category}</Badge>
                  </Flex>
                )}
              </Box>

              {result.confidence < 40 && (
                <Alert status="warning" borderRadius="8px" fontSize="xs" py={2}>
                  <AlertIcon boxSize={3.5} />
                  <AlertDescription>Low confidence — verify fields before saving.</AlertDescription>
                </Alert>
              )}

              <Grid templateColumns="1fr 1fr" gap={3}>
                <Button variant="outline" size="sm" leftIcon={<FiRefreshCw />} onClick={handleRetry}>
                  Scan Again
                </Button>
                <Button colorScheme="brand" size="sm" leftIcon={<FiZap />} onClick={handleUseResult}>
                  Use These Fields
                </Button>
              </Grid>
            </VStack>
          </MotionBox>
        )}

        {scanState === "error" && (
          <MotionBox
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <VStack spacing={3} align="stretch">
              <Alert status="error" borderRadius="10px" fontSize="sm">
                <AlertIcon />
                <AlertDescription>{error || "Could not read receipt. Try a clearer photo."}</AlertDescription>
              </Alert>
              <Text fontSize="xs" color={mutedColor}>
                Tips: good lighting, no shadows, hold camera steady, avoid glare.
              </Text>
              <Button variant="outline" size="sm" leftIcon={<FiRefreshCw />} onClick={handleRetry}>
                Try Again
              </Button>
            </VStack>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  );
}
