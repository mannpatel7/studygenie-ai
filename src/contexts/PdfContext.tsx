import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface PdfDocument {
  id: string;
  fileName: string;
  pdfText: string;
  uploadedAt: Date;
  size: number; // in characters
}

interface PdfContextType {
  // Current active PDF
  pdfText: string;
  fileName: string;
  activePdfId: string | null;
  
  // PDF list management
  pdfDocuments: PdfDocument[];
  addPdfDocument: (text: string, fileName: string) => void;
  removePdfDocument: (id: string) => void;
  setActivePdf: (id: string) => void;
  clearAllPdfs: () => void;
  
  // Upload state
  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;
  
  // Deprecated but kept for backward compatibility
  setPdfText: (text: string, fileName: string) => void;
  clearPdfText: () => void;
}

const PdfContext = createContext<PdfContextType | undefined>(undefined);

export const usePdfContext = () => {
  const context = useContext(PdfContext);
  if (!context) {
    throw new Error('usePdfContext must be used within a PdfProvider');
  }
  return context;
};

interface PdfProviderProps {
  children: ReactNode;
}

export const PdfProvider: React.FC<PdfProviderProps> = ({ children }) => {
  const [pdfDocuments, setPdfDocuments] = useState<PdfDocument[]>([]);
  const [activePdfId, setActivePdfId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Get current active PDF
  const activePdf = pdfDocuments.find((pdf) => pdf.id === activePdfId);
  const pdfText = activePdf?.pdfText || '';
  const fileName = activePdf?.fileName || '';

  // Add a new PDF document
  const addPdfDocument = (text: string, name: string) => {
    const id = `pdf_${Date.now()}`;
    const newPdf: PdfDocument = {
      id,
      fileName: name,
      pdfText: text,
      uploadedAt: new Date(),
      size: text.length,
    };

    setPdfDocuments((prev) => [...prev, newPdf]);
    setActivePdfId(id); // Auto-select the newly uploaded PDF
  };

  // Remove a PDF document
  const removePdfDocument = (id: string) => {
    setPdfDocuments((prev) => prev.filter((pdf) => pdf.id !== id));

    // If removed PDF was active, switch to another or clear
    if (activePdfId === id) {
      const remaining = pdfDocuments.filter((pdf) => pdf.id !== id);
      setActivePdfId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Switch active PDF
  const setActivePdf = (id: string) => {
    if (pdfDocuments.some((pdf) => pdf.id === id)) {
      setActivePdfId(id);
    }
  };

  // Clear all PDFs
  const clearAllPdfs = () => {
    setPdfDocuments([]);
    setActivePdfId(null);
  };

  // Backward compatibility methods
  const setPdfText = (text: string, name: string) => {
    clearAllPdfs();
    addPdfDocument(text, name);
  };

  const clearPdfText = () => {
    clearAllPdfs();
  };

  return (
    <PdfContext.Provider
      value={{
        pdfText,
        fileName,
        activePdfId,
        pdfDocuments,
        addPdfDocument,
        removePdfDocument,
        setActivePdf,
        clearAllPdfs,
        isUploading,
        setIsUploading,
        setPdfText,
        clearPdfText,
      }}
    >
      {children}
    </PdfContext.Provider>
  );
};