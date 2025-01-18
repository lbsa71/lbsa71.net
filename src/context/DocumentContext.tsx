import React, { createContext, useContext, ReactNode } from 'react';

interface DocumentMetadata {
  user_id: string;
  document_id: string;
}

type DocumentContextType = DocumentMetadata;

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocumentContext must be used within a DocumentProvider');
  }
  return context;
};

interface DocumentProviderProps {
  children: ReactNode;
  value: DocumentMetadata;
}

export const DocumentProvider: React.FC<DocumentProviderProps> = ({ children, value }) => {
  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};